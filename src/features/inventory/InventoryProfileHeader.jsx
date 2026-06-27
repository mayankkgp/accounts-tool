import React from "react";
import { calculateAge } from "./inventoryUtils";
import { Download } from "lucide-react";

/**
 * InventoryProfileHeader Component
 * Renders a dense, expert-level grid displaying read-only properties of the inventory record.
 */
export default function InventoryProfileHeader({ item }) {
  const dynamicAge = calculateAge(item.inwardDate);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num || 0);
  };

  const fields = [
    // Row 1
    { label: "SKU", value: item.sku || "—" },
    { label: "Type", value: item.type || "—" },
    { label: "Inward Date", value: item.inwardDate ? `${item.inwardDate} (${dynamicAge}d)` : "—" },
    // Row 2
    { label: "Qty", value: `${formatNumber(item.qty)} m` },
    { label: "Rate", value: formatCurrency(item.rate) },
    { label: "Value", value: formatCurrency(item.value || (item.qty * item.rate)) },
    // Row 3
    { label: "Invoice", value: item.invoice || "—" },
    { label: "Supplier", value: item.supplier || "—" },
    { label: "HSN Code", value: item.hsnCode || "—" },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-sm p-2.5 flex flex-col gap-2" id="inventory-profile-header-card">
      <div className="grid grid-cols-3 gap-2 text-left">
        {fields.map((f, i) => (
          <div key={i} className="flex flex-col min-w-0" id={`profile-field-${f.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold font-sans">
              {f.label}
            </span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[11px] font-semibold text-slate-800 font-mono truncate" title={f.value}>
                {f.value}
              </span>
              {f.label === "Invoice" && item.invoice && item.invoice !== "—" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const element = document.createElement("a");
                    const file = new Blob([
                      `INVOICE DETAILS\n==============\nInvoice No: ${item.invoice}\nSKU: ${item.sku || "—"}\nType: ${item.type || "—"}\nSupplier: ${item.supplier || "—"}\nHSN Code: ${item.hsnCode || "—"}\nInward Date: ${item.inwardDate || "—"}\nQuantity: ${formatNumber(item.qty)} m\nRate: ${formatCurrency(item.rate)}\nTotal Value: ${formatCurrency(item.value || (item.qty * item.rate))}`
                    ], { type: "text/plain" });
                    element.href = URL.createObjectURL(file);
                    element.download = `Invoice-${item.invoice}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="p-0.5 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                  title="Download Invoice"
                  id="download-invoice-cta"
                >
                  <Download size={10} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
