import React, { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";

/**
 * Slide-Out Drawer for mapping ledger links (Phase 5).
 * 
 * Props:
 *  - isOpen: Drawer visibility toggle
 *  - onClose: Closes slide-out drawer
 *  - mode: "purchase" | "inventory"
 *  - parentItemName: Name of the sales parent component is referencing
 *  - onSelectItems: Callback returning an array of selected source objects
 */
export default function MappingSlideOutDrawer({
  isOpen,
  onClose,
  mode,
  parentItemName,
  onSelectItems
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Mock search linkable items simulating backend latency
  const mockSearchLinkableItems = async (queryStr) => {
    setLoading(true);
    // Simulated delay 300ms
    await new Promise((r) => setTimeout(r, 400));

    try {
      const dbInv = JSON.parse(localStorage.getItem("fabrito_inventory") || "[]");
      const dbPurchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");

      let source = [];
      if (mode === "purchase") {
        // Flatten staged purchase line items to link
        const targetPurchases = dbPurchases.length > 0 ? dbPurchases : [
          { id: "PI-402", invoiceNo: "PI-402", vendorName: "Auro Textiles", lValue: 98, lineItems: [{ itemName: "Premium Cotton Greige Fabric", hsnCode: "520212", quantity: 200, rate: 110 }] },
          { id: "PI-419", invoiceNo: "PI-419", vendorName: "Sutlej Weaves", lValue: 100, lineItems: [{ itemName: "Double Ply Weave Slub Yarn", hsnCode: "520512", quantity: 150, rate: 95 }] }
        ];

        targetPurchases.forEach((p) => {
          const lines = p.lineItems || [
            { itemName: "Premium Cotton Greige Fabric", hsnCode: "520212", quantity: 200, rate: 110 }
          ];
          lines.forEach((l, idx) => {
            source.push({
              id: `${p.id || "PI"}-${idx}-${l.itemName}`,
              itemId: l.hsnCode || "520212",
              itemName: l.itemName,
              invoiceNo: p.invoiceNo || p.id || "PI-092",
              supplier: p.vendorName || "Direct Bill",
              availableQty: l.quantity || 100,
              rate: l.rate || 100,
              lValue: p.lValue || 100,
              isPurchase: true
            });
          });
        });
      } else {
        // Fetch from stock inventory. Fill in default SKU items.
        const defaultInv = [
          { itemId: "SKU-YARN-40S", itemName: "Premium Cotton Yarn 40s", availableQty: 300, rate: 140, invoiceNo: "PI-402", vendorName: "Auro Textiles", location: "Warehouse A" },
          { itemId: "SKU-POLY-30S", itemName: "Poly Blend Fabric 30s", availableQty: 250, rate: 110, invoiceNo: "PI-419", vendorName: "Sutlej Weaves", location: "Warehouse B" },
          { itemId: "SKU-GREIGE-ST", itemName: "Greige Standard Loom", availableQty: 180, rate: 90, invoiceNo: "PI-502", vendorName: "Birla Century", location: "Warehouse A" }
        ];
        
        const trackingInv = dbInv.length > 0 ? dbInv : defaultInv;

        source = trackingInv.map((item, idx) => ({
          id: `SKU-${idx}-${item.itemName}`,
          skuId: item.itemId ? item.itemId.replace("INV", "SKU") : `SKU-FAB-${100 + idx}`,
          itemId: item.itemId || `SKU-FAB-${100 + idx}`,
          itemName: item.itemName,
          invoiceNo: item.invoiceNo || `PI-8${idx}1`,
          supplier: item.vendorName || "General Mill Store",
          location: item.location || (idx % 2 === 0 ? "Warehouse A" : "Warehouse B"),
          availableQty: item.availableQty || 400,
          rate: item.rate || 135,
          lValue: 100,
          isPurchase: false
        }));
      }

      // Filter matches
      if (queryStr) {
        const q = queryStr.toLowerCase();
        source = source.filter(
          (x) =>
            x.itemName.toLowerCase().includes(q) ||
            x.itemId.toLowerCase().includes(q)
        );
      }
      setItems(source);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      mockSearchLinkableItems(search);
    }
  }, [isOpen, mode]);

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      mockSearchLinkableItems(search);
    }
  };

  const handleCheckboxToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirmAdd = () => {
    const selected = items.filter((x) => selectedIds.includes(x.id));
    onSelectItems(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-[520px] bg-white border-l border-slate-300 shadow-2xl z-50 flex flex-col min-h-0 font-sans text-xs animate-slide-in select-none">
      {/* Drawer Header Toolbar */}
      <div className="h-8 shrink-0 bg-slate-900 text-slate-100 flex items-center justify-between px-3">
        <span className="font-bold uppercase tracking-wider text-[10px]">
          Link {mode === "purchase" ? "Staged Purchase" : "Inventory Stock"}
        </span>
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-0"
        >
          <X size={14} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Highlights Count Banner instead of target header block */}
      {selectedIds.length > 0 ? (
        <div className="bg-indigo-600 border-b border-indigo-700/50 p-2.5 text-white leading-tight font-extrabold text-[11px] text-center shadow-inner">
          ✨ {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"} selected to align
        </div>
      ) : (
        <div className="bg-slate-50 border-b border-slate-200/60 p-2 text-slate-500 leading-tight">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Target Item Link Target</p>
          <p className="font-semibold text-[11px] truncate text-slate-750">{parentItemName}</p>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="p-2 border-b border-slate-200 bg-slate-5 font-sans flex gap-1 items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input
            type="text"
            placeholder={`Search linkable ${mode === "purchase" ? "purchases" : "stock"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-2 text-[11px] placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => mockSearchLinkableItems(search)}
          className="h-6 bg-slate-850 hover:bg-slate-750 text-white rounded-sm px-2.5 font-bold border-none cursor-pointer text-[10px]"
        >
          Find
        </button>
      </div>

      {/* Selectable Stack List */}
      <div className="flex-1 overflow-y-auto p-2" id="drawer-items-scroller">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-24 select-none">
            <Loader2 size={18} className="animate-spin text-slate-500" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none font-mono">
              RETRIEVING LEDGER RECORDS...
            </span>
          </div>
        ) : items.length > 0 ? (
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              {mode === "purchase" ? (
                // 1. Column Layout (Purchase): Checkbox, Invoice (No ID), Item, Qty/Rate
                <tr className="bg-slate-100/90 border-b border-slate-250 text-slate-500 text-[10px] uppercase font-bold text-center">
                  <th className="py-2.5 px-1.5 text-center w-[8%]"></th>
                  <th className="py-2.5 px-1.5 text-left w-[32%]">Invoice</th>
                  <th className="py-2.5 px-1.5 text-left w-[40%]">Item</th>
                  <th className="py-2.5 px-1.5 text-right w-[20%] pr-1.5">Qty / Rate</th>
                </tr>
              ) : (
                // 2. Column Layout (Inventory): Checkbox, SKU, Invoice, Item, Location, Qty/Rate
                <tr className="bg-slate-100/90 border-b border-slate-250 text-slate-500 text-[10px] uppercase font-bold text-center">
                  <th className="py-2.5 px-1.5 text-center w-[6%]"></th>
                  <th className="py-2.5 px-1.5 text-left w-[18%]">SKU</th>
                  <th className="py-2.5 px-1.5 text-left w-[28%]">Invoice</th>
                  <th className="py-2.5 px-1.5 text-left w-[24%]">Item</th>
                  <th className="py-2.5 px-1.5 text-left w-[12%]">Location</th>
                  <th className="py-2.5 px-1.5 text-right w-[12%] pr-1.5">Qty / Rate</th>
                </tr>
              )}
            </thead>
            <tbody>
              {items.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleCheckboxToggle(item.id)}
                    className={`border-b border-slate-150 h-10 hover:bg-slate-50/70 cursor-pointer ${
                      isChecked ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {/* Checkbox column */}
                    <td className="py-1 px-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Swallowed: Row click handles toggle
                        className="cursor-pointer"
                      />
                    </td>

                    {mode === "purchase" ? (
                      // PURCHASE ROW cells
                      <>
                        {/* Invoice column (stacked Invoice ID and Vendor Name) */}
                        <td className="py-1 px-1.5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-mono text-[10px] font-bold text-slate-700">{item.invoiceNo}</span>
                            <span className="text-[9px] text-slate-400 font-medium truncate max-w-[120px]">{item.supplier}</span>
                          </div>
                        </td>
                        {/* Item renamed header Column */}
                        <td className="py-1 px-1.5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-extrabold text-slate-800 text-[11px] truncate max-w-[170px]">{item.itemName}</span>
                            <span className="text-[9px] text-slate-400 font-mono">HSN: {item.itemId}</span>
                          </div>
                        </td>
                        {/* Qty / Rate with appends */}
                        <td className="py-1 px-1.5 text-right pr-1.5 font-mono">
                          <div className="flex flex-col text-[10px] leading-tight">
                            <span className="font-bold text-slate-800">{item.availableQty}m</span>
                            <span className="text-slate-400">₹{item.rate}/m</span>
                          </div>
                        </td>
                      </>
                    ) : (
                      // INVENTORY ROW cells
                      <>
                        {/* SKU column */}
                        <td className="py-1 px-1.5 font-mono text-[10px] font-bold text-slate-650">
                          {item.skuId}
                        </td>
                        {/* Original Invoice column stacked */}
                        <td className="py-1 px-1.5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-mono text-[10px] font-bold text-slate-700">{item.invoiceNo || "Stock Entry"}</span>
                            <span className="text-[9px] text-slate-400 font-medium truncate max-w-[100px]">{item.supplier}</span>
                          </div>
                        </td>
                        {/* Item name column */}
                        <td className="py-1 px-1.5">
                          <span className="font-extrabold text-slate-800 text-[11px] truncate max-w-[130px]">{item.itemName}</span>
                        </td>
                        {/* Location Mock Column */}
                        <td className="py-1 px-1.5 font-semibold text-slate-500">
                          {item.location}
                        </td>
                        {/* Qty / Rate with appends */}
                        <td className="py-1 px-1.5 text-right pr-1.5 font-mono">
                          <div className="flex flex-col text-[10px] leading-tight">
                            <span className="font-bold text-slate-800">{item.availableQty}m</span>
                            <span className="text-slate-400">₹{item.rate}/m</span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium leading-normal">
            No linkable matches located inside database.
          </div>
        )}
      </div>

      {/* Sticky Bottom Confirmer Button */}
      <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <span className="text-slate-500 font-bold text-[10px]">
          {selectedIds.length} source records selected
        </span>
        <button
          type="button"
          onClick={handleConfirmAdd}
          disabled={selectedIds.length === 0}
          className="h-6 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer text-[10px] uppercase tracking-wider"
        >
          Compile Link Items
        </button>
      </div>
    </div>
  );
}
