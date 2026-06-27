import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { transitionItemToReviewed } from "../../services/inventoryService";

/**
 * InventoryPendingAction Component
 * Handles mapping physical location and approving the item.
 */
export default function InventoryPendingAction({ item, onUpdateSuccess }) {
  const [location, setLocation] = useState(item.location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync with item prop changes
  useEffect(() => {
    setLocation(item.location || "");
    setErrorMsg("");
  }, [item]);

  const handlePendingSave = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setErrorMsg("Physical location is required");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const updated = await transitionItemToReviewed(item.id, {
        location: location.trim(),
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
      <div className="flex flex-col gap-1 text-left">
        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">
          ASSIGN PHYSICAL LOCATION
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSubmitting}
          placeholder="e.g., Amaayra, Gurgaon"
          className="h-6 w-full border border-slate-300 rounded-sm px-1.5 text-xs focus:outline-none focus:border-indigo-500 font-medium font-mono disabled:opacity-60"
          id="assign-location-input"
        />
      </div>

      {errorMsg && <p className="text-[10px] text-rose-500 font-mono text-left font-semibold">{errorMsg}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-6 w-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/30 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-60"
        id="approve-save-btn"
      >
        {isSubmitting ? <Loader2 size={11} className="animate-spin" /> : null}
        <span>APPROVE</span>
      </button>
    </form>
  );
}
