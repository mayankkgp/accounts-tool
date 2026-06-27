import React from "react";

/**
 * InventoryHistoryNode Component
 * Represents a single chronological log event node in the high-density Audit Trail.
 */
export default function InventoryHistoryNode({ event, isLast }) {
  // Determine color scheme based on eventType
  let badgeClasses = "bg-slate-50 text-slate-600 border border-slate-200";
  let dotColor = "bg-slate-400";

  switch (event.eventType) {
    case "Inward":
      badgeClasses = "bg-slate-100 text-slate-700 border border-slate-200";
      dotColor = "bg-slate-500";
      break;
    case "Status Change":
      badgeClasses = "bg-amber-50 text-amber-700 border border-amber-250";
      dotColor = "bg-amber-500";
      break;
    case "Location Update":
      badgeClasses = "bg-emerald-50 text-emerald-700 border border-emerald-250";
      dotColor = "bg-emerald-500";
      break;
    case "Sales Consumption":
      badgeClasses = "bg-rose-50 text-rose-700 border border-rose-250";
      dotColor = "bg-rose-500";
      break;
    case "Bucket Distribution":
      badgeClasses = "bg-indigo-50 text-indigo-700 border border-indigo-250";
      dotColor = "bg-indigo-500";
      break;
    default:
      break;
  }

  // Number formatting utility matching the system standard
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <div className="flex gap-3 min-w-0" id={`history-node-${event.eventId}`}>
      {/* Timeline left side dot & connector line */}
      <div className="flex flex-col items-center shrink-0 relative w-3 select-none">
        {/* Dot */}
        <div className={`w-2 h-2 rounded-full ${dotColor} z-10 border border-white shadow-sm mt-1.5`} />
        {/* Vertical Connector Line */}
        {!isLast && (
          <div className="w-[1px] bg-slate-200 absolute top-3.5 bottom-0 left-1/2 -translate-x-1/2 z-0" />
        )}
      </div>

      {/* Timeline right side event data */}
      <div className="flex-1 pb-4 text-left min-w-0">
        {/* Metadata Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center">
            <span className={`text-[9px] px-1 py-0.25 rounded-sm uppercase tracking-wider font-bold font-sans ${badgeClasses}`} id={`node-badge-${event.eventId}`}>
              {event.eventType}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
            <span className="font-semibold text-slate-600 truncate max-w-[100px]" title={event.user}>
              {event.user}
            </span>
            <span>•</span>
            <span className="text-slate-500 font-medium">{event.date}</span>
          </div>
        </div>

        {/* Event Details Content */}
        <div className="text-[10px] text-slate-700 bg-slate-50/30 hover:bg-slate-50 p-2 rounded-sm border border-slate-200/60 font-sans mt-1" id={`node-content-${event.eventId}`}>
          {event.eventType === "Inward" && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 uppercase tracking-wide">
                <span>Initialization</span>
                <span className="bg-slate-200 text-slate-700 px-1 py-0.25 rounded-[1px] font-sans font-bold">
                  {event.systemStatus}
                </span>
              </div>
              <p className="font-medium text-slate-700 mt-1">Item was successfully registered into the inward system.</p>
            </div>
          )}

          {event.eventType === "Status Change" && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50/75 px-1.5 py-0.5 rounded-sm w-fit">
                <span className="uppercase text-slate-500 font-semibold">{event.previousStatus}</span>
                <span>→</span>
                <span className="uppercase text-indigo-700">{event.newStatus}</span>
              </div>
              {event.assignedLocation && (
                <div className="mt-1 text-slate-600 font-sans text-[9px]">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider font-sans text-[8px] block">Assigned Physical Location</span>
                  <span className="font-mono text-slate-800 font-medium block mt-0.5">{event.assignedLocation}</span>
                </div>
              )}
            </div>
          )}

          {event.eventType === "Location Update" && (
            <div className="flex flex-col gap-1">
              <div className="text-slate-600 font-sans text-[9px]">
                <span className="font-semibold text-slate-400 uppercase tracking-wider font-sans text-[8px] block">Location Transition</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-800 font-medium mt-1">
                  <span className="truncate max-w-[120px] text-slate-500" title={event.previousLocation}>
                    {event.previousLocation || "None"}
                  </span>
                  <span className="text-indigo-500 font-bold">→</span>
                  <span className="truncate max-w-[120px] text-slate-800 font-bold" title={event.newLocation}>
                    {event.newLocation}
                  </span>
                </div>
              </div>
            </div>
          )}

          {event.eventType === "Sales Consumption" && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider font-sans text-[8px] block">Consumed Stock</span>
                  <span className="font-mono text-slate-800 font-bold text-[11px] block mt-0.5">
                    {formatNumber(event.consumedQuantity)} m
                  </span>
                </div>
                {event.salesInvoiceReference && (
                  <div className="text-right">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider font-sans text-[8px] block">Invoice Ref</span>
                    <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-1 py-0.25 rounded-[1px] inline-block mt-0.5">
                      {event.salesInvoiceReference}
                    </span>
                  </div>
                )}
              </div>
              {event.customerName && (
                <div className="border-t border-slate-200/50 pt-1 mt-1 flex items-center justify-between text-[9px]">
                  <span className="text-slate-400 font-medium font-sans">Customer</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[140px]" title={event.customerName}>
                    {event.customerName}
                  </span>
                </div>
              )}
            </div>
          )}

          {event.eventType === "Bucket Distribution" && (
            <div className="flex flex-col gap-0.5 py-0.5">
              <span className="font-semibold text-slate-400 uppercase tracking-wider font-sans text-[8px] block mb-0.5">Distribution Buckets</span>
              <div className="font-mono text-[10px] text-slate-700 flex flex-wrap items-center">
                <span>Issued: <strong className="text-slate-900 font-bold">{formatNumber(event.debitIssuedQuantity)}m</strong></span>
                <span className="text-slate-300 mx-1.5">|</span>
                <span>Pending: <strong className="text-slate-900 font-bold">{formatNumber(event.toDebitQuantity)}m</strong></span>
                <span className="text-slate-300 mx-1.5">|</span>
                <span>Waste: <strong className="text-slate-900 font-bold">{formatNumber(event.wasteageQuantity)}m</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
