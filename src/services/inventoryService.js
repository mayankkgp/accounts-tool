import { simulateNetwork } from "../utils/simulateNetwork";
import mockInventory from "../data/mockInventory.json";

const STORAGE_KEY = "fabrito_inventory";

/**
 * Gets the current raw inventory state from localStorage, seeding if empty.
 * @returns {object} The parsed inventory object containing pendingInventory and reviewedInventory.
 */
function getRawStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInventory));
    return mockInventory;
  }
  try {
    const parsed = JSON.parse(data);
    
    // Check if the parsed object has the new schema with items.
    // If it's an array, or if it doesn't have pendingInventory / reviewedInventory,
    // or if both are empty (which happens with the old array filtering),
    // let's clear it and use the mockInventory so they see the real mock data!
    const isOldArray = Array.isArray(parsed);
    const isEmptyNewSchema = parsed && !isOldArray && (!parsed.pendingInventory || !parsed.reviewedInventory || (parsed.pendingInventory.length === 0 && parsed.reviewedInventory.length === 0));
    
    // Also, check if we need to force update to include the revisedQuantity in history of INV-R-001
    let needsRevisedQtyUpdate = false;
    let needsInwardInvoiceUpdate = false;
    let needsUomUpdate = false;
    if (parsed && parsed.reviewedInventory) {
      const invR001 = parsed.reviewedInventory.find(item => item.id === "INV-R-001");
      if (invR001 && invR001.history) {
        const bucketDistEvent = invR001.history.find(evt => evt.eventType === "Bucket Distribution");
        if (bucketDistEvent && bucketDistEvent.revisedQuantity === undefined) {
          needsRevisedQtyUpdate = true;
        }
        const inwardEvent = invR001.history.find(evt => evt.eventType === "Inward");
        if (inwardEvent && inwardEvent.purchaseInvoice === undefined) {
          needsInwardInvoiceUpdate = true;
        }
      }
    }
    if (parsed && parsed.pendingInventory) {
      const invP001 = parsed.pendingInventory.find(item => item.id === "INV-P-001");
      if (invP001 && !invP001.uom) {
        needsUomUpdate = true;
      }
    }

    if (isOldArray || isEmptyNewSchema || needsRevisedQtyUpdate || needsInwardInvoiceUpdate || needsUomUpdate) {
      console.log("Stale or old inventory structure detected. Migrating to Phase 2 mock inventory...");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInventory));
      return mockInventory;
    }
    
    // Ensure all item IDs are completely unique to prevent React "Encountered two children with the same key" errors
    const seenIds = new Set();
    let changed = false;

    const makeUniqueId = (item, prefix) => {
      if (item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        return item.id;
      }
      let baseId = item.id || `${prefix}-001`;
      let numericPart = baseId.match(/\d+/) ? baseId.match(/\d+/)[0] : "1";
      let num = parseInt(numericPart, 10);
      let newId = `${prefix}-${String(num).padStart(3, "0")}`;
      while (seenIds.has(newId)) {
        num++;
        newId = `${prefix}-${String(num).padStart(3, "0")}`;
      }
      seenIds.add(newId);
      changed = true;
      return newId;
    };

    if (parsed.pendingInventory) {
      parsed.pendingInventory = parsed.pendingInventory.map(item => {
        const newId = makeUniqueId(item, "INV-P");
        if (newId !== item.id) {
          return { ...item, id: newId };
        }
        return item;
      });
    }

    if (parsed.reviewedInventory) {
      parsed.reviewedInventory = parsed.reviewedInventory.map(item => {
        const newId = makeUniqueId(item, "INV-R");
        if (newId !== item.id) {
          return { ...item, id: newId };
        }
        return item;
      });
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse inventory storage, resetting to mock:", error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInventory));
    return mockInventory;
  }
}

/**
 * Persists the entire inventory state to localStorage.
 * @param {object} inventory - The full inventory object.
 */
