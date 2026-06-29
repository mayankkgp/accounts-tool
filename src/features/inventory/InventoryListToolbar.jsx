import React, { useState } from "react";
import Tabs from "../../components/ui/Tabs";
import { Search, ListFilter, X } from "lucide-react";
import InventoryFilterPopover from "./InventoryFilterPopover";
import InventoryFilterPills from "./InventoryFilterPills";

/**
 * InventoryListToolbar Component
 * Renders the compact top toolbar for active search, filter triggers, and segment toggles.
 * Clones the visual style and high-density structure of PurchaseListToolbar.
 */
export default function InventoryListToolbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isCompressed = false,
  filters,
  setFilters,
  inventory = [],
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const tabs = [
    { value: "Pending", label: "Pending" },
    { value: "Reviewed", label: "Reviewed" },
  ];

  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 pb-1.5 shrink-0 select-none font-sans" id="inventory-toolbar">
      <div className="max-w-md w-full flex flex-col gap-1" id="inventory-toolbar-inner">
        {/* 2. Navigation Sub-Tabs Toggle */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Tabs.List className="flex bg-slate-200/60 p-0.5 rounded-sm w-full" id="inventory-segmented-toggle">
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

        {/* 3. Micro Toolbar: Compact Search Input, Filter Button */}
        <div className="flex gap-1 items-center relative" id="inventory-search-filter-row">
          <div className="relative flex-1">
            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium" size={10} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-6 text-[11px] placeholder-slate-500 font-medium outline-none focus:border-indigo-500"
              id="inventory-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 h-4 w-4 flex items-center justify-center cursor-pointer"
                title="Clear search"
                type="button"
                id="clear-inventory-search-btn"
              >
                <X size={10} className="stroke-[2.5]" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={`h-6 bg-white border ${isPopoverOpen ? "border-indigo-500 bg-indigo-50/10 text-indigo-700" : "border-slate-300 text-slate-700"} rounded-sm px-2 text-[11px] outline-none hover:bg-slate-50 cursor-pointer font-sans flex items-center justify-center gap-1 transition-all shrink-0`}
            id="inventory-filter-visual-btn"
          >
            <ListFilter size={10} className={`${isPopoverOpen ? "text-indigo-600" : "text-slate-500"} shrink-0`} />
            <span>Filter</span>
          </button>

          <InventoryFilterPopover
            inventory={inventory}
            filters={filters}
            setFilters={setFilters}
            isOpen={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            isCompressed={isCompressed}
          />
        </div>

        {/* Active Filter Pills */}
        <InventoryFilterPills filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
}
