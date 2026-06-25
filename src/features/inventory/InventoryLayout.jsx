import React, { useState, useEffect } from "react";
import InventoryListToolbar from "./InventoryListToolbar";
import InventoryDataGrid, { calculateAge } from "./InventoryDataGrid";
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
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchSku = (item.sku || "").toLowerCase().includes(q);
    const matchItem = (item.item || "").toLowerCase().includes(q);
    const matchSupplier = (item.supplier || "").toLowerCase().includes(q);
    const matchInvoice = (item.invoice || "").toLowerCase().includes(q);
    return matchSku || matchItem || matchSupplier || matchInvoice;
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

  return (
    <div
      className={`flex-1 h-full grid ${
        isPaneSelected ? "grid-cols-[210px_1fr] gap-0" : "grid-cols-[1fr_0px]"
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
          isPaneSelected ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        id="inventory-details-pane"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-xs" id="inventory-detail-placeholder">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono">
              Item Details Workspace
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              Ref ID: {activeInventoryId}
            </p>
            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              Phase 3: Active Details, Action Panel, and Chronological Audit Trail will mount here.
            </p>
            <button
              onClick={() => setActiveInventoryId(null)}
              className="mt-4 px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-sm transition-all shadow-sm"
              type="button"
              id="close-placeholder-pane-btn"
            >
              Minimize Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
