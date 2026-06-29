import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function PurchaseDraftingGrid({
  lineItems = [],
  setLineItems,
  computedTaxes
}) {
  const handleFieldChange = (rowId, field, val) => {
    setLineItems((prev) =>
      prev.map((it) => {
        if (it.rowId === rowId) {
          return { ...it, [field]: val };
        }
        return it;
      })
    );
  };

  const handleAddRow = () => {
    const newId = "r_" + Math.random().toString(36).substr(2, 5);
    setLineItems((prev) => [
      ...prev,
      {
        rowId: newId,
        itemName: "",
        description: "",
        hsnCode: "",
        rate: "",
        quantity: "",
        uom: "m",
        itemDiscount: ""
      }
    ]);
  };

  const handleDeleteRow = (rowId) => {
    if (lineItems.length <= 1) {
      // Keep at least one empty row
      setLineItems([
        {
          rowId: "r_1",
          itemName: "",
          description: "",
          hsnCode: "",
          rate: "",
          quantity: "",
          uom: "m",
          itemDiscount: ""
        }
      ]);
      return;
    }
    setLineItems((prev) => prev.filter((it) => it.rowId !== rowId));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-sm overflow-hidden p-2" id="purchase-drafting-grid-container">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Line Item Spreadsheet
        </span>
        <button
          type="button"
          onClick={handleAddRow}
          className="h-5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-[1px] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-indigo-200"
          id="btn-add-item-row"
        >
          <Plus size={10} className="stroke-[3]" />
          <span>Add Row</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto border border-slate-100 rounded-xs min-h-0">
        <table className="w-full text-left text-[11px] border-collapse relative">
          <thead className="sticky top-0 bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200/80 z-10">
            <tr className="h-6.5">
              <th className="py-0.5 px-1.5 w-[30%]">Item Name *</th>
              <th className="py-0.5 px-1 w-[15%]">Description</th>
              <th className="py-0.5 px-1 w-[10%] text-center">HSN</th>
              <th className="py-0.5 px-1 w-[10%] text-right">Rate (₹) *</th>
              <th className="py-0.5 px-1 w-[10%] text-right">Qty *</th>
              <th className="py-0.5 px-1 w-[10%] text-center">UOM</th>
              <th className="py-0.5 px-1 w-[10%] text-right">Discount</th>
              <th className="py-0.5 px-1.5 w-[12%] text-right">Line Total (₹)</th>
              <th className="py-0.5 px-1.5 w-[5%] text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
            {lineItems.map((it, idx) => {
              // Find computed line details from computedTaxes if available
              const computedItem = computedTaxes?.items?.[idx] || {};
              const lineTotal = computedItem.lineTotal !== undefined 
                ? computedItem.lineTotal 
                : (Number(it.rate) || 0) * (Number(it.quantity) || 0) - (Number(it.itemDiscount) || 0);

              return (
                <tr key={it.rowId || idx} className="h-8 hover:bg-slate-50/60 transition-colors">
                  <td className="p-1">
                    <input
                      type="text"
                      value={it.itemName || ""}
                      onChange={(e) => handleFieldChange(it.rowId, "itemName", e.target.value)}
                      className="w-full h-6 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-sm px-1 text-xs font-sans font-semibold text-slate-800"
                      placeholder="e.g. Viscose Slub"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={it.description || ""}
                      onChange={(e) => handleFieldChange(it.rowId, "description", e.target.value)}
                      className="w-full h-6 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-sm px-1 text-[10px] text-slate-600"
                      placeholder="Batch no, etc."
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={it.hsnCode || ""}
                      onChange={(e) => handleFieldChange(it.rowId, "hsnCode", e.target.value)}
                      className="w-full h-6 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-sm px-1 text-center"
                      placeholder="HSN"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      value={it.rate === "" ? "" : it.rate}
                      onChange={(e) => handleFieldChange(it.rowId, "rate", e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full h-6 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-sm px-1 text-right font-bold text-slate-800"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      value={it.quantity === "" ? "" : it.quantity}
                      onChange={(e) => handleFieldChange(it.rowId, "quantity", e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full h-6 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-sm px-1 text-right font-bold text-slate-800"
                      placeholder="0"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <select
                      value={it.uom || "m"}
                      onChange={(e) => handleFieldChange(it.rowId, "uom", e.target.value)}
                      className="h-6 bg-transparent hover:bg-white focus:bg-white border-none rounded-sm px-1 text-xs font-semibold outline-none text-center"
                    >
                      <option value="m">m</option>
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      value={it.itemDiscount === "" ? "" : it.itemDiscount}
                      onChange={(e) => handleFieldChange(it.rowId, "itemDiscount", e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full h-6 bg-transparent border-none focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-sm px-1 text-right text-rose-600 font-bold"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="p-1.5 text-right font-bold text-slate-900 pr-3">
                    ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(it.rowId)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer rounded-xs hover:bg-slate-100 transition-colors"
                      title="Delete Row"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
