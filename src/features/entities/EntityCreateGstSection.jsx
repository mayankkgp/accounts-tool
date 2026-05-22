import React from "react";

const spanClass = "text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight";

export default function EntityCreateGstSection({ gstAddress, setGstAddress }) {
  if (!gstAddress) return null;

  return (
    <div className="col-span-2 p-2 bg-indigo-50/20 border border-indigo-100 rounded-sm flex flex-col gap-1.5 animate-fade-in text-xs" id="editable-gst-addr">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">
          GST Billing/Shipping Address (Default)
        </span>
        <span className="inline-block px-1 bg-indigo-100 text-indigo-800 font-mono font-bold rounded-[1px] uppercase text-[7px]">
          Default Mapped
        </span>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex flex-col gap-0.5 w-full">
          <span className={spanClass}>Address Line 1 *</span>
          <input
            type="text"
            required
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
            value={gstAddress.addressLine1 || ""}
            onChange={(e) => setGstAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-0.5 w-full">
          <span className={spanClass}>Address Line 2</span>
          <input
            type="text"
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
            value={gstAddress.addressLine2 || ""}
            onChange={(e) => setGstAddress((prev) => ({ ...prev, addressLine2: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5 w-full">
          <div className="flex flex-col gap-0.5">
            <span className={spanClass}>Pincode *</span>
            <input
              type="text"
              required
              className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
              value={gstAddress.pincode || ""}
              onChange={(e) => setGstAddress((prev) => ({ ...prev, pincode: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={spanClass}>City *</span>
            <input
              type="text"
              required
              className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
              value={gstAddress.city || ""}
              onChange={(e) => setGstAddress((prev) => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={spanClass}>State *</span>
            <input
              type="text"
              required
              className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
              value={gstAddress.state || ""}
              onChange={(e) => setGstAddress((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
