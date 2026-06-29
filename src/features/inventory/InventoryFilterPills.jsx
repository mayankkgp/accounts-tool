import React from "react";
import { X } from "lucide-react";

export default function InventoryFilterPills({ filters, setFilters }) {
  const pills = [];

  // 1. Types
  if (filters.type && filters.type.length > 0) {
    filters.type.forEach((t) => {
      pills.push({
        id: `type-${t}`,
        label: `Type: ${t}`,
        onRemove: () => {
          setFilters((prev) => ({
            ...prev,
            type: prev.type.filter((x) => x !== t),
          }));
        },
      });
    });
  }

  // 2. Suppliers
  if (filters.supplier && filters.supplier.length > 0) {
    filters.supplier.forEach((s) => {
      pills.push({
        id: `supplier-${s}`,
        label: `Supplier: ${s}`,
        onRemove: () => {
          setFilters((prev) => ({
            ...prev,
            supplier: prev.supplier.filter((x) => x !== s),
          }));
        },
      });
    });
  }

  // 3. Locations
  if (filters.location && filters.location.length > 0) {
    filters.location.forEach((l) => {
      pills.push({
        id: `location-${l}`,
        label: `Location: ${l}`,
        onRemove: () => {
          setFilters((prev) => ({
            ...prev,
            location: prev.location.filter((x) => x !== l),
          }));
        },
      });
    });
  }

  // 4. Age Min
  if (filters.age && filters.age.min !== "" && filters.age.min !== undefined && filters.age.min !== null) {
    pills.push({
      id: "age-min",
      label: `Min Age: ${filters.age.min}d`,
      onRemove: () => {
        setFilters((prev) => ({
          ...prev,
          age: { ...prev.age, min: "" },
        }));
      },
    });
  }

  // 5. Age Max
  if (filters.age && filters.age.max !== "" && filters.age.max !== undefined && filters.age.max !== null) {
    pills.push({
      id: "age-max",
      label: `Max Age: ${filters.age.max}d`,
      onRemove: () => {
        setFilters((prev) => ({
          ...prev,
          age: { ...prev.age, max: "" },
        }));
      },
    });
  }

  if (pills.length === 0) return null;

  const handleClearAll = () => {
    setFilters({
      type: [],
      supplier: [],
      location: [],
      age: { min: "", max: "" },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1 pb-1 w-full overflow-x-auto select-none" id="inventory-filter-pills-row">
      {pills.map((p) => (
        <div
          key={p.id}
          className="h-5 pl-2 pr-1 rounded-full bg-slate-100 text-[10px] text-slate-600 flex items-center gap-1 shrink-0 font-medium font-mono border border-slate-200"
        >
          <span>{p.label}</span>
          <button
            type="button"
            onClick={p.onRemove}
            className="text-slate-400 hover:text-slate-600 cursor-pointer h-3.5 w-3.5 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleClearAll}
        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider ml-1 hover:underline cursor-pointer"
        id="clear-all-filters-btn"
      >
        Clear All
      </button>
    </div>
  );
}
