import React from "react";
import InventoryGridHeader from "./InventoryGridHeader";
import InventoryGridSkeleton from "./InventoryGridSkeleton";
import InventoryGridRow from "./InventoryGridRow";

// Keep external imports working flawlessly
export { calculateAge } from "./inventoryUtils";

/**
 * InventoryDataGrid Component
 * Highly dense master ledger directory layout.
 * Delegating headers, skeleton, and rows to clean, decoupled child modules.
 */
export default function InventoryDataGrid({
  inventory = [],
  isLoading = false,
  activeInventoryId = null,
  setActiveInventoryId,
  activeTab = "Pending",
  sortConfig = { column: "age", direction: "desc" },
  setSortConfig,
}) {
  const isCompressed = !!activeInventoryId;

  // Grid columns styling depending on active view mode (Pending 9 cols, Reviewed 10 cols)
  const gridLayoutClass = isCompressed
    ? "grid-cols-[1.3fr_0.8fr_0.9fr]"
    : activeTab === "Reviewed"
    ? "grid-cols-[1fr_1.5fr_0.8fr_1fr_0.7fr_0.7fr_0.9fr_1.2fr_0.6fr_1.1fr]"
    : "grid-cols-[1.1fr_1.8fr_0.9fr_1.1fr_0.8fr_0.8fr_1fr_1.4fr_0.7fr]";

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full mt-2" id="inventory-directory-container">
      {/* 1. Column Headers with Sorting Indicators */}
      <InventoryGridHeader
        activeTab={activeTab}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        isCompressed={isCompressed}
        gridLayoutClass={gridLayoutClass}
      />

      {/* 2. Scrollable Body containing rows/skeleton/empty-state */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto" id="inventory-list-scrollable-area">
        {isLoading ? (
          <InventoryGridSkeleton
            isCompressed={isCompressed}
            gridLayoutClass={gridLayoutClass}
            activeTab={activeTab}
          />
        ) : inventory.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 font-medium select-none text-[10px]" id="empty-inventory-state">
            <span>No inventory records found</span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5 font-mono">Scoped ledger partition empty</span>
          </div>
        ) : (
          inventory.map((item) => (
            <InventoryGridRow
              key={item.id}
              item={item}
              isCompressed={isCompressed}
              isSelected={activeInventoryId === item.id}
              onClick={() => {
                if (setActiveInventoryId) {
                  setActiveInventoryId(activeInventoryId === item.id ? null : item.id);
                }
              }}
              activeTab={activeTab}
              gridLayoutClass={gridLayoutClass}
            />
          ))
        )}
      </div>

      {/* 3. High-Density Ledger Analytics Footer */}
      <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 border-t border-slate-200 pt-1 px-1 flex justify-between shrink-0 select-none bg-slate-100/55" id="inventory-footer-analytics">
        <span>Active Grid Lines: {inventory.length}</span>
        <span className="font-mono text-[8px] text-slate-500">scoped_inventory_db</span>
      </div>
    </div>
  );
}
