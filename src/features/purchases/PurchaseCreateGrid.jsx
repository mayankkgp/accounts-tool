import React from "react";
import { RefreshCw, Plus, Trash2 } from "lucide-react";

/**
 * PurchaseCreateGrid Component
 * Renders the editable spreadsheet grid for purchase invoice line items.
 */
export default function PurchaseCreateGrid({
  lineItems,
  computedTaxes,
  validationErrors,
  isCalculating,
  isSaving,
  isAiMode,
  handleRowFieldChange,
  deleteLineRow,
  addLineRow,
  isLocked = false,
}) {
  return (
    <div className="flex-1 flex flex-col min-h-[160px] border border-slate-200/80 rounded-sm bg-white overflow-hidden" id="purchase-form-spreadsheet-container">
      <div className="h-6 bg-slate-900 px-3 flex items-center justify-between shrink-0 font-sans border-b border-slate-950">
        <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400">Invoice Items Spreadsheet</span>
        <div className="flex items-center gap-1.5">
          {isCalculating && (
            <span className="text-[8px] font-mono font-bold text-amber-400 flex items-center gap-1">
              <RefreshCw size={8} className="animate-spin text-amber-400 shrink-0" />
              <span>Recalculating math live...</span>
            </span>
          )}
          <span className="text-[9px] font-mono text-slate-405">
            {lineItems.length} lines entries
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-205/10" id="form-spreadsheet-viewport">
        <table className="w-full border-collapse text-left text-slate-700 text-xs" id="form-spreadsheet-table">
          <thead className="bg-slate-150 text-[10px] uppercase tracking-wider text-slate-500 font-bold h-6 sticky top-0 border-b border-slate-250 select-none z-10 font-sans">
            <tr>
              <th className="py-0.5 px-1 text-center w-[3%]">#</th>
              <th className="py-0.5 px-1 text-left w-[24%]">Item Name *</th>
              <th className="py-0.5 px-1 text-left w-[18%]">Desc / Remarks</th>
              <th className="py-0.5 px-1 text-center w-[7%]">HSN</th>
              <th className="py-0.5 px-1 text-center w-[7%]">Rate *</th>
              <th className="py-0.5 px-1 text-center w-[6%]">Qty *</th>
              <th className="py-0.5 px-1 text-center w-[6%]">UOM</th>
              <th className="py-0.5 px-1 text-center w-[7%]">Disc. (₹)</th>
              <th className="py-0.5 px-1 text-center w-[8%]">Taxable Value</th>
              <th className="py-0.5 px-1 text-center w-[9%]">Tax Rate & Amt</th>
              <th className="py-0.5 px-1 text-right w-[10%]">Total (After Tax)</th>
              <th className="py-0.5 px-1 text-center w-[5%]">Del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-xs bg-white">
            {lineItems.map((it, idx) => {
              const calculatedRow = computedTaxes.items?.[idx] || {};
              const rawTotal = (Number(it.rate) || 0) * (Number(it.quantity) || 0);
              const baseTaxable = Math.max(0, rawTotal - (Number(it.itemDiscount) || 0));
              const rowErrors = validationErrors.lineItems?.[it.rowId] || {};
              
              return (
                <tr key={it.rowId} className="h-6 hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                  {/* Sequence */}
                  <td className="py-0.5 px-1 text-center text-[10px] font-sans font-bold text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Item name input */}
                  <td className="py-0.5 px-1">
                    <input
                      type="text"
                      value={it.itemName}
                      onChange={(e) => handleRowFieldChange(it.rowId, "itemName", e.target.value)}
                      disabled={isSaving || isLocked}
                      className={`w-full bg-transparent px-1 font-sans focus:bg-slate-50/80 hover:border-slate-300 rounded-sm text-xs h-5 font-medium text-slate-900 leading-none outline-none truncate border disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed ${
                        rowErrors.itemName 
                          ? "!border-red-500 bg-rose-50/10 focus:ring-1 focus:ring-red-500" 
                          : "border-transparent focus:border-indigo-505"
                      }`}
                      required
                    />
                  </td>

                  {/* Description optional remark input */}
                  <td className="py-0.5 px-1">
                    <input
                      type="text"
                      value={it.description || ""}
                      onChange={(e) => handleRowFieldChange(it.rowId, "description", e.target.value)}
                      disabled={isSaving || isLocked}
                      className="w-full bg-transparent px-1 font-sans focus:bg-slate-50/80 hover:border-slate-300 border border-transparent rounded-sm text-[10px] h-5 leading-none text-slate-500 outline-none truncate disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                  </td>

                  {/* HSN Code */}
                  <td className="py-0.5 px-1 text-center">
                    <input
                      type="text"
                      value={it.hsnCode}
                      onChange={(e) => handleRowFieldChange(it.rowId, "hsnCode", e.target.value)}
                      disabled={isSaving || isLocked}
                      className="w-full text-center bg-transparent px-1 font-mono focus:bg-slate-50/85 hover:border-slate-300 border border-transparent rounded-sm text-xs h-5 text-slate-550 outline-none disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                  </td>
                  {/* Unit Rate */}
                  <td className="py-0.5 px-1 text-center">
                    <input
                      type="number"
                      value={it.rate}
                      onChange={(e) => handleRowFieldChange(it.rowId, "rate", e.target.value)}
                      disabled={isSaving || isLocked}
                      className={`w-full text-center bg-transparent px-1 font-mono focus:bg-slate-50/80 hover:border-slate-300 rounded-sm text-xs h-5 text-slate-900 font-medium outline-none text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] border disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed ${
                        rowErrors.rate 
                          ? "!border-red-500 bg-rose-50/10 focus:ring-1 focus:ring-red-500" 
                          : "border-transparent focus:border-indigo-505"
                      }`}
                      required
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-0.5 px-1 text-center">
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => handleRowFieldChange(it.rowId, "quantity", e.target.value)}
                      disabled={isSaving || isLocked}
                      className={`w-full text-center bg-transparent px-1 font-mono focus:bg-slate-550/80 hover:border-slate-300 rounded-sm text-xs h-5 text-slate-900 font-bold outline-none text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] border disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed ${
                        rowErrors.quantity 
                          ? "!border-red-500 bg-rose-50/10 focus:ring-1 focus:ring-red-500" 
                          : "border-transparent focus:border-indigo-505"
                      }`}
                      required
                    />
                  </td>

                  {/* UOM restricted only to m and kg */}
                  <td className="py-0.5 px-1 text-center">
                    <select
                      value={it.uom}
                      onChange={(e) => handleRowFieldChange(it.rowId, "uom", e.target.value)}
                      disabled={isSaving || isLocked}
                      className="h-5 text-[10px] px-1 font-sans font-medium focus:bg-slate-50/80 hover:border-slate-300 border border-transparent rounded-sm outline-none bg-white text-slate-600 disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      <option value="kg">kg</option>
                      <option value="m">m</option>
                    </select>
                  </td>

                  {/* Item Discount */}
                  <td className="py-0.5 px-1 text-center">
                    <input
                      type="number"
                      value={it.itemDiscount}
                      onChange={(e) => handleRowFieldChange(it.rowId, "itemDiscount", e.target.value)}
                      disabled={isSaving || isLocked}
                      className="w-full text-center bg-transparent px-1 font-mono focus:bg-slate-50/80 hover:border-slate-300 focus:border-indigo-550 border border-transparent rounded-sm text-xs h-5 text-rose-600 outline-none text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                  </td>

                  {/* Dynamic Taxable calculations featuring shimmer delay feedback */}
                  <td className="py-0.5 px-1 text-center font-bold text-slate-900 text-xs">
                    {isCalculating ? (
                      <div className="h-3.5 bg-slate-205/65 animate-pulse rounded-xs w-12 mx-auto" />
                    ) : (
                      <span>{Number(calculatedRow.lineTotal || baseTaxable).toFixed(2)}</span>
                    )}
                  </td>

                  {/* CGST/SGST 9%+9% or IGST 18% based on state routing */}
                  <td className="py-0.5 px-1 text-center text-slate-500 text-[10px] leading-tight">
                    {isCalculating ? (
                      <div className="h-3.5 bg-slate-205/65 animate-pulse rounded-xs w-10 mx-auto" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-slate-700">₹{Number(calculatedRow.taxAmount || 0).toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 font-sans">
                          {computedTaxes.isIntrastate ? "CGST+SGST (18%)" : "IGST (18%)"}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* After tax line Total */}
                  <td className="py-0.5 px-1 text-right text-slate-950 font-bold text-xs pr-2">
                    {isCalculating ? (
                      <div className="h-3.5 bg-slate-205/65 animate-pulse rounded-xs w-16 ml-auto" />
                    ) : (
                      <span>{Number(calculatedRow.totalAfterTax || (baseTaxable * 1.18)).toFixed(2)}</span>
                    )}
                  </td>

                  {/* Delete row handler */}
                  <td className="py-0.5 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => deleteLineRow(it.rowId)}
                      disabled={isSaving || isLocked}
                      className="h-5 w-5 rounded-xs flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-none bg-transparent cursor-pointer shrink-0 mx-auto disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Remove item line row"
                      id={`delete-row-${it.rowId}`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add column bottom operations button */}
      <div className="h-8 shrink-0 bg-slate-50/50 border-t border-slate-200 px-3 flex items-center justify-between" id="form-spreadsheet-toolbar">
        <button
          type="button"
          onClick={addLineRow}
          disabled={isSaving || isLocked}
          className="h-5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-705 rounded-sm px-2 text-[10px] uppercase font-bold tracking-wider cursor-pointer flex items-center justify-center gap-1 disabled:opacity-45 disabled:cursor-not-allowed"
          id="btn-form-add-row"
        >
          <Plus size={10} className="stroke-[2.5]" />
          <span>Add Invoice Line Item</span>
        </button>
        
        {isAiMode && (
          <div className="text-[9px] font-medium text-amber-600 bg-amber-50 border border-amber-205/40 rounded-[2px] px-1.5 h-4.5 flex items-center leading-none">
            Warning: Verify item descriptions correspond perfectly to PDF scanned data points
          </div>
        )}
      </div>
    </div>
  );
}
