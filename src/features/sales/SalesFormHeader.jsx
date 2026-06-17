import React from "react";
import { X } from "lucide-react";

/**
 * Top header portion of the Sales invoice configuration modal.
 */
export default function SalesFormHeader({ editingRequest, onClose }) {
  return (
    <div className="h-8 bg-slate-950 px-3 flex items-center justify-between text-slate-100 border-b border-slate-800 tracking-wider shrink-0 select-none">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">
          WORKSPACE
        </span>
        <span className="text-slate-700">|</span>
        <span className="text-xs font-bold font-sans">
          {editingRequest 
            ? `Correction Request View: ${editingRequest.id}` 
            : "Configure New Sales Invoice Request"}
        </span>
      </div>
      <button 
        type="button"
        onClick={onClose} 
        className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none p-0 flex items-center justify-center shrink-0"
        id="btn-close-sales-form"
      >
        <X size={14} className="stroke-[2.5]" />
      </button>
    </div>
  );
}
