import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, Loader2, AlertCircle, RefreshCw, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isCustomerAccordionOpen, setIsCustomerAccordionOpen] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");

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
    if (selectedCustomers.length > 0) {
      return selectedCustomers.includes(r.customer);
    }
    return true;
  });

  const uniqueCustomers = Array.from(
    new Set(requests.map((r) => r.customer).filter(Boolean))
  ).sort();

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

            <div className="relative" ref={filterContainerRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-6 border rounded-sm px-2 text-[11px] outline-none cursor-pointer font-sans flex items-center justify-center gap-1 transition-all shrink-0 ${
                  selectedCustomers.length > 0
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
                id="sm-filter-btn"
              >
                <SlidersHorizontal size={10} className={`${selectedCustomers.length > 0 ? "text-indigo-600" : "text-slate-500"} shrink-0`} />
                <span>Filter</span>
                {selectedCustomers.length > 0 && (
                  <span className="ml-1 bg-indigo-600 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold leading-none">
                    {selectedCustomers.length}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-sm shadow-md p-2.5 z-50 animate-fade-in" id="sm-filter-popover">
                  <div className="flex flex-col gap-2">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">Filters</span>
                      {selectedCustomers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomers([]);
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
                        onClick={() => setIsCustomerAccordionOpen(!isCustomerAccordionOpen)}
                        className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors text-[10px] font-bold text-slate-600 uppercase tracking-wide cursor-pointer border-none outline-none"
                      >
                        <span>Customer</span>
                        {isCustomerAccordionOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      {isCustomerAccordionOpen && (
                        <div className="p-1.5 flex flex-col gap-1.5 bg-white">
                          {/* Sticky Search bar */}
                          <div className="relative">
                            <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" size={9} />
                            <input
                              type="text"
                              placeholder="Search customer..."
                              value={customerSearch}
                              onChange={(e) => setCustomerSearch(e.target.value)}
                              className="w-full h-5.5 bg-slate-50 border border-slate-200 rounded-xs pl-5 pr-1.5 text-[10px] outline-none focus:border-indigo-400 font-sans"
                              id="customer-accordion-search"
                            />
                          </div>

                          {/* Scrollable Container (max-h-40) */}
                          <div className="max-h-40 overflow-y-auto flex flex-col gap-1 pr-0.5">
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
                  </div>
                </div>
              )}
            </div>

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

      {/* Active Filter Pills Row */}
      {selectedCustomers.length > 0 && (
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex flex-wrap gap-1.5 items-center select-none font-sans shrink-0" id="sm-active-pills-row">
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
          <button
            type="button"
            onClick={() => setSelectedCustomers([])}
            className="text-[9px] text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider ml-auto cursor-pointer border-none bg-transparent"
          >
            Reset All
          </button>
        </div>
      )}

      {/* 3. Stream View List (Fluid scrolling viewport) */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-0" id="sm-list-container">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-24">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Fetching ledger database...
            </span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="flex flex-col gap-2 min-h-0">
            {filteredRequests.map((r) => (
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
                Category: "{activeFilter}" • Query: "{searchQuery || "N/A"}" {selectedCustomers.length > 0 ? `• Customer: "${selectedCustomers.join(", ")}"` : ""}
              </p>
            </div>
            {(searchQuery || selectedCustomers.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCustomers([]);
                }}
                className="text-[10px] font-mono text-indigo-600 hover:underline mt-1 bg-transparent border-none cursor-pointer font-bold"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

      </div>

      {/* 4. Sticky mini summary count block */}
      <div className="h-6 bg-slate-900 border-t border-slate-850 flex items-center justify-between px-3 text-[9px] font-mono text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span>Active filter queue size: <strong className="text-slate-100">{filteredRequests.length} records</strong></span>
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
