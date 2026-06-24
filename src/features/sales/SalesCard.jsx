import React, { useState } from "react";
import { Download, Edit, ArrowRight, CornerDownRight, AlertTriangle } from "lucide-react";
import SalesCardText from "./SalesCardText";
import SalesCardLogistics from "./SalesCardLogistics";
import SalesCardProofs from "./SalesCardProofs";

/**
 * SalesCard Component
 * Refactored to strictly adhere to compact-ui guidelines.
 * No arbitrary column headers, clean grid math, unified micro-typography, compact padding and completely gated footer.
 */
export default function SalesCard({ req, role, onEdit, onProcess, onFinalize }) {
  const [downloading, setDownloading] = useState(false);

  const idStr = String(req?.id || "");
  const lastChar = idStr.length > 0 ? idStr.charCodeAt(idStr.length - 1) : 0;
  const badgeState = lastChar % 3;

  const hasUnmappedSales = badgeState === 0 || badgeState === 2;
  const hasUnbookedPurchases = badgeState === 1 || badgeState === 2;

  const handleDownloadInvoice = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Sales Invoice downloaded successfully for Reference ID: ${req.id}`);
    }, 800);
  };

  const handleDownloadFile = (filename) => {
    alert(`Downloading source document: ${filename}`);
  };

  return (
    <div 
      className="bg-white border border-slate-200 hover:border-slate-350 rounded-[2px] overflow-hidden flex flex-col gap-0 select-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-auto p-2 shrink-0" 
      id={`sales-card-${req.id}`}
    >
      {/* 1. Top Bar Identifiers with shifted CTAs on the right */}
      <div className="pb-1 flex items-center justify-between text-xs leading-none font-sans shrink-0 border-b border-slate-100 mb-1">
        <div className="flex items-center gap-1">
          {req.id && (
            <>
              <span className="font-mono font-bold text-slate-800">{req.id}</span>
              <span className="text-slate-300">|</span>
            </>
          )}
          <span className="font-semibold text-slate-700">{req.customer}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] text-slate-400 font-mono">
            SM: {req.smName} • {req.submittedDate}
          </span>
          {req.status === "Settlement Pending" && (
            <>
              {hasUnmappedSales && (
                <span className="bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-xs font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider ml-2">
                  <AlertTriangle size={10} /> UNMAPPED SALES
                </span>
              )}
              {hasUnbookedPurchases && (
                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-xs font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider ml-1">
                  <AlertTriangle size={10} /> PURCHASE UNBOOKED
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 h-full">
          {(req.status === "Fulfilled" || req.status === "Settlement Pending") && (
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloading}
              id={`btn-download-invoice-${req.id}`}
              className="h-5 px-2 rounded-sm bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-850 text-[10px] font-medium font-sans flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download size={11} />
              <span>{downloading ? "Downloading..." : "Download Sales Invoice"}</span>
            </button>
          )}

          {role === "SM" && (
            <>
              {req.status === "Needs Correction" && (
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(req)}
                  id={`btn-edit-request-${req.id}`}
                  className="h-5 px-2 rounded-sm bg-slate-900 text-slate-100 hover:bg-slate-800 text-[10px] font-medium font-sans flex items-center gap-1 transition-all cursor-pointer border-none"
                >
                  <Edit size={11} className="text-slate-300" />
                  <span>Edit Correction</span>
                </button>
              )}
            </>
          )}

          {role === "Finance" && (
            <>
              {req.status === "Invoice Pending" && (
                <button
                  type="button"
                  onClick={() => onProcess && onProcess(req)}
                  id={`btn-process-request-${req.id}`}
                  className="h-5 px-2 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium text-center font-sans tracking-wide transition-all border-none flex items-center gap-1 cursor-pointer"
                >
                  <span>Process Sales</span>
                  <ArrowRight size={10} className="text-indigo-400" />
                </button>
              )}
              {req.status === "Settlement Pending" && (
                <button
                  type="button"
                  onClick={() => onFinalize && onFinalize(req)}
                  id={`btn-finalize-settlement-${req.id}`}
                  className="h-5 px-2 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium text-center font-sans tracking-wide transition-all border-none flex items-center gap-1 cursor-pointer"
                >
                  <span>Finalize Settlement</span>
                  <CornerDownRight size={10} className="text-white" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Core 55fr / 20fr / 25fr Columns Grid */}
      <div className="grid grid-cols-[55fr_20fr_25fr] gap-2 min-h-0 text-xs">
        <SalesCardText req={req} />
        <SalesCardLogistics req={req} />
        <SalesCardProofs req={req} onDownloadFile={handleDownloadFile} />
      </div>
    </div>
  );
}
