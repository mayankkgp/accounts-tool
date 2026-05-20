import React, { useState, useEffect } from "react";
import { User, Briefcase, Phone, Hash, Award, Landmark, MapPin, Pencil, Check } from "lucide-react";
import { updateEntity } from "../../services/entityService";

export default function EntityOverviewTab({ profile, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localProfileOverride, setLocalProfileOverride] = useState(null);
  const [formData, setFormData] = useState({
    pocName: "",
    pocContact: "",
    beneficiary: "",
    bankName: "",
    accountNo: "",
    ifscCode: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        pocName: profile.pocName || "",
        pocContact: profile.pocContact || "",
        beneficiary: profile.bankDetails?.beneficiary || profile.businessName || "",
        bankName: profile.bankDetails?.bankName || "",
        accountNo: profile.bankDetails?.accountNo || "",
        ifscCode: profile.bankDetails?.ifscCode || profile.bankDetails?.ifsc || ""
      });
      setLocalProfileOverride(null);
      setIsEditing(false);
    }
  }, [profile]);

  const handleSave = async () => {
    const updatedFields = {
      pocName: formData.pocName,
      pocContact: formData.pocContact,
      bankDetails: {
        beneficiary: formData.beneficiary,
        bankName: formData.bankName,
        accountNo: formData.accountNo,
        ifscCode: formData.ifscCode
      }
    };

    // Optimistically update
    setLocalProfileOverride({
      ...profile,
      ...updatedFields
    });
    setIsEditing(false);

    try {
      await updateEntity(profile.id, updatedFields);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Failed to update entity", e);
      setLocalProfileOverride(null);
    }
  };

  const getGeoString = (addr) => {
    const geoParts = [];
    if (addr.city) geoParts.push(addr.city.trim());
    if (addr.state) geoParts.push(addr.state.trim());
    const cityState = geoParts.join(", ");
    return cityState && addr.pincode ? `${cityState} - ${addr.pincode.trim()}` : (cityState || addr.pincode || "");
  };

  const currentProfile = localProfileOverride || profile;

  return (
    <div className="space-y-3 flex flex-col flex-1" id="overview-tab-container">
      {/* Point of Contact Subsection */}
      <div className="flex flex-col gap-1" id="subsection-poc">
        <div className="flex items-center justify-between select-none" id="header-poc">
          <div className="flex items-center gap-1">
            <User size={12} className="text-slate-500" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Point of Contact</span>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="h-5 px-1.5 flex items-center gap-1 rounded-[2px] text-[8px] uppercase tracking-wider font-bold text-slate-650 border border-slate-300 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
            id="toggle-edit-mode-btn"
          >
            {isEditing ? (
              <><Check size={10} className="text-emerald-500 stroke-[2.5]" /><span>Save</span></>
            ) : (
              <><Pencil size={8} className="text-slate-500 stroke-[2.5]" /><span>Edit</span></>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 bg-slate-50 border-l-2 border-l-slate-300 p-1.5 rounded-sm" id="detail-overview-grid">
          <div className="flex items-start gap-1">
            <Briefcase size={11} className="text-slate-500 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Contact Person</span>
              {isEditing ? (
                <input
                  type="text"
                  className="h-6 text-xs px-1 py-0.5 border border-slate-205 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-medium leading-none mt-0.5"
                  value={formData.pocName}
                  onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
                />
              ) : (
                <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{currentProfile.pocName || "--"}</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-1">
            <Phone size={11} className="text-slate-500 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">POC Contact Info</span>
              {isEditing ? (
                <input
                  type="text"
                  className="h-6 text-xs px-1 py-0.5 border border-slate-205 bg-white rounded-sm focus:border-indigo-505 focus:outline-none w-full text-slate-800 font-medium leading-none mt-0.5"
                  value={formData.pocContact}
                  onChange={(e) => setFormData({ ...formData, pocContact: e.target.value })}
                />
              ) : (
                <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{currentProfile.pocContact || "--"}</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-1">
            <Hash size={11} className="text-slate-505 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">PAN Number</span>
              <span className="text-[11px] text-slate-800 font-mono font-bold truncate block uppercase leading-tight">
                {currentProfile.pan || (currentProfile.gst && currentProfile.gst.length >= 12 ? currentProfile.gst.substring(2, 12) : "--")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1">
            <Award size={11} className="text-slate-505 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Default Terms</span>
              <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">
                {currentProfile.terms && typeof currentProfile.terms === "object"
                  ? `${currentProfile.terms.creditDays !== undefined ? `CR: ${currentProfile.terms.creditDays}D` : ""}${currentProfile.terms.creditDays !== undefined && currentProfile.terms.debitDays !== undefined ? " / " : ""}${currentProfile.terms.debitDays !== undefined ? `DB: ${currentProfile.terms.debitDays}D` : ""}`
                  : (typeof currentProfile.terms === "string" ? currentProfile.terms : "Net 30 Days")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Bank Details Subsection */}
      <div className="flex flex-col gap-1" id="subsection-bank">
        <div className="flex items-center gap-1 select-none" id="header-bank">
          <Landmark size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">Bank Details</span>
        </div>
        {currentProfile.bankDetails || isEditing ? (
          <div className="bg-slate-50 border-l-2 border-l-blue-400 p-1.5 rounded-sm" id="detail-bank-info">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-slate-600">
              {isEditing ? (
                <>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] text-slate-400 font-bold uppercase block leading-none">Beneficiary</span>
                    <input
                      type="text"
                      className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono"
                      value={formData.beneficiary}
                      onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] text-slate-400 font-bold uppercase block leading-none">Bank Name</span>
                    <input
                      type="text"
                      className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] text-slate-400 font-bold uppercase block leading-none">Account No</span>
                    <input
                      type="text"
                      className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono"
                      value={formData.accountNo}
                      onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] text-slate-400 font-bold uppercase block leading-none">IFSC Code</span>
                    <input
                      type="text"
                      className="h-6 text-xs px-1 py-0.5 border border-slate-200 bg-white rounded-sm focus:border-indigo-500 focus:outline-none w-full text-slate-800 font-mono uppercase"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="truncate"><span className="text-slate-500 font-medium font-sans">BENEFICIARY:</span> {currentProfile.bankDetails?.beneficiary || currentProfile.businessName || "--"}</div>
                  <div className="truncate"><span className="text-slate-500 font-medium font-sans">BANK:</span> {currentProfile.bankDetails?.bankName || "Corporate Bank"}</div>
                  <div className="truncate"><span className="text-slate-500 font-medium font-sans">A/C:</span> {currentProfile.bankDetails?.accountNo || "--"}</div>
                  <div className="truncate"><span className="text-slate-500 font-medium font-sans">IFSC:</span> {currentProfile.bankDetails?.ifscCode || currentProfile.bankDetails?.ifsc || "--"}</div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 border-l-2 border-l-blue-400/50 p-1.5 rounded-sm text-[10px] text-slate-500 font-medium italic" id="detail-bank-missing">
            No bank account specified for this entity profile.
          </div>
        )}
      </div>

      {/* Locations Addresses Subsection */}
      <div className="flex flex-col gap-1.5" id="detail-addresses-section">
        <div className="flex items-center gap-1 border-b border-slate-100 pb-0.5 shrink-0 select-none" id="header-addresses">
          <MapPin size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Registered Locations ({currentProfile.addresses ? currentProfile.addresses.length : 0})
          </span>
        </div>

        {currentProfile.addresses && currentProfile.addresses.length > 0 ? (
          <div className="flex flex-col gap-1" id="detail-overview-address-cards">
            {currentProfile.addresses.map((addr) => {
              const hasBadges = addr.isDefaultBilling || addr.isDefaultShipping;
              const geoString = getGeoString(addr);

              return (
                <div key={addr.id} className="bg-slate-50 border-l-2 border-l-emerald-400 hover:bg-slate-100/50 p-1.5 rounded-sm flex flex-col gap-1 relative text-[10px] transition-all" id={`address-card-${addr.id}`}>
                  {hasBadges && (
                    <div className="flex gap-1 items-center self-start mb-0.5">
                      {addr.isDefaultBilling && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-0.2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[2px]">Default Billing</span>}
                      {addr.isDefaultShipping && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-[2px]">Default Shipping</span>}
                    </div>
                  )}
                  <p className="text-slate-800 font-semibold leading-tight">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                  <div className="text-[9px] text-slate-505 font-mono font-medium uppercase mt-0.5 leading-none truncate">
                    {geoString}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 font-medium italic py-2 text-center bg-slate-50 border-l-2 border-l-emerald-400/50 rounded-sm" id="detail-no-addresses-card">
            No active addresses found. Configure locations dynamically.
          </div>
        )}
      </div>
    </div>
  );
}
