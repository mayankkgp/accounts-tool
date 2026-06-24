import React, { useState } from "react";
import { Loader2, ArrowRight, AlertTriangle, Check } from "lucide-react";

/**
 * MappingExecutionFooter Component (Phase 5 Sticky Footer)
 * Under 150 lines directive.
 * 
 * Props:
 *  - salesItems: parent Sales metrics
 *  - unlinkedSalesFound: boolean indicating incomplete links
 *  - onBookSale: callback doing actual DB updates (takes finalStatus)
 */
export default function MappingExecutionFooter({
  salesItems,
  unlinkedPurchases,
  onBookSale,
  customer,
  billTo,
  shipTo,
  transporter,
  freight,
  paymentTerms,
  salesLValue,
  isFinanceFinalizing,
  onSaveProgress
}) {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isPartialModalOpen, setIsPartialModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleMockSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedFeedback(true);
      setTimeout(() => {
        setShowSavedFeedback(false);
      }, 2500);
    }, 1500);
  };

  // Determination of Settlement state
  // Fully mapped: every parent sales item has at least one cost link or is marked FOC
  const hasIncompleteSales = salesItems.some(p => !p.isFoc && p.linkedCosts.length === 0);
  // Also check if any unlinked staged purchase item remains fully undistributed (toInventory + toDebit equals 0)
  const hasUndistributedPurchases = unlinkedPurchases.some(u => (u.toInventory || 0) + (u.toDebit || 0) === 0);
  
  const isFullyMapped = !hasIncompleteSales && !hasUndistributedPurchases;

  // Validation Rules:
  const isContextComplete =
    String(customer || '').trim() !== '' &&
    String(paymentTerms || '').trim() !== '' &&
    String(transporter || '').trim() !== '' &&
    String(freight || '').trim() !== '' &&
    String(salesLValue || '').trim() !== '' &&
    String(billTo || '').trim() !== '' &&
    String(shipTo || '').trim() !== '';

  const areSalesComplete = salesItems.every(item => {
    const nameOk = item.itemName && String(item.itemName).trim() !== '';
    const qtyOk = item.quantity !== null && item.quantity !== undefined && String(item.quantity).trim() !== '';
    const rateOk = item.rate !== null && item.rate !== undefined && String(item.rate).trim() !== '';
    const hsnOk = item.hsnCode && String(item.hsnCode).trim() !== '';
    return nameOk && qtyOk && rateOk && hsnOk;
  });

  const isBookSalesDisabled = !isContextComplete || !areSalesComplete;

  const unmappedSalesCount = salesItems.filter(item => !item.isFoc && (!item.linkedCosts || item.linkedCosts.length === 0)).length;

  const unbookedPurchasesCount = (() => {
    let count = 0;
    salesItems.forEach(p => {
      if (p.linkedCosts) {
        p.linkedCosts.forEach(child => {
          if (child.isPurchase) {
            const sum = (Number(child.consumed) || 0) + 
                        (Number(child.toInventory) || 0) + 
                        (Number(child.toDebit) || 0) + 
                        (Number(child.wasteage) || 0);
            if (sum !== child.availableQty) {
              count++;
            }
          }
        });
      }
    });

    if (unlinkedPurchases) {
      unlinkedPurchases.forEach(u => {
        const sum = (Number(u.toInventory) || 0) + 
                    (Number(u.toDebit) || 0) + 
                    (Number(u.wasteage) || 0);
        if (sum !== u.availableQty) {
          count++;
        }
      });
    }
    return count;
  })();

  const hasWarnings = unmappedSalesCount > 0 || unbookedPurchasesCount > 0;

  // Heavy transaction simulating writing to real ledger databases (2500ms - 3000ms)
  const handleTriggerBooking = async () => {
    setIsBooking(true);
    setBookingMessage("EXECUTING LEDGER BOOKING (3000ms)...");
    await new Promise(r => setTimeout(r, 1000));
    setBookingMessage("COMMITTING TAX REGISTRY AND LOGGING REVENUE...");
    await new Promise(r => setTimeout(r, 1000));
    setBookingMessage("GENERATING FINAL SALES INVOICE PDF...");
    await new Promise(r => setTimeout(r, 1000));

    // Determine target workflow B status
    const finalStatus = isFullyMapped ? "Fulfilled" : "Settlement Pending";
    onBookSale(finalStatus);
    setIsBooking(false);
  };

  const handleTriggerBookingClick = () => {
    if (hasWarnings && !isFinanceFinalizing) {
      setIsPartialModalOpen(true);
    } else {
      handleTriggerBooking();
    }
  };

  return (
    <>
      {/* 1. Heavy blocking Transaction Loader Overlay */}
      {isBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] select-none text-white animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-md shadow-2xl flex flex-col items-center justify-center gap-3 w-80 text-center">
            <Loader2 size={32} className="animate-spin text-indigo-500 stroke-[2.5]" />
            <h4 className="font-mono text-xs uppercase tracking-widest font-bold text-slate-100">
              Transaction Active
            </h4>
            <p className="text-[10px] text-slate-405 font-medium min-h-[30px]">
              {bookingMessage}
            </p>
          </div>
        </div>
      )}

      {/* 2. Compact Sticky Footer */}
      <div
        className="border-t border-slate-150 pt-2.5 flex items-center justify-between shrink-0 select-none gap-2 bg-white text-slate-800 font-sans px-2 pb-2"
        id="mapping-sticky-footer"
      >
        {/* Left indicators: Settlement state */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Settlement State:
          </span>
          <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
            isFullyMapped
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-250"
          }`}>
            {isFullyMapped ? "Fully Mapped" : "Settlement Pending"}
          </span>
        </div>

        {/* Right CTA layout: Always show Book Sale execution button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleMockSave}
            disabled={isSaving}
            className={`h-6 px-4 font-bold rounded-sm text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1 border ${
              isSaving
                ? "bg-slate-50 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed"
                : showSavedFeedback
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
            }`}
            id="btn-save-mapping-draft"
          >
            {isSaving ? (
              <>
                <Loader2 size={10} className="animate-spin text-slate-400" />
                <span>Saving...</span>
              </>
            ) : showSavedFeedback ? (
              <>
                <Check size={10} className="text-emerald-600 stroke-[3]" />
                <span>Saved</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>

          <button
            type="button"
            disabled={isBookSalesDisabled || (isFinanceFinalizing && hasWarnings)}
            onClick={handleTriggerBookingClick}
            className={`h-6 px-4 font-bold rounded-sm text-[10px] uppercase tracking-wider cursor-pointer border-none flex items-center gap-1 select-none pointer-events-auto transition-all ${
              isBookSalesDisabled || (isFinanceFinalizing && hasWarnings)
                ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-50"
                : hasWarnings 
                ? "bg-rose-600 hover:bg-rose-700 text-white border border-rose-700" 
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
            id="btn-execute-booking"
          >
            <span>
              {isFinanceFinalizing
                ? "Book Purchase"
                : (hasWarnings ? "Book Sales (Partial)" : "Book Sales")}
            </span>
            <ArrowRight size={10} className="stroke-[3] text-white" />
          </button>
        </div>
      </div>

      {/* 3. Confirmation Dialog Component */}
      {isPartialModalOpen && (
        <div id="confirm-partial-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] select-none text-slate-800">
          <div className="bg-white border border-slate-200 p-5 rounded-md shadow-2xl flex flex-col gap-4 w-96 text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <AlertTriangle className="text-amber-500 animate-pulse shrink-0" size={18} />
              <h3 className="font-sans text-sm font-bold text-slate-900">
                Confirm Partial Booking
              </h3>
            </div>
            
            <div className="flex flex-col gap-2.5 my-1 text-[11px] leading-relaxed text-slate-600">
              <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                {unmappedSalesCount > 0 && (
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <p className="flex-1 min-w-0">
                      <strong className="text-slate-800 font-bold">{unmappedSalesCount}</strong> sales items have not been mapped.
                    </p>
                  </div>
                )}
                {unbookedPurchasesCount > 0 && (
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <p className="flex-1 min-w-0">
                      <strong className="text-slate-800 font-bold">{unbookedPurchasesCount}</strong> purchase {unbookedPurchasesCount === 1 ? 'item has' : 'items have'} not been completely bucketed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsPartialModalOpen(false)}
                className="h-7 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-sm text-[10px] uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPartialModalOpen(false);
                  handleTriggerBooking();
                }}
                className="h-7 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-sm text-[10px] uppercase tracking-wider cursor-pointer border border-rose-700 transition-all flex items-center justify-center shadow-xs"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
