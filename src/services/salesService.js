import { simulateNetwork } from "../utils/simulateNetwork";

/**
 * Service layered actions for Fabrito Sales & Cost Mapping Prototype.
 * All subsequent data fetching targets localStorage, wrapped in simulateNetwork delay.
 */

/**
 * Fetches filtered active sales requests.
 * Uses 'medium' (600ms) simulated delay.
 */
export async function fetchSalesRequests({ query = "", status = "" } = {}) {
  await simulateNetwork("medium");
  const data = JSON.parse(localStorage.getItem("fabrito_sales_requests") || "[]");
  
  return data.filter((req) => {
    // 1. Status Filter
    if (status && req.status !== status) {
      return false;
    }

    // 2. Query Search Filter (REQ-id, customer, smName, lineItems)
    if (query) {
      const q = query.toLowerCase().trim();
      const matchId = (req.id || "").toLowerCase().includes(q);
      const matchCustomer = (req.customer || "").toLowerCase().includes(q);
      const matchSM = (req.smName || "").toLowerCase().includes(q);
      const matchItems = (req.unstructuredData?.lineItems || "").toLowerCase().includes(q);

      if (!matchId && !matchCustomer && !matchSM && !matchItems) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Fetches a single Sales Request by ID
 */
export async function fetchSalesRequestById(id) {
  await simulateNetwork("small");
  const data = JSON.parse(localStorage.getItem("fabrito_sales_requests") || "[]");
  return data.find((req) => req.id === id) || null;
}

/**
 * Creates/Adds a new Sales Request
 * Uses 'large' (1200ms) simulated delay for relational mutations.
 */
export async function saveSalesRequest(reqData) {
  await simulateNetwork("large");
  const data = JSON.parse(localStorage.getItem("fabrito_sales_requests") || "[]");
  
  if (reqData.id) {
    // Edit existing
    const idx = data.findIndex((req) => req.id === reqData.id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...reqData };
    }
  } else {
    // New entity
    const newId = `REQ-${1000 + data.length + 1}`;
    const newRequest = {
      id: newId,
      submittedDate: new Date().toISOString().split("T")[0],
      ...reqData
    };
    data.unshift(newRequest);
  }

  localStorage.setItem("fabrito_sales_requests", JSON.stringify(data));
  return true;
}

/**
 * Fetches all available Mock Inventory
 * Uses 'small' (200ms) simulated delay.
 */
export async function fetchInventory({ query = "" } = {}) {
  await simulateNetwork("small");
  const data = JSON.parse(localStorage.getItem("fabrito_inventory") || "[]");

  if (query) {
    const q = query.toLowerCase().trim();
    return data.filter((item) => 
      (item.itemName || "").toLowerCase().includes(q) ||
      (item.itemId || "").toLowerCase().includes(q) ||
      (item.supplier || "").toLowerCase().includes(q) ||
      (item.hsnCode || "").toLowerCase().includes(q)
    );
  }
  return data;
}

/**
 * Performs cost mapping queries against purchase ledger if exists.
 * Match criteria: Vendor Entity and Invoice Number combined.
 */
export async function queryPurchaseLedger(vendorId, invoiceNo) {
  await simulateNetwork("small");
  const purchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");
  
  if (!vendorId || !invoiceNo) return null;
  const vendStr = String(vendorId).trim().toLowerCase();
  const invStr = String(invoiceNo).trim().toLowerCase();

  return purchases.find((p) => {
    const pVendor = String(p.vendorId).trim().toLowerCase();
    const pInvoice = String(p.invoiceNumber).trim().toLowerCase();
    return pVendor === vendStr && pInvoice === invStr;
  }) || null;
}
