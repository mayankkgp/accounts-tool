import React from "react";

export default function EntityCreateBankSection({ formData, setFormData }) {
  return (
    <div className="col-span-2 p-2 border border-slate-100 rounded-sm bg-slate-50/50 flex flex-col gap-2" id="create-bank-section">
      <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block">Bank Details (Optional)</span>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block mb-0.5">Beneficiary</label>
          <input
            type="text" placeholder="Account Name" value={formData.beneficiary}
            onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
          />
        </div>
        <div>
          <label className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block mb-0.5">Bank Name</label>
          <input
            type="text" placeholder="Bank Name" value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
          />
        </div>
        <div>
          <label className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block mb-0.5">Account Number</label>
          <input
            type="text" placeholder="A/C Number" value={formData.accountNo}
            onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
          />
        </div>
        <div>
          <label className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block mb-0.5">IFSC Code</label>
          <input
            type="text" placeholder="IFSC Code" maxLength={11} value={formData.ifscCode}
            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-mono uppercase font-medium"
          />
        </div>
      </div>
    </div>
  );
}
