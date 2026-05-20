import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";
import { Search, Plus, ChevronDown, Check } from "lucide-react";

export default function EntityListToolbar({
  activeType,
  setActiveType,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onAddNew,
}) {
  const types = [
    { value: "brand", label: "Brands" },
    { value: "factory", label: "Factories" },
    { value: "vendor", label: "Vendors" },
  ];

  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 pb-1.5 shrink-0 select-none font-sans" id="entities-toolbar">
      {/* 1. Radix Segmented Tabs Toggle */}
      <Tabs.Root value={activeType} onValueChange={setActiveType} className="w-full">
        <Tabs.List className="flex bg-slate-200/60 p-0.5 rounded-sm w-full" id="entities-segmented-toggle">
          {types.map((t) => {
            const isActive = activeType === t.value;
            return (
              <Tabs.Trigger
                key={t.value}
                value={t.value}
                className={`flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 rounded-[1px] transition-all cursor-pointer outline-none select-none text-center ${
                  isActive
                    ? "bg-slate-950 text-slate-100 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                }`}
                id={`toggle-type-${t.value}`}
              >
                {t.label}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </Tabs.Root>

      {/* 2. Compact Search input and Filter Row */}
      <div className="flex gap-1 items-center" id="entities-search-filter-row">
        {/* Search input container */}
        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" size={10} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-1.5 text-[11px] placeholder-slate-400 outline-none focus:border-indigo-500 font-sans"
            id="entities-search-input"
          />
        </div>

        {/* Radix Dropdown Status Filter */}
        <div className="relative">
          <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger
              className="h-6 bg-white border border-slate-300 rounded-sm px-1.5 text-[11px] text-slate-700 outline-none focus:border-indigo-500 cursor-pointer font-sans flex items-center justify-between gap-1 min-w-[74px]"
              id="entities-status-select-trigger"
            >
              <Select.Value />
              <Select.Icon className="text-slate-400 flex items-center justify-center shrink-0">
                <ChevronDown size={10} />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className="bg-white border border-slate-200 rounded-sm shadow-md font-sans text-[11px] z-50 overflow-hidden min-w-[80px]"
                position="popper"
                sideOffset={2}
              >
                <Select.Viewport className="p-0.5">
                  {[
                    { value: "active", label: "Active" },
                    { value: "archived", label: "Archived" },
                    { value: "all", label: "All" },
                  ].map((item) => (
                    <Select.Item
                      key={item.value}
                      value={item.value}
                      className="flex items-center justify-between px-1.5 py-0.5 outline-none cursor-pointer rounded-[1px] text-[10px] text-slate-700 hover:bg-slate-100 focus:bg-slate-100 select-none h-5 font-mono uppercase tracking-wider"
                    >
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <Select.ItemIndicator className="text-indigo-600 flex items-center">
                        <Check size={9} className="stroke-[2.5]" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Add New Button */}
        <button
          onClick={onAddNew}
          title="Add New Portfolio"
          className="h-6 w-6 shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm flex items-center justify-center border border-indigo-700/50 shadow-sm cursor-pointer transition-colors"
          id="btn-add-entity"
        >
          <Plus size={13} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
