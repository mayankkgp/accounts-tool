import React from "react";
import { User, Pencil, Check, Loader2 } from "lucide-react";

export default function EntityPocSection({
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  currentProfile,
  handleSave,
  isSaving
}) {
  return (
    <div className="flex flex-col gap-1" id="subsection-poc">
      <div className="flex items-center justify-between select-none" id="header-poc">
        <div className="flex items-center gap-1 select-none">
          <User size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">Primary Details</span>
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="h-5 px-1.5 flex items-center gap-1 rounded-[2px] text-[8px] uppercase tracking-wider font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          id="toggle-edit-mode-btn"
        >
          {isEditing ? (
            isSaving ? (
              <><Loader2 size={10} className="animate-spin text-slate-400" /><span>Save</span></>
            ) : (
              <><Check size={10} className="text-emerald-500 stroke-[2.5]" /><span>Save</span></>
            )
          ) : (
            <><Pencil size={8} className="text-slate-500 stroke-[2.5]" /><span>Edit</span></>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 bg-slate-50 border-l-2 border-l-slate-300 p-1.5 rounded-sm" id="detail-overview-grid">
        <div className="min-w-0">
          <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Contact Person</span>
          {isEditing ? (
            <input
              type="text"
              className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-medium leading-none mt-0.5"
              value={formData.pocName}
              onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
            />
          ) : (
            <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{currentProfile.pocName || "--"}</span>
          )}
        </div>

        <div className="min-w-0">
          <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">POC Contact Info</span>
          {isEditing ? (
            <input
              type="text"
              className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-medium leading-none mt-0.5"
              value={formData.pocContact}
              onChange={(e) => setFormData({ ...formData, pocContact: e.target.value })}
            />
          ) : (
            <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{currentProfile.pocContact || "--"}</span>
          )}
        </div>

        <div className="min-w-0">
          <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">PAN Number</span>
          <span className="text-[11px] text-slate-800 font-mono font-bold truncate block uppercase leading-tight">
            {currentProfile.pan || (currentProfile.gst && currentProfile.gst.length >= 12 ? currentProfile.gst.substring(2, 12) : "--")}
          </span>
        </div>

        <div className="min-w-0">
          <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Default Terms</span>
          {isEditing ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center gap-0.5">
                <span className="text-[8px] font-bold text-slate-400 mt-0.5">CR:</span>
                <input
                  type="number"
                  placeholder="Days"
                  className="w-10 h-6 text-xs px-1 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.creditDays}
                  onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[8px] font-bold text-slate-400 mt-0.5">DB:</span>
                <input
                  type="number"
                  placeholder="Days"
                  className="w-10 h-6 text-xs px-1 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.debitDays}
                  onChange={(e) => setFormData({ ...formData, debitDays: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">
              {currentProfile.terms && typeof currentProfile.terms === "object" ? (
                [
                  currentProfile.terms.creditDays !== undefined && currentProfile.terms.creditDays !== null && currentProfile.terms.creditDays !== "" && `CR: ${currentProfile.terms.creditDays}D`,
                  currentProfile.terms.debitDays !== undefined && currentProfile.terms.debitDays !== null && currentProfile.terms.debitDays !== "" && `DB: ${currentProfile.terms.debitDays}D`
                ].filter(Boolean).join(" / ") || "--"
              ) : (
                "--"
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
