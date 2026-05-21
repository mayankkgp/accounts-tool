import React, { useState, useEffect } from "react";
import { X, Archive, RotateCcw, Pencil, Check, Loader2 } from "lucide-react";
import { updateEntity } from "../../services/entityService";

export default function EntityDetailHeader({ profile, onClose, onToggleArchive }) {
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localProfileOverride, setLocalProfileOverride] = useState(null);
  const [editForm, setEditForm] = useState({
    businessName: "",
    brandName: ""
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        businessName: profile.businessName || "",
        brandName: profile.brandName || ""
      });
      setLocalProfileOverride(null);
      setIsEditingIdentity(false);
    }
  }, [profile?.id]);

  const currentProfile = localProfileOverride || profile;
  const isBrand = currentProfile.type === "brand";
  const title = currentProfile.businessName || (isBrand ? currentProfile.brandName : "") || "Unnamed";
  const typeLabel = isBrand ? "Brand" : currentProfile.type === "factory" ? "Factory" : "Vendor";
  const isArchived = currentProfile.status === "archived";

  const handleSaveIdentity = async () => {
    const updatedFields = {
      businessName: editForm.businessName,
      brandName: isBrand ? editForm.brandName : currentProfile.brandName
    };

    setIsSaving(true);
    try {
      await updateEntity(currentProfile.id, updatedFields);
      setLocalProfileOverride({ ...currentProfile, ...updatedFields });
      setIsEditingIdentity(false);
    } catch (e) {
      console.error("Failed to update identity", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5 shrink-0 select-none font-sans"
      id={`detail-header-${currentProfile.id}`}
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Entity Type Tag */}
          <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.25 bg-slate-100 text-slate-700 border border-slate-250 rounded-[2px] shrink-0">
            {typeLabel}
          </span>

          {isEditingIdentity ? (
            <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
              <input
                type="text"
                disabled={isSaving}
                placeholder="Business Name"
                className="text-[13px] font-semibold text-slate-900 border-b border-indigo-500 bg-slate-50 px-1 outline-none max-w-[140px] h-5 leading-none"
                value={editForm.businessName}
                onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
              />
              {isBrand && (
                <input
                  type="text"
                  disabled={isSaving}
                  placeholder="Brand Name"
                  className="text-[10px] font-semibold text-slate-500 border-b border-indigo-500 bg-slate-50 px-1 outline-none max-w-[100px] h-5 leading-none"
                  value={editForm.brandName}
                  onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                />
              )}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveIdentity}
                  className="h-5 w-5 rounded-sm flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save identity"
                >
                  {isSaving ? (
                    <Loader2 size={10} className="animate-spin text-slate-400" />
                  ) : (
                    <Check size={10} className="stroke-[2.5]" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setEditForm({
                      businessName: currentProfile.businessName || "",
                      brandName: currentProfile.brandName || ""
                    });
                    setIsEditingIdentity(false);
                  }}
                  className="h-5 w-5 rounded-sm flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Cancel edit"
                >
                  <X size={10} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 min-w-0">
              <h2 className="text-[13px] font-semibold text-slate-900 leading-tight truncate max-w-[140px]" title={title}>
                {title}
              </h2>
              {isBrand && currentProfile.brandName && (
                <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[80px]">({currentProfile.brandName})</span>
              )}
              <button
                type="button"
                onClick={() => setIsEditingIdentity(true)}
                className="h-5 w-5 rounded-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer shrink-0"
                title="Edit Identity"
              >
                <Pencil size={10} />
              </button>
            </div>
          )}

          {/* Global Archive / Restore button next to Entity Type Tag, inline and middle-aligned */}
          <button
            onClick={() => onToggleArchive(currentProfile)}
            className={`h-5 w-5 rounded-sm flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
              isArchived
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                : "bg-red-50 text-red-650 border-red-200 hover:bg-red-100 hover:text-red-750"
            }`}
            title={isArchived ? "Restore Profile" : "Archive Profile"}
            id="btn-archive-detail-toggle"
          >
            {isArchived ? <RotateCcw size={10} className="stroke-[2.5]" /> : <Archive size={10} className="stroke-[2.5]" />}
          </button>
        </div>
        
        {/* GSTIN / ID */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
          <span>GSTIN: <span className="text-slate-800 font-semibold">{currentProfile.gst || "N/A"}</span></span>
          <span className="text-slate-500">|</span>
          <span>ID: <span className="text-slate-800 font-semibold">{currentProfile.id}</span></span>
        </div>
      </div>

      {/* Financial outstanding summary & Isolated Close button */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <div className="bg-amber-50 border border-amber-200 rounded-[2px] px-1.5 py-0.5 text-right font-mono mr-0.5">
          <div className="text-[8px] uppercase text-amber-700 leading-none tracking-wide font-bold">Total Outstanding</div>
          <div className="text-[11px] font-bold text-amber-800 leading-none mt-0.5">₹0.00</div>
        </div>

        <button
          onClick={onClose}
          className="h-6 w-6 rounded-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
          title="Close details (Esc)"
          id="btn-close-detail-pane"
        >
          <X size={13} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
