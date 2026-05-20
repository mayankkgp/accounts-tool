import React from "react";
import { User, Briefcase, Phone, Hash, Award, Pencil, Check } from "lucide-react";

export default function EntityPocSection({
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  currentProfile,
  handleSave
}) {
  return (
    <div className="flex flex-col gap-1" id="subsection-poc">
      <div className="flex items-center justify-between select-none" id="header-poc">
        <div className="flex items-center gap-1">
          <User size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">Point of Contact</span>
        </div>
        <button
          type="button"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="h-5 px-1.5 flex items-center gap-1 rounded-[2px] text-[8px] uppercase tracking-wider font-bold text-slate-650 border border-slate-300 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
          id="toggle-edit-mode-btn"
        >
          {isEditing ? (
            <><Check size={10} className="text-emerald-500 stroke-[2.5]" /><span>Save</span></>
          ) : (
            <><Pencil size={8} className="text-slate-500 stroke-[2.5]" /><span>Edit</span></>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 bg-slate-50 border-l-2 border-l-slate-300 p-1.5 rounded-sm" id="detail-overview-grid">
        <div className="flex items-start gap-1">
          <Briefcase size={11} className="text-slate-500 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Contact Person</span>
            {isEditing ? (
              <input
                type="text"
                className="h-6 text-xs px-1 py-0.5 border border-slate-205 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-medium leading-none mt-0.5"
                value={formData.pocName}
                onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
              />
            ) : (
              <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{currentProfile.pocName || "--"}</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-1">
          <Phone size={11} className="text-slate-500 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">POC Contact Info</span>
            {isEditing ? (
              <input
                type="text"
                className="h-6 text-xs px-1 py-0.5 border border-slate-205 bg-white rounded-sm focus:border-indigo-505 focus:outline-none w-full text-slate-800 font-medium leading-none mt-0.5"
                value={formData.pocContact}
                onChange={(e) => setFormData({ ...formData, pocContact: e.target.value })}
              />
            ) : (
              <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{currentProfile.pocContact || "--"}</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-1">
          <Hash size={11} className="text-slate-505 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">PAN Number</span>
            <span className="text-[11px] text-slate-800 font-mono font-bold truncate block uppercase leading-tight">
              {currentProfile.pan || (currentProfile.gst && currentProfile.gst.length >= 12 ? currentProfile.gst.substring(2, 12) : "--")}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-1">
          <Award size={11} className="text-slate-505 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Default Terms</span>
            <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">
              {currentProfile.terms && typeof currentProfile.terms === "object"
                ? `${currentProfile.terms.creditDays !== undefined ? `CR: ${currentProfile.terms.creditDays}D` : ""}${currentProfile.terms.creditDays !== undefined && currentProfile.terms.debitDays !== undefined ? " / " : ""}${currentProfile.terms.debitDays !== undefined ? `DB: ${currentProfile.terms.debitDays}D` : ""}`
                : (typeof currentProfile.terms === "string" ? currentProfile.terms : "Net 30 Days")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
