import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, AlertCircle, FileText, Check, ArrowRight, CornerDownRight, RefreshCw, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import Tabs from "../../components/ui/Tabs";
import { fetchSalesRequests, saveSalesRequest } from "../../services/salesService";
import SalesCard from "./SalesCard";
import FinanceTriageWorkspace from "./FinanceTriageWorkspace";
import FinanceMappingWorkspace from "./FinanceMappingWorkspace";
import CostInwardingWorkspace from "./CostInwardingWorkspace";

export default function FinanceQueueDashboard() {
  const [requests, setRequests] = useState([]);
  const [triageRequest, setTriageRequest] = useState(null);
  const [mappingRequest, setMappingRequest] = useState(null);
  const [inwardingRequest, setInwardingRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice Pending"); // Default tab
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedAMs, setSelectedAMs] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState("Customer");
  const [customerSearch, setCustomerSearch] = useState("");
  const [amSearch, setAmSearch] = useState("");

  const filterContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesCustomer = selectedCustomers.length === 0 || selectedCustomers.includes(r.customer);
    const matchesAM = selectedAMs.length === 0 || selectedAMs.includes(r.smName);
    return matchesCustomer && matchesAM;
  });

  const uniqueCustomers = Array.from(
    new Set(requests.map((r) => r.customer).filter(Boolean))
  ).sort();

  const uniqueAMs = Array.from(
    new Set(requests.map((r) => r.smName).filter(Boolean))
  ).sort();

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

  const handleFinalizeSettlement = (req) => {
    setMappingRequest(req);
  };

  // If a request is active in mapping, render mapping workspace
  if (mappingRequest) {
    return (
      <FinanceMappingWorkspace
        req={mappingRequest}
        onClose={() => setMappingRequest(null)}
        onRefresh={loadRequests}
        onBackToInwarding={() => {
          setInwardingRequest(mappingRequest);
          setMappingRequest(null);
        }}
      />
    );
  }

  // If a request is active in inwarding, render inwarding workspace
  if (inwardingRequest) {
    return (
      <CostInwardingWorkspace
        req={inwardingRequest}
        onClose={() => setInwardingRequest(null)}
        onRefresh={loadRequests}
        onProceedToMapping={() => {
          setMappingRequest(inwardingRequest);
          setInwardingRequest(null);
        }}
      />
    );
  }

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

            <div className="relative" ref={filterContainerRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-6 border rounded-sm px-2 text-[11px] outline-none cursor-pointer font-sans flex items-center justify-center gap-1 transition-all shrink-0 ${
                  (selectedCustomers.length + selectedAMs.length) > 0
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
                id="finance-filter-btn"
              >
                <SlidersHorizontal size={10} className={`${(selectedCustomers.length + selectedAMs.length) > 0 ? "text-indigo-600" : "text-slate-500"} shrink-0`} />
                <span>Filter</span>
                {(selectedCustomers.length + selectedAMs.length) > 0 && (
                  <span className="ml-1 bg-indigo-600 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold leading-none">
                    {selectedCustomers.length + selectedAMs.length}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-sm shadow-md p-2.5 z-50 animate-fade-in" id="finance-filter-popover">
                  <div className="flex flex-col gap-2">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">Filters</span>
                      {(selectedCustomers.length + selectedAMs.length) > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomers([]);
                            setSelectedAMs([]);
                            setIsFilterOpen(false);
                          }}
                          className="text-[9px] text-indigo-600 hover:underline cursor-pointer border-none bg-transparent font-semibold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Customer Accordion */}
                    <div className="flex flex-col border border-slate-100 rounded-sm">
                      <button
                        type="button"
                        onClick={() => setExpandedAccordion(expandedAccordion === "Customer" ? null : "Customer")}
                        className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors text-[10px] font-bold text-slate-600 uppercase tracking-wide cursor-pointer border-none outline-none"
                      >
                        <span>Customer</span>
                        {expandedAccordion === "Customer" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      {expandedAccordion === "Customer" && (
                        <div className="p-1.5 flex flex-col gap-1.5 bg-white">
                          <div className="relative">
                            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" size={9} />
                            <input
                              type="text"
                              placeholder="Search customer..."
                              value={customerSearch}
                              onChange={(e) => setCustomerSearch(e.target.value)}
                              className="w-full h-5.5 bg-slate-50 border border-slate-200 rounded-xs pl-5 pr-1.5 text-[10px] outline-none focus:border-indigo-400 font-sans"
                              id="finance-customer-accordion-search"
                            />
                          </div>

                          <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pr-0.5">
                            {uniqueCustomers.filter(cust => 
                              cust.toLowerCase().includes(customerSearch.toLowerCase())
                            ).length > 0 ? (
                              uniqueCustomers
                                .filter(cust => cust.toLowerCase().includes(customerSearch.toLowerCase()))
                                .map((cust) => {
                                  const isChecked = selectedCustomers.includes(cust);
                                  return (
                                    <label
                                      key={cust}
                                      className="flex items-center gap-1.5 p-1 hover:bg-slate-50 rounded-xs cursor-pointer select-none text-[10px] text-slate-700"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          if (isChecked) {
                                            setSelectedCustomers(prev => prev.filter(c => c !== cust));
                                          } else {
                                            setSelectedCustomers(prev => [...prev, cust]);
                                          }
                                        }}
                                        className="rounded-xs border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-3 w-3"
                                      />
                                      <span className="truncate">{cust}</span>
                                    </label>
                                  );
                                })
                            ) : (
                              <span className="text-[10px] text-slate-400 text-center py-2 font-medium">No customers found</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AM Accordion */}
                    <div className="flex flex-col border border-slate-100 rounded-sm">
                      <button
                        type="button"
                        onClick={() => setExpandedAccordion(expandedAccordion === "AM" ? null : "AM")}
                        className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors text-[10px] font-bold text-slate-600 uppercase tracking-wide cursor-pointer border-none outline-none"
                      >
                        <span>AM</span>
                        {expandedAccordion === "AM" ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      {expandedAccordion === "AM" && (
                        <div className="p-1.5 flex flex-col gap-1.5 bg-white">
                          <div className="relative">
                            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" size={9} />
                            <input
                              type="text"
                              placeholder="Search AM..."
                              value={amSearch}
                              onChange={(e) => setAmSearch(e.target.value)}
                              className="w-full h-5.5 bg-slate-50 border border-slate-200 rounded-xs pl-5 pr-1.5 text-[10px] outline-none focus:border-indigo-400 font-sans"
                              id="finance-am-accordion-search"
                            />
                          </div>

                          <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pr-0.5">
                            {uniqueAMs.filter(am => 
                              am.toLowerCase().includes(amSearch.toLowerCase())
                            ).length > 0 ? (
                              uniqueAMs
                                .filter(am => am.toLowerCase().includes(amSearch.toLowerCase()))
                                .map((am) => {
                                  const isChecked = selectedAMs.includes(am);
                                  return (
                                    <label
                                      key={am}
                                      className="flex items-center gap-1.5 p-1 hover:bg-slate-50 rounded-xs cursor-pointer select-none text-[10px] text-slate-700"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          if (isChecked) {
                                            setSelectedAMs(prev => prev.filter(c => c !== am));
                                          } else {
                                            setSelectedAMs(prev => [...prev, am]);
                                          }
                                        }}
                                        className="rounded-xs border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-3 w-3"
                                      />
                                      <span className="truncate">{am}</span>
                                    </label>
                                  );
                                })
                            ) : (
                              <span className="text-[10px] text-slate-400 text-center py-2 font-medium">No managers found</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Active Filter Pills Row */}
      {(selectedCustomers.length > 0 || selectedAMs.length > 0) && (
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex flex-wrap gap-1.5 items-center select-none font-sans shrink-0" id="finance-active-pills-row">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mr-1">Active Filters:</span>
          {selectedCustomers.map((cust) => (
            <div
              key={cust}
              className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm text-[10px] font-medium"
            >
              <span>Customer: {cust}</span>
              <button
                type="button"
                onClick={() => setSelectedCustomers(prev => prev.filter(c => c !== cust))}
                className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <X size={10} className="stroke-[2.5]" />
              </button>
            </div>
          ))}
          {selectedAMs.map((am) => (
            <div
              key={am}
              className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm text-[10px] font-medium"
            >
              <span>AM: {am}</span>
              <button
                type="button"
                onClick={() => setSelectedAMs(prev => prev.filter(c => c !== am))}
                className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer border-none bg-transparent flex items-center justify-center"
              >
                <X size={10} className="stroke-[2.5]" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setSelectedCustomers([]);
              setSelectedAMs([]);
            }}
            className="text-[9px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider ml-auto cursor-pointer border-none bg-transparent"
          >
            Reset All
          </button>
        </div>
      )}

      {/* 3. Infinite View List Layout */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-0" id="finance-list-container">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-24">
            <Loader2 size={24} className="animate-spin text-slate-500" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Fetching Local Storage Registry...
            </span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="flex flex-col gap-2 min-h-0 relative">
            {processingId && (
              <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-xs flex items-center justify-center z-20">
                <div className="bg-slate-900 text-white p-2 rounded-sm text-[11px] font-mono flex items-center gap-2 shadow-lg">
                  <Loader2 size={13} className="animate-spin text-indigo-400" />
                  <span>COMMITTING LEDGER ENTRY...</span>
                </div>
              </div>
            )}
            
            {filteredRequests.map((r) => (
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
              <p className="text-xs text-slate-700 font-bold font-sans">No matching requests found</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                Tab: "{activeTab}" {selectedCustomers.length > 0 ? `• Customer: "${selectedCustomers.join(", ")}"` : ""} {selectedAMs.length > 0 ? `• AM: "${selectedAMs.join(", ")}"` : ""}
              </p>
            </div>
            {(searchQuery || selectedCustomers.length > 0 || selectedAMs.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCustomers([]);
                  setSelectedAMs([]);
                }}
                className="text-[10px] font-mono text-indigo-600 hover:underline mt-1 bg-transparent border-none cursor-pointer font-bold"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

      </div>

      {/* 4. Mini persistent footer telemetry */}
      <div className="h-6 bg-slate-900 border-t border-slate-850 flex items-center justify-between px-3 text-[9px] font-mono text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span>Active Triage Tab count: <strong className="text-slate-100">{filteredRequests.length} pending items</strong></span>
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
