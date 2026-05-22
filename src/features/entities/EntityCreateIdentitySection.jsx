import React from "react";
import { Loader2 } from "lucide-react";
import InputField from "./InputField";

const spanClass = "text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight";

export default function EntityCreateIdentitySection({
  formData,
  setFormData,
  handleGstChange,
  isGstLoading
}) {
  const isBrand = formData.type === "brand";

  return (
    <>
      <div className="col-span-2">
        <div className="flex flex-col gap-0.5">
          <span className={spanClass}>Entity Type *</span>
          <div className="flex bg-slate-200/60 p-0.5 rounded-sm w-full mt-0.5">
            {["brand", "factory", "vendor"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t })}
                className={`flex-1 text-[9px] uppercase tracking-wider font-semibold h-6 py-0 rounded-[1px] transition-all cursor-pointer outline-none text-center ${
                  formData.type === t
                    ? "bg-slate-950 text-slate-100 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <InputField
        label="Business Name *"
        colSpan={isBrand ? "col-span-1" : "col-span-2"}
        type="text"
        required
        value={formData.businessName}
        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
      />

      {isBrand && (
        <InputField
          label="Brand Name *"
          colSpan="col-span-1"
          type="text"
          required
          value={formData.brandName}
          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
        />
      )}

      <InputField
        label="POC Name *"
        colSpan="col-span-1"
        type="text"
        required
        value={formData.pocName}
        onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
      />

      <InputField
        label="POC Contact *"
        colSpan="col-span-1"
        type="text"
        required
        value={formData.pocContact}
        onChange={(e) => setFormData({ ...formData, pocContact: e.target.value })}
      />

      <div className="col-span-1">
        <div className="flex flex-col gap-0.5">
          <span className={spanClass}>GST Number *</span>
          <div className="relative">
            <input
              type="text"
              required
              maxLength={15}
              value={formData.gst}
              onChange={handleGstChange}
              disabled={isGstLoading}
              className="w-full h-6 text-xs pl-1.5 pr-6 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-mono uppercase font-medium text-slate-800 disabled:opacity-50 disabled:bg-slate-50"
            />
            {isGstLoading && (
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <Loader2 size={10} className="animate-spin text-indigo-500" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-1 grid grid-cols-2 gap-1.5">
        <InputField
          label="Credit Days"
          type="number"
          value={formData.creditDays || ""}
          onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
        />
        <InputField
          label="Debit Days"
          type="number"
          value={formData.debitDays || ""}
          onChange={(e) => setFormData({ ...formData, debitDays: e.target.value })}
        />
      </div>
    </>
  );
}
