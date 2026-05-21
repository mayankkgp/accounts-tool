import React from "react";
import { Landmark } from "lucide-react";

export default function EntityBankSection({
  isEditing,
  formData,
  setFormData,
  currentProfile
}) {
  return (
    <div className="flex flex-col gap-1" id="subsection-bank">
      <div className="flex items-center gap-1 select-none">
        <Landmark size={12} className="text-slate-500" />
        <span className="text-[10px] uppercase font-bold text-slate-500">Bank Details</span>
      </div>
      {currentProfile.bankDetails || isEditing ? (
        <div className="bg-slate-50 border-l-2 border-l-blue-400 px-1.5 py-1 rounded-sm" id="detail-bank-info">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-slate-600">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Beneficiary</span>
                <input
                  type="text"
                  className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono"
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Bank Name</span>
                <input
                  type="text"
                  className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Account No</span>
                <input
                  type="text"
                  className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono"
                  value={formData.accountNo}
                  onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">IFSC Code</span>
                <input
                  type="text"
                  className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono uppercase"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="truncate">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold mr-1">BENEFICIARY:</span>
                <span className="text-[11px] text-slate-800 font-semibold">
                  {currentProfile.bankDetails?.beneficiary || currentProfile.businessName || "--"}
                </span>
              </div>
              <div className="truncate">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold mr-1">BANK:</span>
                <span className="text-[11px] text-slate-800 font-semibold">
                  {currentProfile.bankDetails?.bankName || "Corporate Bank"}
                </span>
              </div>
              <div className="truncate">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold mr-1">A/C:</span>
                <span className="text-[11px] text-slate-800 font-semibold">
                  {currentProfile.bankDetails?.accountNo || "--"}
                </span>
              </div>
              <div className="truncate">
                <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold mr-1">IFSC:</span>
                <span className="text-[11px] text-slate-800 font-semibold">
                  {currentProfile.bankDetails?.ifscCode || currentProfile.bankDetails?.ifsc || "--"}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50/50 border-l-2 border-l-blue-400/50 p-1.5 rounded-sm text-[10px] text-slate-500 font-medium italic" id="detail-bank-missing">
          No bank account specified for this entity profile.
        </div>
      )}
    </div>
  );
}
