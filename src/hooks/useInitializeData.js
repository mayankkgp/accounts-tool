import { useEffect } from "react";
import { entities, addresses, connections } from "../data/seedData";

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
  }, []);
}
