import { simulateNetwork } from "../utils/simulateNetwork";

const STORAGE_KEY = 'fabrito_sales_requests';

/**
 * Service layered actions for Fabrito Sales & Cost Mapping Prototype.
 * All subsequent data fetching targets localStorage, wrapped in simulateNetwork delay.
 */

/**
 * Fetches filtered active sales requests.
 * Uses 500ms simulated delay.
 */
export async function fetchSalesRequests({ query = "", status = "" } = {}) {
  await simulateNetwork(500);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  
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
  await simulateNetwork(500);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return data.find((req) => req.id === id) || null;
}

/**
 * Creates/Adds a new Sales Request
 * Uses 800ms simulated delay for relational mutations.
 */
export async function saveSalesRequest(reqData) {
  await simulateNetwork(800);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  
  if (reqData.id) {
    // Edit existing
    const idx = data.findIndex((req) => req.id === reqData.id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...reqData };
    }
  } else {
    // New entity - calculate a truly unique ID by finding the maximum existing numeric ID
    const numericIds = data.map(req => {
      const match = req.id && req.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 1000;
    });
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1000;
    const newId = `REQ-${maxId + 1}`;
    const newRequest = {
      id: newId,
      submittedDate: new Date().toISOString().split("T")[0],
      ...reqData
    };
    data.unshift(newRequest);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return true;
}

/**
 * Fetches all available Mock Inventory
 * Uses 500ms simulated delay.
 */
export async function fetchInventory({ query = "" } = {}) {
  await simulateNetwork(500);
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
 * Uses 500ms simulated delay.
 */
export async function queryPurchaseLedger(vendorId, invoiceNo) {
  await simulateNetwork(500);
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
