import React, { useState, useEffect } from "react";
import { X, Calendar, FileText, IndianRupee, Hash } from "lucide-react";
import { fetchPurchaseById } from "../../services/purchaseService";

/**
 * PurchaseDetailPane Component
 * Renders a high-fidelity, compact read-only detailed panel with a simulated loader.
 * Conforms to compact-ui specifications (24px heights, 12px/10px typography, 4px/8px spacings).
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

  if (!activePurchaseId) return null;

  // Format currency with standard Indian numbering formatting
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  // Math calculator to determine exact subtotals, proportional taxation, and final total amounts
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
      className="h-full flex flex-col bg-slate-50 border border-slate-200 shadow-sm p-2 gap-2 overflow-hidden font-sans select-none animate-none"
      id="purchase-interactive-detail-pane"
    >
      {/* 1. Header Control Row */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 shrink-0" id="detail-header-nav">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Purchase Voucher</span>
          <span className="text-[11px] font-mono text-slate-700 bg-slate-200/50 px-1 rounded-xs font-semibold py-0.5 mt-0.5">
            {activePurchaseId}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 cursor-pointer h-5 w-5 flex items-center justify-center rounded-xs hover:bg-slate-200/60 transition-colors"
          title="Close detail pane"
          type="button"
          id="close-detail-pane-btn"
        >
          <X size={14} className="stroke-[2.5]" />
        </button>
      </div>

      {isLoading ? (
        /* 2. Compact Skeleton Loading Layout (24px fixed heights) */
        <div className="flex-1 flex flex-col gap-2 shrink-0 overflow-hidden" id="detail-pane-shimmer">
          {/* Header Card Shimmer */}
          <div className="bg-white border border-slate-200 rounded-sm p-2 flex flex-col gap-1.5 animate-pulse">
            <div className="h-3 bg-slate-200 rounded-xs w-1/3" />
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <div className="h-5 bg-slate-150 rounded-xs" />
              <div className="h-5 bg-slate-150 rounded-xs" />
            </div>
          </div>
          {/* Table Header Shimmer */}
          <div className="h-6 bg-slate-200 rounded-xs animate-pulse" />
          {/* Table Item Shimmers */}
          <div className="flex flex-col gap-1 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-6 bg-white/70 border border-slate-100 rounded-xs p-1 flex justify-between animate-pulse">
                <div className="h-2 bg-slate-200 rounded-xs w-1/3 my-auto" />
                <div className="h-2 bg-slate-200 rounded-xs w-1/6 my-auto" />
              </div>
            ))}
          </div>
          {/* Totals Section Shimmer */}
          <div className="border-t border-slate-200 pt-2 flex flex-col gap-1 items-end animate-pulse">
            <div className="h-3 bg-slate-200 rounded-xs w-1/4" />
            <div className="h-4 bg-slate-300 rounded-xs w-1/3 mt-1" />
          </div>
        </div>
      ) : !purchase ? (
        /* Empty / Missing Record State */
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs font-medium py-16" id="detail-pane-missing-record">
          <span>Failed to fetch purchase details</span>
          <span className="text-[10px] font-mono mt-1 text-slate-300">record_fetch_error</span>
        </div>
      ) : (
        /* 3. Fully Active High-Density Content Area */
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden" id="detail-pane-content">
          {/* Document Header Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 bg-white border border-slate-250/70 p-2 rounded-sm shrink-0" id="detail-metadata-card">
            <div className="flex flex-col min-w-0" id="meta-vendor">
              <span className="text-[8px] uppercase tracking-wide font-bold text-slate-400 font-mono">Vendor Entity</span>
              <span className="text-[11px] font-bold text-slate-900 truncate" title={vendorName}>
                {vendorName}
              </span>
            </div>

            <div className="flex flex-col min-w-0" id="meta-invoice">
              <span className="text-[8px] uppercase tracking-wide font-bold text-slate-400 font-mono">Invoice Number</span>
              <div className="flex items-center gap-1 text-slate-800 font-mono text-[10px]">
                <FileText size={10} className="text-slate-400 shrink-0" />
                <span className="truncate font-semibold">{purchase.invoiceNumber || "—"}</span>
              </div>
            </div>

            <div className="flex flex-col" id="meta-date">
              <span className="text-[8px] uppercase tracking-wide font-bold text-slate-400 font-mono">Purchase Date</span>
              <div className="flex items-center gap-1 text-slate-800 font-mono text-[10px]">
                <Calendar size={10} className="text-slate-400 shrink-0" />
                <span>{purchase.purchaseDate || "—"}</span>
              </div>
            </div>

            <div className="flex flex-col min-w-0" id="meta-po">
              <span className="text-[8px] uppercase tracking-wide font-bold text-slate-400 font-mono">Linked PO</span>
              <div className="flex items-center gap-1 text-slate-800 font-mono text-[10px]">
                <Hash size={10} className="text-slate-400 shrink-0" />
                <span className="truncate">{purchase.poNumber || "—"}</span>
              </div>
            </div>

            <div className="flex flex-col md:col-span-2 pt-1 border-t border-slate-100 flex-row justify-between" id="meta-lvalue">
              <div>
                <span className="text-[8px] uppercase tracking-wide font-bold text-slate-400 font-mono block">L-Value Ref</span>
                <span className="text-[10px] font-mono text-slate-600 font-medium">
                  {purchase.lValue !== undefined ? purchase.lValue : "—"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wide font-bold text-slate-400 font-mono block">Financial Year</span>
                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1 rounded-sm inline-block">
                  {purchase.financialYear || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Inventory Table Section */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-[110px]" id="detail-line-items-wrapper">
            <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400 mb-1 shrink-0 font-mono">Invoice Line Items</span>
            
            <div className="flex-1 overflow-auto border border-slate-200/80 rounded-sm bg-white" id="detail-grid-viewport">
              <table className="w-full border-collapse text-left text-slate-700 text-[10px]" id="detail-grid-table">
                <thead className="bg-slate-100 text-[8px] uppercase tracking-wider text-slate-500 font-bold h-6 sticky top-0 border-b border-slate-200 select-none z-10">
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
      )}
    </div>
  );
}
