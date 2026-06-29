import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Check, ChevronDown } from "lucide-react";

const INITIAL_LOCATIONS = [
  "Arvind Textiles, Ahmedabad",
  "Vardhman Group, Ludhiana",
  "Raymond, Mumbai",
  "Fabrito Central Warehouse, Ahmedabad",
  "Apex Whouse A, Ahmedabad",
  "Dyeing Hub Unit 3, Ahmedabad"
];

export default function LocationDropdown({ value, onChange, disabled }) {
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem("fabrito_custom_locations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...INITIAL_LOCATIONS, ...parsed];
        }
      } catch (e) {
        console.error("Failed to parse custom locations", e);
      }
    }
    return INITIAL_LOCATIONS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [entityName, setEntityName] = useState("");
  const [city, setCity] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const containerRef = useRef(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch(value || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!entityName.trim() || !city.trim()) {
      setErrorMsg("Both Entity Name and City are required");
      return;
    }
    const newLoc = `${entityName.trim()}, ${city.trim()}`;
    const updated = locations.includes(newLoc) ? locations : [...locations, newLoc];
    setLocations(updated);
    if (!locations.includes(newLoc)) {
      const customOnly = updated.filter(l => !INITIAL_LOCATIONS.includes(l));
      localStorage.setItem("fabrito_custom_locations", JSON.stringify(customOnly));
    }
    onChange(newLoc);
    setIsAdding(false);
    setEntityName("");
    setCity("");
    setErrorMsg("");
  };

  const filtered = locations.filter(loc =>
    loc.toLowerCase().includes(search.toLowerCase())
  );

  if (isAdding) {
    return (
      <div className="flex flex-col gap-1 w-full" id="add-location-form">
        <div className="flex items-center gap-1.5 w-full">
          <input
            type="text"
            placeholder="Entity Name"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            disabled={disabled}
            className="h-6 flex-1 min-w-0 border border-slate-300 rounded-sm px-1.5 text-[11px] focus:outline-none focus:border-indigo-500 font-mono"
            id="new-location-entity"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={disabled}
            className="h-6 flex-1 min-w-0 border border-slate-300 rounded-sm px-1.5 text-[11px] focus:outline-none focus:border-indigo-500 font-mono"
            id="new-location-city"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={disabled}
            className="h-5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-0.5"
            id="save-new-location-btn"
          >
            <Check size={10} />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsAdding(false); setErrorMsg(""); }}
            disabled={disabled}
            className="h-5 w-5 border border-slate-300 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-sm flex items-center justify-center transition-colors cursor-pointer"
            id="cancel-new-location-btn"
          >
            <X size={10} />
          </button>
        </div>
        {errorMsg && (
          <span className="text-[9px] text-rose-500 font-mono font-semibold">{errorMsg}</span>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" id="location-dropdown-wrapper">
      <div className="flex items-center relative w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Search location..."
          className="h-6 text-[11px] w-full border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-500 bg-white pl-1.5 pr-5 font-mono font-medium disabled:opacity-60"
          id="location-search-input"
        />
        <ChevronDown size={12} className="absolute right-1.5 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-[60] left-0 right-0 mt-1 max-h-[160px] overflow-y-auto bg-white border border-slate-200 rounded-sm shadow-md flex flex-col">
          {filtered.length > 0 ? (
            filtered.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  onChange(loc);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2 py-1 text-[11px] font-mono hover:bg-slate-50 border-b border-slate-100/50 transition-colors last:border-b-0 ${
                  value === loc ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700"
                }`}
              >
                {loc}
              </button>
            ))
          ) : (
            <div className="px-2 py-1 text-[10px] text-slate-400 font-mono italic">
              No matching locations
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setIsOpen(false);
            }}
            className="w-full text-left px-2 py-1 text-[11px] font-sans font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 border-t border-slate-200 flex items-center gap-1 sticky bottom-0 mt-auto"
          >
            <Plus size={10} /> Add New Location
          </button>
        </div>
      )}
    </div>
  );
}
