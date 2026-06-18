import React, { useState } from "react";
import { Loader2, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

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
  onBookSale
}) {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSupervisorApproved, setIsSupervisorApproved] = useState(false);
  const [requestingApproval, setRequestingApproval] = useState(false);

  // 1. Calculate Revenue & Mapped Cost
  const totalRevenue = salesItems.reduce((acc, p) => acc + (p.quantity * p.rate), 0) || 1;
  const totalCost = salesItems.reduce((acc, p) => {
    if (p.isFoc) return acc;
    return acc + p.linkedCosts.reduce((sum, c) => sum + ((c.consumed || 0) * (c.rate || 0)), 0);
  }, 0);

  // Calculate Margin percentage
  const calculatedMargin = parseFloat(((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1));
  const isMarginGood = calculatedMargin >= 10;

  // Determination of Settlement state
  // Fully mapped: every parent sales item has at least one cost link or is marked FOC
  const hasIncompleteSales = salesItems.some(p => !p.isFoc && p.linkedCosts.length === 0);
  // Also check if any unlinked staged purchase item remains fully undistributed (toInventory + toDebit equals 0)
  const hasUndistributedPurchases = unlinkedPurchases.some(u => (u.toInventory || 0) + (u.toDebit || 0) === 0);
  
  const isFullyMapped = !hasIncompleteSales && !hasUndistributedPurchases;

  // Simulate remote superior approval transaction
  const handleRequestApproval = async () => {
    setRequestingApproval(true);
    // 600ms latency delay
    await new Promise(r => setTimeout(r, 600));
    setIsSupervisorApproved(true);
    setRequestingApproval(false);
  };

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

  const showBookSaleCTA = isMarginGood || isSupervisorApproved;

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
        className="border-t border-slate-150 pt-2.5 flex items-center justify-between shrink-0 select-none gap-2 bg-white text-slate-800 font-sans"
        id="mapping-sticky-footer"
      >
        {/* Left indicators: Margin badge */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Order Margin:
          </span>
          <div
            className={`flex items-center gap-1 border px-2 py-0.5 rounded-xs text-[11px] font-mono font-bold leading-none ${
              calculatedMargin >= 10
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-250 animate-pulse"
            }`}
          >
            {calculatedMargin >= 10 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{calculatedMargin}%</span>
          </div>

          {/* Supervisor Approved badge override indicator */}
          {isSupervisorApproved && (
            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider">
              <CheckCircle2 size={11} className="text-indigo-600" />
              <span>Approved by Admin</span>
            </div>
          )}
        </div>

        {/* Right CTA layout: State A Rejection/Approval or State B Book Sale */}
        <div className="flex items-center gap-1.5">
          {showBookSaleCTA ? (
            <button
              type="button"
              onClick={handleTriggerBooking}
              className="h-6 px-4 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-sm text-[10px] uppercase tracking-wider cursor-pointer border-none flex items-center gap-1 select-none pointer-events-auto transition-all"
              id="btn-execute-booking"
            >
              <span>Book Sale {isFullyMapped ? "(Full)" : "(Partial)"}</span>
              <ArrowRight size={10} className="stroke-[3] text-indigo-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestApproval}
              disabled={requestingApproval}
              className="h-6 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-sm text-[10px] uppercase tracking-wider cursor-pointer border-none flex items-center gap-1.5 select-none pointer-events-auto transition-all"
              id="btn-request-superior-approval"
            >
              {requestingApproval ? (
                <>
                  <Loader2 size={10} className="animate-spin text-white" />
                  <span>Submitting (600ms)...</span>
                </>
              ) : (
                <>
                  <span>Request Approval</span>
                  <ShieldCheck size={11} className="text-indigo-200" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
