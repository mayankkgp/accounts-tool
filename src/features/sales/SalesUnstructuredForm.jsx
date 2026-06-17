import React from "react";

export default function SalesUnstructuredForm({
  lineItems,
  setLineItems,
  greigeDetails,
  setGreigeDetails,
  comments,
  setComments
}) {
  return (
    <div className="flex flex-col gap-3" id="sm-unstructured-section">
      {/* Line Items description */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wide flex items-center justify-between">
          <span>Sale item specifications *</span>
          <span className="text-[8.5px] text-slate-400 uppercase font-mono font-normal">Mention description, quantities, and rates</span>
        </label>
        <textarea
          value={lineItems}
          onChange={(e) => setLineItems(e.target.value)}
          rows={3}
          placeholder="- 500 kgs cotton yarn 40s @ 250 rs/kg&#10;- poly blend 30s 300kg at 180"
          className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-500 outline-none resize-none leading-relaxed"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Greige details */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Greige details</label>
          <textarea
            value={greigeDetails}
            onChange={(e) => setGreigeDetails(e.target.value)}
            rows={2}
            placeholder="e.g. 100% cotton 60x60 greige, 150 kg, lying at Apex Whouse A"
            className="w-full p-1.5 text-[11px] font-sans border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-500 outline-none resize-none leading-normal"
          />
        </div>

        {/* Comments */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={2}
            placeholder="e.g. client needs this dispatched by tonight, pls do it fast"
            className="w-full p-1.5 text-[11px] font-sans border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-500 outline-none resize-none leading-normal"
          />
        </div>
      </div>
    </div>
  );
}
