import React, { useState, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";

/**
 * PurchaseFilterPopover Component
 * A compact, floating advanced filter popover styled according to compact-ui specifications.
 * Supports: Date Range, Financial Year, Vendor Search Checklist, and Amount Range (Min/Max).
 */
export default function PurchaseFilterPopover({
  filters,
  setFilters,
  vendorLookup = {},
  isOpen,
  onClose,
}) {
  const popoverRef = useRef(null);
  const [vendorSearch, setVendorSearch] = useState("");

  // Close when clicking outside of the popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !event.target.closest("#purchases-filter-visual-btn")
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Derive vendor list from lookup map
  const vendors = Object.entries(vendorLookup).map(([id, name]) => ({
    id,
    name,
  }));

  // Filter vendors based on mini-search
  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const handleVendorToggle = (vendorId) => {
    const isSelected = filters.vendorIds.includes(vendorId);
    let newVendorIds;
    if (isSelected) {
      newVendorIds = filters.vendorIds.filter((id) => id !== vendorId);
    } else {
      newVendorIds = [...filters.vendorIds, vendorId];
    }
    setFilters((prev) => ({ ...prev, vendorIds: newVendorIds }));
  };

  const handleClearAll = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      financialYear: "",
      vendorIds: [],
      minAmount: "",
      maxAmount: "",
    });
    setVendorSearch("");
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-7 z-50 w-72 bg-white border border-slate-200 shadow-lg rounded-sm p-2 flex flex-col gap-2 font-sans text-slate-800 animate-none select-none"
      id="purchases-filter-popover"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1" id="popover-header">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Advanced Filters</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 cursor-pointer h-4 w-4 flex items-center justify-center rounded-sm hover:bg-slate-100"
          type="button"
          id="close-popover-btn"
        >
          <X size={12} />
        </button>
      </div>

      {/* Date Range Inputs */}
      <div className="flex flex-col gap-1" id="filter-section-dates">
        <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Date Range</span>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex flex-col">
            <label className="text-[8px] text-slate-400 uppercase font-medium mb-0.5">From</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
              }
              className="h-6 bg-slate-50 border border-slate-300 rounded-xs px-1 text-[11px] font-mono outline-none focus:border-indigo-500 text-slate-800"
              id="filter-date-from"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[8px] text-slate-400 uppercase font-medium mb-0.5">To</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, toDate: e.target.value }))
              }
              className="h-6 bg-slate-50 border border-slate-300 rounded-xs px-1 text-[11px] font-mono outline-none focus:border-indigo-500 text-slate-800"
              id="filter-date-to"
            />
          </div>
        </div>
      </div>

      {/* Financial Year Selection */}
      <div className="flex flex-col gap-1" id="filter-section-fy">
        <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Financial Year</span>
        <select
          value={filters.financialYear}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, financialYear: e.target.value }))
          }
          className="w-full h-6 bg-slate-50 border border-slate-300 rounded-xs px-1 text-[11px] outline-none focus:border-indigo-500 font-sans text-slate-700"
          id="filter-select-fy"
        >
          <option value="">All Years</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2025-2026">2025-2026</option>
          <option value="2026-2027">2026-2027</option>
        </select>
      </div>

      {/* Vendor Filter with Search box */}
      <div className="flex flex-col gap-1" id="filter-section-vendor">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Vendor Selector</span>
          {filters.vendorIds.length > 0 && (
            <span className="text-[9px] text-indigo-600 font-bold">
              {filters.vendorIds.length} Selected
            </span>
          )}
        </div>
        {/* Compact vendor search */}
        <div className="relative">
          <Search size={10} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={vendorSearch}
            onChange={(e) => setVendorSearch(e.target.value)}
            className="w-full h-5 bg-slate-50 border border-slate-200 rounded-xs pl-5 pr-1.5 text-[10px] outline-none focus:border-indigo-500"
            id="vendor-picker-search"
          />
        </div>
        {/* Scrollable vendor choices list */}
        <div
          className="max-h-24 overflow-y-auto border border-slate-200 rounded-xs p-1 bg-white flex flex-col gap-1.5"
          id="vendor-picker-checklist"
        >
          {filteredVendors.length === 0 ? (
            <span className="text-[9px] text-slate-400 text-center py-1 font-mono">No vendors match</span>
          ) : (
            filteredVendors.map((v) => {
              const isChecked = filters.vendorIds.includes(v.id);
              return (
                <label
                  key={v.id}
                  className="flex items-center gap-1.5 text-[10px] text-slate-700 font-medium cursor-pointer hover:bg-slate-50 py-0.5 rounded-sm select-none"
                  id={`vendor-option-${v.id}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleVendorToggle(v.id)}
                    className="h-3 w-3 rounded-xs text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="truncate flex-1">{v.name}</span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Amount Range inputs */}
      <div className="flex flex-col gap-1" id="filter-section-amount">
        <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Purchase Amount (₹)</span>
        <div className="grid grid-cols-2 gap-1">
          <input
            type="number"
            placeholder="Min Amount"
            value={filters.minAmount}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
            }
            className="h-6 bg-slate-50 border border-slate-300 rounded-xs px-1 text-[11px] font-mono outline-none focus:border-indigo-500"
            id="filter-amount-min"
          />
          <input
            type="number"
            placeholder="Max Amount"
            value={filters.maxAmount}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
            }
            className="h-6 bg-slate-50 border border-slate-300 rounded-xs px-1 text-[11px] font-mono outline-none focus:border-indigo-500"
            id="filter-amount-max"
          />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-1.5 border-t border-slate-100 pt-1.5 justify-between" id="popover-actions">
        <button
          onClick={handleClearAll}
          className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer font-bold uppercase transition-all"
          type="button"
          id="popover-reset-btn"
        >
          Reset All
        </button>
        <button
          onClick={onClose}
          className="h-5 px-2 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-all"
          type="button"
          id="popover-apply-btn"
        >
          Close
        </button>
      </div>
    </div>
  );
}
