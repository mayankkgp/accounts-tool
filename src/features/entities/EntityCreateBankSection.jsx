import React, { useState } from "react";
import { X } from "lucide-react";

export default function EntityCreateBankSection({ formData, setFormData }) {
  const [showBankForm, setShowBankForm] = useState(false);

  const handleClose = () => {
    setShowBankForm(false);
    setFormData((prev) => ({
      ...prev,
      beneficiary: "",
      bankName: "",
      accountNo: "",
      ifscCode: ""
    }));
  };

  const spanClass = "text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight";

  if (!showBankForm) {
    return (
      <div className="col-span-2">
        <button
          type="button"
          onClick={() => setShowBankForm(true)}
          className="w-full h-7 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-sm text-[9px] uppercase tracking-wide font-bold transition-colors cursor-pointer bg-slate-50/20"
        >
          + Add Bank Details
        </button>
      </div>
    );
  }

  return (
    <div className="col-span-2 p-2 border border-slate-100 rounded-sm bg-slate-50/55 flex flex-col gap-2" id="create-bank-section">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block">Bank Details</span>
        <button
          type="button"
          onClick={handleClose}
          className="h-4 w-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <X size={10} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className={spanClass}>Beneficiary</span>
          <input
            type="text"
            value={formData.beneficiary || ""}
            onChange={(e) => setFormData((p) => ({ ...p, beneficiary: e.target.value }))}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={spanClass}>Bank Name</span>
          <input
            type="text"
            value={formData.bankName || ""}
            onChange={(e) => setFormData((p) => ({ ...p, bankName: e.target.value }))}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={spanClass}>Account Number</span>
          <input
            type="text"
            value={formData.accountNo || ""}
            onChange={(e) => setFormData((p) => ({ ...p, accountNo: e.target.value }))}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={spanClass}>IFSC Code</span>
          <input
            type="text"
            maxLength={11}
            value={formData.ifscCode || ""}
            onChange={(e) => setFormData((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-mono uppercase font-medium text-slate-800"
          />
        </div>
      </div>
    </div>
  );
}
