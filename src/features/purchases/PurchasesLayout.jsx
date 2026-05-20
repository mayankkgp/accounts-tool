import React from "react";

export default function PurchasesLayout() {
  return (
    <div className="flex-1 h-full p-2 bg-slate-50 flex flex-col justify-between select-none" id="purchases-placeholder">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-500 font-mono font-medium">
          Purchases Module
        </span>
        <span className="text-xs text-slate-400 font-mono">
          Pending Step 2 Configuration
        </span>
      </div>
    </div>
  );
}
