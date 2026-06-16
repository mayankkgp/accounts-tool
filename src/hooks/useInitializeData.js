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
    }

    const inventoryKey = "fabrito_inventory";
    if (!localStorage.getItem(inventoryKey)) {
      console.log("Seeding local storage with initial Fabrito inventory...");
      localStorage.setItem("fabrito_inventory", JSON.stringify(inventory));
    }
  }, []);
}
