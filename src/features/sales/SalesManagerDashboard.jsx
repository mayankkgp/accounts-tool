import React, { useState, useEffect } from "react";
import { Plus, Search, Loader2, AlertCircle, RefreshCw, X, SlidersHorizontal } from "lucide-react";
import Tabs from "../../components/ui/Tabs";
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
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-1.5 shrink-0 select-none font-sans px-2 pt-2" id="sm-toolbar">
        <div className="max-w-2xl w-full flex flex-col gap-1" id="sm-toolbar-inner">
          
          <Tabs.Root value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <Tabs.List className="flex bg-slate-200/60 p-0.5 rounded-sm w-full" id="sm-segmented-toggle">
              {filters.map((f) => {
                const isActive = activeFilter === f;
                return (
                  <Tabs.Trigger
                    key={f}
                    value={f}
                    className={`flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 rounded-[1px] transition-all cursor-pointer outline-none select-none text-center ${
                      isActive
                        ? "bg-slate-950 text-slate-100 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                    }`}
                    id={`status-filter-${f.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {f}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </Tabs.Root>

          <div className="flex gap-1 items-center" id="sm-search-cta-row">
            <div className="relative flex-1">
              <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium" size={10} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-6 text-[11px] placeholder-slate-500 font-medium outline-none focus:border-indigo-500 font-sans"
                id="search-input-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 h-4 w-4 flex items-center justify-center cursor-pointer border-none bg-transparent"
                  title="Clear search"
                  id="clear-sm-search-btn"
                >
                  <X size={10} className="stroke-[2.5]" />
                </button>
              )}
            </div>

            <button
              type="button"
              className="h-6 bg-white border border-slate-300 text-slate-700 rounded-sm px-2 text-[11px] outline-none hover:bg-slate-50 cursor-pointer font-sans flex items-center justify-center gap-1 transition-all shrink-0"
            >
              <SlidersHorizontal size={10} className="text-slate-500 shrink-0" />
              <span>Filter</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNewClick}
              id="btn-new-sales-request"
              className="h-6 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm flex items-center justify-center gap-1 cursor-pointer transition-all border-none"
            >
              <Plus size={11} className="stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-wider font-sans">New Request</span>
            </button>
          </div>

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
