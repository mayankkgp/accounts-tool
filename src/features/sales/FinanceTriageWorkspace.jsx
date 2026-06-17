import React, { useState } from "react";
import { ArrowLeft, Loader2, HelpCircle } from "lucide-react";
import DocumentViewerPane from "./DocumentViewerPane";
import TriageDataPane from "./TriageDataPane";
import RejectionModal from "./RejectionModal";
import { saveSalesRequest } from "../../services/salesService";

export default function FinanceTriageWorkspace({ req, onClose, onRefresh }) {
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmReject = async (reason) => {
    setLoading(true);
    try {
      const updated = {
        ...req,
        status: "Needs Correction",
        financeFeedback: reason,
      };
      // Mutate local storage through salesService
      await saveSalesRequest(updated);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProceed = async () => {
    const confirmAction = window.confirm(
      `Finance Action:\nProceed with Cost Inwarding & Sales Mapping for request ${req.id}?`
    );
    if (!confirmAction) return;

    setLoading(true);
    try {
      // Set status to "Fulfilled" or similar per state-machine instructions
      const updated = {
        ...req,
        status: "Fulfilled",
        financeFeedback: ""
      };
      await saveSalesRequest(updated);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 relative font-sans text-xs select-none p-2 h-full gap-2" id="finance-triage-workspace-root">
      
      {/* Workspace Header toolbar */}
      <div className="h-8 bg-white border border-slate-200 shadow-xs rounded-sm px-2.5 flex items-center justify-between shrink-0 select-none">
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

      {/* Screen container: 50/50 Split Screen */}
      <div className="flex-1 grid grid-cols-2 gap-2 min-h-0 relative select-none" id="triage-workspace-split">
        {loading && (
          <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-xs flex items-center justify-center z-[900]">
            <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-sm shadow-xl flex items-center gap-2 text-xs font-mono">
              <Loader2 size={13} className="animate-spin text-indigo-400" />
              <span>SAVING UPDATES TO REGSITRY...</span>
            </div>
          </div>
        )}

        {/* Left Pane (Document Viewer) */}
        <DocumentViewerPane req={req} />

        {/* Right Pane (Read-Only Data + Global Actions) */}
        <TriageDataPane
          req={req}
          onRejectInitiate={() => setRejectionOpen(true)}
          onProceed={handleConfirmProceed}
        />
      </div>

      {/* Rejection Modal Component */}
      <RejectionModal
        isOpen={rejectionOpen}
        onClose={() => setRejectionOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
