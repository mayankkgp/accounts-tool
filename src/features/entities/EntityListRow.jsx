import React from "react";
import { Archive, RotateCcw } from "lucide-react";

export default function EntityListRow({
  entity,
  isSelected,
  onSelect,
  onToggleArchive,
}) {
  const isArchived = entity.status === "archived";
  
  // Display columns: Business Name, Point of Contact, and GST
  const displayTitle = entity.businessName || (entity.type === "brand" ? entity.brandName : "") || "Unnamed";
  const displayPoc = entity.pocName || entity.pocContact || "--";
  const displayGst = entity.gst || "--";

  return (
    <div
      onClick={() => onSelect(entity)}
      className={`group h-6 border-b border-slate-200 flex items-center px-1.5 cursor-pointer text-[10px] select-none transition-colors relative ${
        isSelected
          ? "bg-indigo-50/90 text-slate-900 border-l-2 border-l-indigo-600"
          : "text-slate-700 hover:bg-slate-100/90"
      }`}
      id={`entity-row-${entity.id}`}
    >
      {/* 4-column micro visual grid matching 210px layout limits */}
      <div className="flex-1 min-w-0 grid grid-cols-[1.5fr_1fr_1.1fr_10px] gap-1 items-center h-full">
        {/* Business Name */}
        <span className="font-medium text-[11px] truncate text-slate-900" title={displayTitle}>
          {displayTitle}
        </span>

        {/* Contact/POC name */}
        <span className="text-slate-500 truncate text-[10px]" title={displayPoc}>
          {displayPoc}
        </span>

        {/* GST text */}
        <span className="font-mono text-slate-400 truncate text-[9px]" title={displayGst}>
          {displayGst}
        </span>

        {/* Small circle Status indicator */}
        <div className="flex items-center justify-center">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isArchived ? "bg-red-400" : "bg-emerald-500"
            }`}
            title={isArchived ? "Archived" : "Active"}
          />
        </div>
      </div>

      {/* Quick Action Overlay on hover */}
      <div className="absolute right-1 top-0 h-full hidden group-hover:flex items-center bg-slate-100 px-1 gap-1 border-l border-slate-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleArchive(entity);
          }}
          className={`h-4 w-4 rounded-[2px] flex items-center justify-center border transition-colors cursor-pointer ${
            isArchived
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          }`}
          title={isArchived ? "Restore Entity" : "Archive Entity"}
          id={`row-action-${entity.id}`}
        >
          {isArchived ? <RotateCcw size={9} /> : <Archive size={9} />}
        </button>
      </div>
    </div>
  );
}
