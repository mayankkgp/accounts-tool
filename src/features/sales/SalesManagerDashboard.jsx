import React, { useState, useEffect } from "react";
import { Plus, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { fetchSalesRequests } from "../../services/salesService";
import SalesCard from "./SalesCard";
import SalesRequestFormModal from "./SalesRequestFormModal";

export default function SalesManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Invoice Pending"); // Default
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);

  // Status Filter Options
  const filters = ["Invoice Pending", "Needs Correction", "Settlement Pending", "Fulfilled"];

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchSalesRequests({
        query: searchQuery,
        status: activeFilter
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeFilter, searchQuery]);

  const handleCreateNewClick = () => {
    setEditingTarget(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (req) => {
    setEditingTarget(req);
    setIsFormOpen(true);
  };

  const handleSaveSuccess = () => {
    setIsFormOpen(false);
    setEditingTarget(null);
    loadRequests();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative select-none font-sans" id="sm-dashboard-root">
      
      {/* 1. Header Toolbar */}
      <div className="h-10 bg-white border-b border-slate-200 px-3/5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2 pl-3">
          <span className="text-[12px] font-bold text-slate-800 uppercase tracking-widest font-mono">Invoice Requests</span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded-[1px] font-mono font-bold">SM DESK</span>
        </div>

        <div className="flex items-center gap-2 pr-3">
          <button
            type="button"
            onClick={handleCreateNewClick}
            id="btn-new-sales-request"
            className="h-6 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-sm text-[11px] flex items-center gap-1 cursor-pointer shadow-sm border-none"
          >
            <Plus size={12} className="stroke-[3]" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-slate-100 border-b border-slate-200 p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        
        {/* Status Pills Filter */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none" id="sm-status-filters">
          {filters.map((f) => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                id={`status-filter-${f.replace(/\s+/g, "-").toLowerCase()}`}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 h-6 rounded-[2px] text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-all border shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-slate-100 border-slate-950 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-60">
          <span className="absolute left-2 top-1.5 text-slate-450 flex items-center h-full">
            <Search size={12} />
          </span>
          <input
            type="text"
            placeholder="Search customer, ID, line description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-6 text-xs bg-white text-slate-800 border border-slate-300 rounded-sm pl-7 pr-1.5 focus:border-indigo-400 focus:outline-none placeholder-slate-400 font-medium"
            id="search-input-sm"
          />
        </div>

      </div>

      {/* 3. Stream View List (Fluid scrolling viewport) */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-0" id="sm-list-container">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-24">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Fetching ledger database...
            </span>
          </div>
        ) : requests.length > 0 ? (
          <div className="flex flex-col gap-2 min-h-0">
            {requests.map((r) => (
              <SalesCard 
                key={r.id} 
                req={r} 
                role="SM" 
                onEdit={handleEditClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16 bg-white border border-slate-200 rounded-[2px] select-none p-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <AlertCircle size={16} />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-700 font-bold font-sans">No matching requests found</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                Category: "{activeFilter}" • Query: "{searchQuery || "N/A"}"
              </p>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[10px] font-mono text-indigo-600 hover:underline mt-1 bg-transparent border-none cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}

      </div>

      {/* 4. Sticky mini summary count block */}
      <div className="h-6 bg-slate-900 border-t border-slate-850 flex items-center justify-between px-3 text-[9px] font-mono text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span>Active filter queue size: <strong className="text-slate-100">{requests.length} records</strong></span>
        </div>
        <div className="flex items-center gap-2 hover:text-white cursor-pointer" onClick={loadRequests}>
          <RefreshCw size={9} />
          <span>Sync localdb</span>
        </div>
      </div>

      {/* Nested interactive setup modal form */}
      <SalesRequestFormModal 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTarget(null);
        }}
        editingRequest={editingTarget}
        onSaveSuccess={handleSaveSuccess}
      />

    </div>
  );
}
