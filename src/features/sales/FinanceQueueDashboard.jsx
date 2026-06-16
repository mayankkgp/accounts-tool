import React, { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, FileText, Check, ArrowRight, CornerDownRight, RefreshCw } from "lucide-react";
import { fetchSalesRequests, saveSalesRequest } from "../../services/salesService";
import SalesCard from "./SalesCard";

export default function FinanceQueueDashboard() {
  const [requests, setRequests] = useState([]);
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
  const handleProcessSales = async (req) => {
    const confirmAction = window.confirm(
      `Finance Action:\nWould you like to process Sales Invoice Request ${req.id} for Apex/Loom company?`
    );
    if (!confirmAction) return;

    setProcessingId(req.id);
    try {
      // Simulate mapping and set request to "Fulfilled" or "Settlement Pending"
      alert("Simulating Cost Inwarding & Sales Mapping (Phase 2)...\nThe system will now transition this request to 'Fulfilled' in localStorage.");
      
      const updated = {
        ...req,
        status: "Fulfilled",
        financeFeedback: ""
      };
      await saveSalesRequest(updated);
      loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative select-none font-sans" id="finance-dashboard-root">
      
      {/* 1. Header Area with active Workspace indicator */}
      <div className="h-10 bg-white border-b border-slate-200 px-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2 pl-3">
          <span className="text-[12px] font-bold text-slate-800 uppercase tracking-widest font-mono">Invoice Requests</span>
          <span className="text-slate-350">|</span>
          <span className="text-[10px] text-slate-400 bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-[1px] font-mono font-bold">
            FINANCE QUEUE
          </span>
        </div>

        <div className="flex items-center gap-2 pr-3 text-[10px] text-slate-450 font-mono">
          <span>Active queue: Triage & Audit Workspace</span>
        </div>
      </div>

      {/* 2. Interactive Clickable Tabs Row (Header Tabs Filter) */}
      <div className="bg-slate-100 border-b border-slate-200 px-3/5 p-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shrink-0">
        
        {/* Clickable Tabs list */}
        <div className="flex items-center gap-[2px] bg-slate-200/65 p-[2px] rounded-sm max-w-fit" id="finance-queue-tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                id={`tab-filter-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide font-mono rounded-[1px] transition-all cursor-pointer border-none ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-850 hover:bg-slate-100/40"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Dense Query Box */}
        <div className="relative w-full sm:w-60 pr-1.5">
          <span className="absolute left-2.5 top-1.5 text-slate-450 flex items-center h-full">
            <Search size={12} />
          </span>
          <input
            type="text"
            placeholder="Search invoice lists, customer entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-6 text-xs bg-white text-slate-800 border border-slate-300 rounded-sm pl-7 pr-1.5 focus:border-indigo-400 focus:outline-none placeholder-slate-400 font-medium"
            id="search-input-finance"
          />
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
