import React from "react";
import { Check } from "lucide-react";

/**
 * Condition A Table: Renders a read-only list of matched ledger stock items
 * associated with parsed Vendor Invoices. Includes a leading checkbox column.
 */
export default function ConditionAInventory({
  items = [],
  selectedRowIds = [],
  onToggleSelectRow,
  onToggleSelectAll,
  isLocked
}) {
  const allSelected = items.length > 0 && selectedRowIds.length === items.length;

  return (
    <div className="flex-1 flex flex-col min-h-[160px] border border-slate-200/80 rounded-sm bg-white overflow-hidden shadow-xs" id="condition-a-table-container">
      <div className="h-6 bg-slate-900 px-3 flex items-center justify-between shrink-0 font-sans border-b border-slate-950">
        <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400">
          Associated Inventory Items
        </span>
        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded-xs">
          {selectedRowIds.length} of {items.length} selected for staging
        </span>
      </div>

      <div className="flex-1 overflow-auto" id="condition-a-viewport">
        <table className="w-full border-collapse text-left text-slate-700 text-xs" id="condition-a-data-table">
          <thead className="bg-slate-105 text-[10px] uppercase tracking-wider text-slate-500 font-bold h-6 sticky top-0 border-b border-slate-250 select-none z-10 font-sans">
            <tr>
              <th className="py-0.5 px-2 text-center w-[6%]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  disabled={isLocked}
                  className="rounded-xs cursor-pointer text-indigo-600 focus:ring-0 focus:ring-offset-0"
                />
              </th>
              <th className="py-0.5 px-1 text-left w-[12%]">Item ID</th>
              <th className="py-0.5 px-1 text-left w-[42%]">Item Name</th>
              <th className="py-0.5 px-1 text-center w-[12%]">HSN Code</th>
              <th className="py-0.5 px-1 text-center w-[14%]">Avl Qty</th>
              <th className="py-0.5 px-1 text-left w-[14%] pr-2">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs bg-white">
            {items.map((item) => {
              const isSelected = selectedRowIds.includes(item.itemId);
              return (
                <tr
                  key={item.itemId}
                  onClick={() => !isLocked && onToggleSelectRow(item.itemId)}
                  className={`h-7 cursor-pointer hover:bg-slate-50/70 border-b border-slate-150 transition-colors select-none ${
                    isSelected ? "bg-indigo-50/30" : ""
                  }`}
                >
                  {/* Checkbox column */}
                  <td className="py-0.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isLocked}
                      onChange={() => onToggleSelectRow(item.itemId)}
                      className="rounded-xs cursor-pointer text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                  </td>

                  {/* ID */}
                  <td className="py-0.5 px-1 font-sans font-bold text-slate-500 uppercase tracking-tight">
                    {item.itemId}
                  </td>

                  {/* Item Name */}
                  <td className="py-0.5 px-1 font-sans font-semibold text-slate-800 break-words whitespace-normal" title={item.itemName}>
                    {item.itemName}
                  </td>

                  {/* HSN */}
                  <td className="py-0.5 px-1 text-center text-slate-500 font-bold break-words whitespace-normal">
                    {item.hsnCode || "—"}
                  </td>

                  {/* Qty */}
                  <td className="py-0.5 px-1 text-right text-slate-900 font-bold text-xs break-words whitespace-normal">
                    {item.availableQty} units
                  </td>

                  {/* Location */}
                  <td className="py-0.5 px-1 text-left text-[11px] font-sans text-slate-650 pr-2 break-words whitespace-normal">
                    {item.location || "Default Yard"}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-sans italic text-[11px]">
                  No matches detected for the specified triggers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
