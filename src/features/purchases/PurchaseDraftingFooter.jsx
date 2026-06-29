import React from "react";
import { Loader2, Save } from "lucide-react";

export default function PurchaseDraftingFooter({
  overallDiscount,
  setOverallDiscount,
  freight,
  setFreight,
  computedTaxes,
  isSaving,
  onCancel,
  onSave
}) {
  const subtotal = computedTaxes?.subtotal || 0;
  const totalTax = computedTaxes?.totalTax || 0;
  const isIntrastate = computedTaxes?.isIntrastate ?? true;
  const freightVal = Number(freight) || 0;
  const grandTotal = Math.max(0, subtotal + totalTax + freightVal);

  return (
    <div className="bg-slate-900 text-white rounded-sm p-2 flex flex-wrap items-center justify-between gap-3 shrink-0 font-sans text-xs select-none shadow-md mt-auto" id="purchase-drafting-footer">
      {/* 1. Global Math Adjustments (Discount & Freight) */}
      <div className="flex items-center gap-3 bg-slate-850 p-1 px-2 rounded-[2px] border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Overall Disc (₹)</span>
          <input
            type="number"
            value={overallDiscount === "" ? "" : overallDiscount}
            onChange={(e) => setOverallDiscount(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-14 h-5 px-1 bg-slate-800 border border-slate-700 rounded-xs text-[11px] font-mono font-bold text-rose-400 focus:border-rose-500 outline-none text-right"
            placeholder="0"
            id="footer-input-discount"
          />
        </div>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Freight Out (₹)</span>
          <input
            type="number"
            value={freight === "" ? "" : freight}
            onChange={(e) => setFreight(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-14 h-5 px-1 bg-slate-800 border border-slate-700 rounded-xs text-[11px] font-mono font-bold text-indigo-300 focus:border-indigo-500 outline-none text-right"
            placeholder="0"
            id="footer-input-freight"
          />
        </div>
      </div>

      {/* 2. live Tax Ledger calculations */}
      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-300">
        <div className="flex flex-col text-left">
          <span className="text-[8px] text-slate-500 font-sans uppercase font-bold tracking-wider leading-none">Taxable Subtotal</span>
          <span className="font-bold text-slate-100 mt-0.5">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[8px] text-slate-500 font-sans uppercase font-bold tracking-wider leading-none">
            {isIntrastate ? "CGST + SGST (18%)" : "IGST (18%)"}
          </span>
          <span className="font-bold text-slate-100 mt-0.5">₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="flex flex-col text-left border-l border-slate-800 pl-4">
          <span className="text-[8px] text-indigo-400 font-sans uppercase font-bold tracking-wider leading-none">Grand Total</span>
          <span className="font-extrabold text-[12px] text-emerald-400 mt-0.5">
            ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 3. Definitive Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="h-6.5 px-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-sm font-bold text-[10px] uppercase cursor-pointer text-slate-300 hover:text-white transition-colors disabled:opacity-55"
          id="btn-drafting-cancel"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onSave("draft")}
          disabled={isSaving}
          className="h-6.5 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-sm font-bold text-[10px] uppercase cursor-pointer text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 disabled:opacity-55"
          id="btn-drafting-save-draft"
        >
          {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
          <span>Save Draft</span>
        </button>

        <button
          type="button"
          onClick={() => onSave("finalized")}
          disabled={isSaving}
          className="h-6.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-sm font-bold text-[10px] uppercase cursor-pointer text-white shadow-sm flex items-center gap-1 transition-colors disabled:opacity-55"
          id="btn-drafting-save-ledger"
        >
          {isSaving ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <Save size={10} className="stroke-[2.5]" />
          )}
          <span>Save Purchase Ledger</span>
        </button>
      </div>
    </div>
  );
}
