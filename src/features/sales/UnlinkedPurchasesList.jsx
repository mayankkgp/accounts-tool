import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * UnlinkedPurchasesList Component
 * Extracted from MappingLedgerGrid.jsx
 */
export default function UnlinkedPurchasesList({
  unlinkedPurchases,
  handleUpdateUnlinkedBucket
}) {
  if (unlinkedPurchases.length === 0) return null;

  return (
    <div className="border-t-2 border-slate-200 pt-3 mt-2 flex flex-col gap-2 shrink-0" id="unlinked-purchases-container">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1 mr-1">
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wide">Unlinked Staged Purchases</span>
        <span className="text-[8px] font-mono text-slate-400 uppercase font-bold">{unlinkedPurchases.length} items to distribute</span>
      </div>
      <div className="flex flex-col gap-0">
        {unlinkedPurchases.map((u, index) => {
          const unlinkedTotal = (Number(u.toInventory) || 0) + (Number(u.toDebit) || 0) + (Number(u.wasteage) || 0);
          const uError = unlinkedTotal !== u.availableQty;
          return (
            <div key={u.id} className={`bg-white border-t border-b border-r border-slate-200 border-l-[4px] ${index % 2 === 0 ? 'border-l-indigo-500 hover:border-l-indigo-500' : 'border-l-slate-300 hover:border-l-slate-300'} p-2 relative shadow-xs hover:border-slate-300 transition-colors flex flex-col gap-1.5`}>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 leading-tight flex-wrap gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="truncate text-slate-800">{u.itemName}</span>
                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded-xs">
                    Rate: ₹{u.rate}/m
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded-xs">
                    HSN: {u.hsnCode || "520212"}
                  </span>
                  {u.lValue !== 100 && (
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1 rounded-sm">
                      L-{u.lValue}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Buckets Section */}
              <div className="mt-1 pt-1.5">
                <div className="flex flex-row flex-wrap gap-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Total Qty</span>
                    <span className="h-6 flex items-center font-mono text-[11px] font-medium text-slate-900">
                      {u.availableQty} {u.uom || "m"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 relative">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                      To Inventory
                    </span>
                    <input
                      type="number"
                      value={u.toInventory || ""}
                      onChange={e => handleUpdateUnlinkedBucket(u.id, "toInventory", e.target.value)}
                      className="h-6 w-[84px] border border-slate-200 text-left px-1.5 font-mono rounded-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {uError && <AlertTriangle size={11} className="absolute right-1.5 top-5 text-rose-500 pointer-events-none animate-pulse" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">To Debit</span>
                    <input
                      type="number"
                      value={u.toDebit || ""}
                      onChange={e => handleUpdateUnlinkedBucket(u.id, "toDebit", e.target.value)}
                      className="h-6 w-[84px] border border-slate-200 text-left px-1.5 font-mono rounded-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Wasteage</span>
                    <input
                      type="number"
                      value={u.wasteage || ""}
                      onChange={e => handleUpdateUnlinkedBucket(u.id, "wasteage", e.target.value)}
                      className="h-6 w-[84px] border border-slate-200 text-left px-1.5 font-mono rounded-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
