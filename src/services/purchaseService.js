import { simulateNetwork } from "../utils/simulateNetwork";

// Helper parsers for robust date boundary checks in backend scope
const parseDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

const parseDateYYYYMMDD = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

// Reusable math engine mapping for amount filtering in backend scope
const calculateTotalAmountInService = (pur) => {
  const taxDetail = calculatePurchaseTaxesSync(pur.items || [], pur.vendorId, Number(pur.overallDiscount) || 0);
  const freight = Number(pur.freight) || 0;
  return Math.max(0, parseFloat((taxDetail.grandTotal + freight).toFixed(2)));
};

/**
 * 1. The List Fetcher (GET /purchases)
 * Retrieves a filtered and searched list of purchases from the 'fabrito_purchases' LocalStorage partition.
 * It maps vendor names from 'fabrito_entities' to support real-time searches by company names.
 * Uses 'medium' (600ms) simulated delay.
 * 
 * @param {Object} filters - Search query, tab filter (draft/finalized/all), date ranges, vendor ids, amount limits.
 * @returns {Promise<Array>} Resets and resolves with matching purchase entries.
 */
export async function fetchPurchases({
  query = "",
  status = "all",
  fromDate = "",
  toDate = "",
  financialYear = "",
  vendorIds = [],
  minAmount = "",
  maxAmount = ""
} = {}) {
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

  const filtered = purchases.filter((item) => {
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

      if (!matchVendor && !matchInvoice && !matchPO && !matchItems) {
        return false;
      }
    }

    // 3. Date Boundary Checking
    const itemDate = parseDateDDMMYYYY(item.purchaseDate);
    const fromDateObj = fromDate ? parseDateYYYYMMDD(fromDate) : null;
    const toDateObj = toDate ? parseDateYYYYMMDD(toDate) : null;
    if (fromDateObj && itemDate && itemDate < fromDateObj) return false;
    if (toDateObj && itemDate && itemDate > toDateObj) return false;

    // 4. Financial Year Filters
    if (financialYear && item.financialYear !== financialYear) {
      return false;
    }

    // 5. Multi-Select Vendor Filter Checklist
    if (vendorIds && vendorIds.length > 0 && !vendorIds.includes(item.vendorId)) {
      return false;
    }

    // 6. Amount Ranges
    const computedTotal = calculateTotalAmountInService(item);
    if (minAmount !== "" && computedTotal < Number(minAmount)) return false;
    if (maxAmount !== "" && computedTotal > Number(maxAmount)) return false;

    return true;
  });

  // Call simulated network delay after filtering, just before returning the final array, to simulate database query time.
  await simulateNetwork("medium");

  return filtered;
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
export async function calculateTaxes(lineItems, vendorId, overallDiscount = 0) {
  await simulateNetwork("small");
  return calculatePurchaseTaxesSync(lineItems, vendorId, overallDiscount);
}

/**
 * Synchronous companion to calculateTaxes for immediate UI consumption without layout shimmers.
 * Compare the vendor's state against "Haryana" or GST state code "06".
 * Intra-state (Haryana): 9% CGST and 9% SGST.
 * Inter-state (Not Haryana): 18% IGST.
 */
export function calculatePurchaseTaxesSync(lineItems, vendorId, overallDiscount = 0) {
  const entities = JSON.parse(localStorage.getItem("fabrito_entities") || "[]");
  const vendor = entities.find((e) => e.id === vendorId);

  const addresses = JSON.parse(localStorage.getItem("fabrito_addresses") || "[]");
  const vendorAddresses = addresses.filter((addr) => addr.entityId === vendorId);
  const hasHaryanaAddress = vendorAddresses.some((addr) => {
    const stateStr = (addr.state || "").trim().toUpperCase();
    return stateStr === "HARYANA" || stateStr === "HR";
  });

  const isIntrastate = (vendor && (vendor.gst || "").slice(0, 2) === "06") || hasHaryanaAddress;

  // Let's compute totalSubtotal of all items first
  const totalSubtotal = (lineItems || []).reduce((sum, item) => {
    const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const itemLineTotal = Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));
    return sum + itemLineTotal;
  }, 0);

  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const processedItems = (lineItems || []).map((item) => {
    const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const itemLineTotal = Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));

    // Calculate proratedDiscount for each item based on that item's contribution to totalSubtotal
    let proratedDiscount = 0;
    if (totalSubtotal > 0 && overallDiscount > 0) {
      proratedDiscount = parseFloat(((itemLineTotal / totalSubtotal) * overallDiscount).toFixed(4));
    }

    // Subtract this prorated discount from the item's base taxable value before applying tax calculations
    const baseTaxableValue = itemLineTotal;
    const newTaxableValue = Math.max(0, parseFloat((baseTaxableValue - proratedDiscount).toFixed(4)));
    totalTaxableValue += newTaxableValue;

    const cgstRate = isIntrastate ? 0.09 : 0;
    const sgstRate = isIntrastate ? 0.09 : 0;
    const igstRate = !isIntrastate ? 0.18 : 0;

    const cgstAmount = parseFloat((newTaxableValue * cgstRate).toFixed(2));
    const sgstAmount = parseFloat((newTaxableValue * sgstRate).toFixed(2));
    const igstAmount = parseFloat((newTaxableValue * igstRate).toFixed(2));
    const taxAmount = isIntrastate ? (cgstAmount + sgstAmount) : igstAmount;

    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;

    return {
      ...item,
      proratedDiscount: parseFloat(proratedDiscount.toFixed(2)),
      lineTotal: parseFloat(newTaxableValue.toFixed(2)), // Net line-item total before tax after overall discount
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAfterTax: parseFloat((newTaxableValue + taxAmount).toFixed(2))
    };
  });

  const cgst = parseFloat(totalCgst.toFixed(2));
  const sgst = parseFloat(totalSgst.toFixed(2));
  const igst = parseFloat(totalIgst.toFixed(2));
  const totalTax = parseFloat((cgst + sgst + igst).toFixed(2));

  return {
    items: processedItems,
    subtotal: parseFloat(totalTaxableValue.toFixed(2)),
    baseSubtotal: parseFloat(totalSubtotal.toFixed(2)),
    isIntrastate,
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

/**
 * 6. The Single Detail Fetcher (GET /purchases/:id)
 * Retrieves a single complete purchase record by its ID with high performance simulation.
 * Uses 'medium' (600ms) simulated network latency.
 *
 * @param {string} id - The unique purchase record ID.
 * @returns {Promise<Object|null>} Resolves with the purchase record or null if not found.
 */
export async function fetchPurchaseById(id) {
  const purchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");
  const purchase = purchases.find((p) => p.id === id) || null;

  await simulateNetwork("medium");
  return purchase;
}

