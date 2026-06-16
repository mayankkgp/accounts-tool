import React, { useState } from "react";
import { FileText, Download, Edit, ArrowRight, CornerDownRight } from "lucide-react";

/**
 * SalesCard Component
 * Refactored to strictly adhere to compact-ui guidelines.
 * No arbitrary column headers, clean grid math, unified micro-typography, compact padding and completely gated footer.
 */
export default function SalesCard({ req, role, onEdit, onProcess, onFinalize }) {
  const [downloading, setDownloading] = useState(false);

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
          <span className="font-mono font-bold text-slate-800">{req.id}</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-700">{req.customer}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] text-slate-400 font-mono">SM: {req.smName} • {req.submittedDate}</span>
        </div>
        <div className="flex items-center gap-1.5 h-full">
          {role === "SM" && (
            <>
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
        
        {/* LEFT COLUMN (55fr Width) - Unstructured Text */}
        <div className="p-2 flex flex-col gap-1 min-w-0" id={`sales-card-${req.id}-unstructured-col`}>
          {req.status === "Needs Correction" && req.financeFeedback && (
            <div className="bg-rose-50 border border-rose-100 p-1 rounded-sm select-none mb-1">
              <p className="text-[11px] font-sans font-medium italic text-rose-900">
                ⚠️ "{req.financeFeedback}"
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {req.unstructuredData?.lineItems && (
              <div className="flex flex-col gap-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Line Items</span>
                <p className="text-xs text-slate-800 leading-tight whitespace-pre-line break-words">
                  {req.unstructuredData.lineItems}
                </p>
              </div>
            )}
            {req.unstructuredData?.greigeDetails && (
              <div className="flex flex-col gap-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Greige Details</span>
                <p className="text-xs text-slate-800 leading-tight break-words">
                  {req.unstructuredData.greigeDetails}
                </p>
              </div>
            )}
            {req.unstructuredData?.comments && (
              <div className="flex flex-col gap-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Notes</span>
                <p className="text-xs text-slate-800 leading-tight break-words">
                  {req.unstructuredData.comments}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN (20fr Width) - Logistics Raw Key-Value Pairs */}
        <div className="p-2 flex flex-col gap-1 bg-slate-50/20 border-l border-slate-100/80" id={`sales-card-${req.id}-logistics`}>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Bill To</span>
              <span className="text-xs text-slate-800 leading-tight break-words">{req.logistics?.billTo || "—"}</span>
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Ship To</span>
              <span className="text-xs text-slate-800 leading-tight break-words">{req.logistics?.shipTo || "—"}</span>
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Freight</span>
              <span className="text-xs text-slate-800 leading-tight break-words">
                {req.logistics?.freight === "To Pay" ? "₹ TO PAY" : "PREPAID"} • {req.logistics?.transporterName || "—"}
              </span>
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Terms</span>
              <span className="text-xs text-slate-800 leading-tight break-words">{req.logistics?.paymentTerms || "Immediate"}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (25fr Width) - Verified Proofs stacked extremely dense */}
        <div className="p-2 flex flex-col gap-1 border-l border-slate-100/80" id={`sales-card-${req.id}-proofs-col`}>
          <div className="flex flex-col gap-1 text-xs leading-tight select-none w-full">
            
            {/* PO Section */}
            {req.proofs?.po && req.proofs.po.length > 0 && (
              <div className="flex flex-col gap-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">PO</span>
                {req.proofs.po.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between h-5 hover:bg-slate-50 px-1 rounded-sm gap-1">
                    <span className="text-xs text-slate-800 leading-tight break-all pr-1" title={p.filename}>
                      {p.filename}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <a 
                        href={p.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="View PDF"
                        className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <FileText size={11} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(p.filename)}
                        title="Download document"
                        className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
                      >
                        <Download size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Packing List Section */}
            {req.proofs?.packingList && req.proofs.packingList.length > 0 && (
              <div className="flex flex-col gap-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Packing List</span>
                {req.proofs.packingList.map((pl, idx) => (
                  <div key={idx} className="flex items-center justify-between h-5 hover:bg-slate-50 px-1 rounded-sm gap-1">
                    <span className="text-xs text-slate-800 leading-tight break-all pr-1" title={pl.filename}>
                      {pl.filename}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <a 
                        href={pl.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="View PDF"
                        className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <FileText size={11} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(pl.filename)}
                        title="Download document"
                        className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
                      >
                        <Download size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vendor Invoices Section */}
            {req.proofs?.purchaseInvoices && req.proofs.purchaseInvoices.length > 0 && (
              <div className="flex flex-col gap-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Vendor Invoice</span>
                {req.proofs.purchaseInvoices.map((pi, idx) => (
                  <div key={idx} className="flex items-center justify-between h-5 hover:bg-slate-50 px-1 rounded-sm gap-1">
                    <span className="text-xs text-slate-800 leading-tight break-all pr-1" title={pi.filename}>
                      {pi.filename}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <a 
                        href={pi.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="View PDF"
                        className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <FileText size={11} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(pi.filename)}
                        title="Download document"
                        className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
                      >
                        <Download size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(!req.proofs?.po?.length && !req.proofs?.packingList?.length && !req.proofs?.purchaseInvoices?.length) && (
              <span className="text-xs text-slate-800 leading-tight">No files</span>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
