import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Maximize2, Minimize2, AlertTriangle } from "lucide-react";
import MappingDocumentPane from "./MappingDocumentPane";
import MappingLedgerGrid from "./MappingLedgerGrid";
import MappingSlideOutDrawer from "./MappingSlideOutDrawer";
import MappingExecutionFooter from "./MappingExecutionFooter";
import { saveSalesRequest } from "../../services/salesService";

/**
 * FinanceMappingWorkspace Component (Phase 5 Master Component)
 * Utilizing strict 35/65 split resizer pane.
 */
export default function FinanceMappingWorkspace({ req, onClose, onRefresh, onBackToInwarding }) {
  const isFinanceFinalizing = req?.status === "Settlement Pending";
  const [leftWidth, setLeftWidth] = useState(35);
  const [isLeftPaneOpen, setIsLeftPaneOpen] = useState(true);
  const [salesItems, setSalesItems] = useState(() => {
    return req?.status === "Settlement Pending" ? [
      { id: 'S1', itemName: 'Premium Cotton Greige Fabric', quantity: '200', rate: '150', hsnCode: '520212', igst: 18, linkedCosts: [], isFoc: false, uom: 'm' },
      { id: 'S2', itemName: 'Double Ply Weave Slub Yarn', quantity: '150', rate: '120', hsnCode: '520512', igst: 18, linkedCosts: [], isFoc: false, uom: 'm' }
    ] : [
      { id: 'S1', itemName: '', quantity: '', rate: '', hsnCode: '', igst: 0, linkedCosts: [], isFoc: false, uom: 'm' },
      { id: 'S2', itemName: '', quantity: '', rate: '', hsnCode: '', igst: 0, linkedCosts: [], isFoc: false, uom: 'm' }
    ];
  });
  const [unlinkedPurchases, setUnlinkedPurchases] = useState([]);
  const [drawerConfig, setDrawerConfig] = useState({ isOpen: false, mode: "purchase", parentId: null, parentName: "" });

  const [customer, setCustomer] = useState(req?.customer || "Standard Customer");
  const [billTo, setBillTo] = useState(req?.logistics?.billTo || "Office Corporate Head");
  const [shipTo, setShipTo] = useState(req?.logistics?.shipTo || "Factory Warehouse Block D");
  const [transporter, setTransporter] = useState(req?.logistics?.transporterName || "VRL Logistics");
  const [freight, setFreight] = useState(req?.logistics?.freight || "Fixed Standard To Collect");
  const [paymentTerms, setPaymentTerms] = useState(req?.logistics?.paymentTerms || "Net 30 Days");
  const [salesLValue, setSalesLValue] = useState(100);

  useEffect(() => {
    if (req) {
      setCustomer(req.customer || "Standard Customer");
      setBillTo(req.logistics?.billTo || "Office Corporate Head");
      setShipTo(req.logistics?.shipTo || "Factory Warehouse Block D");
      setTransporter(req.logistics?.transporterName || "VRL Logistics");
      setFreight(req.logistics?.freight || "Fixed Standard To Collect");
      setPaymentTerms(req.logistics?.paymentTerms || "Net 30 Days");
    }
  }, [req]);

  // Initialize structured mapping parent-child elements based on specs
  useEffect(() => {
    if (!req) return;

    // 1. Procedural parent sales items
    const specItems = isFinanceFinalizing ? [
      { id: 'S1', itemName: 'Premium Cotton Greige Fabric', quantity: '200', rate: '150', hsnCode: '520212', igst: 18, linkedCosts: [], isFoc: false, uom: 'm' },
      { id: 'S2', itemName: 'Double Ply Weave Slub Yarn', quantity: '150', rate: '120', hsnCode: '520512', igst: 18, linkedCosts: [], isFoc: false, uom: 'm' }
    ] : [
      { id: 'S1', itemName: '', quantity: '', rate: '', hsnCode: '', igst: 0, linkedCosts: [], isFoc: false, uom: 'm' },
      { id: 'S2', itemName: '', quantity: '', rate: '', hsnCode: '', igst: 0, linkedCosts: [], isFoc: false, uom: 'm' }
    ];
    setSalesItems(specItems);

    // 2. Procedural unlinked staged purchases from attached bills
    const purchaseFiles = req.proofs?.purchaseInvoices || [{ filename: "Attached_Bill_PI_761.pdf" }];
    const preppedUnlinked = purchaseFiles.map((file, idx) => {
      let itemName = "Premium Cotton Greige Fabric";
      let totalQty = 200;
      let lVal = 100;
      let rate = 110;
      let hsn = "520212";
      if (idx === 1) {
        itemName = "Double Ply Weave Slub Yarn";
        totalQty = 150;
        lVal = 98;
        rate = 95;
        hsn = "520512";
      }
      return {
        id: `U-${idx}`,
        itemName: `${itemName} (${file.filename})`,
        availableQty: totalQty,
        lValue: lVal,
        toInventory: 0,
        toDebit: 0,
        rate: rate,
        hsnCode: hsn
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
        let updatedItemName = p.itemName;
        let updatedHsnCode = p.hsnCode;

        selectedSources.forEach(s => {
          if (!nextCosts.some(c => c.id === s.id)) {
            nextCosts.push({
              id: s.id,
              itemId: s.itemId,
              itemName: s.itemName,
              isPurchase: s.isPurchase,
              lValue: s.lValue,
              rate: s.rate || 140,
              hsnCode: s.itemId || "520512",
              availableQty: s.availableQty || 200,
              consumed: Math.min(Number(p.quantity) || 0, s.availableQty || 200),
              toInventory: 0,
              toDebit: 0,
              label: s.label
            });

            if (updatedItemName === "" && updatedHsnCode === "") {
              updatedItemName = s.itemName;
              updatedHsnCode = s.itemId || "";
            }
          }
        });
        return { 
          ...p, 
          itemName: updatedItemName, 
          hsnCode: updatedHsnCode, 
          linkedCosts: nextCosts 
        };
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

  const handleSaveProgress = async () => {
    try {
      const updated = {
        ...req,
        mappedSalesItems: salesItems,
        unlinkedPurchases: unlinkedPurchases
      };
      await saveSalesRequest(updated);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const hasUnmappedSales = salesItems.some(item => !item.isFoc && item.linkedCosts.length === 0);
  const hasUnbookedPurchases = salesItems.some(p => p.linkedCosts.some(c => c.isPurchase && ((Number(c.consumed) || 0) + (Number(c.toInventory) || 0) + (Number(c.toDebit) || 0) + (Number(c.wasteage) || 0)) !== c.availableQty)) ||
    unlinkedPurchases.some(u => ((Number(u.toInventory) || 0) + (Number(u.toDebit) || 0) + (Number(u.wasteage) || 0)) !== u.availableQty);

  if (!req) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 relative font-sans text-xs select-none p-2 h-full gap-2" id="finance-mapping-root">
      {/* 1. Global Header Match CostInwarding (Strict Light Theme) */}
      <div className="h-8 bg-white px-2.5 flex items-center justify-between text-slate-800 font-sans text-xs select-none shrink-0" id="mapping-master-header">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => isFinanceFinalizing && onBackToInwarding ? onBackToInwarding() : onClose()}
            className="h-5 px-1.5 rounded-[2px] border border-slate-300 hover:bg-slate-50 text-slate-705 font-bold transition-colors bg-white flex items-center gap-1 cursor-pointer"
            id="btn-triage-back"
          >
            <ArrowLeft size={10} className="stroke-[3]" />
            <span className="text-[10px]">Back</span>
          </button>
          <span className="text-slate-305">|</span>
          <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.2 rounded-xs">
            {req.id}
          </span>
          <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-100/60 font-sans tracking-wide px-1.5 py-0.2 rounded-xs border border-indigo-200">
            Mapping & Settlement Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasUnmappedSales && (
            <span className="bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-xs font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider">
              <AlertTriangle size={10} /> UNMAPPED SALES
            </span>
          )}
          {hasUnbookedPurchases && (
            <span className="bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-xs font-bold text-[10px] flex items-center gap-1 uppercase tracking-wider">
              <AlertTriangle size={10} /> PURCHASE UNBOOKED
            </span>
          )}
        </div>
      </div>

      {/* 2. Resizer Content block */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-transparent items-stretch relative" id="layout-body-wrapper">
        
        {/* Left Pane (Document Reference Canvas) */}
        {isLeftPaneOpen && (
          <>
            <div style={{ width: `${leftWidth}%` }} className="flex flex-col select-none min-h-0 shrink-0 h-full">
              <MappingDocumentPane req={req} onCollapse={() => setIsLeftPaneOpen(false)} />
            </div>
            
            {/* Split Resizer bar */}
            <div
              onMouseDown={handleSeparatorMouseDown}
              className="w-1 h-full bg-slate-205 hover:bg-slate-300 active:bg-indigo-500 cursor-col-resize flex items-center justify-center transition-colors group z-20 shrink-0"
              title="Drag resizer bar"
            >
              <span className="w-0.5 h-6 bg-slate-350 group-hover:bg-indigo-600 transition-colors rounded-xs" />
            </div>
          </>
        )}

        {/* Right Pane (Ledger & Sticky Footer) */}
        <div
          style={{ width: isLeftPaneOpen ? `${100 - leftWidth}%` : "100%" }}
          className="flex-1 flex flex-col min-h-0 bg-transparent pl-2.5 pr-0 py-0 shrink-0 relative h-full"
          id="mapping-ledger-grid-root"
        >
          {/* Scrollable grid section */}
          <div className="flex-1 overflow-y-auto mb-2 min-h-0 relative pr-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            <MappingLedgerGrid
              req={req}
              salesItems={salesItems}
              setSalesItems={setSalesItems}
              unlinkedPurchases={unlinkedPurchases}
              setUnlinkedPurchases={setUnlinkedPurchases}
              onTriggerLink={handleOpenLinkDrawer}
              isLeftPaneOpen={isLeftPaneOpen}
              onToggleLeftPane={() => setIsLeftPaneOpen(true)}
              customer={customer}
              setCustomer={setCustomer}
              billTo={billTo}
              setBillTo={setBillTo}
              shipTo={shipTo}
              setShipTo={setShipTo}
              transporter={transporter}
              setTransporter={setTransporter}
              freight={freight}
              setFreight={setFreight}
              paymentTerms={paymentTerms}
              setPaymentTerms={setPaymentTerms}
              salesLValue={salesLValue}
              setSalesLValue={setSalesLValue}
              isFinanceFinalizing={isFinanceFinalizing}
            />
          </div>

          {/* Sticky Execution Footer */}
          <MappingExecutionFooter
            salesItems={salesItems}
            unlinkedPurchases={unlinkedPurchases}
            onBookSale={handleBookSaleFinal}
            customer={customer}
            billTo={billTo}
            shipTo={shipTo}
            transporter={transporter}
            freight={freight}
            paymentTerms={paymentTerms}
            salesLValue={salesLValue}
            isFinanceFinalizing={isFinanceFinalizing}
            onSaveProgress={handleSaveProgress}
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
