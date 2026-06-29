import React from "react";
import { Loader2 } from "lucide-react";

export default function PurchaseDraftingOverlay({ aiProgress, aiStep }) {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-4" id="ai-processing-dialog">
      <div className="bg-slate-900 p-6 rounded-sm border border-slate-800 shadow-2xl max-w-sm w-full flex flex-col gap-4 text-center select-none font-sans">
        <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Analyzing Document via AI</h3>
          <p className="text-[10px] text-indigo-400 font-mono">Running OCR computer-vision pipeline</p>
        </div>

        {/* Pulsing Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-1.5 transition-all duration-300 rounded-full ease-out"
            style={{ width: `${aiProgress}%` }}
          />
        </div>

        {/* Stepped Log Entries */}
        <div className="h-5 text-center text-[10px] text-slate-400 transition-all font-mono">
          {aiStep === 0 && <span>Analyzing Document Layout Matrix...</span>}
          {aiStep === 1 && <span className="text-amber-400">Scanning Vendor Header Registry...</span>}
          {aiStep === 2 && <span className="text-emerald-400">Extracting Dense Invoice Rows & HSN Codes...</span>}
          {aiStep === 3 && <span className="text-indigo-400">Performing State Taxation Boundary Audit...</span>}
        </div>
      </div>
    </div>
  );
}
