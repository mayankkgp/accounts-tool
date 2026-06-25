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
    
    if (isOldArray || isEmptyNewSchema) {
      console.log("Stale or old inventory structure detected. Migrating to Phase 2 mock inventory...");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInventory));
      return mockInventory;
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
 * @param {object} reviewData - Object containing { location, hsnCode, buckets, user }
 * @returns {Promise<object>} The newly updated/reviewed item.
 */
export async function transitionItemToReviewed(itemId, { location, hsnCode, buckets, user = "Finance Manager" }) {
  await simulateNetwork("large"); // large preset (1200ms) for write mutations
  
  const raw = getRawStorage();
  const pendingIdx = raw.pendingInventory.findIndex(item => item.id === itemId);
  
  if (pendingIdx === -1) {
    throw new Error(`Pending inventory item with ID ${itemId} not found.`);
  }

  const pendingItem = raw.pendingInventory[pendingIdx];
  
  // Create a new reviewed item ID (e.g., INV-R-XYZ or similar)
  const numericPart = itemId.match(/\d+/) ? itemId.match(/\d+/)[0] : String(Math.floor(Math.random() * 900) + 100);
  const reviewedId = `INV-R-${numericPart}`;

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
      assignedLocation: location
    }
  ];

  // If buckets are specified and have values, add a bucket distribution event
  if (buckets && (buckets.toDebit > 0 || buckets.wasteage > 0)) {
    newHistory.push({
      eventId: `EVT-R-${Date.now()}-2`,
      date: dateStr,
      user: user,
      eventType: "Bucket Distribution",
      toDebitQuantity: buckets.toDebit || 0,
      wasteageQuantity: buckets.wasteage || 0
    });
  }

  const reviewedItem = {
    ...pendingItem,
    id: reviewedId,
    status: "Reviewed",
    location: location,
    hsnCode: hsnCode || pendingItem.hsnCode,
    buckets: buckets || { toDebit: 0, wasteage: 0 },
    history: newHistory
  };

  // Remove from pending, add to reviewed
  raw.pendingInventory.splice(pendingIdx, 1);
  raw.reviewedInventory.unshift(reviewedItem);

  saveRawStorage(raw);
  return reviewedItem;
}

/**
 * Updates bucket distribution for an already reviewed inventory item.
 * @param {string} itemId - The ID of the reviewed inventory item.
 * @param {object} data - Object containing { buckets, user }
 * @returns {Promise<object>} The updated reviewed item.
 */
export async function updateReviewedItemBuckets(itemId, { buckets, user = "Finance Manager" }) {
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
      toDebitQuantity: buckets.toDebit || 0,
      wasteageQuantity: buckets.wasteage || 0
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
export async function updateReviewedItemLocation(itemId, { location, user = "Inventory Staff" }) {
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
