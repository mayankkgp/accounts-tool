import React from "react";
import { Loader2 } from "lucide-react";

/**
 * CostInwardingFooter Component
 * 
 * Renders the right pane action footer for individual invoice staging/exemption workflow.
 * 
 * Props:
 *  - activeInvoice: Rich meta state of the currently active queue invoice document
 *  - handleSkipInvoice: Marks the current invoice as "Skipped" (exempt from routing to ledger costing)
 *  - handleStageInvoice: Executes pessimistic database/local storage insertion to lock context and stage items
 *  - handleUnstageEdit: Overwrites active state to let clerks correct quantities or mappings manually
 */
export default function CostInwardingFooter({
  activeInvoice,
  handleSkipInvoice,
  handleStageInvoice,
  handleUnstageEdit
}) {
  return (
    <div className="border-t border-slate-150 pt-2.5 flex items-center justify-between shrink-0 select-none gap-2 bg-white text-slate-800 font-sans px-3 pb-2" id="inwarding-sticky-footer">
      {/* Item Staging Status ONLY (Strictly no "Req Status" representation) */}
      <div className="flex items-center gap-1.5 select-none branding-rail font-sans text-[10px] uppercase tracking-wider">
        <span className="text-slate-500 font-bold">Item Staging Status:</span>
        <span className={`border px-1.5 py-0.5 select-none leading-none font-bold rounded-xs ${
          activeInvoice.stageStatus === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
          activeInvoice.stageStatus === "Staged" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
          "bg-slate-50 text-slate-600 border-slate-200"
        }`}>
          {activeInvoice.stageStatus}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 select-none" id="sticky-footer-cta-group">
        {activeInvoice.stageStatus === "Pending" ? (
          <>
            <button
              type="button"
              onClick={handleSkipInvoice}
              disabled={activeInvoice.isStagingLoading}
              className="h-6 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm text-[10px] font-bold tracking-wider cursor-pointer transition-all uppercase"
            >
              Skip/Exempt from Costing
            </button>
            <button
              type="button"
              onClick={handleStageInvoice}
              disabled={activeInvoice.isStagingLoading}
              className="h-6 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-sm font-bold border-none text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all"
              id="btn-stage-active-doc"
            >
              {/*
                Pessimistic UI state explanation:
                While the invoice is in the process of being staged (`isStagingLoading` is true), we show a detailed
                spinner loader and disable both "Skip/Exempt" and "Stage" buttons. This guards against potential race
                conditions, double-clicks, or incomplete ledger index mutations.
              */}
              {activeInvoice.isStagingLoading ? (
                <>
                  <Loader2 size={11} className="animate-spin text-white" />
                  <span>STAGING INVOICE (600ms)...</span>
                </>
              ) : (
                <span>
                  {activeInvoice.isMatched ? "Stage Selected Items" : "Stage Drafted Items"}
                </span>
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleUnstageEdit}
            className="h-6 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-sm font-bold border-none text-[10px] uppercase tracking-wider cursor-pointer transition-all"
            id="btn-unstage-edit"
          >
            Unstage / Edit Items
          </button>
        )}
      </div>
    </div>
  );
}
