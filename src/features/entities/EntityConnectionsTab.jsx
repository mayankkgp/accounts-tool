import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus, ExternalLink, Loader2 } from "lucide-react";
import { searchEntities, mapConnections } from "../../services/entityService";

// EntityConnectionsTab manages the relational mapping ledger between Brand profiles and Factory manufacturing hubs.
export default function EntityConnectionsTab({ profile }) {
  const [localConnections, setLocalConnections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setLocalConnections(profile.connections || []);
      const trg = profile.type === "brand" ? "factory" : (profile.type === "factory" ? "brand" : null);
      if (trg) searchEntities({ type: trg, status: "active" }).then(setCandidates);
    }
  }, [profile]);

  useEffect(() => {
    const cb = (e) => containerRef.current && !containerRef.current.contains(e.target) && setIsOpen(false);
    document.addEventListener("mousedown", cb);
    return () => document.removeEventListener("mousedown", cb);
  }, []);

  if (profile.type === "vendor") {
    return (
      <div className="p-4 border border-slate-100 bg-slate-50 rounded-sm text-center text-slate-500 font-medium text-[10px] italic select-none font-sans">
        Supplier connection mapping is only available for Brands and Factories.
      </div>
    );
  }

  const alreadyConnectedIds = new Set(localConnections.map((c) => c.id));
  const filteredCandidates = candidates.filter((item) => {
    if (alreadyConnectedIds.has(item.id)) return false;
    const q = searchQuery.toLowerCase();
    return item.businessName?.toLowerCase().includes(q) || item.brandName?.toLowerCase().includes(q);
  });

  const handleAdd = async (candidate) => {
    const updated = [...localConnections, candidate];
    // Trigger progress spinner on the selected candidate row immediately
    setProcessingId(candidate.id);
    try {
      // Direct API write to ensure relation integrity persists on backend database
      await mapConnections(profile.id, profile.type, updated.map((c) => c.id));
      // Upon confirmed server acknowledgment, append item to local list & dismiss dropdown
      setLocalConnections(updated);
      setSearchQuery("");
      setIsOpen(false);
    } catch {
      // Recover baseline state if mapped API fails
      setLocalConnections(profile.connections || []);
    } finally {
      // Clear specific row processing key to release interactive buttons
      setProcessingId(null);
    }
  };

  const handleRemove = async (targetId) => {
    const updated = localConnections.filter((c) => c.id !== targetId);
    // Bind specific target identification key to process loader state over exact row
    setProcessingId(targetId);
    try {
      // Fire relation severance on target endpoint
      await mapConnections(profile.id, profile.type, updated.map((c) => c.id));
      // Flush removed connection locally after api response settles, offering clean spinner UX during API delays
      setLocalConnections(updated);
    } catch {
      // Restore cached connections vector in case of transaction fault
      setLocalConnections(profile.connections || []);
    } finally {
      // Unblock UI interaction
      setProcessingId(null);
    }
  };

  const targetLabel = profile.type === "brand" ? "Factories" : "Brands";
  const getTermsStr = (terms) => {
    if (!terms) return "--";
    if (typeof terms === "object") {
      const parts = [];
      if (terms.creditDays !== undefined && terms.creditDays !== null && terms.creditDays !== "") parts.push(`CR:${terms.creditDays}D`);
      if (terms.debitDays !== undefined && terms.debitDays !== null && terms.debitDays !== "") parts.push(`DB:${terms.debitDays}D`);
      return parts.join("/") || "--";
    }
    return "--";
  };

  return (
    <div className="space-y-2 flex flex-col flex-1 font-sans text-[10px]" id="connections-tab-container" ref={containerRef}>
      <div className="relative w-full">
        <div className="relative flex items-center h-6 border border-slate-200 rounded-sm bg-white focus-within:border-indigo-500 transition-all px-1.5">
          <Search size={11} className="text-slate-400 shrink-0 mr-1" />
          <input
            type="text" placeholder={`+ Link new ${targetLabel.toLowerCase()}...`} value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)}
            className="w-full text-[10px] font-medium text-slate-800 bg-transparent border-0 outline-none p-0 h-full leading-none placeholder-slate-400"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-slate-700 outline-none"><X size={10} /></button>
          )}
        </div>
        {isOpen && (
          <div className="absolute top-7 left-0 right-0 z-50 bg-white border border-slate-200 shadow-md rounded-sm max-h-[256px] overflow-y-auto mt-0.5 animate-fade-in">
            {filteredCandidates.length === 0 ? (
              <div className="px-2 py-1.5 text-[9px] text-slate-500 italic font-medium">No options matching query</div>
            ) : (
              filteredCandidates.map((item) => {
                const city = item.addresses?.[0]?.city || "";
                const isProcessing = item.id === processingId;
                return (
                  <button
                    type="button" key={item.id} onClick={() => handleAdd(item)} disabled={isProcessing}
                    className="w-full text-left px-2 py-1 text-[10px] hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-100 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate text-slate-800 font-medium flex items-center gap-1.5 min-w-0 mr-1">
                      <span className="truncate">{item.brandName ? `${item.brandName} (${item.businessName})` : item.businessName}</span>
                      <span className="text-[8px] text-slate-500 font-mono shrink-0">[{item.gst || "NO GST"}{city ? ` · ${city.toUpperCase()}` : ""}]</span>
                    </span>
                    {isProcessing ? <Loader2 size={10} className="animate-spin text-indigo-500 shrink-0" /> : <Plus size={10} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col border border-slate-100 rounded-sm">
        {localConnections.length === 0 ? (
          <div className="p-3 bg-slate-50 text-center text-slate-500 font-medium text-[9px] italic select-none">No mapped relations linked yet. Search and map options from the select bar.</div>
        ) : (
          <div className="flex flex-col animate-fade-in animate-duration-200" id="active-ledger-rows">
            <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_60px] px-1.5 py-1 bg-slate-100 border-b border-slate-200 select-none text-[8px] text-slate-600 font-bold uppercase tracking-wider">
              <span>Identity</span><span>Compliance</span><span>Contact</span><span>Terms</span><span className="text-right">Actions</span>
            </div>
            {localConnections.map((conn) => (
              <div key={conn.id} className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1fr_60px] items-center h-8 border-b border-slate-100 px-1.5 hover:bg-slate-50 transition-colors" id={`connection-row-${conn.id}`}>
                <div className="flex items-center min-w-0 mr-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 shrink-0 ${conn.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="text-[10px] text-slate-800 font-semibold truncate" title={conn.businessName}>{conn.brandName ? `${conn.brandName} (${conn.businessName})` : conn.businessName}</span>
                  <span className="text-[8px] text-slate-500 font-mono ml-1 uppercase shrink-0">[{conn.id}]</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] text-slate-600 font-mono font-medium truncate">{conn.gst || "NO GST"}</span>
                  {conn.addresses?.[0]?.city && <span className="text-[8px] text-slate-600 uppercase font-bold truncate">{conn.addresses[0].city}</span>}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-800 font-semibold truncate">{conn.pocName || "--"}</span>
                  {conn.pocContact && <span className="text-[9px] text-slate-600 font-medium truncate">{conn.pocContact}</span>}
                </div>
                <span className="text-[9px] text-slate-500 font-mono truncate">{getTermsStr(conn.terms)}</span>
                {/* Mouse interaction tracking area equipped with auto-abort mechanism to clear intent states */}
                <div className="flex items-center gap-2.5 justify-end shrink-0" onMouseLeave={() => setConfirmDeleteId(null)}>
                  <button
                    type="button" disabled={conn.id === processingId} onClick={() => window.open(`/entities/${conn.id}`, '_blank')}
                    className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" title="View Profile"
                  >
                    <ExternalLink size={10} />
                  </button>
                  {conn.id === processingId ? (
                    <div className="h-6 w-6 flex items-center justify-center shrink-0">
                      <Loader2 size={10} className="animate-spin text-slate-400" />
                    </div>
                  ) : confirmDeleteId === conn.id ? (
                    /* Inline double-state confirmation designed to prevent accidental clicks without relying on blocking modal popups */
                    <button
                      type="button" onClick={() => { handleRemove(conn.id); setConfirmDeleteId(null); }}
                      className="px-2 h-6 rounded-sm bg-red-100 text-red-700 hover:bg-red-200 flex items-center font-bold text-[9px] uppercase tracking-wide transition-all shrink-0 cursor-pointer"
                    >
                      Remove?
                    </button>
                  ) : (
                    <button
                      type="button" onClick={() => setConfirmDeleteId(conn.id)}
                      className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0 cursor-pointer" title="Remove relationship"
                    >
                      <X size={10} className="stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
