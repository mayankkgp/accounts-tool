import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import DocumentViewerPane from "./DocumentViewerPane";
import TriageDataPane from "./TriageDataPane";
import TriageHeader from "./TriageHeader";
import RejectionModal from "./RejectionModal";
import CostInwardingWorkspace from "./CostInwardingWorkspace";
import { saveSalesRequest } from "../../services/salesService";

/**
 * Triage workspace split view for internal Finance Teams.
 * Presents a 50/50 comparison: Left pane displays PDFs with real-time scrolling and overrides,
 * while Right pane details metadata and gives final routing buttons.
 */
export default function FinanceTriageWorkspace({ req, onClose, onRefresh }) {
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCostInwarding, setShowCostInwarding] = useState(false);

  // Confirms rejection with inline block reason feedback
  const handleConfirmReject = async (reason) => {
    // Pessimistic UI handling: activate loader overlay
    setLoading(true);
    try {
      const updated = {
        ...req,
        status: "Needs Correction", // Back to Sales team queue with corrective feedback
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

  // Proceeds through Cost Inwarding / Settlement stage
  const handleConfirmProceed = () => {
    setShowCostInwarding(true);
  };

  if (showCostInwarding) {
    return (
      <CostInwardingWorkspace
        req={req}
        onClose={() => setShowCostInwarding(false)}
        onRefresh={() => {
          onRefresh();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 relative font-sans text-xs select-none p-2 h-full gap-2" id="finance-triage-workspace-root">
      
      {/* Workspace Header Toolbar Sub-Component */}
      <TriageHeader 
        req={req} 
        onClose={onClose} 
        loading={loading} 
      />

      {/* Screen container: 50/50 Split Screen comparison */}
      <div className="flex-1 grid grid-cols-2 gap-2 min-h-0 relative select-none items-stretch" id="triage-workspace-split">
        {loading && (
          <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-xs flex items-center justify-center z-[900]">
            <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-sm shadow-xl flex items-center gap-2 text-xs font-mono">
              <Loader2 size={13} className="animate-spin text-indigo-400" />
              <span>SAVING UPDATES TO REGISTRY...</span>
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

      {/* Rejection Feedback Modal Form overlay */}
      <RejectionModal
        isOpen={rejectionOpen}
        onClose={() => setRejectionOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
