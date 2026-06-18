import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

/**
 * CostInwardingHeader Component
 * 
 * Renders the top-level master workspace action bar. Matches the Finance Triage screen header.
 * 
 * Props:
 *  - req: The current sales request metadata object
 *  - onClose: Callback to close the workspace and return to the triage main view
 *  - isSubmittingAll: State flag representing active final backend submission
 *  - isProceedActive: Validator flag indicating if all invoices are either completed or exempt
 *  - handleSaveAndFulfilled: Submits the staged request payloads to transition status to "Fulfilled"
 */
export default function CostInwardingHeader({
  req,
  onClose,
  isSubmittingAll,
  isProceedActive,
  handleSaveAndFulfilled
}) {
  return (
    <div className="h-8 shrink-0 bg-white border border-slate-200 shadow-xs rounded-sm px-2.5 flex items-center justify-between text-slate-800 font-sans text-xs select-none" id="inwarding-master-header">
      {/* Left Side: Back Button + Request ID + Status Badge */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-5 px-1.5 rounded-sm border border-slate-250 hover:bg-slate-50 text-slate-700 font-medium transition-colors bg-white flex items-center gap-1 cursor-pointer animate-fade-in"
          id="btn-triage-back"
        >
          <ArrowLeft size={10} className="stroke-[3]" />
          <span className="text-[10px] font-sans">Back</span>
        </button>
        <span className="text-slate-300 select-none">|</span>
        <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.2 rounded-xs">
          {req.id}
        </span>
        <span className={`text-[10px] font-sans font-semibold tracking-wide border px-1.5 py-0.2 rounded-xs uppercase ${
          req.status === "Invoice Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
          req.status === "Needs Correction" ? "bg-rose-50 text-rose-705 border-rose-200" :
          req.status === "Settlement Pending" ? "bg-indigo-50 text-indigo-750 border-indigo-200" :
          "bg-emerald-50 text-emerald-705 border-emerald-200"
        }`}>
          {req.status || "Invoice Pending"}
        </span>
      </div>

      {/* Right Side: Primary CTA "Proceed to Mapping" */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleSaveAndFulfilled}
          disabled={!isProceedActive || isSubmittingAll}
          className="h-6 px-4 bg-slate-900 text-slate-100 hover:bg-slate-800 font-bold rounded-sm border-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-1 text-[10px]"
          id="btn-confirm-stage-mapping"
        >
          {/*
            Pessimistic UI state explanation:
            When `isSubmittingAll` is active, the app renders a loader spinning glyph and disables the entire control.
            This prevents concurrent submit requests or duplicate database entries while the remote transaction completes.
          */}
          {isSubmittingAll ? (
            <>
              <Loader2 size={10} className="animate-spin text-slate-400" />
              <span>Committing...</span>
            </>
          ) : (
            <>
              <span>Proceed to Mapping</span>
              <ArrowRight size={10} className="stroke-[3] text-indigo-400 shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
