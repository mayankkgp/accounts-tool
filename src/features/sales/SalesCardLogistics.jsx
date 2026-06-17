import React from "react";

export default function SalesCardLogistics({ req }) {
  return (
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
  );
}
