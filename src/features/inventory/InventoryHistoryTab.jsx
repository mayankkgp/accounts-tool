import React from "react";
import InventoryHistoryNode from "./InventoryHistoryNode";

/**
 * Parses dd/mm/yyyy date strings to support correct chronological sorting.
 * Supports standard slash separated date representations or standard ISO.
 */
function parseDate(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).getTime();
  }
  return new Date(dateStr).getTime() || 0;
}

/**
 * InventoryHistoryTab Component
 * Renders sorted chronological history events of an inward inventory item inside a compact vertical timeline.
 */
export default function InventoryHistoryTab({ item }) {
  const history = item?.history || [];

  // Sort history chronologically with newest events first (descending order)
  const sortedHistory = [...history].sort((a, b) => {
    const timeA = parseDate(a.date);
    const timeB = parseDate(b.date);
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    // Secondary fallback: newest event ID first
    return (b.eventId || "").localeCompare(a.eventId || "");
  });

  if (sortedHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 rounded-sm bg-slate-50/40 text-center select-none" id="history-empty-state">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">No History Found</span>
        <span className="text-[10px] text-slate-400 font-medium mt-1 max-w-[200px]">
          This inward item has no logged audit trail events.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5" id="inventory-history-timeline-container">
      {/* Header with counter */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">
          Audit Logs Timeline
        </span>
        <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.25 rounded-sm">
          {sortedHistory.length} Events
        </span>
      </div>

      {/* Timeline List */}
      <div className="flex flex-col pl-1">
        {sortedHistory.map((event, index) => (
          <InventoryHistoryNode
            key={event.eventId || `evt-idx-${index}`}
            event={event}
            isLast={index === sortedHistory.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
