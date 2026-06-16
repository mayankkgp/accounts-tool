import React, { useState } from "react";
import { FileText, Download, Edit, ArrowRight, CornerDownRight, CheckCircle2 } from "lucide-react";

/**
 * SalesCard Component
 * Implements strict rendering: 
 * Left Col (55% Width - Unstructured text)
 * Middle Col (20% Width - Logistics key-value pairs)
 * Right Col (25% Width - Proofs stack with micro Action buttons)
 */
export default function SalesCard({ req, role, onEdit, onProcess, onFinalize }) {
  const [downloading, setDownloading] = useState(false);

  // Status Badge Colors
  const getStatusStyle = (status) => {
    switch (status) {
      case "Invoice Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Needs Correction":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Settlement Pending":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Fulfilled":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

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

  const hasFooter = () => {
    if (role === "SM") {
      return (
        req.status === "Needs Correction" ||
        req.status === "Fulfilled" ||
        req.status === "Settlement Pending"
      );
    } else {
      return req.status === "Invoice Pending" || req.status === "Settlement Pending";
    }
  };

  return (
    <div 
      className="bg-white border border-slate-200 hover:border-slate-300 rounded-[2px] overflow-hidden flex flex-col gap-0 select-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]" 
      id={`sales-card-${req.id}`}
    >
      {/* 1. Top Bar Identifiers */}
      <div className="h-6 px-2.5 bg-slate-50 border-b border-slate-200/60 flex items-center justify-between text-[11px] leading-tight font-sans">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-800">{req.id}</span>
          <span className="text-slate-350">|</span>
          <span className="font-medium text-slate-700">{req.customer}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] text-slate-400 font-mono">SM: {req.smName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">Sub: {req.submittedDate}</span>
          <span className={`px-1.5 py-0.5 text-[9px] font-semibold text-center border rounded-full uppercase scale-[0.9] font-mono leading-none tracking-wider ${getStatusStyle(req.status)}`}>
            {req.status}
          </span>
        </div>
      </div>

      {/* 2. Core 55/20/25 Columns Grid */}
      <div className="grid grid-cols-[55%_20%_25%] md:grid-cols-[55%_20%_25%] border-b border-slate-100/80 divide-x divide-slate-100 min-h-0">
        
        {/* LEFT COLUMN (55% Width) - Unstructured Text & Feedback if any */}
        <div className="p-2 flex flex-col gap-1.5 min-w-0" id={`sales-card-${req.id}-unstructured-col`}>
          {req.status === "Needs Correction" && req.financeFeedback && (
            <div className="bg-rose-50/50 border border-rose-100 text-[10px] text-rose-800 p-1.5 rounded-sm flex flex-col gap-0.5 leading-tight select-none">
              <span className="font-bold flex items-center gap-1 font-mono uppercase text-[8.5px] text-rose-700">
                ⚠️ Finance Rejection reason
              </span>
              <p className="font-sans font-medium italic text-[11px] text-rose-900">
                "{req.financeFeedback}"
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Line Items Description</span>
              <p className="text-xs font-mono text-slate-700 font-medium whitespace-pre-line leading-relaxed tracking-tight break-words pt-0.5">
                {req.unstructuredData?.lineItems || "—"}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Greige Material Details</span>
                <p className="text-[11px] font-sans text-slate-600 leading-normal break-words pt-0.5 font-medium">
                  {req.unstructuredData?.greigeDetails || "—"}
                </p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Dispatch Comments</span>
                <p className="text-[11px] font-sans text-slate-500 italic leading-normal break-words font-medium">
                  {req.unstructuredData?.comments || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN (20% Width) - Logistics key-value */}
        <div className="p-2 flex flex-col gap-2 bg-slate-50/20" id={`sales-card-${req.id}-logistics`}>
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Dispatch Logistics</span>
          
          <div className="flex flex-col gap-1 leading-snug">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-mono font-medium">Bill To:</span>
              <span className="text-xs text-slate-700 font-medium truncate">{req.logistics?.billTo || "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-mono font-medium">Ship To:</span>
              <span className="text-xs text-slate-700 font-medium truncate">{req.logistics?.shipTo || "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-mono font-medium">Freight & Carrier:</span>
              <span className="text-xs text-slate-700 font-medium truncate font-mono">
                {req.logistics?.freight === "To Pay" ? "₹ TO PAY" : "PREPAID"} • {req.logistics?.transporterName || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-mono font-medium">Payment Terms:</span>
              <span className="text-xs text-slate-600 font-mono leading-none font-medium">{req.logistics?.paymentTerms || "Immediate"}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (25% Width) - Proofs stack with Action buttons */}
        <div className="p-2 flex flex-col gap-2 bg-white" id={`sales-card-${req.id}-proofs-col`}>
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">Verifiable Proofs</span>
          
          <div className="flex flex-col gap-1.5 flex-1 justify-between">
            {/* Vertically stacked list */}
            <div className="flex flex-col gap-1 text-[11px] leading-tight select-none">
              
              {/* PO Section */}
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-wide text-indigo-500 font-bold font-mono">Purchase Order (PO)</span>
                {req.proofs?.po && req.proofs.po.length > 0 ? (
                  req.proofs.po.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between h-5 hover:bg-slate-50 px-1 rounded-sm mt-0.5">
                      <span className="font-mono text-[11px] text-slate-700 truncate max-w-[120px]" title={p.filename}>
                        {p.filename}
                      </span>
                      <div className="flex items-center gap-0.5">
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
                          title="Download document file"
                          className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
                        >
                          <Download size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-404 italic mt-0.5">No PO uploaded</span>
                )}
              </div>

              {/* Packing List Section */}
              <div className="flex flex-col mt-1">
                <span className="text-[8px] uppercase tracking-wide text-indigo-500 font-bold font-mono">Packing List</span>
                {req.proofs?.packingList && req.proofs.packingList.length > 0 ? (
                  req.proofs.packingList.map((pl, idx) => (
                    <div key={idx} className="flex items-center justify-between h-5 hover:bg-slate-50 px-1 rounded-sm mt-0.5">
                      <span className="font-mono text-[11px] text-slate-700 truncate max-w-[120px]" title={pl.filename}>
                        {pl.filename}
                      </span>
                      <div className="flex items-center gap-0.5">
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
                          title="Download document file"
                          className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
                        >
                          <Download size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-404 italic mt-0.5">No packing list uploaded</span>
                )}
              </div>

              {/* Purchase Invoices with L-values */}
              <div className="flex flex-col mt-1">
                <span className="text-[8px] uppercase tracking-wide text-indigo-500 font-bold font-mono">Vendor Invoices (L-value)</span>
                {req.proofs?.purchaseInvoices && req.proofs.purchaseInvoices.length > 0 ? (
                  req.proofs.purchaseInvoices.map((pi, idx) => (
                    <div key={idx} className="flex flex-col gap-0 border-b border-dashed border-slate-100 last:border-none py-1 first:pt-0.5">
                      <div className="flex items-center justify-between h-5 hover:bg-slate-50 px-1 rounded-sm">
                        <span className="font-mono text-[11px] text-slate-800 font-medium truncate max-w-[110px]" title={pi.filename}>
                          {pi.filename}
                        </span>
                        <div className="flex items-center gap-0.5">
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
                            title="Download document file"
                            className="w-4 h-4 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
                          >
                            <Download size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-1 text-[9px] font-mono leading-none mt-0.5">
                        <span className="text-slate-400">VERIFIED TAX INTEGRATED:</span>
                        <span className="text-slate-950 font-bold bg-slate-100 px-1 py-[1.5px] rounded-[1px] text-[8px]">
                          L-VALUE: {pi.lValue || 100}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-404 italic mt-0.5">No invoices uploaded</span>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 3. Compact FooterActions (Conditional upon tabs & roles) */}
      {hasFooter() && (
        <div className="bg-slate-50/85 h-7 px-2.5 flex items-center justify-between border-t border-slate-100 font-sans select-none shrink-0" id={`sales-card-${req.id}-actions-bar`}>
          <div>
            <span className="text-[9px] font-mono text-slate-400">Actions Workspace</span>
          </div>

          <div className="flex items-center gap-1.5">
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
                    <span>Edit Correction Form</span>
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
                    className="h-5 px-2.5 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium text-center font-sans tracking-wide transition-all border-none flex items-center gap-1 cursor-pointer"
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
                    className="h-5 px-2.5 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium text-center font-sans tracking-wide transition-all border-none flex items-center gap-1 cursor-pointer"
                  >
                    <span>Finalize Settlement</span>
                    <CornerDownRight size={10} className="text-white" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
