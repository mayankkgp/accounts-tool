import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchEntities, mapConnections } from "../../services/entityService";

export default function EntityConnectionsTab({ profile, onRefresh }) {
  const [localConnections, setLocalConnections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setLocalConnections(profile.connections || []);
      const targetType = profile.type === "brand" ? "factory" : (profile.type === "factory" ? "brand" : null);
      if (targetType) {
        searchEntities({ type: targetType, status: "active" }).then((opts) => {
          setCandidates(opts);
        });
      }
    }
  }, [profile]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (profile.type === "vendor") {
    return (
      <div className="p-4 border border-slate-100 bg-slate-50 rounded-sm text-center text-slate-500 font-medium text-[10px] italic select-none">
        Supplier connection mapping is only available for Brands and Factories.
      </div>
    );
  }

  const alreadyConnectedIds = new Set(localConnections.map((c) => c.id));
  const filteredCandidates = candidates.filter((item) => {
    if (alreadyConnectedIds.has(item.id)) return false;
    const q = searchQuery.toLowerCase();
    const matchBusiness = item.businessName?.toLowerCase().includes(q);
    const matchBrand = item.brandName?.toLowerCase().includes(q);
    return matchBusiness || matchBrand;
  });

  const handleAddConnection = async (candidate) => {
    const updated = [...localConnections, candidate];
    setLocalConnections(updated);
    setSearchQuery("");
    setIsOpen(false);

    try {
      await mapConnections(profile.id, profile.type, updated.map((c) => c.id));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Failed to map connection", e);
      setLocalConnections(profile.connections || []);
    }
  };

  const handleRemoveConnection = async (targetId) => {
    const updated = localConnections.filter((c) => c.id !== targetId);
    setLocalConnections(updated);

    try {
      await mapConnections(profile.id, profile.type, updated.map((c) => c.id));
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Failed to remove connection", e);
      setLocalConnections(profile.connections || []);
    }
  };

  const targetLabel = profile.type === "brand" ? "Factories" : "Brands";

  return (
    <div className="space-y-3 flex flex-col flex-1" id="connections-tab-container" ref={containerRef}>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase font-bold text-slate-500 select-none">
          Link Mapped {targetLabel}
        </label>

        <div className="relative w-full">
          <div className="relative flex items-center h-6 border border-slate-205 rounded-sm bg-white focus-within:border-indigo-500 transition-all px-1.5">
            <Search size={11} className="text-slate-400 shrink-0 mr-1" />
            <input
              type="text"
              placeholder={`Search ${targetLabel.toLowerCase()} to map...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full text-xs font-medium text-slate-800 bg-transparent border-0 outline-none p-0 h-full leading-none placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-650 outline-none">
                <X size={10} />
              </button>
            )}
          </div>

          {isOpen && (
            <div className="absolute top-7 left-0 right-0 z-50 bg-white border border-slate-200 shadow-md rounded-sm max-h-[120px] overflow-y-auto mt-0.5">
              {filteredCandidates.length === 0 ? (
                <div className="px-2 py-1.5 text-[10px] text-slate-400 italic font-medium font-sans">
                  No options matching query
                </div>
              ) : (
                filteredCandidates.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddConnection(item)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-indigo-55 flex items-center justify-between group transition-colors border-b border-slate-50/50 last:border-0"
                  >
                    <span className="truncate text-slate-805 font-medium">
                      {item.brandName ? `${item.brandName} (${item.businessName})` : item.businessName}
                    </span>
                    <Plus size={10} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-1" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-550 select-none">
          Active Relations ({localConnections.length})
        </span>
        {localConnections.length === 0 ? (
          <div className="p-3 border border-dashed border-slate-200 rounded-sm text-center text-slate-450 font-medium text-[10px] italic select-none">
            No mapped relations linked yet. Search and map options from the select bar.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1" id="active-tags-grid">
            {localConnections.map((conn) => (
              <div
                key={conn.id}
                className="inline-flex items-center h-5 gap-1 pl-1.5 pr-0.5 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-medium rounded-sm select-none transition-all hover:bg-slate-100"
                id={`connection-tag-${conn.id}`}
              >
                <span className="truncate max-w-[125px]" title={conn.businessName}>
                  {conn.brandName ? `${conn.brandName} (${conn.businessName})` : conn.businessName}
                </span>
                <button
                  onClick={() => handleRemoveConnection(conn.id)}
                  className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0 cursor-pointer"
                  title="Remove relationship"
                >
                  <X size={10} className="stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
