import React, { useState, useEffect } from "react";
import { updateEntity } from "../../services/entityService";
import EntityPocSection from "./EntityPocSection";
import EntityBankSection from "./EntityBankSection";
import EntityAddressSection from "./EntityAddressSection";

// EntityOverviewTab renders primary contact details, POC info, bank accounts, and registered locations in the split-panel context.
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
    ifscCode: "",
    creditDays: "",
    debitDays: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        pocName: profile.pocName || "",
        pocContact: profile.pocContact || "",
        beneficiary: profile.bankDetails?.beneficiary || profile.businessName || "",
        bankName: profile.bankDetails?.bankName || "",
        accountNo: profile.bankDetails?.accountNo || "",
        ifscCode: profile.bankDetails?.ifscCode || profile.bankDetails?.ifsc || "",
        creditDays: profile.terms?.creditDays ?? "",
        debitDays: profile.terms?.debitDays ?? ""
      });
      setLocalProfileOverride(null);
      setIsEditing(false);
    }
  }, [profile]);

  const handleSave = async () => {
    // Gather matching form fields to submit to the repository backend
    const hasTerms = formData.creditDays !== "" || formData.debitDays !== "";
    const updatedFields = {
      pocName: formData.pocName,
      pocContact: formData.pocContact,
      terms: hasTerms
        ? {
            ...(formData.creditDays && { creditDays: Number(formData.creditDays) }),
            ...(formData.debitDays && { debitDays: Number(formData.debitDays) })
          }
        : null,
      bankDetails: {
        beneficiary: formData.beneficiary,
        bankName: formData.bankName,
        accountNo: formData.accountNo,
        ifscCode: formData.ifscCode
      }
    };

    // Apply local state override immediately for high fluid responsiveness
    setLocalProfileOverride({ ...profile, ...updatedFields });
    setIsSaving(true);

    try {
      // Execute background update API to persist user changes
      await updateEntity(profile.id, updatedFields);
      // Exit editing mode only after successful save to maintain focus during latency
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update entity", e);
      // Revert local override on failure to avoid stale or incorrect data representations
      setLocalProfileOverride(null);
    } finally {
      // Release action button block once transaction achieves completion (success or error)
      setIsSaving(false);
    }
  };

  const handleAddressUpdate = (newAddresses) => {
    setLocalProfileOverride((prev) => ({
      ...(prev || profile),
      addresses: newAddresses
    }));
    if (onRefresh) {
      onRefresh();
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

      <EntityAddressSection
        currentProfile={currentProfile}
        isEditing={isEditing}
        onUpdateProfile={handleAddressUpdate}
      />
    </div>
  );
}
