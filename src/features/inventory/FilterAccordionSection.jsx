import React from "react";

export default function FilterAccordionSection({
  title,
  isOpen,
  onToggle,
  items = [],
  selectedItems = [],
  onSelectChange,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}) {
  const filtered = items.filter((item) =>
    searchPlaceholder && searchValue
      ? item.toLowerCase().includes(searchValue.toLowerCase())
      : true
  );

  return (
    <div className="border-b border-slate-100 pb-1.5 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-800"
      >
        <span>
          {title} ({selectedItems.length})
        </span>
        <span>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="mt-1 flex flex-col gap-1.5">
          {searchPlaceholder && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-6 bg-slate-50 border border-slate-200 rounded-sm px-1.5 text-[10px] outline-none focus:border-indigo-500 font-mono"
            />
          )}
          <div className="max-h-24 overflow-y-auto flex flex-col gap-1 pr-0.5">
            {filtered.length === 0 ? (
              <span className="text-[9px] text-slate-400 italic font-mono p-1">No options match</span>
            ) : (
              filtered.map((item) => {
                const checked = selectedItems.includes(item);
                return (
                  <label
                    key={item}
                    className="flex items-center gap-1.5 text-[10px] text-slate-700 font-medium cursor-pointer hover:bg-slate-50 py-0.5 rounded-sm select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onSelectChange(item, checked)}
                      className="h-3 w-3 rounded-xs text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="truncate flex-1">{item}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
