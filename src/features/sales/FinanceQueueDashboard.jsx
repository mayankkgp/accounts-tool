import React, { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, FileText, Check, ArrowRight, CornerDownRight, RefreshCw, X, SlidersHorizontal } from "lucide-react";
import Tabs from "../../components/ui/Tabs";
import { fetchSalesRequests, saveSalesRequest } from "../../services/salesService";
import SalesCard from "./SalesCard";
import FinanceTriageWorkspace from "./FinanceTriageWorkspace";

export default function FinanceQueueDashboard() {
  const [requests, setRequests] = useState([]);
  const [triageRequest, setTriageRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice Pending"); // Default tab
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Status Tabs Options
  const tabs = ["Invoice Pending", "Needs Correction", "Settlement Pending", "Fulfilled"];

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchSalesRequests({
        query: searchQuery,
        status: activeTab
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
  }, [activeTab, searchQuery]);

  // Handle Dynamic Finance Action triggers: Process Sales & Finalize Settlement
  const handleProcessSales = (req) => {
    setTriageRequest(req);
  };

  const handleFinalizeSettlement = async (req) => {
    const confirmAction = window.confirm(
      `Finance Action:\nWould you like to Finalize Settlement for ${req.id}? This will link and book unmapped ledger inventory details.`
    );
    if (!confirmAction) return;

    setProcessingId(req.id);
    try {
      alert("Executing Settlement & Cost Mapping ledger bookings (Phase 2)...\nUpdating request status to 'Fulfilled' in localStorage.");
      
      const updated = {
        ...req,
        status: "Fulfilled"
      };
      await saveSalesRequest(updated);
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  // If a request is active in triage, render the workspace
  if (triageRequest) {
    return (
      <FinanceTriageWorkspace
        req={triageRequest}
        onClose={() => setTriageRequest(null)}
        onRefresh={loadRequests}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative select-none font-sans" id="finance-dashboard-root">
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-1.5 shrink-0 select-none font-sans px-2 pt-2" id="finance-toolbar">
        <div className="max-w-2xl w-full flex flex-col gap-1" id="finance-toolbar-inner">
          
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Tabs.List className="flex bg-slate-200/60 p-0.5 rounded-sm w-full" id="finance-segmented-toggle">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <Tabs.Trigger
                    key={tab}
                    value={tab}
                    className={`flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 rounded-[1px] transition-all cursor-pointer outline-none select-none text-center ${
                      isActive
                        ? "bg-slate-950 text-slate-100 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                    }`}
                    id={`tab-filter-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {tab}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </Tabs.Root>

          <div className="flex gap-1 items-center" id="finance-search-row">
            <div className="relative flex-1">
              <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium" size={10} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-6 text-[11px] placeholder-slate-500 font-medium outline-none focus:border-indigo-500 font-sans"
                id="search-input-finance"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 h-4 w-4 flex items-center justify-center cursor-pointer border-none bg-transparent"
                  title="Clear search"
                  id="clear-finance-search-btn"
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
          </div>

        </div>
      </div>

      {/* 3. Infinite View List Layout */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-0" id="finance-list-container">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-24">
            <Loader2 size={24} className="animate-spin text-slate-500" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Fetching Local Storage Registry...
            </span>
          </div>
        ) : requests.length > 0 ? (
          <div className="flex flex-col gap-2 min-h-0 relative">
            {processingId && (
              <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-xs flex items-center justify-center z-20">
                <div className="bg-slate-900 text-white p-2 rounded-sm text-[11px] font-mono flex items-center gap-2 shadow-lg">
                  <Loader2 size={13} className="animate-spin text-indigo-400" />
                  <span>COMMITTING LEDGER ENTRY...</span>
                </div>
              </div>
            )}
            
            {requests.map((r) => (
              <SalesCard 
                key={r.id} 
                req={r} 
                role="Finance" 
                onProcess={handleProcessSales}
                onFinalize={handleFinalizeSettlement}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16 bg-white border border-slate-200 rounded-[2px] select-none p-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <AlertCircle size={16} />
            </div>
            <div className="text-center animate-fade-in">
              <p className="text-xs text-slate-700 font-bold font-sans">Queue Empty inside tab</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                No requests located in: "{activeTab}"
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 4. Mini persistent footer telemetry */}
      <div className="h-6 bg-slate-900 border-t border-slate-850 flex items-center justify-between px-3 text-[9px] font-mono text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span>Active Triage Tab count: <strong className="text-slate-100">{requests.length} pending items</strong></span>
        </div>
        <button 
          onClick={loadRequests}
          className="flex items-center gap-1 hover:text-white bg-transparent border-none text-[9px] font-mono text-slate-400 cursor-pointer font-medium"
        >
          <RefreshCw size={9} />
          <span>Sync queue database</span>
        </button>
      </div>

    </div>
  );
}
