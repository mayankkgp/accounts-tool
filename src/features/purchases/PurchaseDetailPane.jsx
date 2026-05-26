import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchPurchaseById } from "../../services/purchaseService";

/**
 * PurchaseDetailPane Component
 * Renders a high-fidelity, completely flat and flush read-only detailed panel with a simulated loader.
 * Conforms to compact-ui and modularity specs (24px heights, 12px/10px typography, 4px/8px spacings, flush stacking).
 */
export default function PurchaseDetailPane({
  activePurchaseId,
  onClose,
  vendorLookup = {},
}) {
  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activePurchaseId) {
      setPurchase(null);
      return;
    }

    let isCurrent = true;
    async function loadDetail() {
      setIsLoading(true);
      try {
        const data = await fetchPurchaseById(activePurchaseId);
        if (isCurrent) {
          setPurchase(data);
        }
      } catch (err) {
        console.error("Critical: Failed to query purchase by id mapping.", err);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isCurrent = false;
    };
  }, [activePurchaseId]);

  // Support closing the pane via Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!activePurchaseId) return null;

  // Format currency with standard Indian numbering formatting
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  const vendorName = purchase ? vendorLookup[purchase.vendorId] || "Unknown Supplier" : "—";

  // Calculate detailed values
  const lines = purchase?.items || [];
  const subtotal = lines.reduce((sum, item) => {
    const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    return sum + Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));
  }, 0);

  const overallDiscount = Number(purchase?.overallDiscount) || 0;
  const netTaxableValue = Math.max(0, subtotal - overallDiscount);
  const freight = Number(purchase?.freight) || 0;
  const taxRate = 0.18; // standard 18% standard GST rate
  const calculatedTax = netTaxableValue * taxRate;
  const grandTotal = netTaxableValue + calculatedTax + freight;

  return (
    <div
      className="h-full flex flex-col bg-white animate-in slide-in-from-right-4 duration-200 font-sans select-none overflow-hidden"
      id="purchase-interactive-detail-pane"
    >
      {isLoading ? (
        /* 1. Header & Detail Skeleton Loader */
        <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden select-none" id="detail-pane-skeleton-loader">
          {/* Header Shimmer */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1.5 shrink-0 animate-pulse">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 bg-slate-200 rounded-sm w-1/4" />
              <div className="h-4 bg-slate-250 rounded-sm w-1/2" />
            </div>
            <div className="h-6 w-6 bg-slate-200 rounded-sm shrink-0" />
          </div>
          {/* Table Header Shimmer */}
          <div className="h-6 bg-slate-200 rounded-sm animate-pulse" />
          {/* Table Item Shimmers */}
          <div className="flex flex-col gap-1 overflow-hidden flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-6 bg-slate-50 border border-slate-100 rounded-sm p-1 flex justify-between items-center animate-pulse">
                <div className="h-2.5 bg-slate-200 rounded-xs w-1/3" />
                <div className="h-2.5 bg-slate-200 rounded-xs w-1/6" />
              </div>
            ))}
          </div>
          {/* Totals Section Shimmer */}
          <div className="border-t border-slate-200 pt-2 flex flex-col gap-1 items-end animate-pulse mt-auto shrink-0 animate-delay-75">
            <div className="h-3 bg-slate-200 rounded-xs w-1/4" />
            <div className="h-5 bg-slate-350 rounded-xs w-1/3 mt-1" />
          </div>
        </div>
      ) : !purchase ? (
        /* 2. Empty / Missing Record State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-xs font-medium" id="detail-pane-missing-record">
          <span>Failed to fetch purchase details</span>
          <span className="text-[10px] font-mono mt-1 text-slate-300">record_fetch_error</span>
        </div>
      ) : (
        /* 3. Fully Active High-Density Content Area */
        <>
          {/* Functional Transaction Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 shrink-0 select-none bg-slate-50/50" id="detail-header-nav">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Purchase Status Badge */}
                <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.25 bg-slate-100 text-slate-700 border border-slate-250 rounded-[2px] shrink-0 font-sans">
                  {purchase.status === "draft" ? "Draft" : "Finalized"}
                </span>
                <h2 className="text-[13px] font-bold text-slate-900 leading-none truncate max-w-[140px]" title={vendorName}>
                  {vendorName}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
                <span>INV: <span className="text-slate-800 font-semibold">{purchase.invoiceNumber || "—"}</span></span>
                <span className="text-[10px] text-slate-300">|</span>
                <span>Date: <span className="text-slate-800 font-semibold">{purchase.purchaseDate || "—"}</span></span>
              </div>
            </div>

            {/* L-value & PO Badges + Close Button */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {purchase.lValue !== undefined && purchase.lValue !== "" && (
                <div className="bg-amber-50 border border-amber-200 rounded-[2px] px-1.5 py-0.5 text-right font-mono shrink-0">
                  <div className="text-[8px] uppercase text-amber-700 leading-none tracking-wide font-bold">L-Value</div>
                  <div className="text-[9px] font-bold font-mono uppercase text-amber-800 leading-none mt-0.5">
                    {purchase.lValue}
                  </div>
                </div>
              )}

              {purchase.poNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-[2px] px-1.5 py-0.5 text-right font-mono shrink-0">
                  <div className="text-[8px] uppercase text-blue-700 leading-none tracking-wide font-bold">PO Num</div>
                  <div className="text-[9px] font-bold font-mono uppercase text-blue-800 leading-none mt-0.5">
                    {purchase.poNumber}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="h-6 w-6 rounded-sm flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer p-0 shrink-0"
                title="Close details (Esc)"
                id="close-detail-pane-btn"
                type="button"
              >
                <X size={13} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Body content with side padding */}
          <div className="flex-1 flex flex-col gap-2 px-3 pb-2.5 pt-1.5 overflow-hidden" id="detail-pane-content">
            {/* Context/Financial Year identification info banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-0.5 shrink-0" id="detail-subheader-meta">
              <span className="text-[10px] text-slate-500 font-medium">
                Financial Year: <span className="font-semibold text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded-xs">{purchase.financialYear || "—"}</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                TRANS_REF: {purchase.id}
              </span>
            </div>

            {/* Line Items Inventory Table Section */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-[110px]" id="detail-line-items-wrapper">
              <div className="flex items-center justify-between mb-1 shrink-0">
                <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400 font-mono">Invoice Line Items</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {lines.length} {lines.length === 1 ? "line entry" : "line entries"}
                </span>
              </div>
              
              <div className="flex-1 overflow-auto border border-slate-200/80 rounded-sm bg-white" id="detail-grid-viewport">
                <table className="w-full border-collapse text-left text-slate-700 text-[10px]" id="detail-grid-table">
                  <thead className="bg-slate-150 text-[8px] uppercase tracking-wider text-slate-500 font-bold h-6 sticky top-0 border-b border-slate-250 select-none z-10">
                    <tr>
                      <th className="py-0.5 px-1.5 font-semibold">Item Name</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-12">HSN</th>
                      <th className="py-0.5 px-1 font-semibold text-right w-14">Rate</th>
                      <th className="py-0.5 px-1 font-semibold text-right w-12">Qty</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-10">UOM</th>
                      <th className="py-0.5 px-1.5 font-semibold text-right w-16">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {lines.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-[9px] text-slate-400 font-sans">
                          No items attached to this invoice.
                        </td>
                      </tr>
                    ) : (
                      lines.map((it, index) => (
                        <tr key={it.rowId || index} className="h-6 hover:bg-slate-50/50 transition-colors">
                          <td className="py-0.5 px-1.5 font-sans font-medium text-slate-900 truncate max-w-[90px]" title={it.itemName}>
                            {it.itemName}
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-500 text-[9px]">
                            {it.hsnCode || "—"}
                          </td>
                          <td className="py-0.5 px-1 text-right text-slate-600">
                            {Number(it.rate || 0).toFixed(2)}
                          </td>
                          <td className="py-0.5 px-1 text-right text-slate-900 font-semibold">
                            {it.quantity || 0}
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-500 font-sans text-[9px]">
                            {it.uom || "—"}
                          </td>
                          <td className="py-0.5 px-1.5 text-right text-slate-500">
                            {it.itemDiscount ? `₹${it.itemDiscount}` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* totals and State tax mapping summaries */}
            <div className="bg-slate-100 border border-slate-200 p-2 rounded-sm shrink-0 flex flex-col gap-1 mt-auto text-[10px]" id="detail-totals-summary">
              <div className="flex justify-between items-center text-slate-500 font-medium h-5">
                <span>Taxable Value (Subtotal):</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              
              {overallDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold h-5">
                  <span>Overall Discount:</span>
                  <span className="font-mono">- {formatCurrency(overallDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-500 font-medium h-5">
                <span>Freight / Shipping:</span>
                <span className="font-mono">{formatCurrency(freight)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500 font-medium h-5">
                <span>Calculated GST (18.00%):</span>
                <span className="font-mono">{formatCurrency(calculatedTax)}</span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-250 pt-1.5 text-[11px] font-bold text-slate-900 mt-0.5 h-6">
                <span className="text-[10px] uppercase tracking-wide">Final Grand Total:</span>
                <span className="font-mono text-indigo-700 bg-indigo-50/70 border border-indigo-200/50 px-1.5 rounded-sm">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
