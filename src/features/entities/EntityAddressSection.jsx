import React, { useState } from "react";
import { MapPin, Plus, Check, X } from "lucide-react";
import { updateEntity, manageAddress } from "../../services/entityService";

// EntityAddressSection manages dynamic shipping & billing locations, including default switches and inline fast addition.
export default function EntityAddressSection({ currentProfile, isEditing, onUpdateProfile }) {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: ""
  });

  const handleSetDefault = async (addrId, field) => {
    const newAddresses = (currentProfile.addresses || []).map((addr) => ({
      ...addr,
      [field]: addr.id === addrId
    }));

    onUpdateProfile(newAddresses);

    try {
      const targetAddress = newAddresses.find((a) => a.id === addrId);
      await manageAddress(currentProfile.id, targetAddress);
      await updateEntity(currentProfile.id, { addresses: newAddresses });
    } catch (err) {
      console.error("Failed to update default address", err);
    }
  };

  const handleSaveNewAddress = async () => {
    if (!newAddr.addressLine1.trim() || !newAddr.city.trim() || !newAddr.state.trim() || !newAddr.pincode.trim()) {
      return;
    }

    const generatedId = `addr_new_${Date.now()}`;
    const freshAddress = {
      id: generatedId,
      addressLine1: newAddr.addressLine1.trim(),
      addressLine2: newAddr.addressLine2.trim() || undefined,
      city: newAddr.city.trim(),
      state: newAddr.state.trim().toUpperCase(),
      pincode: newAddr.pincode.trim(),
      isDefaultBilling: false,
      isDefaultShipping: false
    };

    const newAddresses = [...(currentProfile.addresses || []), freshAddress];
    onUpdateProfile(newAddresses);
    setIsAddingAddress(false);
    setNewAddr({ addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });

    try {
      const saved = await manageAddress(currentProfile.id, {
        addressLine1: freshAddress.addressLine1,
        addressLine2: freshAddress.addressLine2,
        city: freshAddress.city,
        state: freshAddress.state,
        pincode: freshAddress.pincode,
        isDefaultBilling: false,
        isDefaultShipping: false
      });
      const finalAddresses = newAddresses.map((a) => (a.id === generatedId ? saved : a));
      await updateEntity(currentProfile.id, { addresses: finalAddresses });
      onUpdateProfile(finalAddresses);
    } catch (err) {
      console.error("Failed to persist new address", err);
    }
  };

  const addrCount = currentProfile.addresses ? currentProfile.addresses.length : 0;

  return (
    <div className="flex flex-col gap-1.5" id="detail-addresses-section">
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Registered Locations ({addrCount})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingAddress(!isAddingAddress)}
          className="h-5 px-1.5 rounded-sm border border-slate-200 hover:bg-slate-55 bg-white text-slate-600 hover:text-slate-800 flex items-center gap-1 font-bold text-[8px] uppercase tracking-wide cursor-pointer transition-all"
        >
          <Plus size={9} /> Add Location
        </button>
      </div>

      {isAddingAddress && (
        <div className="bg-slate-100 p-2 rounded-sm border border-slate-200 flex flex-col gap-1 animate-fade-in text-xs mb-1" id="inline-address-form">
          <input
            type="text"
            placeholder="Address Line 1"
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
            value={newAddr.addressLine1}
            onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Address Line 2 (Optional)"
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
            value={newAddr.addressLine2}
            onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-1">
            <input
              type="text"
              placeholder="City"
              className="h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="State"
              className="h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
              value={newAddr.state}
              onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Pincode"
              className="h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium"
              value={newAddr.pincode}
              onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-1 mt-1.5 border-t border-slate-200/60 pt-1.5 bg-transparent">
            <button
              type="button"
              onClick={() => setIsAddingAddress(false)}
              className="h-5 px-1.5 flex items-center justify-center gap-0.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-sm cursor-pointer text-[8px] font-bold uppercase"
            >
              <X size={10} /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNewAddress}
              className="h-5 px-1.5 flex items-center justify-center gap-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm cursor-pointer text-[8px] font-bold uppercase"
            >
              <Check size={10} /> Save
            </button>
          </div>
        </div>
      )}

      {currentProfile.addresses && currentProfile.addresses.length > 0 ? (
        <div className="flex flex-col gap-1">
          {currentProfile.addresses.map((addr) => {
            const hasBadges = addr.isDefaultBilling || addr.isDefaultShipping;
            const geoParts = [];
            if (addr.city) geoParts.push(addr.city.trim());
            if (addr.state) geoParts.push(addr.state.trim());
            const cityState = geoParts.join(", ");
            const geoString = cityState && addr.pincode ? `${cityState} - ${addr.pincode.trim()}` : (cityState || addr.pincode || "");

            return (
              <div key={addr.id} className="group bg-slate-50 border-l-2 border-l-emerald-400 hover:bg-slate-100/50 p-1.5 rounded-sm flex flex-col gap-1 relative text-[10px] transition-all">
                {hasBadges && (
                  <div className="flex gap-1 items-center self-start mb-0.5">
                    {addr.isDefaultBilling && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[2px]">Default Billing</span>}
                    {addr.isDefaultShipping && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-[2px]">Default Shipping</span>}
                  </div>
                )}
                <p className="text-slate-800 font-semibold leading-tight">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                <div className="text-[9px] text-slate-500 font-mono font-medium uppercase mt-0.5 leading-none truncate">{geoString}</div>

                <div className="flex gap-1.5 items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!addr.isDefaultBilling && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id, "isDefaultBilling")}
                      className="text-[8px] uppercase font-bold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      Set Billing
                    </button>
                  )}
                  {!addr.isDefaultBilling && !addr.isDefaultShipping && <span className="text-slate-300 select-none">|</span>}
                  {!addr.isDefaultShipping && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id, "isDefaultShipping")}
                      className="text-[8px] uppercase font-bold text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      Set Shipping
                    </button>
                  )}
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
