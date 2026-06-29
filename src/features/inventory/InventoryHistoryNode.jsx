import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

/**
 * InventoryHistoryNode Component
 * Represents a single chronological log event node in the high-density Audit Trail.
 */
export default function InventoryHistoryNode({ event, isLast }) {
  const [copied, setCopied] = useState(false);

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
    case "Remarks Update":
      badgeClasses = "bg-sky-50 text-sky-700 border border-sky-250";
      dotColor = "bg-sky-500";
      break;
    default:
      break;
  }

  // Determine badge text
  let badgeText = (event.eventType || "").toUpperCase();
  if (event.eventType === "Status Change") {
    badgeText = `${event.previousStatus || "PENDING"} → ${event.newStatus || "REVIEWED"}`.toUpperCase();
  } else if (event.eventType === "Bucket Distribution") {
    badgeText = "QTY UPDATE";
  }

  // Number formatting utility matching the system standard
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = (invoiceRef, details) => {
    const blob = new Blob([details], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <div className="flex items-center gap-1.5 flex-wrap mb-1 text-[9px]">
          <span className={`px-1 py-0.25 rounded-sm uppercase tracking-wider font-bold font-sans ${badgeClasses}`} id={`node-badge-${event.eventId}`}>
            {badgeText}
          </span>
          <span className="text-slate-500 font-mono font-medium">{event.date}</span>
          <span className="text-slate-400 font-mono">•</span>
          <span className="font-semibold font-mono text-slate-600 truncate max-w-[120px]" title={event.user}>
            {event.user}
          </span>
        </div>

        {/* Event Details Content */}
        <div className="text-[10px] text-slate-700 font-sans mt-0.5 pl-0.5" id={`node-content-${event.eventId}`}>
          {event.eventType === "Inward" && (
            <div className="font-mono text-[10px] text-slate-700 flex flex-wrap items-center gap-x-2">
              <span className="inline-flex items-center gap-1">
                Purchase Invoice: 
                <strong className="text-slate-900 font-bold inline-flex items-center gap-1">
                  {event.purchaseInvoice || "—"}
                  {event.purchaseInvoice && (
                    <span className="inline-flex items-center gap-0.5 ml-1 select-none">
                      <button
                        onClick={() => handleCopy(event.purchaseInvoice)}
                        title="Copy Purchase Invoice"
                        className="h-3.5 w-3.5 p-0.25 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        {copied ? <Check size={8} className="text-emerald-500" /> : <Copy size={8} />}
                      </button>
                      <button
                        onClick={() => handleDownload(
                          event.purchaseInvoice,
                          `PURCHASE INVOICE DETAILS\n========================\nPurchase Invoice: ${event.purchaseInvoice}\nTotal Purchase Quantity: ${event.totalPurchaseQuantity} m\nDate: ${event.date}`
                        )}
                        title="Download Purchase Invoice"
                        className="h-3.5 w-3.5 p-0.25 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Download size={8} />
                      </button>
                    </span>
                  )}
                </strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>Total Purchase Qty: <strong className="text-slate-900 font-bold">{formatNumber(event.totalPurchaseQuantity)}m</strong></span>
            </div>
          )}

          {event.eventType === "Status Change" && (event.assignedLocation || event.remarks) && (
            <div className="font-mono text-[10px] text-slate-800 font-semibold flex flex-col gap-0.5">
              {event.assignedLocation && <span>{event.assignedLocation}</span>}
              {event.remarks && (
                <span className="text-slate-500 font-normal font-sans text-[10px]">
                  Remarks: <span className="font-semibold text-slate-700 font-mono">{event.remarks}</span>
                </span>
              )}
            </div>
          )}

          {event.eventType === "Remarks Update" && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-700 font-medium">
              <span className="text-slate-500">{event.previousRemarks || "None"}</span>
              <span className="text-indigo-500 font-bold">→</span>
              <span className="text-slate-800 font-bold">{event.newRemarks || "None"}</span>
            </div>
          )}

          {event.eventType === "Location Update" && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-700 font-medium">
              <span className="text-slate-500">{event.previousLocation || "None"}</span>
              <span className="text-indigo-500 font-bold">→</span>
              <span className="text-slate-800 font-bold">{event.newLocation}</span>
            </div>
          )}

          {event.eventType === "Sales Consumption" && (
            <div className="font-mono text-[10px] text-slate-700 flex flex-wrap items-center gap-x-2">
              <span>Consumed: <strong className="text-slate-900 font-bold">{formatNumber(event.consumedQuantity)}m</strong></span>
              <span className="text-slate-300">|</span>
              <span>Customer: <strong className="text-slate-900 font-bold">{event.customerName || "—"}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1">
                Invoice: 
                <strong className="text-slate-900 font-bold inline-flex items-center gap-1">
                  {event.salesInvoiceReference || "—"}
                  {event.salesInvoiceReference && (
                    <span className="inline-flex items-center gap-0.5 ml-1 select-none">
                      <button
                        onClick={() => handleCopy(event.salesInvoiceReference)}
                        title="Copy Invoice"
                        className="h-3.5 w-3.5 p-0.25 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        {copied ? <Check size={8} className="text-emerald-500" /> : <Copy size={8} />}
                      </button>
                      <button
                        onClick={() => handleDownload(
                          event.salesInvoiceReference,
                          `INVOICE DETAILS\n===============\nInvoice Reference: ${event.salesInvoiceReference}\nCustomer Name: ${event.customerName}\nConsumed Quantity: ${event.consumedQuantity} m\nDate: ${event.date}`
                        )}
                        title="Download Invoice"
                        className="h-3.5 w-3.5 p-0.25 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Download size={8} />
                      </button>
                    </span>
                  )}
                </strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>Available Qty: <strong className="text-slate-900 font-bold">{formatNumber(event.availableQty)}m</strong></span>
            </div>
          )}

          {event.eventType === "Bucket Distribution" && (
            <div className="font-mono text-[10px] text-slate-700 flex flex-wrap items-center gap-x-2">
              <span>Debit Issued: <strong className="text-slate-900 font-bold">{formatNumber(event.debitIssuedQuantity)}m</strong></span>
              <span className="text-slate-300">|</span>
              <span>Debit Pending: <strong className="text-slate-900 font-bold">{formatNumber(event.toDebitQuantity)}m</strong></span>
              <span className="text-slate-300">|</span>
              <span>Wasteage: <strong className="text-slate-900 font-bold">{formatNumber(event.wasteageQuantity)}m</strong></span>
              <span className="text-slate-300">|</span>
              <span>Revised Inv Qty: <strong className="text-slate-900 font-bold">{formatNumber(event.revisedQuantity || 0)}m</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
