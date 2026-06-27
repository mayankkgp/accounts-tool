import React from "react";

/**
 * InventoryGridHeader Component
 * Renders the dense column headers with sort controls.
 */
export default function InventoryGridHeader({
  activeTab,
  sortConfig,
  setSortConfig,
  isCompressed,
  gridLayoutClass,
}) {
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

  const renderSortIndicator = (colName) => {
    const isCurrent = sortConfig.column === colName;
    if (!isCurrent || sortConfig.direction === "default") {
      return (
        <span className="opacity-30 font-extrabold text-[8px] tracking-normal inline-block ml-0.5" id={`sort-icon-default-${colName}`}>
          &#8645;
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <span className="text-indigo-600 font-extrabold text-[9px] inline-block ml-0.5" id={`sort-icon-asc-${colName}`}>
        &#8593;
      </span>
    ) : (
      <span className="text-indigo-600 font-extrabold text-[9px] inline-block ml-0.5" id={`sort-icon-desc-${colName}`}>
        &#8595;
      </span>
    );
  };

  return (
    <div
      className={`grid gap-1 px-1.5 py-0.5 border-b border-slate-300 text-[9px] uppercase tracking-wider font-semibold text-slate-500 select-none shrink-0 bg-slate-100 ${gridLayoutClass}`}
      id="inventory-grid-header-row"
    >
      {isCompressed ? (
        <>
          <span className="text-left py-0.5 text-[9px] uppercase tracking-wider font-semibold font-sans" id="header-col-item">ITEM</span>
          <span className="text-left py-0.5 text-[9px] uppercase tracking-wider font-semibold font-sans" id="header-col-sku">SKU</span>
          <span className="text-left py-0.5 text-[9px] uppercase tracking-wider font-semibold font-sans" id="header-col-qty-rate">QTY / RATE</span>
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
  );
}
