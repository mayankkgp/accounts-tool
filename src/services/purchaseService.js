import { simulateNetwork } from "../utils/simulateNetwork";

/**
 * 1. The List Fetcher (GET /purchases)
 * Retrieves a filtered and searched list of purchases from the 'fabrito_purchases' LocalStorage partition.
 * It maps vendor names from 'fabrito_entities' to support real-time searches by company names.
 * Uses 'medium' (600ms) simulated delay.
 * 
 * @param {Object} filters - Search query, tab filter (draft/finalized/all), and pagination tools.
 * @returns {Promise<Array>} Resets and resolves with matching purchase entries.
 */
export async function fetchPurchases({ query = "", status = "all" } = {}) {
  await simulateNetwork("medium");

  const purchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");
  const entities = JSON.parse(localStorage.getItem("fabrito_entities") || "[]");

  // Create a fast lookup map for vendor business/brand names
  const vendorMap = {};
  entities.forEach((ent) => {
    vendorMap[ent.id] = {
      businessName: (ent.businessName || "").toLowerCase(),
      brandName: (ent.brandName || "").toLowerCase()
    };
  });

  return purchases.filter((item) => {
    // 1. Filter by Status (Draft vs Finalized vs All)
    if (status !== "all" && item.status !== status) {
      return false;
    }

    // 2. Filter by search query (Vendor name, invoice number, poNumber, or items content)
    if (query) {
      const q = query.toLowerCase().trim();
      const vendorInfo = vendorMap[item.vendorId] || { businessName: "", brandName: "" };
      
      const matchVendor = vendorInfo.businessName.includes(q) || vendorInfo.brandName.includes(q);
      const matchInvoice = (item.invoiceNumber || "").toLowerCase().includes(q);
      const matchPO = (item.poNumber || "").toLowerCase().includes(q);
      const matchItems = (item.items || []).some((it) => 
        (it.itemName || "").toLowerCase().includes(q) || 
        (it.hsnCode || "").toLowerCase().includes(q)
      );

      return matchVendor || matchInvoice || matchPO || matchItems;
    }

    return true;
  });
}

/**
 * 2. The AI Invoice Extractor (POST /purchases/extract-ai)
 * Emulates parsing physical or digital invoice files into fully tokenized form records.
 * Runs a double 'large' delay (approx. 2.4s total) to simulate OCR scan, layout extraction, and validation.
 * 
 * @param {File} file - Raw document binary from user file upload picker.
 * @returns {Promise<Object>} An pre-vetted draft record with line totals, items, and tax predictions.
 */
export async function extractInvoiceAI(file) {
  // Triple-checks delay triggers to mimic complex computer vision structures
  await simulateNetwork("large");
  await simulateNetwork("large");

  // Mock-extracted sample payload containing realistic fiber line-item data
  return {
    id: "draft_ai_" + Math.random().toString(36).substr(2, 9),
    vendorId: "ent_041", // Pre-maps to safe active supplier
    invoiceNumber: "AI-INV-" + Math.floor(1000 + Math.random() * 9000),
    purchaseDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"), // Pre-filled with DD-MM-YYYY format
    financialYear: "2025-2026",
    poNumber: "PO-" + Math.floor(8000 + Math.random() * 1000),
    status: "draft",
    freight: 350,
    overallDiscount: 800,
    items: [
      {
        rowId: "r1",
        itemName: "Combed Cotton Yarn 30s",
        hsnCode: "5205",
        rate: 275,
        quantity: 150,
        uom: "kg",
        itemDiscount: 0
      },
      {
        rowId: "r2",
        itemName: "Viscose Blend Yarn",
        hsnCode: "5403",
        rate: 190,
        quantity: 80,
        uom: "kg",
        itemDiscount: 50
      }
    ]
  };
}

/**
 * 3. The Tax & Math Engine (POST /purchases/calculate)
 * Triggers realtime calculations for sub-totals, discounts, state taxation paths, and grand ledger metrics.
 * Runs a small simulated delay (200ms) to provide a satisfying, transient dashboard shimmer.
 * 
 * @param {Array} lineItems - Active editable rows dynamically managed in split pane screens.
 * @param {string} vendorId - Vendor reference to pull company physical tax registries for verification.
 * @returns {Promise<Object>} Object detailing gross totals, state breakdown (CGST/SGST vs IGST), and totals.
 */
