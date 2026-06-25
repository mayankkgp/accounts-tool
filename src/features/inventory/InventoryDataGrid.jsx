import React from "react";

/**
 * Helper to parse inwardDate (format DD/MM/YYYY)
 */
function parseDateDDMMYYYY(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Dynamic Age calculation (Current Date June 24, 2026 - Inward Date)
 */
export function calculateAge(inwardDateStr) {
  const inwardDate = parseDateDDMMYYYY(inwardDateStr);
  if (!inwardDate) return 0;

  // Use current date, but if it is before 2026-06-24, default to 2026-06-24 to keep mock data sensible
  let today = new Date();
  const anchorDate = new Date(2026, 5, 24); // June 24, 2026
  if (today < anchorDate) {
    today = anchorDate;
  }

  // Set times to midnight to avoid partial day calculations
  today.setHours(0, 0, 0, 0);
  inwardDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - inwardDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

/**
 * InventoryDataGrid Component
 * Implements a high-density, compact data grid structure for inventory items.
 * Mirroring PurchaseDataGrid with 24px fixed row heights, micro-scale typography, and compression logic.
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
  // Indian standard currency formatting
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Standard number formatting with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  // Cycle column sorts: default -> asc -> desc -> default
  const handleHeaderClick = (colName) => {
    if (!setSortConfig) return;
    if (sortConfig.column !== colName) {
      setSortConfig({ column: colName, direction: "asc" });
    } else if (sortConfig.direction === "asc") {
      setSortConfig({ column: colName, direction: "desc" });
    } else if (sortConfig.direction === "desc") {
      setSortConfig({ column: "default", direction: "default" });
    } else {
      setSortConfig({ column: colName, direction: "asc" });
    }
  };

  // Renders the tiny sort status indicator
  const renderSortIndicator = (colName) => {
    const isCurrent = sortConfig.column === colName;
    if (!isCurrent || sortConfig.direction === "default") {
      return <span className="opacity-30 font-extrabold text-[8px] tracking-normal inline-block ml-0.5">&#8645;</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="text-indigo-600 font-extrabold text-[9px] inline-block ml-0.5">&#8593;</span>
    ) : (
      <span className="text-indigo-600 font-extrabold text-[9px] inline-block ml-0.5">&#8595;</span>
    );
  };

  const isCompressed = !!activeInventoryId;

  // Grid layout class dynamically changes when a row is clicked (isCompressed)
  // Pending has 9 columns, Reviewed has 10 columns (adds Location)
  const gridLayoutClass = isCompressed
    ? "grid-cols-[1.3fr_0.7fr]" // Compressed View
    : activeTab === "Reviewed"
    ? "grid-cols-[1fr_1.5fr_0.8fr_1fr_0.7fr_0.7fr_0.9fr_1.2fr_0.6fr_1.1fr]" // 10 columns
    : "grid-cols-[1.1fr_1.8fr_0.9fr_1.1fr_0.8fr_0.8fr_1fr_1.4fr_0.7fr]"; // 9 columns

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full mt-2" id="inventory-directory-container">
      {/* Dense Grid Header with Sort Controls */}
      <div
        className={`grid gap-1 px-1.5 py-0.5 border-b border-slate-300 text-[9px] uppercase tracking-wider font-semibold text-slate-500 select-none shrink-0 bg-slate-100 ${gridLayoutClass}`}
        id="inventory-grid-header-row"
      >
        {isCompressed ? (
          <>
            <span className="text-left py-0.5 text-[9px] uppercase tracking-wider font-semibold font-sans">Item / SKU</span>
            <span className="text-left py-0.5 text-[9px] uppercase tracking-wider font-semibold font-sans">Qty / Val</span>
          </>
        ) : (
          <>
            {/* SKU Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("sku")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="sku-header-sort-btn"
            >
              <span>SKU</span>
              {renderSortIndicator("sku")}
            </button>

            {/* Item Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("item")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="item-header-sort-btn"
            >
              <span>Item</span>
              {renderSortIndicator("item")}
            </button>

            {/* Type Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("type")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="type-header-sort-btn"
            >
              <span>Type</span>
              {renderSortIndicator("type")}
            </button>

            {/* Invoice Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("invoice")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="invoice-header-sort-btn"
            >
              <span>Invoice</span>
              {renderSortIndicator("invoice")}
            </button>

            {/* Qty Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("qty")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="qty-header-sort-btn"
            >
              <span>Qty</span>
              {renderSortIndicator("qty")}
            </button>

            {/* Rate Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("rate")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="rate-header-sort-btn"
            >
              <span>Rate</span>
              {renderSortIndicator("rate")}
            </button>

            {/* Value Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("value")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="value-header-sort-btn"
            >
              <span>Value</span>
              {renderSortIndicator("value")}
            </button>

            {/* Supplier Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("supplier")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="supplier-header-sort-btn"
            >
              <span>Supplier</span>
              {renderSortIndicator("supplier")}
            </button>

            {/* Age Column Header */}
            <button
              type="button"
              onClick={() => handleHeaderClick("age")}
              className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
              id="age-header-sort-btn"
            >
              <span>Age</span>
              {renderSortIndicator("age")}
            </button>

            {/* Location Column Header (Conditional) */}
            {activeTab === "Reviewed" && (
              <button
                type="button"
                onClick={() => handleHeaderClick("location")}
                className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
                id="location-header-sort-btn"
              >
                <span>Location</span>
                {renderSortIndicator("location")}
              </button>
            )}
          </>
        )}
      </div>

      {/* Row Scrolling Body Section */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto" id="inventory-list-scrollable-area">
        {isLoading ? (
          <div className="flex flex-col select-none divide-y divide-slate-100" id="inventory-list-skeleton-loader">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-6 flex items-center px-1.5 bg-slate-50/50 animate-pulse border-b border-slate-100">
                <div className={`flex-grow grid gap-1 items-center ${gridLayoutClass}`}>
                  {isCompressed ? (
                    <>
                      <div className="h-2.5 bg-slate-200 rounded-xs w-3/4 mb-1" />
                      <div className="h-2.5 bg-slate-200 rounded-xs w-1/2" />
                    </>
                  ) : (
                    <>
                      <div className="h-2 bg-slate-200 rounded-xs w-2/3" />
                      <div className="h-2 bg-slate-200 rounded-xs w-4/5" />
                      <div className="h-2 bg-slate-200 rounded-xs w-1/2" />
                      <div className="h-2 bg-slate-200 rounded-xs w-3/4" />
                      <div className="h-2 bg-slate-200 rounded-xs w-1/2 text-left" />
                      <div className="h-2 bg-slate-200 rounded-xs w-1/2 text-left" />
                      <div className="h-2 bg-slate-200 rounded-xs w-1/2 text-left" />
                      <div className="h-2 bg-slate-200 rounded-xs w-2/3" />
                      <div className="h-2 bg-slate-200 rounded-xs w-1/3 text-left" />
                      {activeTab === "Reviewed" && <div className="h-2 bg-slate-200 rounded-xs w-2/3" />}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : inventory.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 font-medium select-none text-[10px]" id="empty-inventory-state">
            <span>No inventory records found</span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5 font-mono">Scoped ledger partition empty</span>
          </div>
        ) : (
          inventory.map((item) => {
            const isSelected = activeInventoryId === item.id;
            const dynamicAge = calculateAge(item.inwardDate);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (setActiveInventoryId) {
                    setActiveInventoryId(isSelected ? null : item.id);
                  }
                }}
                className={`group ${isCompressed ? "py-1.5 min-h-[40px]" : "h-6"} border-b border-slate-200/60 flex items-center px-1.5 cursor-pointer text-[10px] select-none transition-all relative ${
                  isSelected
                    ? "bg-blue-50/95 text-slate-900 shadow-[inset_2px_0_0_0_rgb(99,102,241)]"
                    : "text-slate-700 hover:bg-slate-100/90"
                }`}
                id={`inventory-row-${item.id}`}
              >
                {isCompressed ? (
                  <div className="w-full grid grid-cols-[1.3fr_0.7fr] gap-1 items-center">
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 truncate text-[11px]" title={item.item}>
                        {item.item}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-medium truncate" title={item.sku}>
                        {item.sku}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-[11px] truncate">
                        {formatNumber(item.qty)} m
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-medium truncate">
                        {activeTab === "Reviewed" ? (item.location || "No Location") : `${dynamicAge}d age`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`flex-1 min-w-0 grid gap-1 items-center h-full ${gridLayoutClass}`}>
                    {/* SKU Column */}
                    <span className="font-mono text-slate-500 truncate text-[10px]" title={item.sku}>
                      {item.sku || "—"}
                    </span>

                    {/* Item Column */}
                    <span className="font-semibold text-slate-900 truncate text-[11px]" title={item.item}>
                      {item.item}
                    </span>

                    {/* Type Column */}
                    <span className="text-slate-600 truncate text-[10px]" title={item.type}>
                      {item.type || "—"}
                    </span>

                    {/* Invoice Column */}
                    <span className="font-mono text-slate-500 truncate text-[10px]" title={item.invoice}>
                      {item.invoice || "—"}
                    </span>

                    {/* Qty Column */}
                    <span className="font-mono text-slate-900 text-left text-[11px]">
                      {formatNumber(item.qty)}
                    </span>

                    {/* Rate Column */}
                    <span className="font-mono text-slate-500 text-left text-[10px]">
                      {formatCurrency(item.rate)}
                    </span>

                    {/* Value Column */}
                    <span className="font-mono font-bold text-slate-900 text-left text-[11px]">
                      {formatCurrency(item.value || (item.qty * item.rate))}
                    </span>

                    {/* Supplier Column */}
                    <span className="text-slate-600 truncate text-[10px]" title={item.supplier}>
                      {item.supplier || "—"}
                    </span>

                    {/* Age Column */}
                    <span className="font-mono text-slate-900 text-left text-[11px]">
                      {dynamicAge}d
                    </span>

                    {/* Location Column (Conditional) */}
                    {activeTab === "Reviewed" && (
                      <span className="text-indigo-600 font-semibold truncate text-[10px]" title={item.location}>
                        {item.location || "Not assigned"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Analytics Footer */}
      <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 border-t border-slate-200 pt-1 px-1 flex justify-between shrink-0 select-none bg-slate-100/55" id="inventory-footer-analytics">
        <span>Active Grid Lines: {inventory.length}</span>
        <span className="font-mono text-[8px] text-slate-500">scoped_inventory_db</span>
      </div>
    </div>
  );
}
