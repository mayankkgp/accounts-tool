import React from "react";
import { Plus, Trash2 } from "lucide-react";

/**
 * Condition B Component: Manual Drafting Spreadsheet for new invoices.
 * Automatically aligns and splits taxes based on Vendor GSTIN,
 * with visually unified totals alignments and hidden spinner inputs.
 */
export default function ConditionBDrafting({
  lineItems = [],
  setLineItems,
  freight = 0,
  setFreight,
  discount = 0,
  setDiscount,
  isLocked,
  vendor = ""
}) {
  // Helper to determine Vendor GSTIN and region
  const getGstin = (vendorName) => {
    const map = {
      "Trident Group": "03AAATG1234A1Z1",
      "Arvind Mills": "24AAACA1105R1Z2",
      "Loom & Co Dyeing Unit": "06AAALL1111B1Z5",
      "Vogue Garments": "07AAAVV2222C2Z6",
      "Mysore Silk Board Vendor": "29AAAMM3333D1Z7",
      "Shree Textiles": "06AAASS4444E1Z8",
      "DEEPSHIKHA FASHIONS": "06AAADD5555F1Z9",
      "Arvind Textiles": "24AAATC6666G1ZA"
    };
    return map[vendorName] || "03AAAX1234X1Z1"; // Default to non-Haryana (Interstate)
  };

  const gstin = getGstin((vendor || "").trim());
  const isHaryana = gstin.startsWith("06");

  // Add a new raw draft line item
  const handleAddLineRow = () => {
    if (isLocked) return;
    const newId = Date.now() + Math.random();
    setLineItems([
      ...lineItems,
      {
        id: newId,
        itemName: "Draft Fabric / Blend",
        hsnCode: "520832",
        quantity: 100,
        rate: 150
      }
    ]);
  };

  const handleRowChange = (id, field, value) => {
    if (isLocked) return;
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleDeleteRow = (id) => {
    if (isLocked) return;
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  // Math formulas
  const basicSum = lineItems.reduce((acc, curr) => acc + (Number(curr.rate) || 0) * (Number(curr.quantity) || 0), 0);
  const taxSum = basicSum * 0.18;
  const totalWithTax = basicSum + taxSum;

  const numericInputClass = "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

  return (
    <div className="flex-1 flex flex-col gap-2 min-h-0 select-none font-sans text-xs" id="condition-b-form-parent">
      {/* Spreadsheet Table Scrollbox */}
      <div className="flex-1 border border-slate-200/80 rounded-sm bg-white overflow-hidden flex flex-col min-h-[160px]" id="condition-b-table-scroller">
        <div className="h-6 bg-slate-900 px-3 flex items-center justify-between shrink-0 font-sans border-b border-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400">Purchase Items Grid</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">{lineItems.length} records</span>
        </div>

        <div className="flex-1 overflow-auto bg-slate-200/10">
          <table className="w-full border-collapse text-left text-slate-700 text-xs">
            <thead className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-bold h-6 sticky top-0 border-b border-slate-250 select-none z-10 font-sans">
              <tr>
                <th className="py-0.5 px-2 text-center w-[4%]">#</th>
                <th className="py-0.5 px-1 text-left w-[36%]">Item Description *</th>
                <th className="py-0.5 px-1 text-center w-[10%]">HSN</th>
                <th className="py-0.5 px-1 text-center w-[8%]">Qty</th>
                <th className="py-0.5 px-1 text-center w-[8%]">Rate (₹)</th>
                {!isHaryana ? (
                  <th className="py-0.5 px-1 text-center w-[10%]">IGST</th>
                ) : (
                  <>
                    <th className="py-0.5 px-1 text-center w-[6%]">CGST</th>
                    <th className="py-0.5 px-1 text-center w-[6%]">SGST</th>
                  </>
                )}
                <th className="py-0.5 px-1 text-right w-[10%]">Subtotal</th>
                <th className="py-0.5 px-1 text-right w-[12%]">Adj Total</th>
                {/* Strict Directive: Remove Del text label but keep empty cell */}
                <th className="py-0.5 px-1 text-center w-[6%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-mono text-xs bg-white">
              {lineItems.map((it, idx) => {
                const qtyVal = Number(it.quantity) || 0;
                const rateVal = Number(it.rate) || 0;
                const rowBasic = qtyVal * rateVal;
                const rowTax = rowBasic * 0.18;
                const rowSubtotal = rowBasic + rowTax;

                // Landed proportional adjustment math: (freight - discount) * (rowBasic / basicSum)
                const propPercent = basicSum > 0 ? rowBasic / basicSum : 0;
                const proportionalAdjustment = (Number(freight) - Number(discount)) * propPercent;
                const rowAdjustedTotal = rowSubtotal + proportionalAdjustment;

                return (
                  <tr key={it.id} className="h-7 hover:bg-slate-50/40 border-b border-slate-200">
                    <td className="py-0.5 px-2 text-center font-bold text-slate-400 font-sans">{idx + 1}</td>

                    <td className="py-0.5 px-1">
                      <input
                        type="text"
                        value={it.itemName}
                        onChange={(e) => handleRowChange(it.id, "itemName", e.target.value)}
                        disabled={isLocked}
                        className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded-sm text-xs h-5.5 px-1 font-sans font-semibold text-slate-800"
                      />
                    </td>

                    <td className="py-0.5 px-1 text-center">
                      <input
                        type="text"
                        value={it.hsnCode}
                        onChange={(e) => handleRowChange(it.id, "hsnCode", e.target.value)}
                        disabled={isLocked}
                        className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded-sm text-xs h-5.5 px-1"
                      />
                    </td>

                    <td className="py-0.5 px-1 text-center">
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => handleRowChange(it.id, "quantity", e.target.value)}
                        disabled={isLocked}
                        className={`w-full text-right bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded-sm text-xs h-5.5 px-1 font-bold ${numericInputClass}`}
                      />
                    </td>

                    <td className="py-0.5 px-1 text-center">
                      <input
                        type="number"
                        value={it.rate}
                        onChange={(e) => handleRowChange(it.id, "rate", e.target.value)}
                        disabled={isLocked}
                        className={`w-full text-right bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded-sm text-xs h-5.5 px-1 font-medium ${numericInputClass}`}
                      />
                    </td>

                    {/* 
                      Strict Directive: Inside Tax columns, stack tax percentage and absolute value: [Percentage]% \n (₹[Abs Value])
                    */}
                    {!isHaryana ? (
                      <td className="py-0.5 px-1 text-center text-slate-700">
                        <div className="flex flex-col leading-tight select-none font-sans">
                          <span className="font-semibold text-[10px]">18%</span>
                          <span className="text-[9px] text-slate-400 font-normal font-mono">(₹{rowTax.toFixed(1)})</span>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="py-0.5 px-1 text-center text-slate-700">
                          <div className="flex flex-col leading-tight select-none font-sans">
                            <span className="font-semibold text-[10px]">9%</span>
                            <span className="text-[9px] text-slate-400 font-normal font-mono">(₹{(rowTax / 2).toFixed(1)})</span>
                          </div>
                        </td>
                        <td className="py-0.5 px-1 text-center text-slate-700">
                          <div className="flex flex-col leading-tight select-none font-sans">
                            <span className="font-semibold text-[10px]">9%</span>
                            <span className="text-[9px] text-slate-400 font-normal font-mono">(₹{(rowTax / 2).toFixed(1)})</span>
                          </div>
                        </td>
                      </>
                    )}

                    <td className="py-0.5 px-1 text-right text-slate-800 pr-1 select-none font-bold">₹{rowSubtotal.toFixed(1)}</td>
                    <td className="py-0.5 px-1 text-right text-indigo-700 pr-1 select-none font-bold bg-indigo-50/10">₹{rowAdjustedTotal.toFixed(1)}</td>

                    <td className="py-0.5 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(it.id)}
                        disabled={isLocked}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-600 disabled:opacity-30 border-none bg-transparent cursor-pointer"
                        title="Delete line"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {lineItems.length === 0 && (
                <tr>
                  <td colSpan={!isHaryana ? 9 : 10} className="py-7 text-center italic text-slate-400 font-sans">
                    No items defined. Click bottom button to insert.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action button toolbar */}
        <div className="h-8 shrink-0 bg-slate-50 border-t border-slate-200 px-3 flex items-center justify-between" id="condition-b-actions-bar">
          <button
            type="button"
            onClick={handleAddLineRow}
            disabled={isLocked}
            className="h-5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 text-indigo-700 rounded-sm px-2 text-[10px] uppercase font-bold tracking-wider cursor-pointer flex items-center justify-center gap-1 shrink-0"
          >
            <Plus size={10} className="stroke-[2.5]" />
            <span>Add Row Entry</span>
          </button>
        </div>
      </div>

      {/* 
        Strict Directives:
        - Rename labels to "Discount", "Freight", "Adj Total"
        - Format summary lines to mimic Freight and Discount input fields visually
        - Apply uniform typography to all label elements
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-sm p-2 shrink-0 font-sans" id="condition-b-financial-summary">
        {/* 1. Freight Additions Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Freight (₹)</label>
          <input
            type="number"
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
            disabled={isLocked}
            className={`h-6 bg-white border border-slate-300 rounded-[1px] px-1.5 text-xs text-right font-mono font-bold hover:border-slate-400 focus:border-indigo-500 outline-none ${numericInputClass}`}
            placeholder="Freight amount"
          />
        </div>

        {/* 2. Discount Additions Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Discount (₹)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            disabled={isLocked}
            className={`h-6 bg-white border border-slate-300 rounded-[1px] px-1.5 text-xs text-right font-mono font-bold hover:border-slate-400 focus:border-indigo-500 outline-none ${numericInputClass}`}
            placeholder="Discount amount"
          />
        </div>

        {/* 3. Subtotal Without Taxes */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Total Excl. Taxes (₹)</label>
          <div className="h-6 bg-slate-100 border border-slate-300 rounded-[1px] px-1.5 text-xs font-mono font-bold text-slate-600 flex items-center justify-end select-none">
            ₹{basicSum.toFixed(2)}
          </div>
        </div>

        {/* 4. Master Total With Taxes */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Total Incl. Taxes (₹)</label>
          <div className="h-6 bg-indigo-50 border border-indigo-200 rounded-[1px] px-1.5 text-xs font-mono font-bold text-indigo-700 flex items-center justify-end select-none">
            ₹{totalWithTax.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