export async function calculateTaxes(lineItems, vendorId) {
  await simulateNetwork("small");

  const entities = JSON.parse(localStorage.getItem("fabrito_entities") || "[]");
  const vendor = entities.find((e) => e.id === vendorId);

  // Default Fabrito warehouse state region is '24' (Gujarat). 
  // Relational tax compliance directs either CGST/SGST (intra-state) or IGST (inter-state routing).
  const isIntrastate = vendor && (vendor.gst || "").slice(0, 2) === "24";

  let totalTaxableValue = 0;

  const processedItems = (lineItems || []).map((item) => {
    const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const lineTotal = Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));
    totalTaxableValue += lineTotal;
    return {
      ...item,
      lineTotal
    };
  });

  // Flat structured tax percentage mapping of 18% generic yarn/textiles standard HSN rules
  const taxRate = 0.18;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isIntrastate) {
    // If supplier is within Gujarat state grid, split the tax equally into State and Center vaults
    cgst = parseFloat((totalTaxableValue * (taxRate / 2)).toFixed(2));
    sgst = parseFloat((totalTaxableValue * (taxRate / 2)).toFixed(2));
  } else {
    // If supplier is external, route full tax directly to the IGST inter-state ledger channel
    igst = parseFloat((totalTaxableValue * taxRate).toFixed(2));
  }

  const totalTax = parseFloat((cgst + sgst + igst).toFixed(2));

  return {
    items: processedItems,
    subtotal: totalTaxableValue,
    cgst,
    sgst,
    igst,
    totalTax,
    grandTotal: parseFloat((totalTaxableValue + totalTax).toFixed(2))
  };
}

/**
 * 4. The Duplicate Watchdog (POST /purchases/check-duplicate)
 * Validates in high security whether a newly added supplier invoice was already logged to prevent double ledger booking.
 * Operates with 'small' (200ms) delay to keep input focus actions snappier.
 * 
 * @param {string} vendorId - Target supplier entity ID.
 * @param {string} invoiceNumber - Raw alpha-numeric invoice string entered on blur.
 * @returns {Promise<Object>} Contains duplication state flag.
 */
export async function checkDuplicate(vendorId, invoiceNumber) {
  await simulateNetwork("small");

  if (!vendorId || !invoiceNumber) {
    return { isDuplicate: false };
  }

  const purchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");
  
  // Scan all finalized files, ignoring uncommitted temporary drafts.
  const isDuplicate = purchases.some((pur) => 
    pur.status === "finalized" &&
    pur.vendorId === vendorId &&
    (pur.invoiceNumber || "").trim().toLowerCase() === invoiceNumber.trim().toLowerCase()
  );

  return { isDuplicate };
}

/**
 * 5. The Save & Finalize Action (POST /purchases)
 * Writes, commits, or archives verified purchase records inside the 'fabrito_purchases' LocalStorage cluster.
 * Runs 'large' (1200ms) delayed persistence to emulate background indexing, accounting ledger balances, and log-commit.
 * 
 * @param {Object} purchasePayload - Comprehensive purchase state mapping.
 * @returns {Promise<Object>} The successfully persisted purchase model.
 */
export async function finalizePurchase(purchasePayload) {
  await simulateNetwork("large");

  const purchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");
  const now = new Date();

  // Basic mandatory validation fallback
  if (!purchasePayload.vendorId) {
    throw new Error("Relational Integrity Error: Vendor reference is mandatory.");
  }

  let finalRecord = { ...purchasePayload };

  if (purchasePayload.id) {
    // Update existing record (upgrades status from draft to finalized or edits drafts)
    const idx = purchases.findIndex((p) => p.id === purchasePayload.id);
    if (idx !== -1) {
      purchases[idx] = {
        ...purchases[idx],
        ...purchasePayload,
        updatedAt: now.toISOString()
      };
      finalRecord = purchases[idx];
    } else {
      purchases.push(purchasePayload);
    }
  } else {
    // Create completely fresh purchase registry file
    const prefix = purchasePayload.status === "draft" ? "draft_" : "pur_";
    const uniqueId = prefix + Math.random().toString(36).substr(2, 9);
    finalRecord = {
      ...purchasePayload,
      id: uniqueId,
      createdAt: now.toISOString()
    };
    purchases.push(finalRecord);
  }

  localStorage.setItem("fabrito_purchases", JSON.stringify(purchases));
  return finalRecord;
}
