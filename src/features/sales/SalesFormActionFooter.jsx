import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Sticky action footer of the Sales invoice configuration modal. Handles resubmission
 * and submission loading states.
 */
export default function SalesFormActionFooter({ saving, editingRequest, onClose, onSubmit }) {
  return (
    <div className="bg-slate-900 h-11 px-4 flex items-center justify-between border-t border-slate-800 shrink-0 select-none">
      <div>
        <span className="text-[10px] font-mono text-slate-400">
          STATUS ROUTING: Sets to 'Invoice Pending'
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          type="button"
          className="h-6 px-3 bg-slate-800 text-slate-300 hover:text-white rounded-sm text-xs font-sans tracking-wide transition-all border-none cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          type="button"
          disabled={saving}
          id="form-btn-submit"
          className="h-6 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-805 text-white font-bold rounded-sm text-xs font-sans tracking-wide transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
        >
          {saving && <Loader2 size={11} className="animate-spin" />}
          <span>
            {saving 
              ? "Submitting..." 
              : (editingRequest ? "Resubmit For Triage" : "Submit Request to Queue")}
          </span>
        </button>
      </div>
    </div>
  );
}
