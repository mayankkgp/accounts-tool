import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import InwardingDocumentPane from "./InwardingDocumentPane";
import LedgerLookupHeader from "./LedgerLookupHeader";
import ConditionAInventory from "./ConditionAInventory";
import ConditionBDrafting from "./ConditionBDrafting";
import { saveSalesRequest } from "../../services/salesService";

/**
 * 2.3 Finance Cost Inwarding Workspace.
 * Full-width split-pane screen for staging ledger components.
 * Restructured with enhanced UI/UX consistency, dynamic taxes,
 * and unified headers/footers.
 */
export default function CostInwardingWorkspace({ req, onClose, onRefresh }) {
  // 1. Initial State Syncing across each invoice tab
  const [invoiceQueue, setInvoiceQueue] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [leftWidth, setLeftWidth] = useState(35);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(true);

  useEffect(() => {
    if (!req) return;
    
    // Fallback if no invoices attached
    const bills = req.proofs?.purchaseInvoices && req.proofs.purchaseInvoices.length > 0
      ? req.proofs.purchaseInvoices
      : [{ filename: "Simulated_Vendor_Invoice.pdf" }];

    // Prepare fresh rich state object for each item in queue to retain work
    const prepared = bills.map((bill, index) => {
      // Rotate basic defaults to show varied demo data
      let defaultVendor = "Trident Group";
      let defaultLValue = 240;
      if (index === 1) {
        defaultVendor = "DEEPSHIKHA FASHIONS";
        defaultLValue = 180;
      } else if (index === 2) {
        defaultVendor = "Loom & Co Dyeing Unit";
        defaultLValue = 150;
      }

      return {
        id: index,
        filename: bill.filename,
        vendor: defaultVendor,
        invoiceNo: bill.filename,
        lValue: defaultLValue,
        isMatched: false,
        matchedItems: [],
        selectedRowIds: [],
        draftedLineItems: [
          { id: 1, itemName: "Premium Cotton Greige Fabric", hsnCode: "520512", quantity: 200, rate: 160 },
          { id: 2, itemName: "Double Ply Weave Slub Yarn", hsnCode: "550921", quantity: 150, rate: 95 }
        ],
        freight: 1200,
        discount: 400,
        label: "Greige",
        stageStatus: "Pending", // "Pending" | "Staged" | "Skipped"
        isStagingLoading: false
      };
    });
    setInvoiceQueue(prepared);
    setActiveIdx(0);
  }, [req]);

  // Active Context shortcut
  const activeInvoice = invoiceQueue[activeIdx];

  const updateActiveInvoice = (fields) => {
    setInvoiceQueue(prev => prev.map((item, idx) => {
      if (idx === activeIdx) {
        return { ...item, ...fields };
      }
      return item;
    }));
  };

  const handleSearchLedger = () => {
    if (!activeInvoice) return;
    const invIdQuery = (activeInvoice.invoiceNo || "").trim().toLowerCase();
    
    // Query simulated inventory from localStorage
    const masterInv = JSON.parse(localStorage.getItem("fabrito_inventory") || "[]");
    const matched = masterInv.filter(item => {
      const dbId = (item.invoiceID || "").toLowerCase();
      return dbId === invIdQuery || dbId.includes(invIdQuery);
    });

    if (matched.length > 0) {
      updateActiveInvoice({
        isMatched: true,
        matchedItems: matched,
        selectedRowIds: [] // Strictly empty array on search match, absolutely no checkboxes checked by default
      });
    } else {
      updateActiveInvoice({
        isMatched: false,
        matchedItems: []
      });
    }
  };

  const handleStageInvoice = async () => {
    if (!activeInvoice) return;
    updateActiveInvoice({ isStagingLoading: true });
    
    // Strict 600ms promise delay constraint
    await new Promise(r => setTimeout(r, 600));

    updateActiveInvoice({
      stageStatus: "Staged",
      isStagingLoading: false
    });
  };

  const handleSkipInvoice = () => {
    updateActiveInvoice({ stageStatus: "Skipped" });
  };

  const handleUnstageEdit = () => {
    updateActiveInvoice({ stageStatus: "Pending" });
  };

  // Draggable separator handler
  const handleSeparatorMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPercent = leftWidth;
    const totalWidth = window.innerWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newPercent = startPercent + (deltaX / totalWidth) * 100;
      if (newPercent < 15) newPercent = 15;
      if (newPercent > 75) newPercent = 75;
      setLeftWidth(newPercent);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Check if every tab is marked Staged or Skipped
  const isProceedActive = invoiceQueue.length > 0 && invoiceQueue.every(t => t.stageStatus !== "Pending");

  const handleSaveAndFulfilled = async () => {
    if (!isProceedActive) return;
    setIsSubmittingAll(true);
    try {
      // Transition sales request status to Fulfilled on success
      const updated = {
        ...req,
        status: "Fulfilled"
      };
      await saveSalesRequest(updated);
      onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAll(false);
    }
  };

  if (!req || !activeInvoice) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 z-40 select-none" id="cost-inwarding-root">
      <div className="bg-slate-100 flex flex-col w-full h-full border border-slate-300 shadow-2xl overflow-hidden rounded-[4px] relative" id="cost-inwarding-viewport">
        {/* Main padded workspace container */}
        <div className="flex-1 flex flex-col p-2 gap-2 min-h-0 relative select-none">
          {/* 
            Strict Directive 1: Global Workspace Header perfectly matching the Triage screen.
            h-8 bg-white border border-slate-200 shadow-xs rounded-sm px-2.5 flex items-center justify-between shrink-0 select-none
          */}
          <div className="h-8 shrink-0 bg-white border border-slate-200 shadow-xs rounded-sm px-2.5 flex items-center justify-between text-slate-800 font-sans text-xs select-none" id="inwarding-master-header">
            {/* Left Side: Back Button + Request ID + Status Badge */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-5 px-1.5 rounded-sm border border-slate-250 hover:bg-slate-50 text-slate-700 font-medium transition-colors bg-white flex items-center gap-1 cursor-pointer animate-fade-in"
                id="btn-triage-back"
              >
                <ArrowLeft size={10} className="stroke-[3]" />
                <span className="text-[10px] font-sans">Back</span>
              </button>
              <span className="text-slate-300 select-none">|</span>
              <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.2 rounded-xs">
                {req.id}
              </span>
              <span className={`text-[10px] font-sans font-semibold tracking-wide border px-1.5 py-0.2 rounded-xs uppercase ${
                req.status === "Invoice Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                req.status === "Needs Correction" ? "bg-rose-50 text-rose-705 border-rose-200" :
                req.status === "Settlement Pending" ? "bg-indigo-50 text-indigo-750 border-indigo-200" :
                "bg-emerald-50 text-emerald-705 border-emerald-200"
              }`}>
                {req.status || "Invoice Pending"}
              </span>
            </div>

            {/* Right Side: Primary CTA "Proceed to Mapping" */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSaveAndFulfilled}
                disabled={!isProceedActive || isSubmittingAll}
                className="h-6 px-4 bg-slate-900 text-slate-100 hover:bg-slate-800 font-bold rounded-sm border-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-1 text-[10px]"
                id="btn-confirm-stage-mapping"
              >
                {isSubmittingAll ? (
                  <>
                    <Loader2 size={10} className="animate-spin text-slate-400" />
                    <span>Committing...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Mapping</span>
                    <ArrowRight size={10} className="stroke-[3] text-indigo-400 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Split Screen Body */}
          <div className="flex-1 flex overflow-hidden min-h-0" id="inwarding-workspace-pane-layout">
            {/* Left Canvas (Document Viewer Sub-component occupies leftWidth %) */}
            {isLeftPaneOpen && (
              <>
                <div style={{ width: `${leftWidth}%` }} className="flex flex-col select-none min-h-0 shrink-0">
                  <InwardingDocumentPane 
                    req={req} 
                    defaultActiveFile={activeInvoice} 
                    activeIdx={activeIdx}
                    setActiveIdx={setActiveIdx}
                    onCollapse={() => setIsLeftPaneOpen(false)}
                  />
                </div>

                {/* Separation Resizer Bar */}
                <div
                  onMouseDown={handleSeparatorMouseDown}
                  className="w-1 h-full bg-slate-205 hover:bg-indigo-300 active:bg-indigo-500 cursor-col-resize flex items-center justify-center transition-colors group z-20"
                  title="Drag resizer bar"
                >
                  <span className="w-0.5 h-6 bg-slate-350 group-hover:bg-indigo-600 transition-colors rounded-xs" />
                </div>
              </>
            )}

            {/* Right Workspace - Fills Remainder */}
            <div style={{ width: isLeftPaneOpen ? `${100 - leftWidth}%` : "100%" }} className="flex-1 flex flex-col min-h-0 bg-white p-2 shrink-0 border border-slate-200 rounded-sm">
              {/* Header section sitting inline */}
              <LedgerLookupHeader
                vendor={activeInvoice.vendor}
                setVendor={v => updateActiveInvoice({ vendor: v })}
                invoiceNo={activeInvoice.invoiceNo}
                setInvoiceNo={i => updateActiveInvoice({ invoiceNo: i })}
                lValue={activeInvoice.lValue}
                setLValue={l => updateActiveInvoice({ lValue: Number(l) })}
                label={activeInvoice.label}
                setLabel={l => updateActiveInvoice({ label: l })}
                isLocked={activeInvoice.stageStatus !== "Pending"}
                onSearch={handleSearchLedger}
                isSearching={activeInvoice.isStagingLoading}
                isLeftPaneOpen={isLeftPaneOpen}
                onToggleLeftPane={() => setIsLeftPaneOpen(true)}
              />

            {/* Split Condition check block */}
            <div className="flex-1 overflow-y-auto my-2 min-h-0" id="condition-renderer-wrapper">
              {activeInvoice.isMatched ? (
                <ConditionAInventory
                  items={activeInvoice.matchedItems}
                  selectedRowIds={activeInvoice.selectedRowIds}
                  onToggleSelectRow={id => {
                    const current = activeInvoice.selectedRowIds;
                    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
                    updateActiveInvoice({ selectedRowIds: next });
                  }}
                  onToggleSelectAll={() => {
                    const allIds = activeInvoice.matchedItems.map(m => m.itemId);
                    const isAll = activeInvoice.selectedRowIds.length === allIds.length;
                    updateActiveInvoice({ selectedRowIds: isAll ? [] : allIds });
                  }}
                  isLocked={activeInvoice.stageStatus !== "Pending"}
                />
              ) : (
                <ConditionBDrafting
                  vendor={activeInvoice.vendor}
                  lineItems={activeInvoice.draftedLineItems}
                  setLineItems={items => updateActiveInvoice({ draftedLineItems: items })}
                  freight={activeInvoice.freight}
                  setFreight={f => updateActiveInvoice({ freight: Number(f) })}
                  discount={activeInvoice.discount}
                  setDiscount={d => updateActiveInvoice({ discount: Number(d) })}
                  isLocked={activeInvoice.stageStatus !== "Pending"}
                />
              )}
            </div>

            {/* 
              Strict Directive 5: Right Pane Footer perfectly matching Triage light sticky footer design.
              border-t border-slate-150 pt-2.5 flex items-center justify-between shrink-0 select-none gap-2 bg-white
              Completely remove any text indicating "Req Status".
            */}
            <div className="border-t border-slate-150 pt-2.5 flex items-center justify-between shrink-0 select-none gap-2 bg-white text-slate-800 font-sans" id="inwarding-sticky-footer">
              {/* Item Staging Status ONLY (Strictly no "Req Status" representation) */}
              <div className="flex items-center gap-1.5 select-none branding-rail font-sans text-[10px] uppercase tracking-wider">
                <span className="text-slate-500 font-bold">Item Staging Status:</span>
                <span className={`border px-1.5 py-0.5 select-none leading-none font-bold rounded-xs ${
                  activeInvoice.stageStatus === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  activeInvoice.stageStatus === "Staged" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  "bg-slate-50 text-slate-600 border-slate-200"
                }`}>
                  {activeInvoice.stageStatus}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 select-none" id="sticky-footer-cta-group">
                {activeInvoice.stageStatus === "Pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSkipInvoice}
                      disabled={activeInvoice.isStagingLoading}
                      className="h-6 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm text-[10px] font-bold tracking-wider cursor-pointer transition-all uppercase"
                    >
                      Skip/Exempt from Costing
                    </button>
                    <button
                      type="button"
                      onClick={handleStageInvoice}
                      disabled={activeInvoice.isStagingLoading}
                      className="h-6 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-sm font-bold border-none text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-all"
                      id="btn-stage-active-doc"
                    >
                      {activeInvoice.isStagingLoading ? (
                        <>
                          <Loader2 size={11} className="animate-spin text-white" />
                          <span>STAGING INVOICE (600ms)...</span>
                        </>
                      ) : (
                        <span>
                          {activeInvoice.isMatched ? "Stage Selected Items" : "Stage Drafted Items"}
                        </span>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleUnstageEdit}
                    className="h-6 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-sm font-bold border-none text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                    id="btn-unstage-edit"
                  >
                    Unstage / Edit Items
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
  );
}
