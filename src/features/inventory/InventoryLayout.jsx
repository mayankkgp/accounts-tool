import React, { useState, useEffect } from "react";
import InventoryListToolbar from "./InventoryListToolbar";
import InventoryDataGrid, { calculateAge } from "./InventoryDataGrid";
import InventoryDetailPane from "./InventoryDetailPane";
import { fetchInventory } from "../../services/inventoryService";

/**
 * InventoryLayout Component
 * Primary master workspace of the Inventory module.
 * Manages states for tab selections, queries, filtering, and detail panes.
 * Clones the split-pane transition and structural hierarchy of PurchasesLayout.
 */
export default function InventoryLayout() {
  const [activeInventoryId, setActiveInventoryId] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending"); // "Pending" or "Reviewed"
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allInventory, setAllInventory] = useState({ pendingInventory: [], reviewedInventory: [] });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    type: [],
    supplier: [],
    location: [],
    age: { min: "", max: "" }
  });

  // Sort Config state tracking
  const [sortConfig, setSortConfig] = useState({
    column: "age", // Default sort
    direction: "desc", // Newest first
  });

  // Pessimistic list loading cycle
  useEffect(() => {
    let isCurrentFetch = true;

    async function loadInventory() {
      setIsLoading(true);
      try {
        const results = await fetchInventory();
        if (isCurrentFetch) {
          setAllInventory(results);
        }
      } catch (err) {
        console.error("Critical: Failed to query commercial inventory list", err);
      } finally {
        if (isCurrentFetch) {
          setIsLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      isCurrentFetch = false;
    };
  }, [refreshTrigger]);

  // Client-side filtration matching the search queries
  const activeItems = allInventory[activeTab === "Pending" ? "pendingInventory" : "reviewedInventory"] || [];

  const filteredInventory = activeItems.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchSku = (item.sku || "").toLowerCase().includes(q);
      const matchItem = (item.item || "").toLowerCase().includes(q);
      const matchSupplier = (item.supplier || "").toLowerCase().includes(q);
      const matchInvoice = (item.invoice || "").toLowerCase().includes(q);
      if (!(matchSku || matchItem || matchSupplier || matchInvoice)) {
        return false;
      }
    }

    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(item.type)) return false;
    }

    if (filters.supplier && filters.supplier.length > 0) {
      if (!filters.supplier.includes(item.supplier)) return false;
    }

    if (filters.location && filters.location.length > 0) {
      if (!filters.location.includes(item.location)) return false;
    }

    if (filters.age) {
      const ageVal = calculateAge(item.inwardDate);
      if (filters.age.min !== "" && filters.age.min !== undefined && filters.age.min !== null) {
        if (ageVal < Number(filters.age.min)) return false;
      }
      if (filters.age.max !== "" && filters.age.max !== undefined && filters.age.max !== null) {
        if (ageVal > Number(filters.age.max)) return false;
      }
    }

    return true;
  });

  // Multi-Column Sort Logic
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortConfig.column === "default" || !sortConfig.column) {
      return 0; // Natural unsorted fallback
    }

    let valA, valB;

    if (sortConfig.column === "age") {
      valA = calculateAge(a.inwardDate);
      valB = calculateAge(b.inwardDate);
    } else if (sortConfig.column === "qty") {
      valA = Number(a.qty) || 0;
      valB = Number(b.qty) || 0;
    } else if (sortConfig.column === "rate") {
      valA = Number(a.rate) || 0;
      valB = Number(b.rate) || 0;
    } else if (sortConfig.column === "value") {
      valA = (Number(a.qty) || 0) * (Number(a.rate) || 0);
      valB = (Number(b.qty) || 0) * (Number(b.rate) || 0);
    } else {
      valA = a[sortConfig.column] || "";
      valB = b[sortConfig.column] || "";
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortConfig.direction === "asc"
        ? (valA > valB ? 1 : -1)
        : (valA < valB ? 1 : -1);
    }
  });

  const isPaneSelected = !!activeInventoryId;

  const handleUpdateSuccess = (updatedItem) => {
    setRefreshTrigger((prev) => prev + 1);
    if (updatedItem && updatedItem.id) {
      setActiveInventoryId(updatedItem.id);
    } else {
      setActiveInventoryId(null);
    }
  };

  return (
    <div
      className={`flex-1 h-full grid ${
        isPaneSelected ? "grid-cols-[380px_1fr] gap-0" : "grid-cols-[1fr_0px]"
      } transition-all duration-300 ease-in-out overflow-hidden`}
      id="inventory-layout-grid"
    >
      {/* Left List Pane */}
      <div
        className="bg-slate-50 border-r border-slate-200 flex flex-col p-2 justify-between animate-none z-10 min-h-0"
        id="inventory-sidebar-pane"
      >
        <div className="flex-1 flex flex-col min-h-0 h-full" id="inventory-list-container">
          <InventoryListToolbar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setActiveInventoryId(null); // Clear selected item on tab change
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isCompressed={isPaneSelected}
            filters={filters}
            setFilters={setFilters}
            inventory={[
              ...(allInventory.pendingInventory || []),
              ...(allInventory.reviewedInventory || []),
            ]}
          />

          <InventoryDataGrid
            inventory={sortedInventory}
            isLoading={isLoading}
            activeInventoryId={activeInventoryId}
            setActiveInventoryId={setActiveInventoryId}
            activeTab={activeTab}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        </div>
      </div>

      {/* Right Detail Pane Wrapper (Phase 3 Prep) */}
      <div
        className={`bg-white overflow-hidden min-h-0 h-full relative transition-all duration-300 ease-in-out ${
          isPaneSelected ? "opacity-100 border-l border-slate-200" : "opacity-0 pointer-events-none"
        }`}
        id="inventory-details-pane"
      >
        {isPaneSelected && (
          <InventoryDetailPane
            activeInventoryId={activeInventoryId}
            inventory={[
              ...(allInventory.pendingInventory || []),
              ...(allInventory.reviewedInventory || []),
            ]}
            onClose={() => setActiveInventoryId(null)}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </div>
  );
}
