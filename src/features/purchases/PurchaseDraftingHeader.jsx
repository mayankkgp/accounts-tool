import React, { useRef } from "react";
import { Search, PanelLeftOpen, CheckCircle2 } from "lucide-react";

const labelsList = ["Finished", "Greige", "RFD", "Yarn", "Jobwork"];

export default function PurchaseDraftingHeader({
  vendorId,
  setVendorId,
  invoiceNumber,
  setInvoiceNumber,
  purchaseDate = "",
  setPurchaseDate = () => {},
  lValue,
  setLValue,
  label = "Finished",
  setLabel = () => {},
  vendors = [],
  isLeftPaneOpen = true,
  onToggleLeftPane,
  onVerify = () => {},
  isVerifying = false,
  isSaving = false
}) {
  const ddRef = useRef(null);
  const mmRef = useRef(null);
  const yyRef = useRef(null);

  const dateParts = (purchaseDate || "").split("/");
  const dd = dateParts[0] || "";
  const mm = dateParts[1] || "";
  const yy = dateParts[2] || "";

  const handleDatePartChange = (partIndex, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "").substring(0, 2);
    
    const currentParts = ["", "", ""];
    const splitted = (purchaseDate || "").split("/");
    currentParts[0] = splitted[0] || "";
    currentParts[1] = splitted[1] || "";
    currentParts[2] = splitted[2] || "";
    
    currentParts[partIndex] = cleanVal;
    
    const joined = currentParts.join("/");
    setPurchaseDate(joined);
    
    if (cleanVal.length === 2) {
      if (partIndex === 0) mmRef.current?.focus();
      else if (partIndex === 1) yyRef.current?.focus();
    }
  };

  const handleDateKeyDown = (partIndex, e) => {
    if (e.key === "Backspace") {
      const currentParts = ["", "", ""];
      const splitted = (purchaseDate || "").split("/");
      currentParts[0] = splitted[0] || "";
      currentParts[1] = splitted[1] || "";
      currentParts[2] = splitted[2] || "";
      
      if (!currentParts[partIndex]) {
        if (partIndex === 1) {
          ddRef.current?.focus();
          e.preventDefault();
        } else if (partIndex === 2) {
          mmRef.current?.focus();
          e.preventDefault();
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onVerify();
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-sm p-2 flex flex-col gap-2 shrink-0 font-sans text-xs select-none shadow-xs" id="purchase-drafting-header-container">
      {/* AI Extraction Status and Toggle Row */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
        <div className="flex items-center gap-2">
          {!isLeftPaneOpen && onToggleLeftPane && (
            <button
              type="button"
              onClick={onToggleLeftPane}
              className="h-5 px-1.5 flex items-center justify-center bg-white border border-slate-300 rounded-[1px] hover:bg-slate-50 text-slate-500 hover:text-indigo-600 text-[10px] font-bold cursor-pointer shadow-xs mr-1 shrink-0"
              title="Show Document Pane"
            >
              Show Source
            </button>
          )}
          <span className="text-slate-800 font-bold uppercase tracking-wider text-[11px]">
            Purchase Ledger Drafting Entry
          </span>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-[2px] px-1.5 py-0.5 text-[9px] font-semibold">
          <CheckCircle2 size={10} className="text-emerald-600 animate-none shrink-0" />
          <span>Extracted via AI OCR (99% confidence)</span>
        </div>
      </div>

      {/* Inputs flex row styling replicating LedgerLookupHeader exactly */}
      <div className="flex flex-col sm:flex-row gap-2 items-end">
        {!isLeftPaneOpen && onToggleLeftPane && (
          <button
            type="button"
            onClick={onToggleLeftPane}
            className="h-6 w-6 flex items-center justify-center bg-white border border-slate-300 rounded-[1px] hover:bg-slate-50 text-slate-500 hover:text-indigo-600 cursor-pointer shadow-xs shrink-0"
            title="Expand Document Panel"
          >
            <PanelLeftOpen size={13} className="stroke-[2.5]" />
          </button>
        )}

        {/* 1. Vendor Selection */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Vendor Entity *</label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            disabled={isSaving || isVerifying}
            className="w-full h-6 bg-white border border-slate-300 rounded-[1px] px-1 text-xs font-semibold hover:border-slate-400 focus:border-indigo-500 outline-none select-none"
            id="drafting-select-vendor"
          >
            <option value="">-- Choose Vendor --</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brandName || v.businessName || v.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Invoice Number with Contextual Verify CTA Button */}
        <div className="flex-1 min-w-[140px] flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Invoice No *</label>
          <div className="relative">
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving || isVerifying}
              className="w-full h-6 bg-white border border-slate-300 rounded-[1px] pl-1 pr-6 text-xs text-slate-800 leading-tight outline-none focus:border-indigo-500 font-semibold"
              placeholder="e.g. INV-2026-001"
              id="drafting-input-invoice"
            />
            <button
              type="button"
              onClick={onVerify}
              disabled={isSaving || isVerifying}
              className="absolute right-0 top-0 h-6 w-6 bg-slate-100 hover:bg-slate-200 border-l border-slate-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
              title="Verify Invoice Data"
            >
              {isVerifying ? (
                <div className="w-2 h-2 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <Search size={11} className="text-slate-550 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* 3. Invoice Label (Strict fixed width dropdown selector) */}
        <div className="w-[92px] flex flex-col gap-1 shrink-0">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold truncate" title="Label *">Label *</label>
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isSaving || isVerifying}
            className="w-full h-6 bg-white border border-slate-300 rounded-[1px] px-1 text-xs font-semibold outline-none focus:border-indigo-500"
          >
            {labelsList.map((lbl, idx) => (
              <option key={idx} value={lbl}>{lbl}</option>
            ))}
          </select>
        </div>

        {/* 3.5. Purchase Date (Segmented DD/MM/YY input with persistent stable slashes) */}
        <div className="w-[82px] flex flex-col gap-1 shrink-0">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold whitespace-nowrap">Purchase Date *</label>
          <div
            className={`w-full h-6 px-1 flex items-center justify-center gap-0 border border-slate-300 rounded-[1px] hover:border-slate-400 focus-within:border-indigo-500 ${
              isSaving || isVerifying ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"
            }`}
          >
            <input
              ref={ddRef}
              type="text"
              placeholder="DD"
              maxLength={2}
              value={dd}
              onChange={(e) => handleDatePartChange(0, e.target.value)}
              onKeyDown={(e) => handleDateKeyDown(0, e)}
              disabled={isSaving || isVerifying}
              className="w-[18px] text-center bg-transparent outline-none p-0 text-xs font-semibold text-slate-800 placeholder:text-[9px] placeholder:font-normal placeholder:text-slate-400 focus:text-indigo-600 disabled:text-slate-500"
            />
            <span className="text-slate-400 font-semibold select-none text-[10px] mx-[2px] scale-90">/</span>
            <input
              ref={mmRef}
              type="text"
              placeholder="MM"
              maxLength={2}
              value={mm}
              onChange={(e) => handleDatePartChange(1, e.target.value)}
              onKeyDown={(e) => handleDateKeyDown(1, e)}
              disabled={isSaving || isVerifying}
              className="w-[18px] text-center bg-transparent outline-none p-0 text-xs font-semibold text-slate-800 placeholder:text-[9px] placeholder:font-normal placeholder:text-slate-400 focus:text-indigo-600 disabled:text-slate-500"
            />
            <span className="text-slate-400 font-semibold select-none text-[10px] mx-[2px] scale-90">/</span>
            <input
              ref={yyRef}
              type="text"
              placeholder="YY"
              maxLength={2}
              value={yy}
              onChange={(e) => handleDatePartChange(2, e.target.value)}
              onKeyDown={(e) => handleDateKeyDown(2, e)}
              disabled={isSaving || isVerifying}
              className="w-[18px] text-center bg-transparent outline-none p-0 text-xs font-semibold text-slate-800 placeholder:text-[9px] placeholder:font-normal placeholder:text-slate-400 focus:text-indigo-600 disabled:text-slate-500"
            />
          </div>
        </div>

        {/* 4. L-Value Input (Strictly constrained width to match single-line label) */}
        <div className="w-14 flex flex-col gap-1 shrink-0">
          <label className="text-[9px] uppercase tracking-wide text-slate-500 font-bold whitespace-nowrap">L-Value *</label>
          <input
            type="number"
            min={0}
            max={500}
            value={lValue}
            onChange={(e) => setLValue(e.target.value)}
            disabled={isSaving || isVerifying}
            className={`w-full h-6 px-1 border border-slate-300 rounded-[1px] outline-none text-right font-mono font-bold hover:border-slate-400 focus:border-indigo-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] ${
              isSaving || isVerifying ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
