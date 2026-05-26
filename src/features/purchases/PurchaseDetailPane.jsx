import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchPurchaseById, calculatePurchaseTaxesSync } from "../../services/purchaseService";

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

  // Calculate taxes and totals from Tax Engine API (Sync implementation)
  const taxDetail = purchase ? calculatePurchaseTaxesSync(purchase.items || [], purchase.vendorId, Number(purchase.overallDiscount) || 0) : null;
  const isIntrastate = taxDetail?.isIntrastate;

  // Detailed totals
  const subtotal = taxDetail?.subtotal || 0;
  const freight = Number(purchase?.freight) || 0;

  // Recalculate net dynamic tax values taking into account the overall discount
  const netCgst = taxDetail?.cgst || 0;
  const netSgst = taxDetail?.sgst || 0;
  const netIgst = taxDetail?.igst || 0;
  const totalTax = taxDetail?.totalTax || 0;
  const grandTotal = subtotal + totalTax + freight;

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
          <span className="text-[10px] font-mono mt-1 text-slate-350">record_fetch_error</span>
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
                <h2 className="text-[13px] font-bold text-slate-900 leading-none truncate max-w-[210px]" title={vendorName}>
                  {vendorName}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
                <span>INV: <span className="text-slate-800 font-semibold">{purchase.invoiceNumber || "—"}</span></span>
                <span className="text-[10px] text-slate-300">|</span>
                <span>Date: <span className="text-slate-800 font-semibold">{purchase.purchaseDate || "—"}</span></span>
              </div>
            </div>

            {/* Close Button Only */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
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
            {/* Context subheader (L-Value, Relocated PO No, and TRANS_REF) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-0.5 shrink-0" id="detail-subheader-meta">
              <div className="flex items-center gap-4 text-xs font-sans">
                {purchase.lValue !== undefined && purchase.lValue !== "" && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium font-sans">L-Value:</span>
                    <span className="text-xs text-slate-900 font-mono font-semibold">{purchase.lValue}</span>
                  </div>
                )}
                {purchase.poNumber && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium font-sans">Ref PO No:</span>
                    <span className="text-xs text-slate-900 font-mono font-semibold">{purchase.poNumber}</span>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                TRANS_REF: {purchase.id}
              </span>
            </div>

            {/* Line Items Inventory Table Section */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-[110px]" id="detail-line-items-wrapper">
              <div className="flex items-center justify-between mb-1 shrink-0">
                <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400 font-mono">Invoice Line Items</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {purchase.items?.length || 0} {purchase.items?.length === 1 ? "line entry" : "line entries"}
                </span>
              </div>
              
              <div className="flex-1 overflow-auto border border-slate-200/80 rounded-sm bg-white" id="detail-grid-viewport">
                <table className="w-full border-collapse text-left text-slate-705 text-xs" id="detail-grid-table">
                  <thead className="bg-slate-150 text-[10px] uppercase tracking-wider text-slate-500 font-bold h-6 sticky top-0 border-b border-slate-250 select-none z-10 font-sans">
                    <tr>
                      <th className="py-0.5 px-1 font-semibold text-left w-[23%] truncate">Item Name</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-[8%]">HSN</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-[9%]">Rate</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-[7%]">Qty</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-[7%]">UOM</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-[8%]">Disc</th>
                      <th className="py-0.5 px-1 font-semibold text-center w-[11%]">Before Tax</th>
                      {isIntrastate ? (
                        <>
                          <th className="py-0.5 px-1 font-semibold text-center w-[8.5%]">CGST</th>
                          <th className="py-0.5 px-1 font-semibold text-center w-[8.5%]">SGST</th>
                        </>
                      ) : (
                        <th className="py-0.5 px-1 font-semibold text-center w-[17%]">IGST</th>
                      )}
                      <th className="py-0.5 px-1 font-semibold text-right w-[10%]">After Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-xs">
                    {!taxDetail || taxDetail.items?.length === 0 ? (
                      <tr>
                        <td colSpan={isIntrastate ? 10 : 9} className="py-4 text-center text-xs text-slate-400 font-sans">
                          No items attached to this invoice.
                        </td>
                      </tr>
                    ) : (
                      taxDetail.items.map((it, index) => (
                        <tr key={it.rowId || index} className="h-6 hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                          <td className="py-0.5 px-1 font-sans font-medium text-slate-900 truncate max-w-[120px]" title={it.itemName}>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs text-slate-900 font-bold truncate leading-none">{it.itemName}</span>
                              {it.description && (
                                <span className="text-[10px] text-slate-500 truncate mt-0.5 leading-none" title={it.description}>
                                  {it.description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-500 text-xs">
                            {it.hsnCode || "—"}
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-600 text-xs">
                            {Number(it.rate || 0).toFixed(2)}
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-900 font-semibold text-xs">
                            {it.quantity || 0}
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-500 font-sans text-xs">
                            {it.uom || "—"}
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-500 text-xs">
                            {it.itemDiscount ? `₹${it.itemDiscount}` : "—"}
                          </td>
                          <td className="py-0.5 px-1 text-center text-slate-700 font-semibold text-xs">
                            {Number(it.lineTotal || 0).toFixed(2)}
                          </td>
                          {isIntrastate ? (
                            <>
                              <td className="py-0.5 px-1 text-center font-sans text-xs">
                                <div className="flex flex-col items-center leading-none">
                                  <span className="text-slate-700 text-xs font-semibold">₹{Number(it.cgstAmount || 0).toFixed(2)}</span>
                                  <span className="text-[10px] text-slate-400">9%</span>
                                </div>
                              </td>
                              <td className="py-0.5 px-1 text-center font-sans text-xs">
                                <div className="flex flex-col items-center leading-none">
                                  <span className="text-slate-700 text-xs font-semibold">₹{Number(it.sgstAmount || 0).toFixed(2)}</span>
                                  <span className="text-[10px] text-slate-400">9%</span>
                                </div>
                              </td>
                            </>
                          ) : (
                            <td className="py-0.5 px-1 text-center font-sans text-xs">
                              <div className="flex flex-col items-center leading-none">
                                <span className="text-slate-700 text-xs font-semibold">₹{Number(it.igstAmount || 0).toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400">18%</span>
                              </div>
                            </td>
                          )}
                          <td className="py-0.5 px-1 text-right text-slate-900 font-bold text-xs">
                            {Number(it.totalAfterTax || 0).toFixed(2)}
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
              
              <div className="flex justify-between items-center text-slate-500 font-medium h-5">
                <span>Freight / Shipping:</span>
                <span className="font-mono">{formatCurrency(freight)}</span>
              </div>

              {/* Dynamic State Tax Labels basing Haryana Registered Home State */}
              {isIntrastate ? (
                <>
                  <div className="flex justify-between items-center text-slate-500 font-medium h-5">
                    <span>Central GST (CGST - 9%):</span>
                    <span className="font-mono">{formatCurrency(netCgst)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-medium h-5">
                    <span>State GST (SGST - 9%):</span>
                    <span className="font-mono">{formatCurrency(netSgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-slate-500 font-medium h-5">
                  <span>Integrated GST (IGST - 18%):</span>
                  <span className="font-mono">{formatCurrency(netIgst)}</span>
                </div>
              )}

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
