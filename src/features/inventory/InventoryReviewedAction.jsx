import React, { useState, useEffect } from "react";
import { Loader2, Edit, Check, X } from "lucide-react";
import {
  updateReviewedItemBuckets,
  updateReviewedItemLocation
} from "../../services/inventoryService";

/**
 * InventoryReviewedAction Component
 * Handles inline location edits and distribution buckets (debit issued, debit pending, wasteage).
 */
export default function InventoryReviewedAction({ item, onUpdateSuccess }) {
  const [location, setLocation] = useState(item.location || "");
  const [debitIssued, setDebitIssued] = useState(item.buckets?.debitIssued || 0);
  const [toDebit, setToDebit] = useState(item.buckets?.toDebit || 0);
  const [wasteage, setWasteage] = useState(item.buckets?.wasteage || 0);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState(item.location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Keep state synchronized if item changes
  useEffect(() => {
    setLocation(item.location || "");
    setDebitIssued(item.buckets?.debitIssued || 0);
    setToDebit(item.buckets?.toDebit || 0);
    setWasteage(item.buckets?.wasteage || 0);
    setTempLocation(item.location || "");
    setIsEditingLocation(false);
    setErrorMsg("");
  }, [item]);

  const handleDistributionSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const debitIssuedNum = Number(debitIssued) || 0;
    const toDebitNum = Number(toDebit) || 0;
    const wasteageNum = Number(wasteage) || 0;

    if (debitIssuedNum < 0 || toDebitNum < 0 || wasteageNum < 0) {
      setErrorMsg("Quantities cannot be negative");
      return;
    }

    if (debitIssuedNum + toDebitNum + wasteageNum > item.qty) {
      setErrorMsg(`Sum (${debitIssuedNum + toDebitNum + wasteageNum}m) exceeds available stock (${item.qty}m)`);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateReviewedItemBuckets(item.id, {
        buckets: { debitIssued: debitIssuedNum, toDebit: toDebitNum, wasteage: wasteageNum },
        user: "Finance Manager"
      });
      if (onUpdateSuccess) onUpdateSuccess(updated);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update distribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationUpdate = async () => {
    if (!tempLocation.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await updateReviewedItemLocation(item.id, {
        location: tempLocation.trim(),
        user: "Inventory Staff"
      });
      setLocation(updated.location);
      setIsEditingLocation(false);
      if (onUpdateSuccess) onUpdateSuccess(updated);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update location");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-sm" id="reviewed-action-container">
      {/* Location Row with inline Edit */}
      <div className="flex flex-col py-1 px-0.5 text-left">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">Location</span>
        <div className="flex items-center gap-2 mt-0.5 min-w-0 flex-wrap">
          {isEditingLocation ? (
            <div className="flex items-center gap-2 w-full max-w-[400px]">
              <input
                type="text"
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                disabled={isSubmitting}
                className="h-5 flex-1 min-w-0 border border-slate-300 rounded-sm px-1 text-[11px] focus:outline-none focus:border-indigo-500 font-mono font-medium"
                id="edit-location-input"
              />
              <button
                type="button"
                onClick={handleLocationUpdate}
                disabled={isSubmitting}
                className="h-5 w-5 shrink-0 rounded-sm flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
                id="save-edit-location-btn"
              >
                <Check size={11} className="stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempLocation(location);
                  setIsEditingLocation(false);
                }}
                disabled={isSubmitting}
                className="h-5 w-5 shrink-0 rounded-sm flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                id="cancel-edit-location-btn"
                title="Cancel"
              >
                <X size={11} className="stroke-[3]" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-xs text-slate-800 font-semibold font-mono break-words" title={location || "Not Assigned"}>
                {location || "Not Assigned"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setTempLocation(location);
                  setIsEditingLocation(true);
                }}
                disabled={isSubmitting}
                className="h-5 w-5 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                id="start-edit-location-btn"
              >
                <Edit size={11} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Distribution Form (Single Row Distribution Controls) */}
      <form onSubmit={handleDistributionSave} className="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
        <div className="flex items-center justify-start gap-4 text-left flex-wrap">
          {/* 1. Static Quantity Display */}
          <div className="flex flex-col min-w-[50px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">QTY</span>
            <span className="text-xs text-slate-850 font-bold font-mono mt-0.5">{item.qty} m</span>
          </div>

          {/* 2. Debit Issued input field */}
          <div className="flex flex-col items-start gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">Debit Issued</label>
            <input
              type="number"
              step="any"
              value={debitIssued}
              onChange={(e) => setDebitIssued(e.target.value)}
              disabled={isSubmitting}
              className="h-6 w-20 border border-slate-300 rounded-sm px-1 text-xs focus:outline-none focus:border-indigo-500 font-medium font-mono disabled:opacity-60"
              id="debit-issued-bucket-input"
            />
          </div>

          {/* 3. Debit Pending input field */}
          <div className="flex flex-col items-start gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">Debit Pending</label>
            <input
              type="number"
              step="any"
              value={toDebit}
              onChange={(e) => setToDebit(e.target.value)}
              disabled={isSubmitting}
              className="h-6 w-20 border border-slate-300 rounded-sm px-1 text-xs focus:outline-none focus:border-indigo-500 font-medium font-mono disabled:opacity-60"
              id="to-debit-bucket-input"
            />
          </div>

          {/* 4. Wasteage input field */}
          <div className="flex flex-col items-start gap-0.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">Wasteage</label>
            <input
              type="number"
              step="any"
              value={wasteage}
              onChange={(e) => setWasteage(e.target.value)}
              disabled={isSubmitting}
              className="h-6 w-20 border border-slate-300 rounded-sm px-1 text-xs focus:outline-none focus:border-indigo-500 font-medium font-mono disabled:opacity-60"
              id="wasteage-bucket-input"
            />
          </div>

          {/* 5. Inline Save Button */}
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-transparent select-none font-semibold font-sans">Action</span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-6 w-20 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/30 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-60"
              id="save-distribution-btn"
            >
              {isSubmitting ? <Loader2 size={11} className="animate-spin" /> : null}
              <span>SAVE</span>
            </button>
          </div>
        </div>

        {errorMsg && <p className="text-[10px] text-rose-500 font-mono text-left font-semibold">{errorMsg}</p>}
      </form>
    </div>
  );
}
