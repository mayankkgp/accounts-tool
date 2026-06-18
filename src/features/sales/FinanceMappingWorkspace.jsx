import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Maximize2, Minimize2 } from "lucide-react";
import MappingDocumentPane from "./MappingDocumentPane";
import MappingLedgerGrid from "./MappingLedgerGrid";
import MappingSlideOutDrawer from "./MappingSlideOutDrawer";
import MappingExecutionFooter from "./MappingExecutionFooter";
import { saveSalesRequest } from "../../services/salesService";

/**
 * FinanceMappingWorkspace Component (Phase 5 Master Component)
 * Utilizing strict 35/65 split resizer pane.
 */
export default function FinanceMappingWorkspace({ req, onClose, onRefresh }) {
  const [leftWidth, setLeftWidth] = useState(35);
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(true);
  const [salesItems, setSalesItems] = useState([]);
  const [unlinkedPurchases, setUnlinkedPurchases] = useState([]);
  const [drawerConfig, setDrawerConfig] = useState({ isOpen: false, mode: "purchase", parentId: null, parentName: "" });

  // Initialize structured mapping parent-child elements based on specs
  useEffect(() => {
    if (!req) return;

    // 1. Procedural parent sales items
    const specItems = [];
    if (req.id === "REQ-1001") {
      specItems.push(
        { id: "S1", itemName: "Premium Cotton Yarn 40s", quantity: 500, rate: 250, hsnCode: "", igst: 18, linkedCosts: [], isFoc: false },
        { id: "S2", itemName: "Poly Blend Fabric 30s", quantity: 300, rate: 180, hsnCode: "", igst: 12, linkedCosts: [], isFoc: false },
        { id: "S3", itemName: "Greige Standard Loom", quantity: 150, rate: 120, hsnCode: "", igst: 5, linkedCosts: [], isFoc: false }
      );
    } else {
      specItems.push(
        { id: "S1", itemName: "Premium Cotton Print Fabric", quantity: 400, rate: 220, hsnCode: "", igst: 18, linkedCosts: [], isFoc: false },
        { id: "S2", itemName: "Double Ply Weave Slub Yarn", quantity: 250, rate: 110, hsnCode: "", igst: 12, linkedCosts: [], isFoc: false }
      );
    }
    setSalesItems(specItems);

    // 2. Procedural unlinked staged purchases from attached bills
    const purchaseFiles = req.proofs?.purchaseInvoices || [{ filename: "Attached_Bill_PI_761.pdf" }];
    const preppedUnlinked = purchaseFiles.map((file, idx) => {
      let itemName = "Premium Cotton Greige Fabric";
      let totalQty = 200;
      let lVal = 100;
      if (idx === 1) {
        itemName = "Double Ply Weave Slub Yarn";
        totalQty = 150;
        lVal = 98;
      }
      return {
        id: `U-${idx}`,
        itemName: `${itemName} (${file.filename})`,
        availableQty: totalQty,
        lValue: lVal,
        toInventory: 0,
        toDebit: 0
      };
    });
    setUnlinkedPurchases(preppedUnlinked);
  }, [req]);

  // Resizer bar dragging handler
  const handleSeparatorMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPercent = leftWidth;
    const totalWidth = window.innerWidth || 1200;

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

  const handleOpenLinkDrawer = (mode, parentId, parentName) => {
    setDrawerConfig({ isOpen: true, mode, parentId, parentName });
  };

  const handleSelectLinkItems = (selectedSources) => {
    const parentId = drawerConfig.parentId;
    setSalesItems(prev => prev.map(p => {
      if (p.id === parentId) {
        // Build new child cost links
        const nextCosts = [...p.linkedCosts];
        selectedSources.forEach(s => {
          if (!nextCosts.some(c => c.id === s.id)) {
            nextCosts.push({
              id: s.id,
              itemId: s.itemId,
              itemName: s.itemName,
              isPurchase: s.isPurchase,
              lValue: s.lValue,
              rate: s.rate,
              consumed: Math.min(p.quantity, s.availableQty),
              toInventory: 0,
              toDebit: 0
            });
          }
        });
        return { ...p, linkedCosts: nextCosts };
      }
      return p;
    }));
  };

  const handleBookSaleFinal = async (finalStatus) => {
    try {
      const updated = {
        ...req,
        status: finalStatus,
        mappedSalesItems: salesItems,
        unlinkedPurchases: unlinkedPurchases
      };
      await saveSalesRequest(updated);
      onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!req) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 relative font-sans text-xs select-none p-2 h-full gap-2" id="finance-mapping-root">
      {/* 1. Global Header Match CostInwarding (Strict Light Theme) */}
      <div className="h-8 bg-white border border-slate-200 shadow-xs rounded-sm px-2.5 flex items-center justify-between text-slate-800 font-sans text-xs select-none shrink-0" id="mapping-master-header">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-5 px-1.5 rounded-[2px] border border-slate-300 hover:bg-slate-50 text-slate-705 font-bold transition-colors bg-white flex items-center gap-1 cursor-pointer"
            id="btn-triage-back"
          >
            <ArrowLeft size={10} className="stroke-[3]" />
            <span className="text-[10px]">Back</span>
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.2 rounded-xs">
            {req.id}
          </span>
          <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-100/60 font-sans tracking-wide px-1.5 py-0.2 rounded-xs border border-indigo-200">
            Mapping & Settlement Engine
          </span>
        </div>

        {/* Action Toggle for canvas display */}
        <div className="flex gap-1">
          {!isLeftPaneOpen && (
            <button
              onClick={() => setIsLeftPaneOpen(true)}
              className="h-5 px-1.5 text-[9px] uppercase font-bold text-slate-650 bg-white border border-slate-300 hover:bg-slate-50 rounded-sm cursor-pointer"
            >
              Expand Reference Panel
            </button>
          )}
        </div>
      </div>

      {/* 2. Resizer Content block */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-white border border-slate-200 shadow-xs rounded-sm relative" id="layout-body-wrapper">
        
        {/* Left Pane (Document Reference Canvas) */}
        {isLeftPaneOpen && (
          <>
            <div style={{ width: `${leftWidth}%` }} className="flex flex-col select-none min-h-0 shrink-0">
              <MappingDocumentPane req={req} onCollapse={() => setIsLeftPaneOpen(false)} />
            </div>
            
            {/* Split Resizer bar */}
            <div
              onMouseDown={handleSeparatorMouseDown}
              className="w-1 h-full bg-slate-205 hover:bg-indigo-300 active:bg-indigo-500 cursor-col-resize flex items-center justify-center transition-colors group z-20 shrink-0"
              title="Drag resizer bar"
            >
              <span className="w-0.5 h-6 bg-slate-350 group-hover:bg-indigo-600 transition-colors rounded-xs" />
            </div>
          </>
        )}

        {/* Right Pane (Ledger & Sticky Footer) */}
        <div
          style={{ width: isLeftPaneOpen ? `${100 - leftWidth}%` : "100%" }}
          className="flex-1 flex flex-col min-h-0 bg-white p-2.5 shrink-0 border border-slate-200 rounded-sm relative"
          id="mapping-ledger-grid-root"
        >
          {/* Scrollable grid section */}
          <div className="flex-1 overflow-y-auto mb-2 min-h-0 relative pr-0.5">
            <MappingLedgerGrid
              salesItems={salesItems}
              setSalesItems={setSalesItems}
              unlinkedPurchases={unlinkedPurchases}
              setUnlinkedPurchases={setUnlinkedPurchases}
              onTriggerLink={handleOpenLinkDrawer}
            />
          </div>

          {/* Sticky Execution Footer */}
          <MappingExecutionFooter
            salesItems={salesItems}
            unlinkedPurchases={unlinkedPurchases}
            onBookSale={handleBookSaleFinal}
          />
        </div>

        {/* Side slide-out drawer */}
        <MappingSlideOutDrawer
          isOpen={drawerConfig.isOpen}
          onClose={() => setDrawerConfig(prev => ({ ...prev, isOpen: false }))}
          mode={drawerConfig.mode}
          parentItemName={drawerConfig.parentName}
          onSelectItems={handleSelectLinkItems}
        />

      </div>
    </div>
  );
}
