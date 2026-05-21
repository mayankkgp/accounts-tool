import React from "react";
import { X } from "lucide-react";

export default function EntityCreateTermsAddresses({ formData, setFormData, extraAddresses, setExtraAddresses }) {
  return (
    <>
      <div className="col-span-2 grid grid-cols-2 gap-2 p-2 border border-slate-100 rounded-sm bg-slate-50/50" id="create-terms-addresses-section">
        <div>
          <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Default Terms</span>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1">
              <span className="text-[8px] font-bold text-slate-400 mt-0.5">CR:</span>
              <input
                type="number" placeholder="Days" value={formData.creditDays} onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
                className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="flex-1 flex items-center gap-1">
              <span className="text-[8px] font-bold text-slate-400 mt-0.5">DB:</span>
              <input
                type="number" placeholder="Days" value={formData.debitDays} onChange={(e) => setFormData({ ...formData, debitDays: e.target.value })}
                className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Addresses</span>
          <button
            type="button" onClick={() => setExtraAddresses([...extraAddresses, ""])}
            className="w-full h-6 border border-slate-200 hover:border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-sm flex items-center justify-center font-bold text-[9px] uppercase tracking-wider cursor-pointer"
          >
            + Add Another Address
          </button>
        </div>
      </div>

      {extraAddresses.length > 0 && (
        <div className="col-span-2 flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Additional Addresses</span>
          {extraAddresses.map((addrStr, idx) => (
            <div key={idx} className="flex gap-1 items-center w-full animate-fade-in">
              <input
                type="text" required placeholder="123 Street, 110001, City, State" value={addrStr}
                className="flex-1 h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
                onChange={(e) => {
                  const updated = [...extraAddresses];
                  updated[idx] = e.target.value;
                  setExtraAddresses(updated);
                }}
              />
              <button
                type="button" onClick={() => setExtraAddresses(extraAddresses.filter((_, i) => i !== idx))}
                className="h-6 w-6 rounded-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