function saveRawStorage(inventory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

/**
 * Fetches the entire inventory dataset with a simulated network delay.
 * @returns {Promise<object>} Resolves to { pendingInventory, reviewedInventory }
 */
export async function fetchInventory() {
  await simulateNetwork("medium"); // medium preset (600ms) for fetching dataset
  return getRawStorage();
}

/**
 * Updates a pending inventory item with its assigned location and moves it to reviewed.
 * @param {string} itemId - The ID of the pending inventory item.
 * @param {object} reviewData - Object containing { location, hsnCode, buckets, remarks, user }
 * @returns {Promise<object>} The newly updated/reviewed item.
 */
export async function transitionItemToReviewed(itemId, { location, hsnCode, buckets, remarks, user = "Amit Patel" }) {
  await simulateNetwork("large"); // large preset (1200ms) for write mutations
  
  const raw = getRawStorage();
  const pendingIdx = raw.pendingInventory.findIndex(item => item.id === itemId);
  
  if (pendingIdx === -1) {
    throw new Error(`Pending inventory item with ID ${itemId} not found.`);
  }

  const pendingItem = raw.pendingInventory[pendingIdx];
  
  // Create a new reviewed item ID (e.g., INV-R-XYZ or similar) and ensure it is unique
  let numericPart = itemId.match(/\d+/) ? itemId.match(/\d+/)[0] : String(Math.floor(Math.random() * 900) + 100);
  let reviewedId = `INV-R-${numericPart}`;
  
  const existingReviewedIds = new Set(raw.reviewedInventory.map(item => item.id));
  let counter = 1;
  while (existingReviewedIds.has(reviewedId)) {
    const num = parseInt(numericPart, 10) + counter;
    reviewedId = `INV-R-${String(num).padStart(3, "0")}`;
    counter++;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB"); // dd/mm/yyyy

  const newHistory = [
    ...pendingItem.history,
    {
      eventId: `EVT-R-${Date.now()}-1`,
      date: dateStr,
      user: user,
      eventType: "Status Change",
      previousStatus: "Pending",
      newStatus: "Reviewed",
      assignedLocation: location,
      remarks: remarks || ""
    }
  ];

  // If buckets are specified and have values, add a bucket distribution event
  if (buckets && (buckets.toDebit > 0 || buckets.wasteage > 0 || buckets.debitIssued > 0)) {
    newHistory.push({
      eventId: `EVT-R-${Date.now()}-2`,
      date: dateStr,
      user: user,
      eventType: "Bucket Distribution",
      debitIssuedQuantity: buckets.debitIssued || 0,
      toDebitQuantity: buckets.toDebit || 0,
      wasteageQuantity: buckets.wasteage || 0,
      revisedQuantity: pendingItem.qty
    });
  }

  const reviewedItem = {
    ...pendingItem,
    id: reviewedId,
    status: "Reviewed",
    location: location,
    hsnCode: hsnCode || pendingItem.hsnCode,
    buckets: buckets || { debitIssued: 0, toDebit: 0, wasteage: 0 },
    remarks: remarks || "",
    history: newHistory
  };

  // Remove from pending, add to reviewed
  raw.pendingInventory.splice(pendingIdx, 1);
  raw.reviewedInventory.unshift(reviewedItem);

  saveRawStorage(raw);
  return reviewedItem;
}

/**
 * Updates remarks for an already reviewed inventory item.
 * @param {string} itemId - The ID of the reviewed inventory item.
 * @param {object} data - Object containing { remarks, user }
 * @returns {Promise<object>} The updated reviewed item.
 */
export async function updateReviewedItemRemarks(itemId, { remarks, user = "Amit Patel" }) {
  await simulateNetwork("large");
  
  const raw = getRawStorage();
  const idx = raw.reviewedInventory.findIndex(item => item.id === itemId);
  
  if (idx === -1) {
    throw new Error(`Reviewed inventory item with ID ${itemId} not found.`);
  }

  const item = raw.reviewedInventory[idx];
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB");

  const newHistory = [
    ...item.history,
    {
      eventId: `EVT-R-${Date.now()}`,
      date: dateStr,
      user: user,
      eventType: "Remarks Update",
      previousRemarks: item.remarks || "",
      newRemarks: remarks || ""
    }
  ];

  const updatedItem = {
    ...item,
    remarks: remarks || "",
    history: newHistory
  };

  raw.reviewedInventory[idx] = updatedItem;
  saveRawStorage(raw);
  return updatedItem;
}

/**
 * Updates bucket distribution for an already reviewed inventory item.
 * @param {string} itemId - The ID of the reviewed inventory item.
 * @param {object} data - Object containing { buckets, user }
 * @returns {Promise<object>} The updated reviewed item.
 */
export async function updateReviewedItemBuckets(itemId, { buckets, user = "Amit Patel" }) {
  await simulateNetwork("large");
  
  const raw = getRawStorage();
  const idx = raw.reviewedInventory.findIndex(item => item.id === itemId);
  
  if (idx === -1) {
    throw new Error(`Reviewed inventory item with ID ${itemId} not found.`);
  }

  const item = raw.reviewedInventory[idx];
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB");

  const newHistory = [
    ...item.history,
    {
      eventId: `EVT-R-${Date.now()}`,
      date: dateStr,
      user: user,
      eventType: "Bucket Distribution",
      debitIssuedQuantity: buckets.debitIssued || 0,
      toDebitQuantity: buckets.toDebit || 0,
      wasteageQuantity: buckets.wasteage || 0,
      revisedQuantity: item.qty
    }
  ];

  const updatedItem = {
    ...item,
    buckets: buckets,
    history: newHistory
  };

  raw.reviewedInventory[idx] = updatedItem;
  saveRawStorage(raw);
  return updatedItem;
}

/**
 * Updates location for an already reviewed inventory item.
 * @param {string} itemId - The ID of the reviewed inventory item.
 * @param {object} data - Object containing { location, user }
 * @returns {Promise<object>} The updated reviewed item.
 */
export async function updateReviewedItemLocation(itemId, { location, user = "Amit Patel" }) {
  await simulateNetwork("large");
  
  const raw = getRawStorage();
  const idx = raw.reviewedInventory.findIndex(item => item.id === itemId);
  
  if (idx === -1) {
    throw new Error(`Reviewed inventory item with ID ${itemId} not found.`);
  }

  const item = raw.reviewedInventory[idx];
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB");

  const newHistory = [
    ...item.history,
    {
      eventId: `EVT-R-${Date.now()}`,
      date: dateStr,
      user: user,
      eventType: "Location Update",
      previousLocation: item.location,
      newLocation: location
    }
  ];

  const updatedItem = {
    ...item,
    location: location,
    history: newHistory
  };

  raw.reviewedInventory[idx] = updatedItem;
  saveRawStorage(raw);
  return updatedItem;
}
