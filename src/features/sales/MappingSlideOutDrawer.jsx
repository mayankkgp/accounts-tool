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
    // Simulated delay 500ms - 800ms
    await new Promise((r) => setTimeout(r, 600));

    try {
      const dbInv = JSON.parse(localStorage.getItem("fabrito_inventory") || "[]");
      const dbPurchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");

      let source = [];
      if (mode === "purchase") {
        // Flatten staged purchase line items to link
        dbPurchases.forEach((p) => {
          const lines = p.lineItems || [
            { itemName: "Premium Cotton Greige Fabric", hsnCode: "520512", quantity: 200, rate: 160 },
            { itemName: "Double Ply Weave Slub Yarn", hsnCode: "550921", quantity: 150, rate: 95 }
          ];
          lines.forEach((l, idx) => {
            source.push({
              id: `${p.id || "PI"}-${idx}-${l.itemName}`,
              itemId: l.hsnCode || "520512",
              itemName: `${l.itemName} (from ${p.vendorName || "Attached Vendor"})`,
              supplier: p.vendorName || "Direct Bill",
              availableQty: l.quantity || 100,
              rate: l.rate || 100,
              lValue: p.lValue || 100,
              isPurchase: true
            });
          });
        });
      } else {
        // Fetch from stock inventory
        source = dbInv.map((item, idx) => ({
          id: `${item.itemId || "INV"}-${idx}-${item.itemName}`,
          itemId: item.itemId,
          itemName: item.itemName,
          supplier: item.supplier || "Warehouse Stock",
          availableQty: item.availableQty || 500,
          rate: item.rate || 140,
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
    <div className="absolute inset-y-0 right-0 w-[420px] bg-white border-l border-slate-300 shadow-2xl z-50 flex flex-col min-h-0 font-sans text-xs animate-slide-in select-none">
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

      {/* Target Info Node */}
      <div className="bg-indigo-50 border-b border-indigo-100/50 p-2 text-slate-800 leading-tight">
        <p className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">Active Target Sales Item</p>
        <p className="font-semibold text-[11px] truncate">{parentItemName}</p>
      </div>

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
              SEARCHING REGISTRIES (500ms)...
            </span>
          </div>
        ) : items.length > 0 ? (
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-250 text-slate-500 text-[10px] uppercase font-bold">
                <th className="py-1 px-1 text-center w-[10%]"></th>
                <th className="py-1 px-1 w-[20%]">ID</th>
                <th className="py-1 px-1 w-[45%]">Name</th>
                <th className="py-1 px-1 text-right w-[25%] pr-1">Qty / Rate</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleCheckboxToggle(item.id)}
                    className={`border-b border-slate-150 h-8 hover:bg-slate-50 cursor-pointer ${
                      isChecked ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <td className="py-0.5 px-1 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Swallowed: Row click handles toggle
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-0.5 px-1 font-mono text-[10px] font-bold text-slate-500">
                      {item.itemId}
                    </td>
                    <td className="py-0.5 px-1 font-semibold text-slate-700 leading-tight">
                      <div className="flex flex-col pt-0.5">
                        <span className="truncate max-w-[170px]">{item.itemName}</span>
                        {item.isPurchase && (
                          <span className="text-[9px] text-indigo-500 font-medium">
                            L-Value: {item.lValue}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-0.5 px-1 text-right pr-1 font-mono hover:text-slate-900">
                      <div className="flex flex-col text-[10px] leading-tight">
                        <span className="font-bold text-slate-700">{item.availableQty}</span>
                        <span className="text-slate-400">₹{item.rate}</span>
                      </div>
                    </td>
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
