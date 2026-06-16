import React from "react";

/**
 * PurchaseDetailTotals Component
 * Renders the bottom totals summary block.
 * Accepts subtotal, freight, netCgst, netSgst, netIgst, totalTax, grandTotal, and isIntrastate as props.
 */
export default function PurchaseDetailTotals({
  subtotal,
  freight,
  netCgst,
  netSgst,
  netIgst,
  totalTax,
  grandTotal,
  isIntrastate,
}) {
  // Format currency with standard Indian numbering formatting
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  return (
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
  );
}
