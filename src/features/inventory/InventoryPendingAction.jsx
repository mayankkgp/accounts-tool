import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { transitionItemToReviewed } from "../../services/inventoryService";
import LocationDropdown from "./LocationDropdown";

/**
 * InventoryPendingAction Component
 * Handles mapping physical location and approving the item.
 */
export default function InventoryPendingAction({ item, onUpdateSuccess }) {
  const [location, setLocation] = useState(item.location || "");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const remarksRef = useRef(null);

  // Sync with item prop changes
  useEffect(() => {
    setLocation(item.location || "");
    setRemarks("");
    setErrorMsg("");
    if (remarksRef.current) {
      remarksRef.current.style.height = "24px";
    }
  }, [item]);

  const handlePendingSave = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setErrorMsg("Physical location is required");
      return;
    }
    if (!remarks.trim()) {
      setErrorMsg("Remarks are required");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const updated = await transitionItemToReviewed(item.id, {
        location: location.trim(),
        remarks: remarks.trim(),
        hsnCode: item.hsnCode,
        buckets: { toDebit: 0, wasteage: 0 },
        user: "Finance Manager"
      });
      if (onUpdateSuccess) onUpdateSuccess(updated);
    } catch (err) {
      setErrorMsg(err.message || "Failed to approve item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePendingSave} className="flex flex-col gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-sm" id="pending-action-form">
      <div className="flex flex-row items-start gap-2 w-full">
        <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">
            ASSIGN PHYSICAL LOCATION
          </label>
          <LocationDropdown
            value={location}
            onChange={setLocation}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">
            REMARKS
          </label>
          <textarea
            ref={remarksRef}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            onInput={(e) => {
              e.target.style.height = "24px";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            disabled={isSubmitting}
            placeholder="e.g., Quality approved, no visual defects"
            className="min-h-[24px] h-6 w-full border border-slate-300 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-medium font-mono disabled:opacity-60 resize-none overflow-hidden leading-tight"
            id="remarks-input"
          />
        </div>
      </div>

      {errorMsg && <p className="text-[10px] text-rose-500 font-mono text-left font-semibold">{errorMsg}</p>}

      <button
        type="submit"
        disabled={isSubmitting || !remarks.trim()}
        className="h-6 w-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/30 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-60"
        id="approve-save-btn"
      >
        {isSubmitting ? <Loader2 size={11} className="animate-spin" /> : null}
        <span>APPROVE</span>
      </button>
    </form>
  );
}
