import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { fetchLocationByPin } from "../../services/api";

const spanClass = "text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight";

function ExtraAddressItem({ index, address, onUpdate, onRemove }) {
  const [isPinLoading, setIsPinLoading] = useState(false);

  useEffect(() => {
    if (address.pincode?.trim().length === 6) {
      let active = true;
      setIsPinLoading(true);
      fetchLocationByPin(address.pincode.trim()).then((res) => {
        if (active) {
          if (res) {
            onUpdate({ ...address, city: res.city, state: res.state });
          }
          setIsPinLoading(false);
        }
      });
      return () => { active = false; };
    }
  }, [address.pincode]);

  return (
    <div className="bg-slate-50 border-l-2 border-l-emerald-400 p-1.5 rounded-sm flex flex-col gap-1.5 animate-fade-in text-xs bg-opacity-70">
      <div className="grid grid-cols-2 gap-1.5 w-full">
        <div className="flex flex-col gap-0.5 w-full">
          <span className={spanClass}>Address Line 1</span>
          <input
            type="text"
            required
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
            value={address.addressLine1 || ""}
            onChange={(e) => onUpdate({ ...address, addressLine1: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-0.5 w-full">
          <span className={spanClass}>Address Line 2</span>
          <input
            type="text"
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
            value={address.addressLine2 || ""}
            onChange={(e) => onUpdate({ ...address, addressLine2: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-end gap-1.5 w-full">
        <div className="flex flex-col gap-0.5 flex-1 w-full">
          <span className={spanClass}>Pincode</span>
          <input
            type="text"
            required
            className="w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium text-slate-800"
            value={address.pincode || ""}
            onChange={(e) => onUpdate({ ...address, pincode: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-0.5 flex-1 w-full">
          <span className={spanClass}>City</span>
          <div className="relative">
            <input
              type="text"
              required
              disabled={isPinLoading}
              className={`w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium ${isPinLoading ? "text-slate-400 italic bg-gray-100" : "text-slate-800"}`}
              value={address.city || ""}
              onChange={(e) => onUpdate({ ...address, city: e.target.value })}
            />
            {isPinLoading && <span className="absolute right-1 top-1/2 -translate-y-1/2"><Loader2 size={10} className="animate-spin text-slate-400" /></span>}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 flex-1 w-full">
          <span className={spanClass}>State</span>
          <input
            type="text"
            required
            disabled={isPinLoading}
            className={`w-full h-6 text-xs px-1.5 border border-slate-200 bg-white rounded-sm outline-none focus:border-indigo-500 font-medium ${isPinLoading ? "text-slate-400 italic bg-gray-100" : "text-slate-800"}`}
            value={address.state || ""}
            onChange={(e) => onUpdate({ ...address, state: e.target.value.toUpperCase() })}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="h-6 w-6 rounded-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  );
}

export default function EntityCreateTermsAddresses({ extraAddresses, setExtraAddresses }) {
  const handleAddAddress = () => {
    setExtraAddresses([
      ...extraAddresses,
      { addressLine1: "", addressLine2: "", pincode: "", city: "", state: "" }
    ]);
  };

  const handleUpdateAddress = (idx, updated) => {
    const updatedList = [...extraAddresses];
    updatedList[idx] = updated;
    setExtraAddresses(updatedList);
  };

  const handleRemoveAddress = (idx) => {
    setExtraAddresses(extraAddresses.filter((_, i) => i !== idx));
  };

  return (
    <div className="col-span-2 flex flex-col gap-2" id="create-addresses-section">
      <button
        type="button"
        onClick={handleAddAddress}
        className="w-full h-7 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-sm text-[9px] uppercase tracking-wide font-bold transition-colors cursor-pointer bg-slate-5/10"
      >
        + Add Additional Address
      </button>

      {extraAddresses.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <span className={spanClass}>Additional Addresses ({extraAddresses.length})</span>
          {extraAddresses.map((addr, idx) => (
            <ExtraAddressItem
              key={idx}
              index={idx}
              address={addr}
              onUpdate={(updatedItem) => handleUpdateAddress(idx, updatedItem)}
              onRemove={() => handleRemoveAddress(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
