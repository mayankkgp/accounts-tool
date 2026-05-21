import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { updateEntity } from "../../services/entityService";
import EntityPocSection from "./EntityPocSection";
import EntityBankSection from "./EntityBankSection";

export default function EntityOverviewTab({ profile, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

    setLocalProfileOverride({ ...profile, ...updatedFields });
    setIsSaving(true);

    try {
      await updateEntity(profile.id, updatedFields);
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update entity", e);
      setLocalProfileOverride(null);
    } finally {
      setIsSaving(false);
    }
  };

  const currentProfile = localProfileOverride || profile;

  return (
    <div className="space-y-3 flex flex-col flex-1" id="overview-tab-container">
      <EntityPocSection
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        formData={formData}
        setFormData={setFormData}
        currentProfile={currentProfile}
        handleSave={handleSave}
        isSaving={isSaving}
      />

      <EntityBankSection
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        currentProfile={currentProfile}
      />

      <div className="flex flex-col gap-1.5" id="detail-addresses-section">
        <div className="flex items-center gap-1 select-none">
          <MapPin size={12} className="text-slate-500" />
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Registered Locations ({currentProfile.addresses ? currentProfile.addresses.length : 0})
          </span>
        </div>

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
                <div key={addr.id} className="bg-slate-50 border-l-2 border-l-emerald-400 hover:bg-slate-100/50 p-1.5 rounded-sm flex flex-col gap-1 relative text-[10px] transition-all">
                  {hasBadges && (
                    <div className="flex gap-1 items-center self-start mb-0.5">
                      {addr.isDefaultBilling && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[2px]">Default Billing</span>}
                      {addr.isDefaultShipping && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-[2px] bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-[2px]">Default Shipping</span>}
                    </div>
                  )}
                  <p className="text-slate-800 font-semibold leading-tight">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                  <div className="text-[9px] text-slate-500 font-mono font-medium uppercase mt-0.5 leading-none truncate">{geoString}</div>
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
    </div>
  );
}
