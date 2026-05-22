import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createEntity, autoFillGstData, manageAddress } from "../../services/entityService";
import EntityCreateBankSection from "./EntityCreateBankSection";
import EntityCreateTermsAddresses from "./EntityCreateTermsAddresses";

const spanClass = "text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight";

export default function EntityCreateDrawer({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    type: "brand", businessName: "", brandName: "", pocName: "", pocContact: "",
    gst: "", creditDays: "", debitDays: "",
    beneficiary: "", bankName: "", accountNo: "", ifscCode: ""
  });
  const [extraAddresses, setExtraAddresses] = useState([]);
  const [isGstLoading, setIsGstLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gstAddress, setGstAddress] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: "brand", businessName: "", brandName: "", pocName: "", pocContact: "",
        gst: "", creditDays: "", debitDays: "",
        beneficiary: "", bankName: "", accountNo: "", ifscCode: ""
      });
      setExtraAddresses([]);
      setGstAddress(null);
    }
  }, [isOpen]);

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
        pocName: formData.pocName, pocContact: formData.pocContact, gst: formData.gst, pan: null,
        bankDetails: hasB ? { beneficiary: formData.beneficiary, bankName: formData.bankName, accountNo: formData.accountNo, ifscCode: formData.ifscCode } : null,
        terms: (cr !== null || db !== null) ? { ...(cr !== null && { creditDays: cr }), ...(db !== null && { debitDays: db }) } : null,
        address: gstAddress
      });
      for (const addr of extraAddresses) {
        if (addr.addressLine1?.trim()) {
          await manageAddress(ent.id, {
            addressLine1: addr.addressLine1.trim(),
            addressLine2: addr.addressLine2?.trim() || undefined,
            city: addr.city?.trim() || "Unknown",
            state: (addr.state || "Unknown").toUpperCase(),
            pincode: addr.pincode?.trim() || "000000",
            isDefaultBilling: false,
            isDefaultShipping: false
          });
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
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-40 transition-opacity" id="create-drawer-overlay" />
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
              <div className="flex flex-col gap-0.5">
                <span className={spanClass}>Entity Type *</span>
                <div className="flex bg-slate-200/60 p-0.5 rounded-sm w-full mt-0.5">
                  {["brand", "factory", "vendor"].map((t) => (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} className={`flex-1 text-[9px] uppercase tracking-wider font-semibold h-6 py-0 rounded-[1px] transition-all cursor-pointer outline-none text-center ${formData.type === t ? "bg-slate-950 text-slate-100 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className={formData.type === "brand" ? "col-span-1" : "col-span-2"}>
              <div className="flex flex-col gap-0.5">
                <span className={spanClass}>Business Name *</span>
                <input type="text" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" />
              </div>
            </div>

            {formData.type === "brand" && (
              <div className="col-span-1">
                <div className="flex flex-col gap-0.5">
                  <span className={spanClass}>Brand Name *</span>
                  <input type="text" required value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" />
                </div>
              </div>
            )}

            <div className="col-span-1">
              <div className="flex flex-col gap-0.5">
                <span className={spanClass}>POC Name *</span>
                <input type="text" required value={formData.pocName} onChange={(e) => setFormData({ ...formData, pocName: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" />
              </div>
            </div>

            <div className="col-span-1">
              <div className="flex flex-col gap-0.5">
                <span className={spanClass}>POC Contact *</span>
                <input type="text" required value={formData.pocContact} onChange={(e) => setFormData({ ...formData, pocContact: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" />
              </div>
            </div>

            <div className="col-span-1">
              <div className="flex flex-col gap-0.5">
                <span className={spanClass}>GST Number *</span>
                <div className="relative">
                  <input type="text" required maxLength={15} value={formData.gst} onChange={handleGstChange} disabled={isGstLoading} className="w-full h-6 text-xs pl-1.5 pr-6 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-mono uppercase font-medium text-slate-800 disabled:opacity-50 disabled:bg-slate-50" />
                  {isGstLoading && <span className="absolute right-1.5 top-1/2 -translate-y-1/2"><Loader2 size={10} className="animate-spin text-indigo-500" /></span>}
                </div>
              </div>
            </div>

            <div className="col-span-1 grid grid-cols-2 gap-1.5">
              <div className="flex flex-col gap-0.5">
                <span className={spanClass}>Credit Days</span>
                <input type="number" value={formData.creditDays} onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={spanClass}>Debit Days</span>
                <input type="number" value={formData.debitDays} onChange={(e) => setFormData({ ...formData, debitDays: e.target.value })} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" />
              </div>
            </div>

            {gstAddress && (
              <div className="col-span-2 p-2 bg-indigo-50/20 border border-indigo-100 rounded-sm flex flex-col gap-1.5 animate-fade-in text-xs" id="editable-gst-addr">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">GST Billing/Shipping Address (Default)</span>
                  <span className="inline-block px-1 bg-indigo-100 text-indigo-800 font-mono font-bold rounded-[1px] uppercase text-[7px]">Default Mapped</span>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex flex-col gap-0.5 w-full">
                    <span className={spanClass}>Address Line 1 *</span>
                    <input type="text" required className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={gstAddress.addressLine1 || ""} onChange={(e) => setGstAddress((prev) => ({ ...prev, addressLine1: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-0.5 w-full">
                    <span className={spanClass}>Address Line 2</span>
                    <input type="text" className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={gstAddress.addressLine2 || ""} onChange={(e) => setGstAddress((prev) => ({ ...prev, addressLine2: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 w-full">
                    <div className="flex flex-col gap-0.5">
                      <span className={spanClass}>Pincode *</span>
                      <input type="text" required className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={gstAddress.pincode || ""} onChange={(e) => setGstAddress((prev) => ({ ...prev, pincode: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className={spanClass}>City *</span>
                      <input type="text" required className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={gstAddress.city || ""} onChange={(e) => setGstAddress((prev) => ({ ...prev, city: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className={spanClass}>State *</span>
                      <input type="text" required className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={gstAddress.state || ""} onChange={(e) => setGstAddress((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <EntityCreateBankSection formData={formData} setFormData={setFormData} />
            <EntityCreateTermsAddresses extraAddresses={extraAddresses} setExtraAddresses={setExtraAddresses} />
          </div>

          <div className="mt-auto border-t border-slate-200 pt-3 flex gap-2 shrink-0">
            <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 h-7 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wide cursor-pointer text-[10px] rounded-sm transition-all">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm font-bold uppercase tracking-wide cursor-pointer text-[10px] flex items-center justify-center gap-1.5 transition-all">
              {isSaving ? <Loader2 size={11} className="animate-spin text-white" /> : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
