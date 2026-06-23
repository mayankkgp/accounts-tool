import React from "react";
import { User, Calendar, CornerDownRight, XCircle, ShieldAlert, ArrowRight } from "lucide-react";

export default function TriageDataPane({ req, onRejectInitiate, onProceed }) {
  if (!req) return null;

  return (
    <div className="flex-grow flex flex-col h-full bg-transparent min-h-0 select-none overflow-hidden" id="triage-data-pane-root">
      
      {/* Scrollable content container */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 min-h-0 p-2.5" id="triage-scrollable-content">
        
        {/* Identifier Header */}
        <div className="border-b border-slate-150 pb-2 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xs text-slate-800 leading-tight font-sans font-bold" id="triage-customer-title">
              {req.customer}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1.5 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <User size={11} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-800 leading-tight font-sans">{req.smName}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Calendar size={11} className="text-slate-400 shrink-0" />
              <span className="text-xs text-slate-800 leading-tight font-sans">{req.submittedDate}</span>
            </div>
          </div>
        </div>

        {/* Action / Warning box if needs correction was previously set */}
        {req.financeFeedback && (
          <div className="bg-rose-50 border border-rose-100 p-2 rounded-sm" id="prior-feedback-alert">
            <div className="flex gap-1.5 items-start">
              <ShieldAlert size={12} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Previous Correction Feedbacks</span>
                <p className="text-xs text-slate-800 leading-tight font-sans italic mt-0.5">
                  "{req.financeFeedback}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logistics Grid */}
        <div className="flex flex-col gap-1.5" id="triage-logistics-group">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Bill to</span>
              <span className="text-xs text-slate-800 leading-tight font-sans break-words">{req.logistics?.billTo || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Ship to</span>
              <span className="text-xs text-slate-800 leading-tight font-sans break-words">{req.logistics?.shipTo || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Freight terms</span>
              <span className="text-xs text-slate-800 leading-tight font-sans break-words">
                {req.logistics?.freight === "To Pay" ? "TO PAY" : "PREPAID"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Transporter Name</span>
              <span className="text-xs text-slate-800 leading-tight font-sans break-words">{req.logistics?.transporterName || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5 col-span-2">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Payment term</span>
              <span className="text-xs text-slate-800 leading-tight font-sans break-words">{req.logistics?.paymentTerms || "Immediate basis"}</span>
            </div>
          </div>
        </div>

        {/* Standalone Horizontal Divider perfectly centered */}
        <div className="border-t border-slate-100 my-1 py-0 shrink-0" />

        {/* Unstructured Text area blocks */}
        <div className="flex flex-col gap-2.5" id="triage-unstructured-group">
          {req.unstructuredData?.lineItems && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Sale item specifications</span>
              <p className="text-xs text-slate-800 leading-tight font-sans whitespace-pre-line break-words pl-0.5">
                {req.unstructuredData.lineItems}
              </p>
            </div>
          )}

          {req.unstructuredData?.greigeDetails && (
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Greige details</span>
              <p className="text-xs text-slate-800 leading-tight font-sans break-words pl-0.5">
                {req.unstructuredData.greigeDetails}
              </p>
            </div>
          )}

          {req.unstructuredData?.comments && (
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Comments</span>
              <p className="text-xs text-slate-800 leading-tight font-sans break-words pl-0.5 italic">
                "{req.unstructuredData.comments}"
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Global Footer Actions */}
      <div className="border-t border-slate-150 pt-2.5 flex items-center justify-between shrink-0 select-none gap-2 bg-white text-slate-800 font-sans px-2 pb-2" id="triage-actions-footer">
        <button
          type="button"
          onClick={onRejectInitiate}
          className="h-6 px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1 text-[11px]"
          id="btn-triage-reject"
        >
          <XCircle size={12} className="stroke-[2.5]" />
          <span>REJECT REQUEST</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="h-6 px-4 bg-slate-900 text-slate-100 hover:bg-slate-800 font-bold rounded-sm border-none cursor-pointer transition-all flex items-center justify-center gap-1 text-[11px]"
          id="btn-triage-proceed"
        >
          <span>PROCEED TO COST INWARDING</span>
          <ArrowRight size={11} className="text-indigo-400 shrink-0" />
        </button>
      </div>

    </div>
  );
}
