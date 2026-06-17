import React from "react";

/**
 * Information panel that warns users regarding previous triage rejections or
 * corrections required by the internal finance desk.
 */
export default function SalesFormFeedback({ editingRequest }) {
  if (!editingRequest || !editingRequest.financeFeedback) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 p-2 text-rose-900 text-xs flex flex-col font-sans select-none shrink-0" id="form-feedback-block">
      <span className="font-bold text-[10px] uppercase tracking-wider text-rose-700">
        Finance Team Block Comment:
      </span>
      <p className="font-sans italic font-medium mt-0.5 text-slate-850 leading-tight">
        "{editingRequest.financeFeedback}"
      </p>
    </div>
  );
}
