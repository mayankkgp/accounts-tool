import React from "react";

/**
 * PurchaseDataGrid Component
 * Implements a high-density, compact data grid structure.
 * Respects 24px fixed row heights, micro-scale typography, and flush stacking boundaries.
 */
export default function PurchaseDataGrid({
  purchases = [],
  isLoading = false,
  selectedPurchaseId = null,
  onSelectPurchase,
  vendorLookup = {},
  sortConfig = { column: "purchaseDate", direction: "desc" },
  setSortConfig,
}) {
  // Commercial totals calculation taking into account taxes and overall/item-wise discounts
  const calculateTotalAmount = (pur) => {
    const subtotal = (pur.items || []).reduce((sum, item) => {
      const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
      const lineTotal = Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));
      return sum + lineTotal;
    }, 0);

    const netTaxableValue = Math.max(0, subtotal - (Number(pur.overallDiscount) || 0));
    const tax = netTaxableValue * 0.18; // Flat standard 18% GST routing
    const grandTotal = netTaxableValue + tax + (Number(pur.freight) || 0);
    return Math.max(0, parseFloat(grandTotal.toFixed(2)));
  };

  // Indian standard currency formatting
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
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

  const isCompressed = !!selectedPurchaseId;
  const gridLayoutClass = isCompressed
    ? "grid-cols-[1.2fr_0.8fr]" // Compressed View displaying only Vendor name and Grand Total
    : "grid-cols-[1.1fr_2fr_1.5fr_1.4fr]"; // Full View displaying Date, Vendor name, Invoice number, Total Amount

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full" id="purchases-directory-container">
      {/* Dense Grid Header with Sort Controls */}
      <div
        className={`grid gap-1 px-1.5 py-0.5 border-b border-slate-300 text-[9px] uppercase tracking-wider font-semibold text-slate-500 select-none shrink-0 bg-slate-100 ${gridLayoutClass}`}
        id="purchase-grid-header-row"
      >
        {!isCompressed && (
          <button
            type="button"
            onClick={() => handleHeaderClick("purchaseDate")}
            className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
            id="date-header-sort-btn"
          >
            <span>Date</span>
            {renderSortIndicator("purchaseDate")}
          </button>
        )}

        <button
          type="button"
          onClick={() => handleHeaderClick("vendorName")}
          className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
          id="vendor-header-sort-btn"
        >
          <span>Vendor Name</span>
          {renderSortIndicator("vendorName")}
        </button>

        {!isCompressed && (
          <button
            type="button"
            onClick={() => handleHeaderClick("invoiceNumber")}
            className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans"
            id="invoice-header-sort-btn"
          >
            <span>Invoice Number</span>
            {renderSortIndicator("invoiceNumber")}
          </button>
        )}

        <button
          type="button"
          onClick={() => handleHeaderClick("totalAmount")}
          className="flex items-center gap-0.5 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 justify-self-end font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider font-sans text-right"
          id="amount-header-sort-btn"
        >
          <span>Total Amount</span>
          {renderSortIndicator("totalAmount")}
        </button>
      </div>

      {/* Row Scrolling Body Section */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto" id="purchase-list-scrollable-area">
        {isLoading ? (
          <div className="flex flex-col select-none divide-y divide-slate-100" id="purchase-list-skeleton-loader">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-6 flex items-center px-1.5 bg-slate-50/50 animate-pulse border-b border-slate-100">
                <div className={`flex-grow grid gap-1 items-center ${gridLayoutClass}`}>
                  {!isCompressed && <div className="h-2 bg-slate-200 rounded-xs w-2/3" />}
                  <div className="h-2 bg-slate-200 rounded-xs w-4/5" />
                  {!isCompressed && <div className="h-2 bg-slate-200 rounded-xs w-3/4" />}
                  <div className="h-2 bg-slate-200 rounded-xs w-1/2 justify-self-end text-right" />
                </div>
              </div>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 font-medium select-none text-[10px]" id="empty-purchase-state">
            <span>No purchase records found</span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5 font-mono">Scoped ledger partition empty</span>
          </div>
        ) : (
          purchases.map((p) => {
            const vendorName = vendorLookup[p.vendorId] || "Unknown Vendor";
            const computedTotal = calculateTotalAmount(p);
            const isSelected = selectedPurchaseId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => onSelectPurchase(p.id)}
                className={`group h-6 border-b border-slate-200/60 flex items-center px-1.5 cursor-pointer text-[10px] select-none transition-all relative ${
                  isSelected
                    ? "bg-indigo-50/95 text-slate-900 border-l-2 border-l-indigo-600"
                    : "text-slate-700 hover:bg-slate-100/90"
                }`}
                id={`purchase-row-${p.id}`}
              >
                <div className={`flex-1 min-w-0 grid gap-1 items-center h-full ${gridLayoutClass}`}>
                  {/* Date Column */}
                  {!isCompressed && (
                    <span className="font-mono text-slate-500 truncate text-[10px]" title={p.purchaseDate}>
                      {p.purchaseDate || "—"}
                    </span>
                  )}

                  {/* Vendor Name Column */}
                  <span className="font-semibold text-slate-900 truncate text-[11px]" title={vendorName}>
                    {vendorName}
                  </span>

                  {/* Invoice Number Column */}
                  {!isCompressed && (
                    <span className="font-mono text-slate-500 truncate text-[10px]" title={p.invoiceNumber}>
                      {p.invoiceNumber || "—"}
                    </span>
                  )}

                  {/* Total Amount Column */}
                  <span className="font-mono font-bold text-slate-900 text-right text-[11px]">
                    {formatCurrency(computedTotal)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Analytics Footer */}
      <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 border-t border-slate-200 pt-1 px-1 flex justify-between shrink-0 select-none bg-slate-100/55" id="purchases-footer-analytics">
        <span>Active Grid Lines: {purchases.length}</span>
        <span className="font-mono text-[8px] text-slate-500">scoped_purchases_db</span>
      </div>
    </div>
  );
}
