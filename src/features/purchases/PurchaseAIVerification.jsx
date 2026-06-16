import React, { useState, useEffect } from "react";
import { Loader2, GripVertical, FileText, CheckCircle2, X } from "lucide-react";
import { extractInvoiceAI } from "../../services/purchaseService";
import PurchaseCreateForm from "./PurchaseCreateForm";

/**
 * PurchaseAIVerification Component
 * Handles Phase 7 AI Invoice Bot Workflow:
 * 1. Takes the uploaded file and triggers simulated OCR extraction with a heavy artificial delay (~2.5 seconds).
 * 2. Displays a custom high-visibility "Processing Document" pulsing progress overlay.
 * 3. Switches to a split-screen layout (35% Left / 65% Right) with a draggable resize divider.
 * 4. Left Pane: Source Document viewer (stylized layout scan matrix representing the uploaded vendor paper invoice).
 * 5. Right Pane: Embeds the manual data entry form pre-filled with the extracted AI dataset.
 */
export default function PurchaseAIVerification({
  isOpen,
  file,
  onClose,
  onSaveSuccess
}) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [aiStep, setAiStep] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);

  // Split-screen width configuration (left pane percentage width, defaults to 35%)
  const [leftWidth, setLeftWidth] = useState(35);

  useEffect(() => {
    if (!isOpen || !file) return;

    let progressInterval;
    let labelTimeout1;
    let labelTimeout2;
    let labelTimeout3;

    async function runAIExtractionTimeline() {
      setIsProcessing(true);
      setAiProgress(0);
      setAiStep(0);

      // Natural increment simulator for the progress bar
      progressInterval = setInterval(() => {
        setAiProgress((prev) => {
          if (prev >= 98) {
            clearInterval(progressInterval);
            return 98;
          }
          return prev + 1;
        });
      }, 25);

      // Sub-timeline steps simulating individual CV agents
      labelTimeout1 = setTimeout(() => setAiStep(1), 600);
      labelTimeout2 = setTimeout(() => setAiStep(2), 1200);
      labelTimeout3 = setTimeout(() => setAiStep(3), 1800);

      try {
        // Run service-side simulated delay and parsing Engine
        const data = await extractInvoiceAI(file);
        
        clearInterval(progressInterval);
        setAiProgress(100);

        // Pre-populate data structures
        setExtractedData(data);

        // Give a tiny 300ms transition buffer for finalization
        setTimeout(() => {
          setIsProcessing(false);
        }, 300);

      } catch (err) {
        console.error("AI Document Verification failed:", err);
        clearInterval(progressInterval);
        alert("OCR Scan failed. Defaulting to empty draft workspace.");
        setIsProcessing(false);
      }
    }

    runAIExtractionTimeline();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(labelTimeout1);
      clearTimeout(labelTimeout2);
      clearTimeout(labelTimeout3);
    };
  }, [isOpen, file]);

  // Handle panel scaling on mouse drag
  const handleSeparatorMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const totalWidth = window.innerWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newPercent = startWidth + (deltaX / totalWidth) * 100;
      if (newPercent < 15) newPercent = 15;
      if (newPercent > 70) newPercent = 70;
      setLeftWidth(newPercent);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-2 select-none" id="ai-verification-root">
      
      {/* 1. Progress / Processing State Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-4" id="ai-processing-dialog">
          <div className="bg-slate-900 p-6 rounded-sm border border-slate-800 shadow-2xl max-w-sm w-full flex flex-col gap-4 text-center">
            <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Analyzing Document via AI</h3>
              <p className="text-[10px] text-indigo-400 font-mono">Running OCR computer-vision pipeline</p>
            </div>

            {/* Pulsing Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 transition-all duration-300 rounded-full ease-out"
                style={{ width: `${aiProgress}%` }}
              />
            </div>

            {/* Stepped Log Entries */}
            <div className="h-5 text-center text-[10px] text-slate-400 transition-all font-mono">
              {aiStep === 0 && <span>Analyzing Document Layout Matrix...</span>}
              {aiStep === 1 && <span className="text-amber-400">Scanning Vendor Header Registry...</span>}
              {aiStep === 2 && <span className="text-emerald-400">Extracting Dense Invoice Rows & HSN Codes...</span>}
              {aiStep === 3 && <span className="text-indigo-400">Performing State Taxation Boundary Audit...</span>}
            </div>
          </div>
        </div>
      )}

      {/* 2. Standard Split Pane Workspace */}
      <div className="bg-slate-100 flex flex-col w-full h-full border border-slate-300 shadow-2xl overflow-hidden rounded-[4px] relative" id="ai-workspace-container">
        
        {/* Global Toolbar Header */}
        <div className="h-8 shrink-0 bg-slate-900 px-3 flex items-center justify-between font-sans border-b border-slate-950 text-white" id="ai-workspace-header">
          <div className="flex items-center gap-2">
            <FileText className="text-slate-400" size={14} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
              AI Invoice Extracted Record Validation Workspace
            </span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer border-none bg-transparent p-0 flex items-center justify-center shrink-0"
            id="btn-close-verification"
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Content View divided by resizer */}
        <div className="flex-1 flex overflow-hidden min-h-0" id="ai-split-screen-body">
          
          {/* LEFT PANEL: Document Viewer */}
          <div 
            style={{ width: `${leftWidth}%` }} 
            className="bg-slate-200/90 border-r border-slate-300/80 flex flex-col p-2.5 overflow-auto select-none font-sans relative"
            id="ai-pdf-doc-viewer"
          >
            <div className="flex items-center justify-between mb-2 border-b border-slate-300 pb-1.5 shrink-0">
              <span className="text-[10px] uppercase tracking-wide font-bold text-slate-500 font-mono">Source Scan: {file?.name || "AI-INVOICE.pdf"}</span>
              <span className="text-[9px] px-1 bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-[2px] font-mono shrink-0">CV Match 99%</span>
            </div>

            {/* Stylized physical invoice preview model */}
            <div className="bg-white rounded-sm border border-slate-300 shadow-md p-4 flex flex-col gap-3 leading-none text-xs text-slate-800 mx-auto aspect-[1/1.41] max-w-[420px] w-full" id="doc-scanned-mockup">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2 relative">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[13px] tracking-tight uppercase text-indigo-900 leading-tight">Vardhman Yarns & Threads</span>
                  <span className="text-[8px] text-slate-400 font-mono uppercase">Mill: Industrial Area-A, Ludhiana, Punjab</span>
                  <span className="text-[8px] font-mono mt-0.5 text-slate-500">GSTIN: 03OOOBV1122W1Z4</span>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <span className="font-bold text-[10px] tracking-wider text-slate-400 font-mono">TAX INVOICE</span>
                  <span className="text-[9px] font-mono font-bold text-slate-700">INV: {extractedData?.invoiceNumber || "AI-INV-XXXX"}</span>
                  <span className="text-[9px] font-mono text-slate-500">Date: {extractedData?.purchaseDate || "DD/MM/YYYY"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[8px] pb-1.5 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wide">Consigned to:</span>
                  <span className="font-semibold text-slate-800">Fabrito Fabrics LLP</span>
                  <span className="text-slate-500">Facility G-304, Pyare Lal Complex</span>
                  <span className="text-slate-500">Panipat, Haryana</span>
                  <span className="font-semibold text-slate-600 font-mono">GSTIN: 06AAKFF3456I1Z2</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right font-mono text-slate-505">
                  <div>PO Ref: <span className="text-slate-700 font-semibold">{extractedData?.poNumber || "PO-XXXX"}</span></div>
                  <div>Discount Code: <span className="text-rose-500">₹{extractedData?.overallDiscount || "0.00"}</span></div>
                  <div>Freight Out: <span className="text-slate-705">₹{extractedData?.freight || "0.00"}</span></div>
                </div>
              </div>

              {/* Items List inside PDF preview */}
              <div className="flex-1 overflow-hidden" id="doc-scanned-items-box">
                <table className="w-full text-left text-[8.5px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500 h-6">
                      <th className="py-0.5 px-1 w-[45%]">Item name</th>
                      <th className="py-0.5 px-0.5 text-center">HSN</th>
                      <th className="py-0.5 px-0.5 text-center">Qty</th>
                      <th className="py-0.5 px-0.5 text-right">Rate</th>
                      <th className="py-0.5 px-0.5 text-right">Disc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {extractedData?.items?.map((it, idx) => (
                      <tr key={it.rowId || idx} className="h-6.5">
                        <td className="py-0.5 px-1 font-sans font-semibold text-slate-800 truncate">{it.itemName}</td>
                        <td className="py-0.5 px-0.5 text-center text-slate-450">{it.hsnCode}</td>
                        <td className="py-0.5 px-0.5 text-center font-bold">{it.quantity} {it.uom}</td>
                        <td className="py-0.5 px-0.5 text-right">₹{Number(it.rate).toFixed(2)}</td>
                        <td className="py-0.5 px-0.5 text-right text-rose-500">₹{Number(it.itemDiscount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Highlight Note */}
              <div className="bg-amber-50 border border-amber-200 text-[8px] text-amber-700 p-1.5 rounded-sm flex gap-1 font-sans select-none leading-normal shadow-xs mt-auto">
                <span className="font-bold">AI Bot Audit:</span>
                <span>Verified state routing for Inter-state GST (18% IGST Punjab to Haryana). Line totals are computed live.</span>
              </div>
            </div>
          </div>

          {/* DRAGGABLE DIVIDER (RESIZER) */}
          <div 
            onMouseDown={handleSeparatorMouseDown}
            className="w-1.5 h-full bg-slate-200 hover:bg-slate-300 active:bg-slate-400 cursor-col-resize flex items-center justify-center transition-colors group z-20"
            title="Drag to resize panes"
            id="ai-resizer-bar"
          >
            <GripVertical size={12} className="text-slate-400 group-hover:text-slate-600" />
          </div>

          {/* RIGHT PANEL: Data Entry Form */}
          <div 
            style={{ width: `${100 - leftWidth}%` }} 
            className="flex-1 flex flex-col min-h-0 bg-white"
            id="ai-form-fields-view"
          >
            {extractedData && (
              <PurchaseCreateForm
                isOpen={true}
                isEmbedded={true}
                onClose={onClose}
                editingPurchase={extractedData}
                onSaveSuccess={onSaveSuccess}
              />
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
