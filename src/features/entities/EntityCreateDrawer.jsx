import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createEntity, autoFillGstData, manageAddress } from "../../services/entityService";
import { fetchLocationByPin } from "../../services/api";
import EntityCreateBankSection from "./EntityCreateBankSection";
import EntityCreateTermsAddresses from "./EntityCreateTermsAddresses";

export default function EntityCreateDrawer({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    type: "brand", businessName: "", brandName: "", pocName: "", pocContact: "",
    gst: "", pan: "", beneficiary: "", bankName: "", accountNo: "", ifscCode: "",
    creditDays: "", debitDays: ""
  });
  const [extraAddresses, setExtraAddresses] = useState([]);
  const [isGstLoading, setIsGstLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gstAddress, setGstAddress] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleGstChange = async (e) => {
    const val = e.target.value.toUpperCase().slice(0, 15);
    setFormData((prev) => ({ ...prev, gst: val }));
    if (val.length === 15) {
      setIsGstLoading(true);
      try {
        const res = await autoFillGstData(val);
        setGstAddress(res.address);
        setFormData((prev) => ({ ...prev, pan: res.pan }));
      } catch (err) {
        console.error("GST autofill failed", err);
      } finally {
        setIsGstLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const hasB = formData.beneficiary || formData.bankName || formData.accountNo || formData.ifscCode;
    const cr = formData.creditDays !== "" ? Number(formData.creditDays) : null;
    const db = formData.debitDays !== "" ? Number(formData.debitDays) : null;
    try {
      const ent = await createEntity({
        type: formData.type, businessName: formData.businessName,
        brandName: formData.type === "brand" ? formData.brandName : null,
        pocName: formData.pocName, pocContact: formData.pocContact, gst: formData.gst, pan: formData.pan || null,
        bankDetails: hasB ? { beneficiary: formData.beneficiary, bankName: formData.bankName, accountNo: formData.accountNo, ifscCode: formData.ifscCode } : null,
        terms: (cr !== null || db !== null) ? { ...(cr !== null && { creditDays: cr }), ...(db !== null && { debitDays: db }) } : null,
        address: gstAddress
      });
      for (const r of extraAddresses) {
        if (r.trim()) {
          const p = r.split(",").map((x) => x.trim()).filter(Boolean);
          if (p.length) {
            const pin = p.find((x) => /^\d{5,6}$/.test(x)) || "000000";
            let city = p[1] || "Unknown", state = p[2] || "Unknown";
            if (pin !== "000000") {
              const live = await fetchLocationByPin(pin);
              if (live) { city = live.city; state = live.state; }
            }
            await manageAddress(ent.id, { addressLine1: p[0] || "Main Office", city, state, pincode: pin, isDefaultBilling: false, isDefaultShipping: false });
          }
        }
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity" onClick={onClose} id="create-drawer-overlay" />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] sm:w-[520px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col h-full font-sans text-xs" id="create-drawer-body">
        <div className="flex items-center justify-between p-3 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800">Add New Profile</h3>
            <p className="text-[8px] text-slate-500 font-mono">SCOPED_ENTITY_INITIALIZATION_MODULE</p>
          </div>
          <button type="button" onClick={onClose} className="h-5 w-5 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" id="btn-close-create-drawer"><X size={12} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3" id="create-drawer-form">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-1">Entity Type *</label>
              <div className="flex bg-slate-200/60 p-0.5 rounded-sm w-full">
                {["brand", "factory", "vendor"].map((t) => (
                  <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} className={`flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 rounded-[1px] transition-all cursor-pointer outline-none text-center ${formData.type === t ? "bg-slate-950 text-slate-100 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className={formData.type === "brand" ? "col-span-1" : "col-span-2"}>
              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-0.5">Business Name *</label>
              <input type="text" required placeholder="e.g. Acme Textiles Ltd" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium" />
            </div>
            {formData.type === "brand" && (
              <div className="col-span-1">
                <label className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-0.5">Brand Name *</label>
                <input type="text" required placeholder="e.g. Acme Clothing" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium" />
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-0.5">POC Name *</label>
              <input type="text" required placeholder="Contact Person" value={formData.pocName} onChange={(e) => setFormData({ ...formData, pocName: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-0.5">POC Contact *</label>
              <input type="text" required placeholder="Phone or email" value={formData.pocContact} onChange={(e) => setFormData({ ...formData, pocContact: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-0.5">GST Number *</label>
              <div className="relative">
                <input type="text" required maxLength={15} placeholder="e.g. 27AAAAA1111A1Z1" value={formData.gst} onChange={handleGstChange} className="w-full h-6 text-xs pl-1.5 pr-6 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-mono uppercase font-medium" />
                {isGstLoading && <span className="absolute right-1.5 top-1/2 -translate-y-1/2"><Loader2 size={10} className="animate-spin text-indigo-500" /></span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-slate-500 font-bold block mb-0.5">PAN Card Number</label>
              <input type="text" placeholder="Auto from GST" maxLength={10} value={formData.pan || ""} onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-slate-50 text-slate-700 rounded-sm outline-none font-mono uppercase font-medium" />
            </div>
            {gstAddress && (
              <div className="col-span-2 p-1.5 bg-indigo-50/50 border border-indigo-100 rounded-sm flex flex-col gap-0.5 text-[9px] text-slate-600 animate-fade-in" id="default-gst-address-card">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-600 uppercase tracking-wide">GST Billing/Shipping Address (Default)</span>
                  <span className="inline-block px-1 bg-indigo-100 text-indigo-800 font-mono font-bold rounded-[1px] uppercase text-[7px]">Default Mapped</span>
                </div>
                <p className="font-medium text-slate-800">{gstAddress.addressLine1}</p>
                <p>{gstAddress.city}, {gstAddress.state} - {gstAddress.pincode}</p>
              </div>
            )}
            <EntityCreateBankSection formData={formData} setFormData={setFormData} />
            <EntityCreateTermsAddresses formData={formData} setFormData={setFormData} extraAddresses={extraAddresses} setExtraAddresses={setExtraAddresses} />
          </div>
          <div className="mt-auto border-t border-slate-200 pt-3 flex gap-2 shrink-0">
            <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 h-7 border border-slate-200 hover:bg-slate-50 rounded-sm text-slate-700 font-bold uppercase tracking-wide cursor-pointer text-[10px]">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm font-bold uppercase tracking-wide cursor-pointer text-[10px] flex items-center justify-center gap-1.5">
              {isSaving ? <Loader2 size={11} className="animate-spin text-white" /> : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
