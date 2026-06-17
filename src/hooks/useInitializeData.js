import { useEffect } from "react";
import { entities, addresses, connections } from "../data/seedData";
import purchases from "../data/purchases.json";
import salesRequests from "../data/sales_requests.json";
import inventory from "../data/inventory.json";

/**
 * Initializes localStorage with seed B2B data if not already initialized.
 * Uses strict namespacing to prevent state collision.
 */
export function useInitializeData() {
  useEffect(() => {
    const checkKey = "fabrito_entities";
    if (!localStorage.getItem(checkKey)) {
      console.log("Seeding local storage with initial Fabrito dataset...");
      localStorage.setItem("fabrito_entities", JSON.stringify(entities));
      localStorage.setItem("fabrito_addresses", JSON.stringify(addresses));
      localStorage.setItem("fabrito_connections", JSON.stringify(connections));
    } else {
      try {
        const stored = localStorage.getItem("fabrito_entities");
        if (stored) {
          const parsed = JSON.parse(stored);
          const seenIds = new Set();
          let hasDuplicates = false;
          const sanitized = parsed.map((ent, index) => {
            if (!ent.id || seenIds.has(ent.id)) {
              hasDuplicates = true;
              const newId = `ENT-${1000 + index + 1}`;
              seenIds.add(newId);
              return { ...ent, id: newId };
            }
            seenIds.add(ent.id);
            return ent;
          });
          if (hasDuplicates) {
            localStorage.setItem("fabrito_entities", JSON.stringify(sanitized));
          }
        }
      } catch (e) {
        console.error("Error sanitizing entities:", e);
      }
    }

    const purchaseKey = "fabrito_purchases";
    if (!localStorage.getItem(purchaseKey)) {
      console.log("Seeding local storage with initial Fabrito purchases...");
      localStorage.setItem("fabrito_purchases", JSON.stringify(purchases));
    }

    const salesKey = "fabrito_sales_requests";
    if (!localStorage.getItem(salesKey)) {
      console.log("Seeding local storage with initial Fabrito sales requests...");
      localStorage.setItem("fabrito_sales_requests", JSON.stringify(salesRequests));
    } else {
      try {
        const stored = localStorage.getItem(salesKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const seenIds = new Set();
          let hasDuplicates = false;
          const sanitized = parsed.map((req, index) => {
            if (!req.id || seenIds.has(req.id)) {
              hasDuplicates = true;
              const numericIds = Array.from(seenIds).map(id => {
                const match = id.match(/\d+/);
                return match ? parseInt(match[0], 10) : 1000;
              });
              const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1000;
              const newId = `REQ-${maxId + 1}`;
              seenIds.add(newId);
              return { ...req, id: newId };
            }
            seenIds.add(req.id);
            return req;
          });
          if (hasDuplicates) {
            localStorage.setItem(salesKey, JSON.stringify(sanitized));
          }
        }
      } catch (e) {
        console.error("Error sanitizing sales requests:", e);
      }
    }

    const inventoryKey = "fabrito_inventory";
    if (!localStorage.getItem(inventoryKey)) {
      console.log("Seeding local storage with initial Fabrito inventory...");
      localStorage.setItem("fabrito_inventory", JSON.stringify(inventory));
    }
  }, []);
}
