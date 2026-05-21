import React, { useState, useEffect } from "react";
import { MapPin, Plus, Check, X, Loader2 } from "lucide-react";
import { manageAddress, deleteAddress } from "../../services/entityService";
import { fetchLocationByPin } from "../../services/api";

export default function EntityAddressSection({ currentProfile, onUpdateProfile }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [isSavingAction, setIsSavingAction] = useState(false);
  const [processingAddrId, setProcessingAddrId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm] = useState({ addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    if (form.pincode?.trim().length === 6) {
      let active = true; setIsPinLoading(true);
      fetchLocationByPin(form.pincode.trim()).then((res) => {
        if (active) {
          if (res) setForm((prev) => ({ ...prev, city: res.city, state: res.state }));
          setIsPinLoading(false);
        }
      });
      return () => { active = false; };
    }
  }, [form.pincode]);

  const handleSetDefault = async (addrId, field) => {
    setProcessingAddrId(addrId);
    try {
      const updated = (currentProfile.addresses || []).map(a => ({ ...a, [field]: a.id === addrId }));
      await manageAddress(currentProfile.id, updated.find(a => a.id === addrId));
      onUpdateProfile(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingAddrId(null);
    }
  };

  const handleSave = async (isEdit, addrId) => {
    if (!form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) return;
    setIsSavingAction(true);
    try {
      const clean = { addressLine1: form.addressLine1.trim(), addressLine2: form.addressLine2.trim() || undefined, city: form.city.trim(), state: form.state.trim().toUpperCase(), pincode: form.pincode.trim() };
      const payload = isEdit ? { ...currentProfile.addresses.find(a => a.id === addrId), ...clean } : { ...clean, isDefaultBilling: false, isDefaultShipping: false };
      const saved = await manageAddress(currentProfile.id, payload);
      onUpdateProfile(isEdit ? currentProfile.addresses.map(a => a.id === addrId ? saved : a) : [...(currentProfile.addresses || []), saved]);
      setIsAdding(false); setEditId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleDelete = async (addrId) => {
    setProcessingAddrId(addrId);
    try {
      await deleteAddress(addrId);
      const updatedList = (currentProfile.addresses || []).filter(a => a.id !== addrId);
      onUpdateProfile(updatedList);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingAddrId(null);
      setDeleteConfirmId(null);
    }
  };

  const startForm = (addr = null) => {
    setForm(addr ? { addressLine1: addr.addressLine1 || "", addressLine2: addr.addressLine2 || "", city: addr.city || "", state: addr.state || "", pincode: addr.pincode || "" } : { addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });
    setEditId(addr ? addr.id : null); setIsAdding(!addr);
  };

  const renderForm = (isEdit, addrId) => (
    <div className="bg-slate-50 border-l-2 border-l-emerald-400 px-1.5 py-1 rounded-sm flex flex-col gap-1.5 animate-fade-in text-xs mb-1 bg-opacity-70">
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {[["Address Line 1", "addressLine1", true], ["Address Line 2", "addressLine2", false]].map(([lbl, key, req]) => (
          <div key={key} className="flex flex-col gap-0.5 w-full">
            <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">{lbl}</span>
            <input type="text" disabled={isSavingAction} className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800 disabled:opacity-60" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required={req} />
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1.5 w-full">
        {[["Pincode", "pincode", false], ["City", "city", true], ["State", "state", true]].map(([lbl, key, lockable]) => {
          const disabled = isSavingAction || (lockable && isPinLoading);
          return (
            <div key={key} className="flex flex-col gap-0.5 flex-1 w-full">
              <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">{lbl}</span>
              <input type="text" disabled={disabled} className={`w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium disabled:opacity-60 ${disabled ? "text-slate-400 italic bg-gray-100" : "text-slate-800"}`} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required />
            </div>
          );
        })}
        <button type="button" disabled={isSavingAction} onClick={() => { setIsAdding(false); setEditId(null); }} className="h-5 px-1.5 flex items-center justify-center gap-0.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-sm cursor-pointer text-[9px] font-bold uppercase shrink-0 disabled:opacity-50"><X size={10} /> Cancel</button>
        <button type="button" disabled={isSavingAction} onClick={() => handleSave(isEdit, addrId)} className="h-5 px-1.5 flex items-center justify-center gap-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm cursor-pointer text-[9px] font-bold uppercase shrink-0 disabled:opacity-50">
          {isSavingAction ? <Loader2 size={10} className="animate-spin text-white/50" /> : <Check size={10} />}
          Save
        </button>
      </div>
    </div>
  );

  const list = currentProfile.addresses || [];
  return (
    <div className="flex flex-col gap-1.5" id="detail-addresses-section">
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">Registered Locations ({list.length})</span>
        </div>
        <button type="button" onClick={() => startForm()} className="h-5 px-1.5 rounded-sm border border-slate-200 hover:bg-slate-50 bg-white text-slate-600 hover:text-slate-800 flex items-center gap-1 font-bold text-[8px] uppercase tracking-wide cursor-pointer transition-all">
          <Plus size={9} /> Add Location
        </button>
      </div>
      {isAdding && renderForm(false)}
      {list.length > 0 ? (
        <div className="flex flex-col gap-1">
          {list.map((addr) => {
            if (editId === addr.id) return <React.Fragment key={addr.id}>{renderForm(true, addr.id)}</React.Fragment>;
            const geo = [addr.city?.trim(), addr.state?.trim()].filter(Boolean).join(", ") + (addr.pincode ? ` - ${addr.pincode.trim()}` : "");
            const hasBadges = addr.isDefaultBilling || addr.isDefaultShipping;
            const isProcessing = processingAddrId === addr.id;

            return (
              <div key={addr.id} className="bg-slate-50 border-l-2 border-l-emerald-400 hover:bg-slate-100/50 px-1.5 py-1 rounded-sm flex flex-col gap-1 text-[10px] transition-all">
                {hasBadges && (
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap gap-1 items-center self-start mb-0.5">
                      {addr.isDefaultBilling && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[2px]">Default Billing</span>}
                      {addr.isDefaultShipping && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-emerald-55 border border-emerald-200 text-emerald-600 rounded-[2px]" style={{backgroundColor:"rgba(236, 253, 245, 1)"}}>Default Shipping</span>}
                    </div>
                  </div>
                )}
                <p className="text-slate-800 font-semibold leading-tight">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                <div className="flex justify-between items-center mt-0.5 w-full">
                  <div className="text-[9px] text-slate-500 font-mono font-medium uppercase leading-none truncate">{geo}</div>
                  <div className="flex gap-1.5 items-center flex-shrink-0 text-[8px] font-bold text-slate-400" onMouseLeave={() => setDeleteConfirmId(null)}>
                    {isProcessing && <Loader2 size={8} className="animate-spin text-indigo-500 mr-1" />}
                    {!addr.isDefaultBilling && (
                      <button type="button" disabled={isProcessing} onClick={() => handleSetDefault(addr.id, "isDefaultBilling")} className="uppercase hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Set Billing</button>
                    )}
                    {!addr.isDefaultBilling && !addr.isDefaultShipping && <span className="text-slate-300 select-none">|</span>}
                    {!addr.isDefaultShipping && (
                      <button type="button" disabled={isProcessing} onClick={() => handleSetDefault(addr.id, "isDefaultShipping")} className="uppercase hover:text-emerald-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Set Shipping</button>
                    )}
                    {(!addr.isDefaultBilling || !addr.isDefaultShipping) && <span className="text-slate-300 select-none">|</span>}
                    <button type="button" disabled={isProcessing} onClick={() => startForm(addr)} className="uppercase hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Edit</button>
                    {!addr.isDefaultBilling && !addr.isDefaultShipping && (
                      <>
                        <span className="text-slate-300 select-none">|</span>
                        {deleteConfirmId === addr.id ? (
                          <button type="button" disabled={isProcessing} onClick={() => handleDelete(addr.id)} className="text-[9px] uppercase tracking-wide font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-1.5 py-[2px] rounded-[2px]" style={{lineHeight: "1"}}>Delete?</button>
                        ) : (
                          <button type="button" disabled={isProcessing} onClick={() => setDeleteConfirmId(addr.id)} className="uppercase hover:text-red-600 transition-colors cursor-pointer">Delete</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-[10px] text-slate-500 font-medium italic py-2 text-center bg-slate-50 border-l-2 border-l-emerald-400/50 rounded-sm">
          No active addresses found. Configure locations dynamically.
        </div>
      )}
    </div>
  );
}
