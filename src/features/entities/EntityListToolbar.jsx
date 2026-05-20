import React from "react";
import { Search, Plus, Filter } from "lucide-react";

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
    <div className="flex flex-col gap-1 border-b border-slate-200 pb-1.5 shrink-0 select-none" id="entities-toolbar">
      {/* 1. Segmented Toggle Control */}
      <div className="flex bg-slate-200/60 p-0.5 rounded-sm" id="entities-segmented-toggle">
        {types.map((t) => {
          const isActive = activeType === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={`flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 rounded-[1px] transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-950 text-slate-100 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-350/40"
              }`}
              id={`toggle-type-${t.value}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

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

        {/* Status Dropdown Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-6 bg-white border border-slate-300 rounded-sm px-1 text-[11px] text-slate-700 outline-none focus:border-indigo-500 cursor-pointer font-sans appearance-none pr-4 min-w-[62px]"
            id="entities-status-select"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
          <Filter className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={9} />
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
