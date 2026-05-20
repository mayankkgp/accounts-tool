import React from "react";
import { X, Archive, RotateCcw } from "lucide-react";

export default function EntityDetailHeader({ profile, onClose, onToggleArchive }) {
  const isBrand = profile.type === "brand";
  const title = profile.businessName || (isBrand ? profile.brandName : "") || "Unnamed";
  const typeLabel = isBrand ? "Brand" : profile.type === "factory" ? "Factory" : "Vendor";
  const isArchived = profile.status === "archived";

  return (
    <div
      className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5 shrink-0 select-none font-sans"
      id={`detail-header-${profile.id}`}
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Entity Type Tag */}
          <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.25 bg-slate-100 text-slate-700 border border-slate-250 rounded-[2px] shrink-0">
            {typeLabel}
          </span>

          {/* Global Archive / Restore button next to Entity Type Tag */}
          <button
            onClick={() => onToggleArchive(profile)}
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

          {/* Business Name */}
          <h2 className="text-[13px] font-semibold text-slate-900 leading-tight truncate max-w-[140px]" title={title}>
            {title}
          </h2>
          {isBrand && profile.brandName && (
            <span className="text-[10px] text-slate-505 font-semibold truncate max-w-[80px]">({profile.brandName})</span>
          )}
        </div>
        
        {/* GSTIN / ID */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
          <span>GSTIN: <span className="text-slate-800 font-semibold">{profile.gst || "N/A"}</span></span>
          <span className="text-slate-500">|</span>
          <span>ID: <span className="text-slate-800 font-semibold">{profile.id}</span></span>
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
