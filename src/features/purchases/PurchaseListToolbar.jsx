import React, { useState } from "react";
import Tabs from "../../components/ui/Tabs";
import { Search, Plus, SlidersHorizontal, X } from "lucide-react";
import PurchaseFilterPopover from "./PurchaseFilterPopover";

/**
 * PurchaseListToolbar Component
 * Renders the compact top toolbar for active search, filter triggers, and operational CTAs.
 */
export default function PurchaseListToolbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onAddNew,
  isCompressed = false,
  filters,
  setFilters,
  vendorLookup = {},
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const tabs = [
    { value: "finalized", label: "Finalized" },
    { value: "draft", label: "Drafts" },
  ];

  // Calculate active filters categories count
  const activeFilterCount = [
    filters.fromDate,
    filters.toDate,
    filters.financialYear,
    filters.vendorIds && filters.vendorIds.length > 0,
    filters.minAmount,
    filters.maxAmount,
  ].filter(Boolean).length;

  // Build the list of active filter chips
  const chips = [];

  if (filters.fromDate || filters.toDate) {
    let label = "Date: ";
    if (filters.fromDate && filters.toDate) {
      label += `${filters.fromDate} to ${filters.toDate}`;
    } else if (filters.fromDate) {
      label += `From ${filters.fromDate}`;
    } else {
      label += `To ${filters.toDate}`;
    }
    chips.push({
      id: "date",
      label,
      onRemove: () => setFilters((p) => ({ ...p, fromDate: "", toDate: "" })),
    });
  }

  if (filters.financialYear) {
    chips.push({
      id: "fy",
      label: `FY: ${filters.financialYear}`,
      onRemove: () => setFilters((p) => ({ ...p, financialYear: "" })),
    });
  }

  if (filters.vendorIds && filters.vendorIds.length > 0) {
    filters.vendorIds.forEach((vendorId) => {
      const vName = vendorLookup[vendorId] || "Unknown Vendor";
      chips.push({
        id: `vendor-${vendorId}`,
        label: `Vendor: ${vName}`,
        onRemove: () =>
          setFilters((p) => ({
            ...p,
            vendorIds: p.vendorIds.filter((id) => id !== vendorId),
          })),
      });
    });
  }

  if (filters.minAmount || filters.maxAmount) {
    let label = "Amount: ";
    if (filters.minAmount && filters.maxAmount) {
      label += `₹${filters.minAmount} - ₹${filters.maxAmount}`;
    } else if (filters.minAmount) {
      label += `>= ₹${filters.minAmount}`;
    } else {
      label += `<= ₹${filters.maxAmount}`;
    }
    chips.push({
      id: "amount",
      label,
      onRemove: () => setFilters((p) => ({ ...p, minAmount: "", maxAmount: "" })),
    });
  }

  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-1.5 shrink-0 select-none font-sans" id="purchases-toolbar">
      {/* 1. Dense Mini Header Segment */}
      <div className="flex items-center justify-between px-1.5 py-0.5 bg-slate-100/50 rounded-xs border border-slate-200/40" id="purchases-mini-header">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700">Commercial Ledger</span>
        <span className="text-[9px] font-mono text-slate-400 bg-slate-200/40 px-1 rounded-sm">Purchases</span>
      </div>

      <div className="max-w-md w-full flex flex-col gap-1" id="purchases-toolbar-inner">
        {/* 2. Navigation Sub-Tabs Toggle */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Tabs.List className="flex bg-slate-200/60 p-0.5 rounded-sm w-full" id="purchases-segmented-toggle">
            {tabs.map((t) => {
              const isActive = activeTab === t.value;
              return (
                <Tabs.Trigger
                  key={t.value}
                  value={t.value}
                  className={`flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 rounded-[1px] transition-all cursor-pointer outline-none select-none text-center ${
                    isActive
                      ? "bg-slate-950 text-slate-100 shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                  }`}
                  id={`toggle-tab-${t.value}`}
                >
                  {t.label}
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>
        </Tabs.Root>

        {/* 3. Micro Toolbar: Compact Search Input, Advanced Filter, and Action */}
        <div className="flex gap-1 items-center" id="purchases-search-filter-row">
          <div className="relative flex-1">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium" size={10} />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-6 text-[11px] placeholder-slate-500 font-medium outline-none focus:border-indigo-500"
              id="purchases-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 h-4 w-4 flex items-center justify-center cursor-pointer"
                title="Clear search"
                type="button"
                id="clear-purchases-search-btn"
              >
                <X size={10} className="stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Advanced Filter with custom dropdown container */}
          <div className="relative">
            <button
              onClick={() => setIsPopoverOpen((prev) => !prev)}
              type="button"
              className={`h-6 bg-white border ${
                activeFilterCount > 0 ? "border-indigo-500 text-indigo-700 bg-indigo-50/20" : "border-slate-300 text-slate-700"
              } rounded-sm px-2 text-[11px] outline-none hover:bg-slate-50 focus:border-indigo-500 cursor-pointer font-sans flex items-center justify-center gap-1 transition-all`}
              id="purchases-filter-visual-btn"
            >
              <SlidersHorizontal size={10} className={activeFilterCount > 0 ? "text-indigo-600 shrink-0" : "text-slate-500 shrink-0"} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[8px] font-bold text-white leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <PurchaseFilterPopover
              filters={filters}
              setFilters={setFilters}
              vendorLookup={vendorLookup}
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            />
          </div>

          {/* Add Manual/AI Purchase Operations */}
          <button
            onClick={onAddNew}
            title="Add Purchase"
            className={`h-6 ${
              isCompressed ? "w-6" : "px-2"
            } shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm flex items-center justify-center gap-1 border border-indigo-700/50 shadow-sm cursor-pointer transition-all`}
            id="btn-add-purchase"
          >
            <Plus size={11} className="stroke-[2.5]" />
            {!isCompressed && (
              <span className="text-[9px] font-bold uppercase tracking-wider">Add Purchase</span>
            )}
          </button>
        </div>

        {/* 4. Active Filter Chips Row */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100 mt-1 max-h-16 overflow-y-auto" id="purchases-filter-chips-row">
            {chips.map((chip) => (
              <div
                key={chip.id}
                className="h-5 px-1.5 bg-slate-200/70 hover:bg-slate-200/90 border border-slate-300/40 rounded-sm flex items-center gap-1 text-[9px] text-slate-700 font-medium select-none"
                id={`filter-chip-${chip.id}`}
              >
                <span className="truncate max-w-[125px]">{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer flex items-center justify-center p-0.5 rounded-xs"
                  type="button"
                  id={`remove-chip-btn-${chip.id}`}
                >
                  <X size={8} className="stroke-[2.5]" />
                </button>
              </div>
            ))}
            {chips.length > 1 && (
              <button
                onClick={() =>
                  setFilters({
                    fromDate: "",
                    toDate: "",
                    financialYear: "",
                    vendorIds: [],
                    minAmount: "",
                    maxAmount: "",
                  })
                }
                className="text-[9px] uppercase tracking-wider font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer ml-1.5"
                type="button"
                id="clear-all-chips-btn"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
