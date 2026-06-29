import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import FilterAccordionSection from "./FilterAccordionSection";

export default function InventoryFilterPopover({ inventory = [], filters, setFilters, isOpen, onClose, isCompressed = false }) {
  const popoverRef = useRef(null);
  const [openSection, setOpenSection] = useState("type");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && popoverRef.current && !popoverRef.current.contains(e.target) && !e.target.closest("#inventory-filter-visual-btn")) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const types = [...new Set(inventory.map((i) => i.type).filter(Boolean))].sort();
  const suppliers = [...new Set(inventory.map((i) => i.supplier).filter(Boolean))].sort();
  const locations = [...new Set(inventory.map((i) => i.location).filter(Boolean))].sort();

  const handleSelectChange = (field, val, checked) => {
    const curr = filters[field] || [];
    const next = checked ? curr.filter((x) => x !== val) : [...curr, val];
    setFilters((prev) => ({ ...prev, [field]: next }));
  };

  return (
    <div ref={popoverRef} className={`absolute ${isCompressed ? "left-0" : "right-0"} top-7 z-[70] w-72 bg-white border border-slate-200 shadow-lg rounded-sm p-2 flex flex-col gap-2 font-sans text-slate-800 select-none`} id="inventory-filter-popover">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1" id="popover-header">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Filters</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer h-4 w-4 flex items-center justify-center rounded-sm hover:bg-slate-100" type="button" id="close-popover-btn">
          <X size={12} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[280px] pr-0.5">
        <FilterAccordionSection title="Type" isOpen={openSection === "type"} onToggle={() => setOpenSection(openSection === "type" ? null : "type")} items={types} selectedItems={filters.type} onSelectChange={(val, chk) => handleSelectChange("type", val, chk)} />
        <FilterAccordionSection title="Supplier" isOpen={openSection === "supplier"} onToggle={() => setOpenSection(openSection === "supplier" ? null : "supplier")} items={suppliers} selectedItems={filters.supplier} onSelectChange={(val, chk) => handleSelectChange("supplier", val, chk)} searchPlaceholder="Search suppliers..." searchValue={supplierSearch} onSearchChange={setSupplierSearch} />
        <FilterAccordionSection title="Location" isOpen={openSection === "location"} onToggle={() => setOpenSection(openSection === "location" ? null : "location")} items={locations} selectedItems={filters.location} onSelectChange={(val, chk) => handleSelectChange("location", val, chk)} searchPlaceholder="Search locations..." searchValue={locationSearch} onSearchChange={setLocationSearch} />

        <div className="pb-1">
          <button type="button" onClick={() => setOpenSection(openSection === "age" ? null : "age")} className="w-full flex items-center justify-between py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-800">
            <span>Age (Days)</span>
            <span>{openSection === "age" ? "−" : "+"}</span>
          </button>
          {openSection === "age" && (
            <div className="mt-1 flex items-center gap-1.5 w-full">
              <input type="number" placeholder="Min" value={filters.age?.min || ""} onChange={(e) => setFilters((prev) => ({ ...prev, age: { ...prev.age, min: e.target.value } }))} className="h-6 w-full flex-1 bg-slate-50 border border-slate-300 rounded-sm px-1.5 text-[11px] font-mono outline-none focus:border-indigo-500" />
              <input type="number" placeholder="Max" value={filters.age?.max || ""} onChange={(e) => setFilters((prev) => ({ ...prev, age: { ...prev.age, max: e.target.value } }))} className="h-6 w-full flex-1 bg-slate-50 border border-slate-300 rounded-sm px-1.5 text-[11px] font-mono outline-none focus:border-indigo-500" />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 border-t border-slate-100 pt-1.5 justify-between" id="popover-actions">
        <button onClick={() => { setFilters({ type: [], supplier: [], location: [], age: { min: "", max: "" } }); setSupplierSearch(""); setLocationSearch(""); }} className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer font-bold uppercase transition-all" type="button" id="popover-reset-btn">
          Reset All
        </button>
        <button onClick={onClose} className="h-5 px-2 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all" type="button" id="popover-apply-btn">
          Close
        </button>
      </div>
    </div>
  );
}
