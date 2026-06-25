import React from "react";
import { PanelLeftOpen, ChevronDown, ChevronUp } from "lucide-react";

/**
  * SalesContextHeader Component
  * Extracted from MappingLedgerGrid.jsx
  */
export default function SalesContextHeader({
  isLeftPaneOpen,
  onToggleLeftPane,
  customer,
  paymentTerms,
  transporter,
  freight,
  salesLValue,
  setSalesLValue,
  isHeaderExpanded,
  setIsHeaderExpanded,
  billTo,
  shipTo,
  isSameAsBillTo,
  setIsSameAsBillTo,
  headerRef,
  handleCustomerChange,
  handlePaymentTermsChange,
  handleTransporterChange,
  handleFreightChange,
  handleBillToChange,
  handleShipToChange
}) {
  return (
    <div 
      ref={headerRef}
      className="bg-slate-50 border border-slate-200 rounded-sm p-2 mb-1.5 shrink-0 flex flex-col relative cursor-pointer transition-all" 
      id="sales-context-header"
    >
      {/* Row 1 (Always Visible) */}
      <div 
        className="flex items-start gap-2 w-full pr-8"
        onClick={() => setIsHeaderExpanded(true)}
      >
        {!isLeftPaneOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLeftPane();
            }}
            className="mt-[13px] h-6 w-6 rounded-xs border border-slate-300 hover:bg-slate-105 hover:text-indigo-600 transition-colors bg-white cursor-pointer shrink-0 flex items-center justify-center text-slate-500"
            title="Expand Reference Panel"
          >
            <PanelLeftOpen size={12} className="stroke-[2.5]" />
          </button>
        )}

        <div className="flex-1 flex items-start gap-2 min-w-0">
          {/* Customer */}
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Customer</label>
            <select
              value={customer}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1 bg-white focus:border-indigo-500 focus:outline-none cursor-pointer w-full text-slate-800"
            >
              <option value="Standard Customer">Standard Customer</option>
              <option value="Apex Textiles">Apex Textiles</option>
              <option value="Trident Group">Trident Group</option>
              <option value="Loom & Co">Loom & Co</option>
            </select>
          </div>

          {/* Payment Terms */}
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Payment Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => handlePaymentTermsChange(e.target.value)}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none w-full text-slate-800"
            />
          </div>

          {/* Transporter Name */}
          <div className="flex flex-col flex-1 min-w-0">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Transporter Name</label>
            <input
              type="text"
              value={transporter}
              onChange={(e) => handleTransporterChange(e.target.value)}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none w-full text-slate-800"
            />
          </div>

          {/* Freight Terms */}
          <div className="flex flex-col w-24 shrink-0">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Freight Terms</label>
            <input
              type="text"
              value={freight}
              onChange={(e) => handleFreightChange(e.target.value)}
              className="h-6 text-[11px] border border-slate-300 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none w-full text-slate-800"
            />
          </div>

          {/* Sales L-Value */}
          <div className="flex flex-col w-24 shrink-0">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Sales L-Value</label>
            <input
              type="number"
              value={salesLValue}
              onChange={(e) => setSalesLValue(Number(e.target.value) || 0)}
              className="h-6 text-[11px] border border-indigo-200 bg-indigo-50/50 rounded-xs px-1.5 focus:border-indigo-500 focus:outline-none font-bold font-mono text-indigo-700 w-full"
            />
          </div>
        </div>
      </div>

      {/* Chevron Toggle Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsHeaderExpanded(!isHeaderExpanded);
        }}
        className="absolute top-1.5 right-2 h-5 w-5 flex items-center justify-center text-slate-400 hover:text-slate-600 z-10"
        title={isHeaderExpanded ? "Collapse Details" : "Expand Details"}
      >
        {isHeaderExpanded ? <ChevronUp size={14} className="stroke-[2.5]" /> : <ChevronDown size={14} className="stroke-[2.5]" />}
      </button>

      {/* Row 2 (Collapsible Bill To & Ship To) */}
      {isHeaderExpanded && (
        <div 
          className="grid grid-cols-2 gap-4 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bill To */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Bill To</label>
            <textarea
              rows={2}
              value={billTo}
              onChange={(e) => handleBillToChange(e.target.value)}
              className="resize-y min-h-[40px] max-h-[100px] text-xs p-1 outline-none border border-slate-300 focus:border-indigo-500 rounded-sm bg-white text-slate-800"
            />
          </div>

          {/* Ship To */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[9px] uppercase font-bold text-slate-500">Ship To</label>
              <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSameAsBillTo}
                  onChange={(e) => setIsSameAsBillTo(e.target.checked)}
                  className="rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                />
                Same as Bill to
              </label>
            </div>
            <textarea
              rows={2}
              value={shipTo}
              onChange={(e) => handleShipToChange(e.target.value)}
              disabled={isSameAsBillTo}
              className="resize-y min-h-[40px] max-h-[100px] text-xs p-1 outline-none border border-slate-300 focus:border-indigo-500 rounded-sm bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
