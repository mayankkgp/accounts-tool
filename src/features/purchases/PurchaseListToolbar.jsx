import React from "react";
import Tabs from "../../components/ui/Tabs";
import { Search, Plus, SlidersHorizontal, X } from "lucide-react";

/**
 * PurchaseListToolbar Component
 * Renders the compact top toolbar for active search, filter triggers, and operational CTAs.
 * Designed with absolute structural parity to EntityListToolbar.jsx.
 * Includes: Density Mini Header Segment, Micro Toolbar, and Navigation Sub-Tabs.
 */
export default function PurchaseListToolbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onAddNew,
  isCompressed = false,
}) {
  const tabs = [
    { value: "finalized", label: "Finalized" },
    { value: "draft", label: "Drafts" },
  ];

  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-1.5 shrink-0 select-none font-sans" id="purchases-toolbar">
      {/* 1. Dense Mini Header Segment */}
      <div className="flex items-center justify-between px-1.5 py-0.5 select-none bg-slate-100/50 rounded-xs border border-slate-200/40" id="purchases-mini-header">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700">Commercial Ledger</span>
        <span className="text-[9px] font-mono text-slate-400 bg-slate-200/40 px-1 rounded-sm">Purchases</span>
      </div>

      <div className="max-w-md w-full flex flex-col gap-1" id="purchases-toolbar-inner">
        {/* 2. Navigation Sub-Tabs (Radix-Backed Segmented Tabs Toggle) */}
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

        {/* 3. Micro Toolbar: Compact Search Input and Action Buttons Row */}
        <div className="flex gap-1 items-center" id="purchases-search-filter-row">
          {/* Search Input field */}
          <div className="relative flex-1">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium animate-none" size={10} />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-6 text-[11px] placeholder-slate-500 font-medium outline-none focus:border-indigo-500 font-sans"
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

          {/* Static Uniform Filter Trigger */}
          <button
            type="button"
            className="h-6 bg-white border border-slate-300 rounded-sm px-2 text-[11px] text-slate-700 outline-none hover:bg-slate-50 focus:border-indigo-500 cursor-pointer font-sans flex items-center justify-center gap-1 transition-all"
            id="purchases-filter-visual-btn"
          >
            <SlidersHorizontal size={10} className="text-slate-500 shrink-0" />
            <span>Filter</span>
          </button>

          {/* Primary Operations Add Button */}
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
      </div>
    </div>
  );
}
