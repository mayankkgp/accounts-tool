import React from "react";
import { Archive, RotateCcw } from "lucide-react";

export default function EntityListRow({
  entity,
  isSelected,
  onSelect,
  isCompressed = false,
}) {
  const isArchived = entity.status === "archived";
  
  // Display columns: Business Name, Point of Contact, and GST
  const displayTitle = entity.businessName || (entity.type === "brand" ? entity.brandName : "") || "Unnamed";
  const displayPoc = entity.pocName || entity.pocContact || "--";
  const displayGst = entity.gst || "--";

  return (
    <div
      onClick={() => onSelect(entity)}
      className={`group h-6 border-b border-slate-200 flex items-center px-1.5 cursor-pointer text-[10px] select-none transition-all relative ${
        isSelected
          ? "bg-indigo-50/90 text-slate-900 border-l-2 border-l-indigo-600"
          : "text-slate-700 hover:bg-slate-100/90"
      }`}
      id={`entity-row-${entity.id}`}
    >
      <div 
        className={`flex-1 min-w-0 grid gap-1 items-center h-full ${
          isCompressed ? "grid-cols-[1fr_16px]" : "grid-cols-[1.5fr_1fr_1.1fr_16px]"
        }`}
      >
        {/* Business Name */}
        <span className="font-medium text-[11px] truncate text-slate-900" title={displayTitle}>
          {displayTitle}
        </span>

        {/* Contact/POC name (hidden on compression) */}
        {!isCompressed && (
          <span className="text-slate-500 truncate text-[10px]" title={displayPoc}>
            {displayPoc}
          </span>
        )}

        {/* GST text (hidden on compression) */}
        {!isCompressed && (
          <span className="font-mono text-slate-500 font-medium truncate text-[9px]" title={displayGst}>
            {displayGst}
          </span>
        )}

        {/* Small circle Status indicator */}
        <div className="flex items-center justify-center shrink-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isArchived ? "bg-red-500" : "bg-emerald-500"
            }`}
            title={isArchived ? "Archived" : "Active"}
          />
        </div>
      </div>
    </div>
  );
}
