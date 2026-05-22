import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createEntity, autoFillGstData, manageAddress } from "../../services/entityService";
import EntityCreateBankSection from "./EntityCreateBankSection";
import EntityCreateTermsAddresses from "./EntityCreateTermsAddresses";
import EntityCreateGstSection from "./EntityCreateGstSection";
import EntityCreateIdentitySection from "./EntityCreateIdentitySection";

// Default form template for fresh initialization.
const defaultForm = {
  type: "brand", businessName: "", brandName: "", pocName: "", pocContact: "",
  gst: "", creditDays: "", debitDays: "", beneficiary: "", bankName: "",
  accountNo: "", ifscCode: ""
};

export default function EntityCreateDrawer({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState(defaultForm);
  const [extraAddresses, setExtraAddresses] = useState([]);
  const [isGstLoading, setIsGstLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gstAddress, setGstAddress] = useState(null);

  // Cleanses the form states on drawer open to prevent stale data lingering from previous views.
  useEffect(() => {
    if (isOpen) {
      setFormData(defaultForm);
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

  // Listens to GST edits. When input reaches exactly 15 characters (complete GSTIN),
  // it locks inputs (isGstLoading) and automatically fetches verified address from simulated registry.
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

  // Handles payload construction. First creates main registry record (including default GST address,
  // credit configs, bank details), then loops through extra locations to store them as isolated entity relations.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { beneficiary, bankName, accountNo, ifscCode, creditDays, debitDays, type, businessName, brandName, pocName, pocContact, gst } = formData;
    const hasB = beneficiary || bankName || accountNo || ifscCode;
    const cr = creditDays !== "" ? Number(creditDays) : null;
    const db = debitDays !== "" ? Number(debitDays) : null;

    try {
      const ent = await createEntity({
        type, businessName, brandName: type === "brand" ? brandName : null,
        pocName, pocContact, gst, pan: null,
        bankDetails: hasB ? { beneficiary, bankName, accountNo, ifscCode } : null,
        terms: (cr !== null || db !== null) ? { ...((cr !== null) && { creditDays: cr }), ...((db !== null) && { debitDays: db }) } : null,
        address: gstAddress
      });

      // Relational database architecture requires adding extra locations in a separate iteration loop.
      for (const addr of extraAddresses) {
        if (addr.addressLine1?.trim()) {
          await manageAddress(ent.id, {
            ...addr,
            city: addr.city?.trim() || "Unknown",
            state: (addr.state || "Unknown").toUpperCase(),
            pincode: addr.pincode?.trim() || "000000",
            isDefaultBilling: false, isDefaultShipping: false
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
          <button
            type="button"
            onClick={onClose}
            className="h-5 w-5 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
            id="btn-close-create-drawer"
          >
            <X size={12} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3" id="create-drawer-form">
          <div className="grid grid-cols-2 gap-2">
            <EntityCreateIdentitySection formData={formData} setFormData={setFormData} handleGstChange={handleGstChange} isGstLoading={isGstLoading} />
            <EntityCreateGstSection gstAddress={gstAddress} setGstAddress={setGstAddress} />
            <EntityCreateBankSection formData={formData} setFormData={setFormData} />
            <EntityCreateTermsAddresses extraAddresses={extraAddresses} setExtraAddresses={setExtraAddresses} />
          </div>

          <div className="mt-auto border-t border-slate-200 pt-3 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 h-7 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wide cursor-pointer text-[10px] rounded-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm font-bold uppercase tracking-wide cursor-pointer text-[10px] flex items-center justify-center gap-1.5 transition-all"
            >
              {isSaving ? <Loader2 size={11} className="animate-spin text-white" /> : "Save Profile"}
            </button>
          </div>
        </form>

      </div>
    </>
  );
}
