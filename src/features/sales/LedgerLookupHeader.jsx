import React from "react";
import { Search } from "lucide-react";

// Common list of fallback vendor options
const defaultVendors = [
  "Trident Group",
  "Arvind Mills",
  "Loom & Co Dyeing Unit",
  "Vogue Garments",
  "Mysore Silk Board Vendor",
  "Shree Textiles",
  "DEEPSHIKHA FASHIONS",
  "Arvind Textiles"
];

const labelsList = ["Finished", "Greige", "RFD", "Yarn", "Jobwork"];

/**
 * Compact form header for cost inwarding. Contains ledger lookups and metadata parameters inline.
 */
export default function LedgerLookupHeader({
  vendor,
  setVendor,
  invoiceNo,
  setInvoiceNo,
  lValue,
  setLValue,
  label,
  setLabel,
  isLocked,
  onSearch,
  isSearching,
  companies = []
}) {
  const currentVendors = companies.length > 0 ? companies : defaultVendors;

  // Handle keypress enter on the invoice input to trigger immediate search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-sm p-2 flex flex-col gap-2 shrink-0 font-sans text-xs select-none shadow-xs" id="ledger-lookup-header-container">
      {/* 
        Strict Directive: Completely delete the "lookup triggers..." subheader text.
        Always retains the isLocked badge cleanly if locked.
      */}
      {isLocked && (
        <div className="flex justify-end select-none">
          <span className="text-[9px] px-1 bg-green-50 text-green-700 font-bold border border-green-200 rounded-[2px]" id="status-context-locked">
            MATCHED LEDGER - CONTEXT LOCKED
          </span>
        </div>
      )}

      {/* 
        Strict Directive: "Vendor Entity", "Invoice No", "Invoice Label" (Dropdown), and "L-Value" sitting inline.
      */}
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        {/* 1. Vendor Entity Dropdown Selector */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Vendor Entity *</label>
          <select
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            disabled={isLocked || isSearching}
            className="w-full h-6 bg-white border border-slate-300 rounded-[1px] px-1 text-xs font-semibold hover:border-slate-400 focus:border-indigo-500 outline-none select-none"
            id="lookup-select-vendor"
          >
            <option value="">-- Choose Vendor --</option>
            {currentVendors.map((vend, idx) => (
              <option key={idx} value={vend}>{vend}</option>
            ))}
          </select>
        </div>

        {/* 2. Invoice Number Input */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Invoice No *</label>
          <div className="relative">
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLocked || isSearching}
              className="w-full h-6 bg-white border border-slate-300 rounded-[1px] pl-1 pr-6 text-xs text-slate-800 leading-tight outline-none focus:border-indigo-500 font-semibold"
              placeholder="e.g. PI_Trident_441.pdf"
              id="lookup-input-invoice"
            />
            <button
              type="button"
              onClick={onSearch}
              disabled={isSearching}
              className="absolute right-0 top-0 h-6 w-6 bg-slate-100 hover:bg-slate-205 border-l border-slate-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
              title="Click to search ledger"
            >
              <Search size={11} className="text-slate-550 shrink-0" />
            </button>
          </div>
        </div>

        {/* 3. Invoice Label (Dropdown selector sits inline) */}
        <div className="flex-1 min-w-[90px] flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Invoice Label *</label>
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isLocked || isSearching}
            className="w-full h-6 bg-white border border-slate-300 rounded-[1px] px-1 text-xs font-semibold outline-none focus:border-indigo-500"
          >
            {labelsList.map((lbl, idx) => (
              <option key={idx} value={lbl}>{lbl}</option>
            ))}
          </select>
        </div>

        {/* 4. L-Value Input (Strictly constrained width to match single-line label) */}
        <div className="w-14 flex flex-col gap-1 shrink-0">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider whitespace-nowrap">L-Value *</label>
          <input
            type="number"
            min={0}
            max={500}
            value={lValue}
            onChange={(e) => setLValue(e.target.value)}
            disabled={isLocked || isSearching}
            className={`w-full h-6 px-1 border border-slate-300 rounded-[1px] outline-none text-right font-mono font-bold hover:border-slate-400 focus:border-indigo-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] ${
              isLocked ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
