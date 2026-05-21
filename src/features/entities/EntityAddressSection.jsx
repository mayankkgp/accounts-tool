import React, { useState, useEffect } from "react";
import { MapPin, Plus, Check, X } from "lucide-react";
import { updateEntity, manageAddress } from "../../services/entityService";
import { fetchLocationByPin } from "../../services/api";

export default function EntityAddressSection({ currentProfile, onUpdateProfile }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [form, setForm] = useState({ addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    if (form.pincode?.trim().length === 6) {
      let active = true;
      setIsPinLoading(true);
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
    const updated = (currentProfile.addresses || []).map(a => ({ ...a, [field]: a.id === addrId }));
    onUpdateProfile(updated);
    try {
      await manageAddress(currentProfile.id, updated.find(a => a.id === addrId));
      await updateEntity(currentProfile.id, { addresses: updated });
    } catch (e) {
      console.error("Default-map failed", e);
    }
  };

  const handleSave = async (isEdit, addrId) => {
    if (!form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) return;
    const clean = { addressLine1: form.addressLine1.trim(), addressLine2: form.addressLine2.trim() || undefined, city: form.city.trim(), state: form.state.trim().toUpperCase(), pincode: form.pincode.trim() };
    const updated = isEdit 
      ? currentProfile.addresses.map(a => a.id === addrId ? { ...a, ...clean } : a)
      : [...(currentProfile.addresses || []), { ...clean, id: `addr_new_${Date.now()}`, isDefaultBilling: false, isDefaultShipping: false }];
    onUpdateProfile(updated);
    setIsAdding(false);
    setEditId(null);
    try {
      const payload = isEdit ? { ...currentProfile.addresses.find(a => a.id === addrId), ...clean } : { ...clean, isDefaultBilling: false, isDefaultShipping: false };
      const saved = await manageAddress(currentProfile.id, payload);
      const final = updated.map(a => a.id.startsWith("addr_new_") || a.id === addrId ? saved : a);
      await updateEntity(currentProfile.id, { addresses: final });
      onUpdateProfile(final);
    } catch (e) {
      console.error("Address save failed", e);
    }
  };

  const startForm = (addr = null) => {
    setForm(addr ? { addressLine1: addr.addressLine1 || "", addressLine2: addr.addressLine2 || "", city: addr.city || "", state: addr.state || "", pincode: addr.pincode || "" } : { addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });
    setEditId(addr ? addr.id : null);
    setIsAdding(!addr);
  };

  const renderForm = (isEdit, addrId) => (
    <div className="bg-slate-50 border-l-2 border-l-emerald-400 p-1.5 rounded-sm flex flex-col gap-1 animate-fade-in text-xs mb-1 bg-opacity-70">
      <div className="grid grid-cols-2 gap-1">
        <input type="text" placeholder="Address Line 1" className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} required />
        <input type="text" placeholder="Address Line 2 (Optional)" className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-1">
        <input type="text" placeholder="Pincode" className="h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} required />
        <input type="text" placeholder={isPinLoading ? "Loading..." : "City"} disabled={isPinLoading} className={`h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium ${isPinLoading ? "text-slate-400 italic bg-slate-50" : "text-slate-800"}`} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
        <input type="text" placeholder={isPinLoading ? "Loading..." : "State"} disabled={isPinLoading} className={`h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium ${isPinLoading ? "text-slate-400 italic bg-slate-50" : "text-slate-800"}`} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
      </div>
      <div className="flex justify-end gap-1 mt-1 border-t border-slate-200/60 pt-1">
        <button type="button" onClick={() => { setIsAdding(false); setEditId(null); }} className="h-5 px-1.5 flex items-center justify-center gap-0.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-sm cursor-pointer text-[8px] font-bold uppercase"><X size={10} /> Cancel</button>
        <button type="button" onClick={() => handleSave(isEdit, addrId)} className="h-5 px-1.5 flex items-center justify-center gap-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm cursor-pointer text-[8px] font-bold uppercase"><Check size={10} /> Save</button>
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

            return (
              <div key={addr.id} className="bg-slate-50 border-l-2 border-l-emerald-400 hover:bg-slate-100/50 p-1.5 rounded-sm flex flex-col gap-1 text-[10px] transition-all">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-wrap gap-1 items-center self-start mb-0.5">
                    {addr.isDefaultBilling && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[2px]">Default Billing</span>}
                    {addr.isDefaultShipping && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-emerald-55 border border-emerald-200 text-emerald-600 rounded-[2px]" style={{backgroundColor:"rgba(236, 253, 245, 1)"}}>Default Shipping</span>}
                  </div>
                  <div className="flex gap-1.5 items-center flex-shrink-0 text-[8px] font-bold">
                    {!addr.isDefaultBilling && (
                      <button type="button" onClick={() => handleSetDefault(addr.id, "isDefaultBilling")} className="uppercase text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">Set Billing</button>
                    )}
                    {!addr.isDefaultBilling && !addr.isDefaultShipping && <span className="text-slate-300 select-none">|</span>}
                    {!addr.isDefaultShipping && (
                      <button type="button" onClick={() => handleSetDefault(addr.id, "isDefaultShipping")} className="uppercase text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">Set Shipping</button>
                    )}
                    {(!addr.isDefaultBilling || !addr.isDefaultShipping) && <span className="text-slate-300 select-none">|</span>}
                    <button type="button" onClick={() => startForm(addr)} className="uppercase text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">Edit</button>
                  </div>
                </div>
                <p className="text-slate-800 font-semibold leading-tight">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                <div className="text-[9px] text-slate-500 font-mono font-medium uppercase mt-0.5 leading-none truncate">{geo}</div>
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
