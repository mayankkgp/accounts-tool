import React from "react";
import { Loader2, Save, Check } from "lucide-react";

/**
 * PurchaseCreateFooter Component
 * Renders the totals summary indicators and submission action buttons.
 */
export default function PurchaseCreateFooter({
  computedTaxes,
  freight,
  isCalculating,
  isSaving,
  onClose,
  handleSaveAction,
  isCheckingDuplicate,
  isDuplicate,
  saveStatusMsg,
}) {
  return (
    <>
      {/* SECTION C: Totals Footer */}
      <div className="bg-slate-100 border border-slate-200 p-2 text-[10px] rounded-sm shrink-0 flex flex-col md:flex-row gap-4 md:items-center md:justify-end select-none font-sans" id="purchase-form-footer-box">
        
        {/* Main dynamic numeric columns */}
        <div className="flex-1 flex gap-4 md:justify-end flex-wrap">
          <div className="flex flex-col items-center px-2 py-0.5 border-r border-slate-200 bg-white shadow-xs rounded-[2px]">
            <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wide leading-none">Subtotal (Before Tax)</span>
            <span className="text-xs font-mono font-bold text-slate-900 mt-1 leading-none">
              {isCalculating ? (
                <span className="block animate-pulse bg-slate-200 h-3 w-12 rounded-xs" />
              ) : (
                `₹${computedTaxes.subtotal.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-0.5 border-r border-slate-200 bg-white shadow-xs rounded-[2px]">
            <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wide leading-none">Freight Charges</span>
            <span className="text-xs font-mono font-bold text-slate-900 mt-1 leading-none">
              ₹{parseFloat(freight || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-center px-2 py-0.5 border-r border-slate-200 bg-white shadow-xs rounded-[2px]">
            <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wide leading-none">Total Tax Value</span>
            <span className="text-xs font-mono font-bold text-slate-900 mt-1 leading-none text-indigo-700">
              {isCalculating ? (
                <span className="block animate-pulse bg-slate-200 h-3 w-12 rounded-xs" />
              ) : (
                `₹${computedTaxes.totalTax.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex flex-col items-end px-3 py-1 bg-indigo-900 text-white shadow-md rounded-[2px] min-w-[120px]">
            <span className="text-[8px] uppercase font-bold text-indigo-200 tracking-wide leading-none">Invoice Total (INR)</span>
            <span className="text-sm font-mono font-bold mt-1.5 leading-none">
              {isCalculating ? (
                <span className="block animate-pulse bg-indigo-700 h-3.5 w-16 rounded-xs" />
              ) : (
                `₹${Number(computedTaxes.grandTotal + (Number(freight) || 0)).toFixed(2)}`
              )}
            </span>
          </div>
        </div>

      </div>

      {/* Global form operations footer */}
      <div className="h-10 shrink-0 bg-slate-900 px-3 flex items-center justify-between font-sans border-t border-slate-950" id="purchase-form-actions-toolbar">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="h-6 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300 rounded-sm px-3 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all disabled:opacity-40"
          id="btn-form-cancel"
        >
          Cancel
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSaveAction("draft")}
            disabled={isSaving || isCheckingDuplicate || isDuplicate}
            className="h-6 bg-amber-600 hover:bg-amber-500 text-white rounded-sm px-3 text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-amber-700/50 shadow-sm transition-all disabled:opacity-40 flex items-center gap-1"
            id="btn-form-save-draft"
          >
            {isSaving && saveStatusMsg === "draft" ? (
              <>
                <Loader2 size={10} className="animate-spin text-white shrink-0" />
                <span>Saving Draft...</span>
              </>
            ) : (
              <>
                <Save size={11} className="stroke-[2.5]" />
                <span>Save as Draft</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSaveAction("finalized")}
            disabled={isSaving || isCheckingDuplicate || isDuplicate}
            className="h-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm px-3 text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-indigo-700/50 shadow-sm transition-all disabled:opacity-40 flex items-center gap-1"
            id="btn-form-finalize"
          >
            {isSaving && saveStatusMsg === "finalized" ? (
              <>
                <Loader2 size={10} className="animate-spin text-white shrink-0" />
                <span>Finalizing...</span>
              </>
            ) : (
              <>
                <Check size={11} className="stroke-[2.5]" />
                <span>Finalize Purchase</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
