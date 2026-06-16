import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchPurchaseById, calculatePurchaseTaxesSync } from "../../services/purchaseService";
import PurchaseDetailTable from "./PurchaseDetailTable";
import PurchaseDetailTotals from "./PurchaseDetailTotals";

/**
 * PurchaseDetailPane Component
 * Renders a high-fidelity, completely flat and flush read-only detailed panel with a simulated loader.
 * Conforms to compact-ui and modularity specs (24px heights, 12px/10px typography, 4px/8px spacings, flush stacking).
 */
export default function PurchaseDetailPane({
  activePurchaseId,
  onClose,
  vendorLookup = {},
  onEditDraft,
}) {
  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activePurchaseId) {
      setPurchase(null);
      return;
    }

    let isCurrent = true;
    async function loadDetail() {
      setIsLoading(true);
      try {
        const data = await fetchPurchaseById(activePurchaseId);
        if (isCurrent) {
          setPurchase(data);
        }
      } catch (err) {
        console.error("Critical: Failed to query purchase by id mapping.", err);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isCurrent = false;
    };
  }, [activePurchaseId]);

  // Support closing the pane via Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!activePurchaseId) return null;

  // Format currency with standard Indian numbering formatting
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  const vendorName = purchase ? vendorLookup[purchase.vendorId] || "Unknown Supplier" : "—";

  // Calculate taxes and totals from Tax Engine API (Sync implementation)
  const taxDetail = purchase ? calculatePurchaseTaxesSync(purchase.items || [], purchase.vendorId, Number(purchase.overallDiscount) || 0) : null;
  const isIntrastate = taxDetail?.isIntrastate;

  // Detailed totals
  const subtotal = taxDetail?.subtotal || 0;
  const freight = Number(purchase?.freight) || 0;

  // Recalculate net dynamic tax values taking into account the overall discount
  const netCgst = taxDetail?.cgst || 0;
  const netSgst = taxDetail?.sgst || 0;
  const netIgst = taxDetail?.igst || 0;
  const totalTax = taxDetail?.totalTax || 0;
  const grandTotal = subtotal + totalTax + freight;

  return (
    <div
      className="h-full flex flex-col bg-white animate-in slide-in-from-right-4 duration-200 font-sans select-none overflow-hidden"
      id="purchase-interactive-detail-pane"
    >
      {isLoading ? (
        /* 1. Header & Detail Skeleton Loader */
        <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden select-none" id="detail-pane-skeleton-loader">
          {/* Header Shimmer */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1.5 shrink-0 animate-pulse">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 bg-slate-200 rounded-sm w-1/4" />
              <div className="h-4 bg-slate-250 rounded-sm w-1/2" />
            </div>
            <div className="h-6 w-6 bg-slate-200 rounded-sm shrink-0" />
          </div>
          {/* Table Header Shimmer */}
          <div className="h-6 bg-slate-200 rounded-sm animate-pulse" />
          {/* Table Item Shimmers */}
          <div className="flex flex-col gap-1 overflow-hidden flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-6 bg-slate-50 border border-slate-100 rounded-sm p-1 flex justify-between items-center animate-pulse">
                <div className="h-2.5 bg-slate-200 rounded-xs w-1/3" />
                <div className="h-2.5 bg-slate-200 rounded-xs w-1/6" />
              </div>
            ))}
          </div>
          {/* Totals Section Shimmer */}
          <div className="border-t border-slate-200 pt-2 flex flex-col gap-1 items-end animate-pulse mt-auto shrink-0 animate-delay-75">
            <div className="h-3 bg-slate-200 rounded-xs w-1/4" />
            <div className="h-5 bg-slate-350 rounded-xs w-1/3 mt-1" />
          </div>
        </div>
      ) : !purchase ? (
        /* 2. Empty / Missing Record State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-xs font-medium" id="detail-pane-missing-record">
          <span>Failed to fetch purchase details</span>
          <span className="text-[10px] font-mono mt-1 text-slate-350">record_fetch_error</span>
        </div>
      ) : (
        /* 3. Fully Active High-Density Content Area */
        <>
          {/* Functional Transaction Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 shrink-0 select-none bg-slate-50/50" id="detail-header-nav">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Purchase Status Badge */}
                {purchase.status === "draft" && (
                  <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.25 bg-slate-100 text-slate-700 border border-slate-250 rounded-[2px] shrink-0 font-sans">
                    Draft
                  </span>
                )}
                <h2 className="text-[13px] font-bold text-slate-900 leading-none truncate max-w-[210px]" title={vendorName}>
                  {vendorName}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium font-mono">
                <span>INV: <span className="text-slate-800 font-semibold">{purchase.invoiceNumber || "—"}</span></span>
                <span className="text-[10px] text-slate-300">|</span>
                <span>Date: <span className="text-slate-800 font-semibold">{purchase.purchaseDate || "—"}</span></span>
              </div>
            </div>

            {/* Close and Resume Button */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {purchase.status === "draft" && onEditDraft && (
                <button
                  onClick={() => onEditDraft(purchase)}
                  className="h-6 px-2 bg-amber-605 hover:bg-amber-500 text-white border border-amber-700/30 rounded-sm text-[9px] uppercase font-extrabold tracking-wider transition-all cursor-pointer flex items-center justify-center shrink-0"
                  id="resume-edit-draft-btn"
                  type="button"
                >
                  Resume Verification
                </button>
              )}
              <button
                onClick={onClose}
                className="h-6 w-6 rounded-sm flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer p-0 shrink-0"
                title="Close details (Esc)"
                id="close-detail-pane-btn"
                type="button"
              >
                <X size={13} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Body content with side padding */}
          <div className="flex-1 flex flex-col gap-2 px-3 pb-2.5 pt-1.5 overflow-hidden min-h-0" id="detail-pane-content">
            {/* Context subheader (L-Value, Relocated PO No, and TRANS_REF) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-0.5 shrink-0" id="detail-subheader-meta">
              <div className="flex items-center gap-4 text-xs font-sans">
                {purchase.lValue !== undefined && purchase.lValue !== "" && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium font-sans">L-Value:</span>
                    <span className="text-xs text-slate-900 font-mono font-semibold">{purchase.lValue}</span>
                  </div>
                )}
                {purchase.poNumber && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium font-sans">Ref PO No:</span>
                    <span className="text-xs text-slate-900 font-mono font-semibold">{purchase.poNumber}</span>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                TRANS_REF: {purchase.id}
              </span>
            </div>

            {/* Line Items Inventory Table Section */}
            <PurchaseDetailTable taxDetail={taxDetail} isIntrastate={isIntrastate} />

            {/* totals and State tax mapping summaries */}
            <PurchaseDetailTotals
              subtotal={subtotal}
              freight={freight}
              netCgst={netCgst}
              netSgst={netSgst}
              netIgst={netIgst}
              totalTax={totalTax}
              grandTotal={grandTotal}
              isIntrastate={isIntrastate}
            />
          </div>
        </>
      )}
    </div>
  );
}
