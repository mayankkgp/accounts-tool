import React from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Header toolbar for the Finance Triage Workspace. Shows the specific ID
 * and formatted status of the request, with a responsive 'Back' navigation button.
 */
export default function TriageHeader({ req, onClose, loading }) {
  if (!req) return null;

  return (
    <div className="h-8 bg-white px-2.5 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="h-5 px-1.5 rounded-sm border border-slate-250 hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer bg-white disabled:opacity-50"
          id="btn-triage-back"
        >
          <ArrowLeft size={11} className="stroke-[2.5]" />
          <span className="text-[10px] tracking-wide font-sans">Back</span>
        </button>
        <span className="text-slate-300">|</span>
        <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-xs">
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

      <div className="flex items-center gap-1" />
    </div>
  );
}
