import React, { useState } from "react";
import { Loader2, AlertCircle, X } from "lucide-react";
import { simulateNetwork } from "../../utils/simulateNetwork";

export default function RejectionModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      // Simulate API call with 800ms per instructions
      await simulateNetwork(800);
      await onConfirm(reason);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 text-xs select-none">
      <div className="bg-white border border-slate-200 rounded-sm w-full max-w-md shadow-xl flex flex-col p-3 gap-3 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span className="text-[13px] font-medium text-slate-800 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-red-500" />
            <span>Reject Sales Request</span>
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer border-none bg-transparent"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Rejection Reason *
            </label>
            <textarea
              required
              disabled={loading}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State clear, mandatory reasons for correction (e.g. Missing Vendor Bill for Item X)"
              rows={3}
              className="w-full p-2 text-xs border border-slate-300 rounded-sm outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-sans resize-none"
            />
          </div>

          <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-6 px-3 bg-slate-100 hover:bg-slate-250 text-slate-700 font-medium rounded-sm border-none cursor-pointer text-[11px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="h-6 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm border-none cursor-pointer flex items-center gap-1 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={11} className="animate-spin text-white" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <span>Confirm Rejection</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
