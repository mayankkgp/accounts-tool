import { simulateNetwork } from "../utils/simulateNetwork";

const STORAGE_KEY = 'fabrito_sales_requests';

/**
 * Service layered actions for Fabrito Sales & Cost Mapping Prototype.
 * All subsequent data fetching targets localStorage, wrapped in simulateNetwork delay
 * to accurately mock server-side/database fetch and persist latencies.
 */

/**
 * Fetches filtered active sales invoice requests from browser localStorage.
 * Integrates search-query lookups and status filtrations.
 * 
 * @async
 * @function fetchSalesRequests
 * @param {object} [filters] - Query parameters for retrieving records.
 * @param {string} [filters.query] - Case-insensitive string search over request ID, Customer Name, Sales Agent, and Specifications.
 * @param {string} [filters.status] - Status code filter to screen specific workflow stages (e.g., "Invoice Pending").
 * @returns {Promise<Array<object>>} Resolves to a list of matching sales request objects after a 500ms network emulation delay.
 */
export async function fetchSalesRequests({ query = "", status = "" } = {}) {
  // Uses a 500ms simulated delay to match production HTTP roundtrip delays.
  await simulateNetwork(500);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  
  return data.filter((req) => {
    // 1. Status Filter matching
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
 * Looks up a single sales invoice request transaction entity by its unique ID.
 * 
 * @async
 * @function fetchSalesRequestById
 * @param {string} id - The unique request ID (e.g. "REQ-1004").
 * @returns {Promise<object|null>} Resolves to the request object if found, otherwise returns null, after a 500ms network delay.
 */
export async function fetchSalesRequestById(id) {
  // Uses a 500ms simulated delay to match production HTTP roundtrip delays.
  await simulateNetwork(500);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return data.find((req) => req.id === id) || null;
}

/**
 * Creates a brand new sales invoice request or updates an existing request item.
 * Calculations for new IDs search for the maximum numeric ID currently in the
 * array to produce a consistent sequential order.
 * 
 * @async
 * @function saveSalesRequest
 * @param {object} reqData - The payload representing the sales request properties to create or update.
 * @returns {Promise<boolean>} Resolves to true on successful database storage in localStorage, after an 800ms network delay.
 */
export async function saveSalesRequest(reqData) {
  // Uses an 800ms simulated delay to emulate relational database mutations and locking procedures.
  await simulateNetwork(800);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  
  if (reqData.id) {
    // Edit existing layout matching items
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
 * Fetches all mock stock items, supporting simple fuzzy matching on Supplier/Item parameters.
 * 
 * @async
 * @function fetchInventory
 * @param {object} [filters] - Query parameters.
 * @param {string} [filters.query] - Search queries to match item name, item ID, supplier name, or HSN Code.
 * @returns {Promise<Array<object>>} Resolves to search-filtered inventory entries after a 500ms network delay.
 */
export async function fetchInventory({ query = "" } = {}) {
  // Uses a 500ms simulated delay to match production HTTP roundtrip delays.
  await simulateNetwork(500);
  const rawData = JSON.parse(localStorage.getItem("fabrito_inventory") || "[]");
  const data = Array.isArray(rawData)
    ? rawData
    : [
        ...(rawData.pendingInventory || []).map(item => ({
          itemId: item.id,
          itemName: item.item,
          availableQty: item.qty,
          hsnCode: item.hsnCode,
          invoiceID: item.invoice,
          invoiceDate: item.inwardDate,
          supplier: item.supplier,
          location: item.location || ""
        })),
        ...(rawData.reviewedInventory || []).map(item => ({
          itemId: item.id,
          itemName: item.item,
          availableQty: item.qty,
          hsnCode: item.hsnCode,
          invoiceID: item.invoice,
          invoiceDate: item.inwardDate,
          supplier: item.supplier,
          location: item.location || ""
        }))
      ];

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
 * Performs cost mapping queries against the persistent purchase ledger records.
 * Match criteria looks up matches combining Vendor Entity and Invoice Number.
 * 
 * @async
 * @function queryPurchaseLedger
 * @param {string|number} vendorId - The unique supplier/vendor identifier.
 * @param {string} invoiceNo - Vendor invoice code to cross-reference (e.g. "INV-421").
 * @returns {Promise<object|null>} Resolves to matching purchase record metadata if found, or null, after 500ms delay.
 */
export async function queryPurchaseLedger(vendorId, invoiceNo) {
  // Uses a 500ms simulated delay to match production HTTP roundtrip delays.
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
