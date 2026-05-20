import React from "react";

export default function EntitiesLayout() {
  return (
    <div className="flex-1 h-full grid grid-cols-[210px_1fr] overflow-hidden" id="entities-layout-grid">
      {/* Fixed Left Column Pane (210px) */}
      <div className="bg-slate-100 border-r border-slate-200 flex flex-col p-2 overflow-hidden justify-between select-none" id="entities-sidebar-pane">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-500 font-mono font-medium">
            Entities Register
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Fixed [210px]
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-200/60 pt-1">
          Panel Base: Empty
        </div>
      </div>

      {/* Fluid Right Details Pane (1fr) */}
      <div className="bg-white flex flex-col p-2 overflow-hidden justify-between select-none" id="entities-details-pane">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-500 font-mono font-medium">
            Entity Details Column
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Fluid [1fr]
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-1">
          Workspace Base: Empty
        </div>
      </div>
    </div>
  );
}
