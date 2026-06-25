import React from "react";
import { Link2, Trash2, AlertTriangle, Copy, Plus } from "lucide-react";

/**
 * MappedSalesList Component
 * Extracted from MappingLedgerGrid.jsx
 */
export default function MappedSalesList({
  salesItems,
  setSalesItems,
  updateParentItem,
  handleRemoveChild,
  handleUpdateChildBucket,
  onTriggerLink,
  isFinanceFinalizing
}) {
  return (
    <div className="flex flex-col gap-0 min-h-0" id="main-ledger-nested-loop">
      {salesItems.map((parent, index) => {
        return (
          <div
            key={parent.id}
            className={`bg-white border-t border-b border-r border-slate-200 border-l-[4px] ${index % 2 === 0 ? 'border-l-indigo-500 hover:border-l-indigo-500' : 'border-l-slate-300 hover:border-l-slate-300'} p-2 relative group/parent shadow-xs hover:border-slate-300 transition-colors`}
          >
            {/* Parent Delete Action */}
            {!isFinanceFinalizing && (
              <button
                type="button"
                onClick={() => setSalesItems(prev => prev.filter(item => item.id !== parent.id))}
                className="absolute top-2 right-2 p-0.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-xs bg-transparent border-none"
                title="Delete Sales Item"
              >
                <Trash2 size={12} strokeWidth={2.5} />
              </button>
            )}

            {/* Row 1: Core Description */}
            <div className="grid grid-cols-12 gap-1.5 items-center mb-2 pr-6">
              <div className="col-span-8 flex flex-col gap-0.5">
                <div className="flex items-center">
                  <label className="text-[10px] uppercase font-extrabold text-slate-900 mb-0.5">Sales Item #{index + 1} Description</label>
                  {!parent.isFoc && parent.linkedCosts.length === 0 && <AlertTriangle size={11} className="text-rose-500 ml-1 mb-0.5 animate-bounce" title="Requires mapping" />}
                </div>
                <input
                  type="text"
                  value={parent.itemName}
                  onChange={e => updateParentItem(parent.id, { itemName: e.target.value })}
                  disabled={isFinanceFinalizing}
                  className="h-6 w-full border border-slate-300 px-1.5 text-slate-850 font-semibold focus:border-indigo-500 rounded-xs bg-white text-[11px] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
              <div className="col-span-4 flex flex-col gap-0.5">
                <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">HSN Code</label>
                <input
                  type="text"
                  value={parent.hsnCode}
                  onChange={e => updateParentItem(parent.id, { hsnCode: e.target.value })}
                  disabled={isFinanceFinalizing}
                  className="h-6 w-full border border-slate-300 px-1.5 focus:border-indigo-500 rounded-xs font-mono text-[10px] disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  placeholder="Enter HSN"
                />
              </div>
            </div>

            {/* Row 2: Metrics Inputs */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Sales Qty *</span>
                <div className="flex h-6 border border-slate-300 rounded-xs overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 bg-white">
                  <input
                    type="number"
                    value={parent.quantity}
                    onChange={e => updateParentItem(parent.id, { quantity: Math.max(1, Number(e.target.value) || 0) })}
                    disabled={isFinanceFinalizing}
                    className="w-full h-full border-none focus:ring-0 font-mono text-left pl-1.5 bg-transparent px-1 m-0 appearance-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                  <select
                    value={parent.uom || "m"}
                    onChange={e => updateParentItem(parent.id, { uom: e.target.value })}
                    disabled={isFinanceFinalizing}
                    className="w-[42px] shrink-0 h-full bg-slate-100 border-none border-l border-slate-300 text-[10px] font-bold text-slate-600 focus:ring-0 cursor-pointer outline-none text-center appearance-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="m">m</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Price (₹) *</span>
                <input
                  type="number"
                  value={parent.rate}
                  onChange={e => updateParentItem(parent.id, { rate: Math.max(0, Number(e.target.value) || 0) })}
                  disabled={isFinanceFinalizing}
                  className="h-6 border border-slate-300 font-mono text-left px-1.5 rounded-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">IGST (%)</span>
                <input
                  type="number"
                  value={parent.igst}
                  onChange={e => updateParentItem(parent.id, { igst: Number(e.target.value) || 0 })}
                  disabled={isFinanceFinalizing}
                  className="h-6 border border-slate-300 font-mono text-left px-1.5 rounded-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Row total</span>
                <span className="h-6 bg-slate-50 border border-slate-200 flex items-center justify-start px-2 font-mono font-bold text-slate-650 rounded-xs">
                  ₹{(parent.quantity * parent.rate).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 justify-end">
                <label className="flex items-center gap-1.5 h-6 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={parent.isFoc}
                    onChange={e => updateParentItem(parent.id, { isFoc: e.target.checked })}
                    className="cursor-pointer"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">FOC Toggle</span>
                </label>
              </div>
            </div>

            {/* Row 3: Linked cost Child list (THREADED HIERARCHY STYLE) */}
            {!parent.isFoc && parent.linkedCosts.length > 0 && (
              <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-indigo-100 mt-1">
                <span className="text-[9px] uppercase font-bold text-indigo-600 tracking-wide">Linked Cost Sources:</span>
                <div className="flex flex-col gap-2">
                  {parent.linkedCosts.map((child) => {
                    const totalBuckets = (Number(child.consumed) || 0) + (Number(child.toInventory) || 0) + (Number(child.toDebit) || 0) + (Number(child.wasteage) || 0);
                    const hasError = child.isPurchase ? totalBuckets !== child.availableQty : (Number(child.consumed) || 0) > child.availableQty;
                    return (
                      <div key={child.id} className="flex flex-col gap-1.5 relative group hover:bg-slate-50 -mx-2 px-2 py-1 rounded-xs transition-colors border-b border-slate-200 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                        {/* Title Row with Explicit Tags and Data Columns (Rate, HSN) */}
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link2 size={11} className="text-indigo-500 shrink-0" />
                            <span className="font-extrabold text-slate-800 text-[11px]">{child.itemName}</span>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(child.itemName || "")}
                              className="text-slate-400 hover:text-indigo-600 cursor-pointer border-none bg-transparent ml-1 p-0 flex items-center"
                              title="Copy Item Name"
                            >
                              <Copy size={10} />
                            </button>
                            <span className="font-mono text-[10px] text-slate-500 ml-2">HSN: {child.itemId || "N/A"}</span>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(child.itemId || "")}
                              className="text-slate-400 hover:text-indigo-600 cursor-pointer border-none bg-transparent ml-1 p-0 flex items-center"
                              title="Copy HSN"
                            >
                              <Copy size={10} />
                            </button>
                            
                            <span className={`px-1.5 py-0.2 rounded-xs text-[8px] font-extrabold tracking-wide uppercase font-sans ${
                              child.isPurchase
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-teal-100 text-teal-700"
                            }`}>
                              {child.isPurchase ? "PURCHASE" : "INVENTORY"}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-xs ml-1 border border-slate-200">{child.label || "Greige"}</span>

                            <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded-xs">
                              Rate: ₹{child.rate}/m
                            </span>

                            {child.isPurchase && child.lValue !== 100 && (
                              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded-xs">
                                L-{child.lValue}
                              </span>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(parent.id, child.id)}
                            className="text-slate-500 hover:text-rose-600 border-none bg-transparent cursor-pointer ml-auto p-0 flex items-center"
                            title="Remove cost link node"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Quantity labels inline before buckets */}
                        <div className="mt-1 pt-1.5">
                          {/* Numeric Input Buckets: consumed, to inventory, to debit */}
                          <div className="flex flex-row flex-wrap gap-6">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                                {child.isPurchase ? "Total Qty" : "Available Qty"}
                              </span>
                              <span className="h-6 flex items-center font-mono text-[11px] font-medium text-slate-900">
                                {child.availableQty || (child.isPurchase ? 200 : 120)} {parent.uom || "m"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 relative">
                              <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Consumed Qty</span>
                              <input
                                type="number"
                                value={child.consumed || ""}
                                onChange={e => handleUpdateChildBucket(parent.id, child.id, "consumed", e.target.value)}
                                className="h-6 w-[84px] border border-slate-200 text-left px-1.5 font-mono font-bold rounded-xs bg-indigo-50/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {hasError && <AlertTriangle size={11} className="absolute right-1.5 top-5 text-rose-500 pointer-events-none animate-pulse" />}
                            </div>

                            {child.isPurchase ? (
                              <>
                                <div className="flex flex-col gap-0.5 relative">
                                  <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">
                                    To Inv
                                  </span>
                                  <input
                                    type="number"
                                    value={child.toInventory || ""}
                                    onChange={e => handleUpdateChildBucket(parent.id, child.id, "toInventory", e.target.value)}
                                    className="h-6 w-[84px] border border-slate-200 text-left px-1.5 font-mono rounded-xs bg-slate-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">To Debit</span>
                                  <input
                                    type="number"
                                    value={child.toDebit || ""}
                                    onChange={e => handleUpdateChildBucket(parent.id, child.id, "toDebit", e.target.value)}
                                    className="h-6 w-[84px] border border-slate-200 text-left px-1.5 font-mono rounded-xs bg-slate-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Wasteage</span>
                                  <input
                                    type="number"
                                    value={child.wasteage || ""}
                                    onChange={e => handleUpdateChildBucket(parent.id, child.id, "wasteage", e.target.value)}
                                    className="h-6 w-[84px] border border-slate-200 text-left px-1.5 font-mono rounded-xs bg-slate-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Card Footer Single-click CTAs */}
            <div className="pt-3 mt-1 flex items-center justify-between pointer-events-auto" id="parent-card-actions">
              <span className="text-[9px] italic text-slate-400 font-medium select-none">
                {parent.isFoc ? "Exempt due to FOC status." : `${parent.linkedCosts.length} cost link nodes aligned`}
              </span>
              
              {!parent.isFoc && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onTriggerLink("purchase", parent.id, parent.itemName)}
                    className="h-5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-sm border border-slate-350 cursor-pointer text-[10px] uppercase transition-colors"
                  >
                    Link Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerLink("inventory", parent.id, parent.itemName)}
                    className="h-5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-sm border border-slate-350 cursor-pointer text-[10px] uppercase transition-colors"
                  >
                    Link Inventory
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* Full-width Add Sales Item Button */}
      {!isFinanceFinalizing && (
        <button
          type="button"
          onClick={() => {
            setSalesItems(prev => [
              ...prev,
              { id: 'S' + Date.now(), itemName: '', quantity: 1, rate: 0, hsnCode: '', igst: 0, linkedCosts: [], isFoc: false, uom: 'm' }
            ]);
          }}
          className="flex items-center justify-center gap-1.5 w-full h-8 mt-2 border border-dashed border-slate-300 rounded-sm text-slate-500 font-bold uppercase text-[10px] tracking-wider hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-colors cursor-pointer"
        >
          <Plus size={11} strokeWidth={2.5} />
          Add Sales Item
        </button>
      )}
    </div>
  );
}
