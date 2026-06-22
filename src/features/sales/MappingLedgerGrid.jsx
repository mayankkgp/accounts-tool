import React from "react";
import { Link2, Trash2, AlertTriangle, ShieldCheck, HelpCircle, PanelLeftOpen } from "lucide-react";

/**
 * MappingLedgerGrid Component (Phase 5 Right Mapping Grid)
 * Under 150 lines directive.
 */
export default function MappingLedgerGrid({
  req,
  salesItems,
  setSalesItems,
  unlinkedPurchases,
  setUnlinkedPurchases,
  onTriggerLink,
  isLeftPaneOpen,
  onToggleLeftPane
}) {
  
  // Handler helper to dynamically modify selected parent row properties
  const updateParentItem = (id, fields) => {
    setSalesItems(prev => prev.map(item => {
      if (item.id === id) {
        const next = { ...item, ...fields };
        // Apply HSN locking check: if exactly 1 child is linked, auto-populate HSN to match child
        if (next.linkedCosts.length === 1) {
          next.hsnCode = next.linkedCosts[0].itemId;
        }
        return next;
      }
      return item;
    }));
  };

  const handleRemoveChild = (parentId, childId) => {
    setSalesItems(prev => prev.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          linkedCosts: item.linkedCosts.filter(c => c.id !== childId)
        };
      }
      return item;
    }));
  };

  const handleUpdateChildBucket = (parentId, childId, field, val) => {
    const num = Math.max(0, Number(val) || 0);
    setSalesItems(prev => prev.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          linkedCosts: item.linkedCosts.map(c => {
            if (c.id === childId) {
              return { ...c, [field]: num };
            }
            return c;
          })
        };
      }
      return item;
    }));
  };

  const handleUpdateUnlinkedBucket = (id, field, val) => {
    const num = Math.max(0, Number(val) || 0);
    setUnlinkedPurchases(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: num };
      }
      return item;
    }));
  };

  return (
    <div className="flex-grow flex flex-col gap-1.5 font-sans text-xs select-none p-1 shrink-0" id="mapping-ledger-container">
      {/* 1. Sales Context Header (Editable Grid) */}
      <div className="bg-slate-50 border border-slate-200 rounded-sm p-2 mb-1.5 shrink-0 flex items-start gap-2 relative" id="sales-context-header">
        {!isLeftPaneOpen && (
          <button
            type="button"
            onClick={onToggleLeftPane}
            className="mt-[13px] h-6 w-6 rounded-xs border border-slate-300 hover:bg-slate-105 hover:text-indigo-600 transition-colors bg-white cursor-pointer shrink-0 flex items-center justify-center text-slate-500"
            title="Expand Reference Panel"
          >
            <PanelLeftOpen size={12} className="stroke-[2.5]" />
          </button>
        )}
        <div className="flex-1 grid grid-cols-4 gap-2">
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-450 mb-0.5">Customer</label>
            <select
              defaultValue={req?.customer || "Standard Customer"}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1 bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="Standard Customer">Standard Customer</option>
              <option value="Apex Textiles">Apex Textiles</option>
              <option value="Trident Group">Trident Group</option>
              <option value="Loom & Co">Loom & Co</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-450 mb-0.5">Bill To</label>
            <input
              type="text"
              defaultValue={req?.logistics?.billTo || "Office Corporate Head"}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-450 mb-0.5">Ship To</label>
            <input
              type="text"
              defaultValue={req?.logistics?.shipTo || "Factory Warehouse Block D"}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-450 mb-0.5">Transporter Name</label>
            <input
              type="text"
              defaultValue={req?.logistics?.transporterName || "VRL Logistics"}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-450 mb-0.5">Freight Terms</label>
            <input
              type="text"
              defaultValue={req?.logistics?.freight || "Fixed Standard To Collect"}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-450 mb-0.5">Payment Terms</label>
            <input
              type="text"
              defaultValue={req?.logistics?.paymentTerms || "Net 30 Days"}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-450 mb-0.5">Sales L-Value</label>
            <input
              type="number"
              defaultValue={100}
              className="h-6 text-[11px] border border-indigo-200 bg-indigo-50/50 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none font-bold font-mono text-indigo-700"
            />
          </div>
        </div>
      </div>

      {/* 2. Parent-Child list */}
      <div className="flex flex-col gap-1.5 min-h-0" id="main-ledger-nested-loop">
        {salesItems.map((parent) => {
          // Soft alert logic: Quantities match warning
          const totalLinkedQty = parent.linkedCosts.reduce((acc, c) => acc + (c.consumed || 0), 0);
          const needsWarning = !parent.isFoc && parent.linkedCosts.length === 1 && totalLinkedQty !== parent.quantity;

          return (
            <div
              key={parent.id}
              className={`flex flex-col border-b border-slate-200 pb-3 mb-1.5 last:border-b-0 last:pb-0 ${
                parent.isFoc ? "opacity-75 bg-slate-50/40 px-1 py-1 rounded-xs" : ""
              }`}
            >
              {/* Row 1: Core Description */}
              <div className="grid grid-cols-12 gap-1.5 items-center mb-2">
                <div className="col-span-8 flex flex-col gap-0.5">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Sales Item Description</label>
                  <input
                    type="text"
                    value={parent.itemName}
                    onChange={e => updateParentItem(parent.id, { itemName: e.target.value })}
                    className="h-6 w-full border border-slate-300 px-1.5 text-slate-850 font-semibold focus:border-indigo-500 rounded-xs bg-white text-[11px]"
                  />
                </div>
                <div className="col-span-4 flex flex-col gap-0.5">
                  <label className="text-[9px] uppercase font-bold text-slate-400">HSN Code</label>
                  <input
                    type="text"
                    value={parent.hsnCode}
                    disabled={parent.linkedCosts.length === 1}
                    onChange={e => updateParentItem(parent.id, { hsnCode: e.target.value })}
                    className="h-6 w-full border border-slate-300 px-1.5 focus:border-indigo-500 rounded-xs disabled:bg-slate-50/80 disabled:text-slate-500 font-mono text-[10px]"
                    placeholder="Enter HSN"
                  />
                </div>
              </div>

              {/* Row 2: Metrics Inputs */}
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-slate-450 font-bold">Sales Qty *</span>
                  <div className="flex h-6 border border-slate-300 rounded-xs overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 bg-white">
                    <input
                      type="number"
                      value={parent.quantity}
                      onChange={e => updateParentItem(parent.id, { quantity: Math.max(1, Number(e.target.value) || 0) })}
                      className="w-full h-full border-none focus:ring-0 font-mono text-center bg-transparent px-1 m-0 appearance-none focus:outline-none"
                    />
                    <select
                      value={parent.uom || "m"}
                      onChange={e => updateParentItem(parent.id, { uom: e.target.value })}
                      className="w-[42px] shrink-0 h-full bg-slate-100 border-none border-l border-slate-300 text-[10px] font-bold text-slate-600 focus:ring-0 cursor-pointer outline-none text-center appearance-none"
                    >
                      <option value="m">m</option>
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-slate-450 font-bold">Price (₹) *</span>
                  <input
                    type="number"
                    value={parent.rate}
                    onChange={e => updateParentItem(parent.id, { rate: Math.max(0, Number(e.target.value) || 0) })}
                    className="h-6 border border-slate-300 font-mono text-center rounded-xs"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-slate-450 font-bold">IGST (%)</span>
                  <input
                    type="number"
                    value={parent.igst}
                    onChange={e => updateParentItem(parent.id, { igst: Number(e.target.value) || 0 })}
                    className="h-6 border border-slate-300 font-mono text-center rounded-xs"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-slate-450 font-bold">Row total</span>
                  <span className="h-6 bg-slate-50 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-650 rounded-xs">
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

              {/* Row 3: Linked cost Child list (BORDERLESS SOFT LAYOUT) */}
              {!parent.isFoc && parent.linkedCosts.length > 0 && (
                <div className="bg-slate-50/80 -mx-1 px-2 py-2 mt-2 flex flex-col gap-1.5 rounded-xs">
                  <span className="text-[9px] uppercase font-bold text-indigo-600 tracking-wide">Linked Cost Sources:</span>
                  <div className="flex flex-col gap-1.5">
                    {parent.linkedCosts.map((child) => (
                      <div key={child.id} className="flex flex-col gap-1.5 pb-2 mb-2 border-b border-slate-200/60 last:border-b-0 last:pb-0 last:mb-0 relative">
                        {/* Title Row with Explicit Tags and Data Columns (Rate, HSN) */}
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link2 size={11} className="text-indigo-500 shrink-0" />
                            <span className="font-extrabold text-slate-800 text-[11px]">{child.itemName}</span>
                            
                            <span className={`px-1.5 py-0.2 rounded-xs text-[8px] font-extrabold tracking-wide uppercase font-sans ${
                              child.isPurchase
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-teal-100 text-teal-700"
                            }`}>
                              {child.isPurchase ? "PURCHASE" : "INVENTORY"}
                            </span>

                            <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded-xs">
                              Rate: ₹{child.rate}/m
                            </span>
                            <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded-xs">
                              HSN: {child.hsnCode || child.itemId || "520512"}
                            </span>

                            {child.isPurchase && child.lValue !== 100 && (
                              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded-xs">
                                L-Value: {child.lValue}%
                              </span>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(parent.id, child.id)}
                            className="text-slate-450 hover:text-rose-600 border-none bg-transparent cursor-pointer ml-auto"
                            title="Remove cost link node"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {/* Quantity labels inline before buckets */}
                        <div className="mt-1 border-t border-slate-200/45 pt-1.5">
                          {child.isPurchase ? (
                            <div className="text-[10px] font-bold text-slate-550 mb-1">
                              Total Qty: <span className="text-indigo-700 font-mono font-bold">{child.availableQty || 200}m</span>
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-slate-550 mb-1">
                              Available Qty: <span className="text-teal-700 font-mono font-bold">{child.availableQty || 120}m</span>
                            </div>
                          )}

                          {/* Numeric Input Buckets: consumed, to inventory, to debit */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase text-slate-455 font-bold">Consumed Qty</span>
                              <input
                                type="number"
                                value={child.consumed || ""}
                                onChange={e => handleUpdateChildBucket(parent.id, child.id, "consumed", e.target.value)}
                                className="h-6 w-full border border-slate-200 px-1 text-center font-mono font-bold rounded-xs bg-indigo-50/20"
                              />
                            </div>

                            {child.isPurchase ? (
                              <>
                                <div className="flex flex-col gap-0.5 relative">
                                  <span className="text-[9px] uppercase text-slate-455 font-bold flex items-center justify-between">
                                    <span>To Inv</span>
                                    {(child.toInventory || 0) > 0 && (
                                      <span className="text-[8px] text-indigo-500 font-bold leading-none animate-pulse">Conv. L100</span>
                                    )}
                                  </span>
                                  <input
                                    type="number"
                                    value={child.toInventory || ""}
                                    onChange={e => handleUpdateChildBucket(parent.id, child.id, "toInventory", e.target.value)}
                                    className="h-6 w-full border border-slate-200 px-1 text-center font-mono rounded-xs bg-slate-50"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] uppercase text-slate-455 font-bold">To Debit</span>
                                  <input
                                    type="number"
                                    value={child.toDebit || ""}
                                    onChange={e => handleUpdateChildBucket(parent.id, child.id, "toDebit", e.target.value)}
                                    className="h-6 w-full border border-slate-200 px-1 text-center font-mono rounded-xs bg-slate-50"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="col-span-2 text-slate-400 italic text-[9px] flex items-center pt-3 pl-2">
                                No surplus buckets for direct stock matches.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Non-blocking soft alert if single mapping has qty mismatch */}
                  {needsWarning && (
                    <div className="flex items-center gap-1.5 p-1.5 px-2 border.none bg-amber-55/70 rounded-md text-amber-900 text-[10px] leading-tight font-medium">
                      <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                      <span>
                        Quantity Mismatch: Linked costing (<strong>{totalLinkedQty}{parent.uom || "m"}</strong>) does not equal Sales Quantity (<strong>{parent.quantity}{parent.uom || "m"}</strong>).
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer Single-click CTAs */}
              <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between pointer-events-auto" id="parent-card-actions">
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
      </div>

      {/* 3. Unlinked Purchases section (SOFT BORDERLESS CARD DESIGN) */}
      {unlinkedPurchases.length > 0 && (
        <div className="border-t-2 border-slate-200 pt-3 mt-2 flex flex-col gap-2 shrink-0" id="unlinked-purchases-container">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mr-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wide">Unlinked Staged Purchases</span>
            <span className="text-[8px] font-mono text-slate-455 uppercase font-bold">{unlinkedPurchases.length} items to distribute</span>
          </div>
          <div className="flex flex-col gap-2">
            {unlinkedPurchases.map((u) => (
              <div key={u.id} className="bg-slate-50 px-2 py-1.5 rounded-xs flex flex-col gap-1.5">
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
                      <span className="text-[9px] font-mono font-bold text-slate-450 bg-slate-100 px-1 rounded-sm">
                        L-Value: {u.lValue}%
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Available: {u.availableQty}m</span>
                </div>
                
                {/* Buckets Section */}
                <div className="mt-1 border-t border-slate-200/40 pt-1.5">
                  {/* Inline Quantity label */}
                  <div className="text-[10px] font-bold text-slate-550 mb-1">
                    Total Qty: <span className="text-slate-850 font-mono font-bold">{u.availableQty}m</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-0.5 relative">
                      <span className="text-[9px] uppercase text-slate-455 font-bold flex items-center justify-between">
                        <span>To Inventory</span>
                        {(u.toInventory || 0) > 0 && (
                          <span className="text-[8px] text-indigo-500 font-bold leading-none animate-pulse">Conv. L100</span>
                        )}
                      </span>
                      <input
                        type="number"
                        value={u.toInventory || ""}
                        onChange={e => handleUpdateUnlinkedBucket(u.id, "toInventory", e.target.value)}
                        className="h-6 w-full border border-slate-200 px-1 text-center font-mono rounded-xs bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase text-slate-455 font-bold">To Debit</span>
                      <input
                        type="number"
                        value={u.toDebit || ""}
                        onChange={e => handleUpdateUnlinkedBucket(u.id, "toDebit", e.target.value)}
                        className="h-6 w-full border border-slate-200 px-1 text-center font-mono rounded-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
