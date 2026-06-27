import React from "react";
import { calculateAge } from "./inventoryUtils";

/**
 * InventoryGridRow Component
 * Renders a single custom table row matching dense layouts.
 */
export default function InventoryGridRow({
  item,
  isCompressed,
  isSelected,
  onClick,
  activeTab,
  gridLayoutClass,
}) {
  const dynamicAge = calculateAge(item.inwardDate);

  // Indian standard currency formatting
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Standard number formatting with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <div
      onClick={onClick}
      className={`group ${isCompressed ? "py-1.5 min-h-[40px]" : "h-6"} border-b border-slate-200/60 flex items-center px-1.5 cursor-pointer text-[10px] select-none transition-all relative ${
        isSelected
          ? "bg-blue-50/95 text-slate-900 shadow-[inset_2px_0_0_0_rgb(99,102,241)]"
          : "text-slate-700 hover:bg-slate-100/90"
      }`}
      id={`inventory-row-${item.id}`}
    >
      {isCompressed ? (
        <div className={`w-full grid ${gridLayoutClass} gap-1 items-center`}>
          {/* Column 1: Item name & Type */}
          <div className="flex flex-col min-w-0 text-left">
            <span className="font-bold text-slate-900 truncate text-[11px]" title={item.item}>
              {item.item}
            </span>
            <span className="text-[10px] text-slate-500 font-medium truncate" title={item.type}>
              {item.type || "—"}
            </span>
          </div>
          {/* Column 2: SKU ID & Age */}
          <div className="flex flex-col min-w-0 text-left">
            <span className="font-mono text-[10px] text-slate-500 font-medium truncate" title={item.sku}>
              {item.sku}
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-medium truncate">
              {dynamicAge}d
            </span>
          </div>
          {/* Column 3: Quantity & Rate */}
          <div className="flex flex-col min-w-0 text-left">
            <span className="font-mono font-bold text-slate-900 text-[11px] truncate">
              {formatNumber(item.qty)} m
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-medium truncate">
              {formatCurrency(item.rate)}
            </span>
          </div>
        </div>
      ) : (
        <div className={`flex-1 min-w-0 grid gap-1 items-center h-full ${gridLayoutClass}`}>
          {/* SKU Column */}
          <span className="font-mono text-slate-500 truncate text-[10px]" title={item.sku}>
            {item.sku || "—"}
          </span>

          {/* Item Column */}
          <span className="font-semibold text-slate-900 truncate text-[11px]" title={item.item}>
            {item.item}
          </span>

          {/* Type Column */}
          <span className="text-slate-600 truncate text-[10px]" title={item.type}>
            {item.type || "—"}
          </span>

          {/* Invoice Column */}
          <span className="font-mono text-slate-500 truncate text-[10px]" title={item.invoice}>
            {item.invoice || "—"}
          </span>

          {/* Qty Column */}
          <span className="font-mono text-slate-900 text-left text-[11px]">
            {formatNumber(item.qty)}
          </span>

          {/* Rate Column */}
          <span className="font-mono text-slate-500 text-left text-[10px]">
            {formatCurrency(item.rate)}
          </span>

          {/* Value Column */}
          <span className="font-mono font-bold text-slate-900 text-left text-[11px]">
            {formatCurrency(item.value || (item.qty * item.rate))}
          </span>

          {/* Supplier Column */}
          <span className="text-slate-600 truncate text-[10px]" title={item.supplier}>
            {item.supplier || "—"}
          </span>

          {/* Age Column */}
          <span className="font-mono text-slate-900 text-left text-[11px]">
            {dynamicAge}d
          </span>

          {/* Location Column (Conditional) */}
          {activeTab === "Reviewed" && (
            <span className="text-indigo-600 font-semibold truncate text-[10px]" title={item.location}>
              {item.location || "Not assigned"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
