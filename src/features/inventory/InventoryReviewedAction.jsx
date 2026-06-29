import React, { useState, useEffect } from "react";
import { Loader2, Edit, Check, X } from "lucide-react";
import {
  updateReviewedItemBuckets,
  updateReviewedItemLocation,
  updateReviewedItemRemarks
} from "../../services/inventoryService";
import LocationDropdown from "./LocationDropdown";

export default function InventoryReviewedAction({ item, onUpdateSuccess }) {
  const [location, setLocation] = useState(item.location || "");
  const [debitIssued, setDebitIssued] = useState(item.buckets?.debitIssued || 0);
  const [toDebit, setToDebit] = useState(item.buckets?.toDebit || 0);
  const [wasteage, setWasteage] = useState(item.buckets?.wasteage || 0);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState(item.location || "");
  const [remarks, setRemarks] = useState(item.remarks || "");
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [tempRemarks, setTempRemarks] = useState(item.remarks || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLocation(item.location || "");
    setDebitIssued(item.buckets?.debitIssued || 0);
    setToDebit(item.buckets?.toDebit || 0);
    setWasteage(item.buckets?.wasteage || 0);
    setTempLocation(item.location || "");
    setIsEditingLocation(false);
    setRemarks(item.remarks || "");
    setTempRemarks(item.remarks || "");
    setIsEditingRemarks(false);
    setErrorMsg("");
  }, [item]);

  const saveDistribution = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const di = Number(debitIssued) || 0, td = Number(toDebit) || 0, w = Number(wasteage) || 0;
    if (di < 0 || td < 0 || w < 0) return setErrorMsg("Quantities cannot be negative");
    if (di + td + w > item.qty) return setErrorMsg(`Sum (${di + td + w}${item.uom || 'm'}) exceeds available stock (${item.qty}${item.uom || 'm'})`);
    setIsSubmitting(true);
    try {
      const u = await updateReviewedItemBuckets(item.id, { buckets: { debitIssued: di, toDebit: td, wasteage: w } });
      if (onUpdateSuccess) onUpdateSuccess(u);
    } catch (err) { setErrorMsg(err.message || "Failed to update distribution"); }
    setIsSubmitting(false);
  };

  const updateField = async (field, value, updateFn, setLocalVal, setEditState) => {
    setIsSubmitting(true);
    try {
      const u = await updateFn(item.id, { [field]: value.trim(), user: "Inventory Staff" });
      setLocalVal(u[field]);
      setEditState(false);
      if (onUpdateSuccess) onUpdateSuccess(u);
    } catch (err) { setErrorMsg(err.message || `Failed to update ${field}`); }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-sm text-left" id="reviewed-action-container">
      {/* Location Section */}
      <div className="flex flex-col py-0.5">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">Location</span>
        <div className="flex items-center gap-2 mt-0.5 w-full">
          {isEditingLocation ? (
            <div className="flex items-center gap-1.5 w-full">
              <div className="flex-1 min-w-0">
                <LocationDropdown
                  value={tempLocation}
                  onChange={setTempLocation}
                  disabled={isSubmitting}
                />
              </div>
              <button onClick={() => updateField("location", tempLocation, updateReviewedItemLocation, setLocation, setIsEditingLocation)} disabled={isSubmitting} className="h-5 w-5 rounded-sm flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 cursor-pointer shrink-0"><Check size={11} /></button>
              <button onClick={() => { setTempLocation(location); setIsEditingLocation(false); }} disabled={isSubmitting} className="h-5 w-5 rounded-sm flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer shrink-0"><X size={11} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-800 font-semibold font-mono">{location || "Not Assigned"}</span>
              <button onClick={() => { setTempLocation(location); setIsEditingLocation(true); }} disabled={isSubmitting} className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"><Edit size={10} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Remarks Section */}
      <div className="flex flex-col py-0.5 border-t border-slate-200/40 pt-1.5">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">Remarks</span>
        <div className="flex items-center gap-2 mt-0.5 w-full">
          {isEditingRemarks ? (
            <div className="flex items-center gap-1.5 w-full">
              <textarea
                value={tempRemarks}
                onChange={(e) => setTempRemarks(e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "24px";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                disabled={isSubmitting}
                className="min-h-[24px] h-6 w-full flex-1 border border-slate-300 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-medium font-mono disabled:opacity-60 resize-none overflow-hidden leading-tight"
              />
              <button onClick={() => updateField("remarks", tempRemarks, updateReviewedItemRemarks, setRemarks, setIsEditingRemarks)} disabled={isSubmitting} className="h-5 w-5 rounded-sm flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 cursor-pointer shrink-0"><Check size={11} /></button>
              <button onClick={() => { setTempRemarks(remarks); setIsEditingRemarks(false); }} disabled={isSubmitting} className="h-5 w-5 rounded-sm flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer shrink-0"><X size={11} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-800 font-semibold font-mono">{remarks || "No remarks provided"}</span>
              <button onClick={() => { setTempRemarks(remarks); setIsEditingRemarks(true); }} disabled={isSubmitting} className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"><Edit size={10} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Distribution Form */}
      <form onSubmit={saveDistribution} className="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col min-w-[40px]"><span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">QTY</span><span className="text-xs text-slate-800 font-bold font-mono mt-0.5">{item.qty} {item.uom || 'm'}</span></div>
          {[
            { label: "Debit Issued", val: debitIssued, setVal: setDebitIssued, id: "debit-issued-bucket-input" },
            { label: "Debit Pending", val: toDebit, setVal: setToDebit, id: "to-debit-bucket-input" },
            { label: "Wasteage", val: wasteage, setVal: setWasteage, id: "wasteage-bucket-input" }
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-start gap-0.5">
              <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">{f.label}</label>
              <input type="number" step="any" value={f.val} onChange={(e) => f.setVal(e.target.value)} disabled={isSubmitting} className="h-6 w-16 border border-slate-300 rounded-sm px-1 text-xs focus:outline-none focus:border-indigo-500 font-medium font-mono" id={f.id} />
            </div>
          ))}
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[9px] text-transparent select-none font-sans">Action</span>
            <button type="submit" disabled={isSubmitting} className="h-6 w-16 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1" id="save-distribution-btn">
              {isSubmitting && <Loader2 size={11} className="animate-spin" />}
              <span>SAVE</span>
            </button>
          </div>
        </div>
        {errorMsg && <p className="text-[10px] text-rose-500 font-mono font-semibold">{errorMsg}</p>}
      </form>
    </div>
  );
}
