import React from "react";

/**
 * PurchaseDetailTable Component
 * Renders the line-items list inside a compact, high-density read-only table.
 * Accepts `taxDetail` and `isIntrastate` as props.
 */
export default function PurchaseDetailTable({ taxDetail, isIntrastate }) {
  const items = taxDetail?.items || [];
  const itemsCount = items.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-[110px] min-h-0" id="detail-line-items-wrapper">
      <div className="flex items-center justify-between mb-1 shrink-0">
        <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400 font-mono font-sans font-sans">Invoice Line Items</span>
        <span className="text-[9px] font-mono text-slate-400">
          {itemsCount} {itemsCount === 1 ? "line entry" : "line entries"}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto min-h-0 border border-slate-200/80 rounded-sm bg-white" id="detail-grid-viewport">
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
            {itemsCount === 0 ? (
              <tr>
                <td colSpan={isIntrastate ? 10 : 9} className="py-4 text-center text-xs text-slate-400 font-sans">
                  No items attached to this invoice.
                </td>
              </tr>
            ) : (
              items.map((it, index) => (
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
                    {((Number(it.itemDiscount) || 0) + (Number(it.proratedDiscount) || 0)) > 0 ? (
                      `₹${((Number(it.itemDiscount) || 0) + (Number(it.proratedDiscount) || 0)).toFixed(2)}`
                    ) : (
                      "—"
                    )}
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
  );
}
