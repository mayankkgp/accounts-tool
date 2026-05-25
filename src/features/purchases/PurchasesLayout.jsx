import React, { useState, useEffect } from "react";
import PurchaseListToolbar from "./PurchaseListToolbar";
import PurchaseDataGrid from "./PurchaseDataGrid";
import { fetchPurchases } from "../../services/purchaseService";
import { getVendorLookupMap } from "../../services/entityService";

/**
 * PurchasesLayout Component
 * Primary workspace component of the Purchases module.
 * Embeds high-density left-aligned directories matching EntitiesLayout.jsx.
 */
export default function PurchasesLayout() {
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("finalized"); // "finalized" & "draft"
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorLookup, setVendorLookup] = useState({});

  // Debouncing logic for keyword query tracking
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Generate lookup mapping from entityService on component load and triggers
  useEffect(() => {
    try {
      const lookup = getVendorLookupMap();
      setVendorLookup(lookup);
    } catch (e) {
      console.error("Critical: Failed to generate fast supplier identity lookup caches.", e);
    }
  }, [refreshTrigger]);

  // Handles updating table lists after actions trigger refresh states
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Pessimistic list loading cycle
  useEffect(() => {
    let isCurrentFetch = true;

    async function loadPurchaseRegister() {
      setIsLoading(true);
      try {
        const results = await fetchPurchases({
          query: debouncedQuery,
          status: activeTab,
        });
        if (isCurrentFetch) {
          setPurchases(results);
        }
      } catch (err) {
        console.error("Critical: Failed to query commercial purchase list register", err);
      } finally {
        if (isCurrentFetch) {
          setIsLoading(false);
        }
      }
    }

    loadPurchaseRegister();

    return () => {
      isCurrentFetch = false;
    };
  }, [activeTab, debouncedQuery, refreshTrigger]);

  const isPaneSelected = !!selectedPurchaseId;

  return (
    <div
      className={`flex-1 h-full grid ${
        isPaneSelected ? "grid-cols-[210px_1fr]" : "grid-cols-[1fr_0px]"
      } transition-all duration-300 ease-in-out overflow-hidden`}
      id="purchases-layout-grid"
    >
      {/* High Density Left Column Directory (210px or 100% fluid) matches Entities Layout */}
      <div className="bg-slate-50 border-r border-slate-200 flex flex-col p-2 overflow-hidden justify-between animate-none" id="purchases-sidebar-pane">
        <div className="flex-1 flex flex-col overflow-hidden h-full" id="purchase-list-container">
          <PurchaseListToolbar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSelectedPurchaseId(null); // Deselect on filter transitions
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddNew={() => {}} // Visual CTA only in this phase
            isCompressed={isPaneSelected}
          />

          <PurchaseDataGrid
            purchases={purchases}
            isLoading={isLoading}
            selectedPurchaseId={selectedPurchaseId}
            onSelectPurchase={setSelectedPurchaseId}
            vendorLookup={vendorLookup}
          />
        </div>
      </div>

      {/* Fluid Right details panel mapping placeholder to preserve structural uniformity */}
      <div
        className={`bg-white flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isPaneSelected ? "p-2 border-l border-slate-200 opacity-100" : "p-0 border-0 opacity-0 pointer-events-none"
        }`}
        id="purchases-details-pane"
      >
        <div className="p-3 text-xs text-slate-500 font-medium">
          Detailed view selected for Purchase Reference: <span className="font-mono text-slate-900 bg-slate-100 px-1 rounded-sm">{selectedPurchaseId}</span>
          <button
            onClick={() => setSelectedPurchaseId(null)}
            className="block mt-3 h-6 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-sm border border-indigo-700/50 cursor-pointer shadow-sm ml-0"
          >
            Close Detail Pane
          </button>
        </div>
      </div>
    </div>
  );
}
