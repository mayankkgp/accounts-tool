import { simulateNetwork } from "../utils/simulateNetwork";

/**
 * Helper to fetch a parsed array from localStorage.
 */
function getStorageItem(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return [];
  }
}

/**
 * Helper to save an array to localStorage as JSON string.
 */
function setStorageItem(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving ${key} to storage`, e);
  }
}

/**
 * Filters and searches companies stored in the 'fabrito_entities' namespace based on query, type, and status.
 * This query simulator runs with a small simulated network latency.
 */
export async function searchEntities({ query = "", type = "all", status = "all" } = {}) {
  await simulateNetwork("small");
  const entities = getStorageItem("fabrito_entities");

  return entities.filter((entity) => {
    // 1. Filter by Type (brand, factory, vendor)
    if (type !== "all" && entity.type !== type) {
      return false;
    }
    // 2. Filter by Status (active, archived)
    if (status !== "all" && entity.status !== status) {
      return false;
    }
    // 3. Search query match (businessName, brandName, pocName, id)
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchId = entity.id.toLowerCase().includes(q);
      const matchBusiness = entity.businessName?.toLowerCase().includes(q);
      const matchBrand = entity.brandName?.toLowerCase().includes(q);
      const matchPoc = entity.pocName?.toLowerCase().includes(q);
      return matchId || matchBusiness || matchBrand || matchPoc;
    }
    return true;
  });
}

/**
 * Loads a comprehensive profile from the 'fabrito_entities', 'fabrito_addresses', and 'fabrito_connections' namespaces.
 * This profile details fetch operation is run with a medium simulated network delay.
 */
export async function loadEntityProfile(entityId) {
  await simulateNetwork("medium");
  const entities = getStorageItem("fabrito_entities");
  const addresses = getStorageItem("fabrito_addresses");
  const connections = getStorageItem("fabrito_connections");

  // Locate company
  const entity = entities.find((e) => e.id === entityId);
  if (!entity) return null;

  // Fetch mapped addresses
  const entityAddresses = addresses.filter((addr) => addr.entityId === entityId);

  // Fetch brand-factory relationships
  let mappedConnections = [];
  if (entity.type === "brand") {
    // Get all connected factories
    const factoryIds = connections
      .filter((c) => c.brandId === entityId)
      .map((c) => c.factoryId);
    mappedConnections = entities.filter((e) => factoryIds.includes(e.id));
  } else if (entity.type === "factory") {
    // Get all connected brands
    const brandIds = connections
      .filter((c) => c.factoryId === entityId)
      .map((c) => c.brandId);
    mappedConnections = entities.filter((e) => brandIds.includes(e.id));
  }

  return {
    ...entity,
    addresses: entityAddresses,
    connections: mappedConnections,
  };
}

/**
 * Creates a new company profile and appends it to 'fabrito_entities', plus saves any initial address to 'fabrito_addresses'.
 * The write operation executes with a large simulated network latency.
 */
export async function createEntity(entityPayload) {
  await simulateNetwork("large");
  const entities = getStorageItem("fabrito_entities");

  // Generate sequence id
  const nextNum = entities.length + 1;
  const newId = `ent_${String(nextNum).padStart(3, "0")}`;

  const newEntity = {
    id: newId,
    status: "active",
    type: entityPayload.type || "brand",
    businessName: entityPayload.businessName || "",
    brandName: entityPayload.type === "brand" ? entityPayload.brandName || "" : null,
    pocName: entityPayload.pocName || "",
    pocContact: entityPayload.pocContact || "",
    gst: entityPayload.gst?.toUpperCase() || "",
    pan: entityPayload.pan?.toUpperCase() || null,
    bankDetails: entityPayload.bankDetails || null,
    terms: entityPayload.terms || null,
  };

  entities.push(newEntity);
  setStorageItem("fabrito_entities", entities);

  // If initial address is provided with the insert
  if (entityPayload.address) {
    const addresses = getStorageItem("fabrito_addresses");
    const newAddrId = `addr_${String(addresses.length + 1).padStart(3, "0")}`;
    addresses.push({
      id: newAddrId,
      entityId: newId,
      addressLine1: entityPayload.address.addressLine1 || "Main Office",
      addressLine2: entityPayload.address.addressLine2 || undefined,
      city: entityPayload.address.city || "",
      state: entityPayload.address.state || "",
      pincode: entityPayload.address.pincode || "",
      isDefaultBilling: true,
      isDefaultShipping: true,
    });
    setStorageItem("fabrito_addresses", addresses);
  }

  return newEntity;
}

/**
 * Updates an existing company's fields inside the 'fabrito_entities' namespace.
 * The edit operation is executed under a large simulated network latency.
 */
export async function updateEntity(entityId, updatedFields) {
  await simulateNetwork("large");
  const entities = getStorageItem("fabrito_entities");

  const idx = entities.findIndex((e) => e.id === entityId);
  if (idx === -1) {
    throw new Error(`Entity with ID ${entityId} not found`);
  }

  // Merge profile information
  const existing = entities[idx];
  const updated = {
    ...existing,
    ...updatedFields,
    // Ensure brandName is null for factories/vendors
    brandName: updatedFields.type === "brand" ? (updatedFields.brandName || existing.brandName) : (existing.type === "brand" ? existing.brandName : null)
  };

  entities[idx] = updated;
  setStorageItem("fabrito_entities", entities);

  return updated;
}

/**
 * Resolves a mockup address from public identifiers, mimicking government databases without direct mutations to 'fabrito_' namespaces.
 * The compliance checker executes with a medium simulated network latency.
 */
export async function autoFillGstData(gstNumber) {
  await simulateNetwork("medium");
  if (!gstNumber || gstNumber.length < 15) {
    throw new Error("Invalid GSTIN: Requires exactly 15 characters");
  }

  const cleanGst = gstNumber.toUpperCase().trim();
  const pan = cleanGst.substring(2, 12);

  // Derive Indian State codes for mockup fidelity
  const stateCode = cleanGst.substring(0, 2);
  let state = "MH";
  let city = "Mumbai";
  
  const stateMappings = {
    "27": { state: "MH", city: "Mumbai" },
    "29": { state: "KA", city: "Bangalore" },
    "07": { state: "DL", city: "New Delhi" },
    "24": { state: "GJ", city: "Surat" },
    "33": { state: "TN", city: "Chennai" },
    "19": { state: "WB", city: "Kolkata" },
    "03": { state: "PB", city: "Ludhiana" },
    "09": { state: "UP", city: "Noida" },
    "08": { state: "RJ", city: "Jaipur" },
    "36": { state: "TS", city: "Hyderabad" },
  };

  if (stateMappings[stateCode]) {
    state = stateMappings[stateCode].state;
    city = stateMappings[stateCode].city;
  }

  return {
    pan,
    address: {
      addressLine1: "Industrial Zone, Phase 1",
      city,
      state,
      pincode: "400011",
    },
  };
}

/**
 * Commits a list of brand-to-factory relational mappings to the 'fabrito_connections' local storage namespace.
 * The operation completes under a large simulated network latency.
 */
export async function saveBrandFactoryConnections(entityId, type, mappedTargetIds) {
  await simulateNetwork("large");
  let connections = getStorageItem("fabrito_connections");

  if (type === "brand") {
    // Clear existing factory connections for this brand
    connections = connections.filter((c) => c.brandId !== entityId);
    // Push new sets
    mappedTargetIds.forEach((facId) => {
      connections.push({ brandId: entityId, factoryId: facId });
    });
  } else if (type === "factory") {
    // Clear existing brand connections for this factory
    connections = connections.filter((c) => c.factoryId !== entityId);
    // Push new sets
    mappedTargetIds.forEach((bndId) => {
      connections.push({ brandId: bndId, factoryId: entityId });
    });
  }

  setStorageItem("fabrito_connections", connections);
  return { success: true };
}

/**
 * Creates or updates address resources inside the 'fabrito_addresses' namespace and configures billing/shipping flags.
 * This persistence action runs with a large simulated network latency.
 */
export async function manageAddress(entityId, addressPayload) {
  await simulateNetwork("large");
  const addresses = getStorageItem("fabrito_addresses");

  let resultAddress = null;

  if (addressPayload.id) {
    // Update existing address
    const idx = addresses.findIndex((a) => a.id === addressPayload.id);
    if (idx !== -1) {
      addresses[idx] = {
        ...addresses[idx],
        ...addressPayload,
      };
      resultAddress = addresses[idx];
    }
  } else {
    // Create new address
    const nextNum = addresses.length + 1;
    const newId = `addr_${String(nextNum).padStart(3, "0")}`;
    const newAddress = {
      id: newId,
      entityId,
      addressLine1: addressPayload.addressLine1 || "",
      addressLine2: addressPayload.addressLine2 || undefined,
      city: addressPayload.city || "",
      state: addressPayload.state || "",
      pincode: addressPayload.pincode || "",
      isDefaultBilling: !!addressPayload.isDefaultBilling,
      isDefaultShipping: !!addressPayload.isDefaultShipping,
    };
    addresses.push(newAddress);
    resultAddress = newAddress;
  }

  // Handle single billing/shipping default constraint
  if (resultAddress) {
    if (resultAddress.isDefaultBilling) {
      addresses.forEach((a) => {
        if (a.entityId === entityId && a.id !== resultAddress.id) {
          a.isDefaultBilling = false;
        }
      });
    }
    if (resultAddress.isDefaultShipping) {
      addresses.forEach((a) => {
        if (a.entityId === entityId && a.id !== resultAddress.id) {
          a.isDefaultShipping = false;
        }
      });
    }
  }

  setStorageItem("fabrito_addresses", addresses);
  return resultAddress;
}

/**
 * Deletes a designated address record from the 'fabrito_addresses' namespace.
 * The deletion executes with a large simulated network latency.
 */
export async function deleteAddress(addressId) {
  await simulateNetwork("large");
  let addresses = getStorageItem("fabrito_addresses");
  addresses = addresses.filter((a) => a.id !== addressId);
  setStorageItem("fabrito_addresses", addresses);
  return { success: true };
}

/**
 * Maps connections between brands and factories by writing to the 'fabrito_connections' namespace via saveBrandFactoryConnections.
 * This process executes under a large simulated network latency.
 */
export async function mapConnections(entityId, type, mappedTargetIds) {
  return saveBrandFactoryConnections(entityId, type, mappedTargetIds);
}

