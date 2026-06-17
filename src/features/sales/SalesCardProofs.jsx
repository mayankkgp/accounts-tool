import React from "react";
import { FileText, Download } from "lucide-react";

export default function SalesCardProofs({ req, onDownloadFile }) {
  return (
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
                    onClick={() => onDownloadFile && onDownloadFile(p.filename)}
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
                    onClick={() => onDownloadFile && onDownloadFile(pl.filename)}
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
                    onClick={() => onDownloadFile && onDownloadFile(pi.filename)}
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
  );
}
