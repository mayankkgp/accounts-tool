import React, { useState, useEffect } from "react";
import InwardingDocumentPane from "./InwardingDocumentPane";
import LedgerLookupHeader from "./LedgerLookupHeader";
import ConditionAInventory from "./ConditionAInventory";
import ConditionBDrafting from "./ConditionBDrafting";
import CostInwardingHeader from "./CostInwardingHeader";
import CostInwardingFooter from "./CostInwardingFooter";
import FinanceMappingWorkspace from "./FinanceMappingWorkspace";
import { saveSalesRequest } from "../../services/salesService";

/**
 * 2.3 Finance Cost Inwarding Workspace.
 * Full-width split-pane screen for staging ledger components.
 * Restructured with enhanced UI/UX consistency, dynamic taxes,
 * and unified headers/footers.
 */
export default function CostInwardingWorkspace({ req, onClose, onRefresh, onProceedToMapping }) {
  // 1. Initial State Syncing across each invoice tab
  const [invoiceQueue, setInvoiceQueue] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [leftWidth, setLeftWidth] = useState(35);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(true);
  const [showMappingWorkspace, setShowMappingWorkspace] = useState(false);

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
    const masterInvRaw = JSON.parse(localStorage.getItem("fabrito_inventory") || "[]");
    const masterInv = Array.isArray(masterInvRaw)
      ? masterInvRaw
      : [
          ...(masterInvRaw.pendingInventory || []).map(item => ({
            itemId: item.id,
            itemName: item.item,
            availableQty: item.qty,
            hsnCode: item.hsnCode,
            invoiceID: item.invoice,
            invoiceDate: item.inwardDate,
            supplier: item.supplier,
            location: item.location || ""
          })),
          ...(masterInvRaw.reviewedInventory || []).map(item => ({
            itemId: item.id,
            itemName: item.item,
            availableQty: item.qty,
            hsnCode: item.hsnCode,
            invoiceID: item.invoice,
            invoiceDate: item.inwardDate,
            supplier: item.supplier,
            location: item.location || ""
          }))
        ];
    const matched = masterInv.filter(item => {
      const dbId = (item.invoiceID || "").toLowerCase();
      return dbId === invIdQuery || dbId.includes(invIdQuery);
    });

    if (matched.length > 0) {
      updateActiveInvoice({
        isMatched: true,
        matchedItems: matched,
        // Security constraint: Force user to explicitly select items upon a new ledger search; clear previous selections
        selectedRowIds: []
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
    // Pessimistic UI logic: Set active tab staging status to loading immediately to prevent duplicate submissions
    updateActiveInvoice({ isStagingLoading: true });
    
    // Strict 600ms promise delay constraint simulating asynchronous remote committing/indexing latency
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

  // Draggable separator handler with strict window-bounded layout limits
  const handleSeparatorMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPercent = leftWidth;
    const totalWidth = window.innerWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newPercent = startPercent + (deltaX / totalWidth) * 100;
      // Restrict left pane width between 15% and 75% to prevent complete UI collapse or overflow breaks
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

  const handleSaveProgress = async () => {
    try {
      const updated = {
        ...req,
        invoiceQueue: invoiceQueue
      };
      await saveSalesRequest(updated);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAndFulfilled = () => {
    if (!isProceedActive) return;
    if (onProceedToMapping) {
      onProceedToMapping();
    } else {
      setShowMappingWorkspace(true);
    }
  };

  if (showMappingWorkspace) {
    return (
      <FinanceMappingWorkspace
        req={req}
        onClose={() => setShowMappingWorkspace(false)}
        onRefresh={() => {
          onRefresh();
          onClose();
        }}
      />
    );
  }

  if (!req || !activeInvoice) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 relative font-sans text-xs select-none p-2 h-full gap-2" id="cost-inwarding-root">
      {/* Top-Level Master Header */}
      <CostInwardingHeader
        req={req}
        onClose={onClose}
        isSubmittingAll={isSubmittingAll}
        isProceedActive={isProceedActive}
        handleSaveAndFulfilled={handleSaveAndFulfilled}
        onSaveProgress={handleSaveProgress}
      />

      {/* Dynamic Split Screen Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-transparent items-stretch" id="inwarding-workspace-pane-layout">
        {/* Left Canvas (Document Viewer Sub-component occupies leftWidth %) */}
        {isLeftPaneOpen && (
          <>
            <div style={{ width: `${leftWidth}%` }} className="flex flex-col select-none min-h-0 shrink-0 h-full">
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
              className="w-1 h-full bg-slate-205 hover:bg-slate-300 active:bg-indigo-500 cursor-col-resize flex items-center justify-center transition-colors group z-20"
              title="Drag resizer bar"
            >
              <span className="w-0.5 h-6 bg-slate-350 group-hover:bg-indigo-600 transition-colors rounded-xs" />
            </div>
          </>
        )}

        {/* Right Workspace - Fills Remainder */}
        <div style={{ width: isLeftPaneOpen ? `${100 - leftWidth}%` : "100%" }} className="flex-1 flex flex-col min-h-0 h-full bg-transparent pl-2.5 pr-0 py-0 shrink-0">
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

          {/* Sticky Footer */}
          <CostInwardingFooter
            activeInvoice={activeInvoice}
            handleSkipInvoice={handleSkipInvoice}
            handleStageInvoice={handleStageInvoice}
            handleUnstageEdit={handleUnstageEdit}
          />
        </div>
      </div>
    </div>
  );
}
