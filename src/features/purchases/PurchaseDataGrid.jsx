import React from "react";

/**
 * PurchaseDataGrid Component - Fully Compact Table View
 * Implements the operational ledger rows with exact 24px fixed heights,
 * 12px micro-type font styles, and strict truncation guards to align with the compact-ui.md specification.
 */
export default function PurchaseDataGrid({ purchases = [], vendorLookup = {} }) {
  
  /**
   * Performs dynamic commercial calculations over the complete purchase payload
   * to determine the exact grand total matching corresponding tax regimes (flat 18%).
   * Sub-totals are computed dynamically per row subtracting item-level discounts,
   * then deducting manual header discounts before compiling tax and adding freight.
   * 
   * @param {Object} pur - Primary purchase record.
   * @returns {number} Fully processed Grand Total amount.
   */
  const calculateTotalAmount = (pur) => {
    // 1. Accumulate taxable baseline value from all individual row indices
    const subtotal = (pur.items || []).reduce((sum, item) => {
      const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
      const lineTotal = Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));
      return sum + lineTotal;
    }, 0);

    // 2. Reduce the total taxable basin by general overall discount
    const netTaxableValue = Math.max(0, subtotal - (Number(pur.overallDiscount) || 0));

    // 3. Collect Indian commercial standard GST tax (flat 18% standard rate)
    const tax = netTaxableValue * 0.18;

    // 4. Inject physical freight overhead to construct the final grand ledger amount
    const grandTotal = netTaxableValue + tax + (Number(pur.freight) || 0);
    return parseFloat(grandTotal.toFixed(2));
  };

  /**
   * Formats a raw numeric currency value to Indian Rupee (INR) notation with standard thousand separators.
   * 
   * @param {number} num - Raw floating point or integer sum.
   * @returns {string} Elegantly formatted currency line.
   */
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  if (!purchases || purchases.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-8 text-center text-xs text-slate-400 select-none shadow-xs font-medium" id="purchases-empty-state">
        No active purchase records found under this status tab.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs" id="purchases-ledgers-table-wrapper">
      <div className="overflow-x-auto w-full">
        {/* Strict fixed-table layout preventing header/row misalignment on high-density displays */}
        <table className="w-full text-left border-collapse table-fixed text-[12px] text-slate-700 bg-white" id="purchases-data-grid">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 uppercase text-[10px] text-slate-500 select-none h-6 font-semibold tracking-wider font-mono">
              <th className="py-0.5 px-2 w-[100px]" id="th-purchase-date">Purchase Date</th>
              <th className="py-0.5 px-2" id="th-vendor-name">Vendor Name</th>
              <th className="py-0.5 px-2 w-[140px]" id="th-invoice-number">Invoice Number</th>
              <th className="py-0.5 px-2 w-[70px] text-center" id="th-l-value">L-Value</th>
              <th className="py-0.5 px-2 w-[120px] text-right" id="th-total-amount">Total Amount</th>
              <th className="py-0.5 px-2 w-[90px] text-center" id="th-status">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((p) => {
              const vendorName = vendorLookup[p.vendorId] || "Unknown Supplier";
              const computedTotal = calculateTotalAmount(p);
              const invoiceNo = p.invoiceNumber || "—";
              const lValueText = p.lValue ?? "—";
              const isFinalized = p.status === "finalized";

              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 border-b border-slate-100/80 transition-colors h-6 font-medium text-slate-700 select-none cursor-pointer"
                  id={`purchase-row-${p.id}`}
                >
                  {/* Date Column */}
                  <td className="py-0.5 px-2 text-slate-500 font-mono truncate">{p.purchaseDate || "—"}</td>

                  {/* Vendor Name Column */}
                  <td className="py-0.5 px-2 text-slate-900 font-semibold truncate" title={vendorName}>
                    {vendorName}
                  </td>

                  {/* Invoice Number Column */}
                  <td className="py-0.5 px-2 text-slate-600 font-mono truncate" title={invoiceNo}>
                    {invoiceNo}
                  </td>

                  {/* L-Value Column */}
                  <td className="py-0.5 px-2 text-slate-600 text-center font-mono">
                    <span className="bg-slate-50 border border-slate-200/80 px-1 rounded-sm text-[10px]">
                      {lValueText}
                    </span>
                  </td>

                  {/* Total Amount Column (Gross subtotal after item-to-header discounts + commercial 18% tax + freight) */}
                  <td className="py-0.5 px-2 text-slate-900 text-right font-bold font-mono">
                    {formatCurrency(computedTotal)}
                  </td>

                  {/* Status Badges Channel */}
                  <td className="py-0.5 px-2 text-center">
                    {isFinalized ? (
                      <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono border uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200/80">
                        Finalized
                      </span>
                    ) : (
                      <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono border uppercase tracking-wider bg-orange-50 text-orange-700 border-orange-200/80">
                        Draft
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
