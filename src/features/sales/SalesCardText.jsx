import React from "react";

export default function SalesCardText({ req }) {
  return (
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
  );
}
