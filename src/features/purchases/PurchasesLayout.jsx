import React, { useState, useEffect } from "react";
import { Plus, Search, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { fetchPurchases } from "../../services/purchaseService";
import PurchaseDataGrid from "./PurchaseDataGrid";

/**
 * PurchasesLayout Component
 * Serves as the primary operational Workspace shell of the Purchase Register module.
 * Embeds dense tabs "Finalized" and "Drafts", handles debounced data retrieval,
 * and tracks local state changes with strict pessimistic UI loading indicators.
 */
export default function PurchasesLayout() {
  const [activeTab, setActiveTab] = useState("Finalized"); // "Finalized" (default active tab) or "Drafts"
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorLookup, setVendorLookup] = useState({});

  // Scans & parses global localStorage active directory to build local memory maps
  // to avoid redundant O(N) searching for vendor profile identities in nested views.
  useEffect(() => {
    try {
      const storedEntities = JSON.parse(localStorage.getItem("fabrito_entities") || "[]");
      const lookup = {};
      storedEntities.forEach((ent) => {
        lookup[ent.id] = ent.businessName || ent.brandName || "Unknown Vendor";
      });
      setVendorLookup(lookup);
    } catch (e) {
      console.error("Critical: Failed to generate fast supplier identity lookup caches.", e);
    }
  }, []);

  // Pessimistic database querying logic. Triggers on tab changes and updates states
  // only after the mocked service latency promise is completely resolved.
  useEffect(() => {
    let isCurrentFetch = true;

    async function loadTargetPurchases() {
      setIsLoading(true);
      const statusParam = activeTab === "Finalized" ? "finalized" : "draft";
      try {
        const results = await fetchPurchases({ status: statusParam });
        if (isCurrentFetch) {
          setPurchases(results);
        }
      } catch (err) {
        console.error("Critical: Failed to resolve purchase lists.", err);
      } finally {
        if (isCurrentFetch) {
          setIsLoading(false);
        }
      }
    }

    loadTargetPurchases();

    return () => {
      // Prevents state update memory leak races if activeTab toggles rapidly
      isCurrentFetch = false;
    };
  }, [activeTab]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans" id="purchases-module-workspace">
      {/* Dense Mini Header Segment */}
      <div className="bg-white border-b border-slate-200 px-3 py-1.5 flex items-center justify-between shrink-0" id="purchases-primary-header">
        <div className="flex items-center gap-1.5">
          <ShoppingBag size={14} className="text-slate-600" />
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800 leading-tight">Purchase Ledger</h2>
            <p className="text-[8px] text-slate-500 font-mono tracking-wider">MODULE_COMMERCIAL_PURCHASE_REGISTER</p>
          </div>
        </div>

        {/* Micro Toolbar holding mock search and add actions */}
        <div className="flex items-center gap-1.5" id="purchases-header-toolbar">
          <div className="relative">
            <input
              type="text"
              placeholder="Search purchases..."
              readOnly
              className="h-6 w-[180px] pl-6 pr-1.5 border border-slate-200 bg-slate-50/50 rounded-sm outline-none text-xs text-slate-400 font-medium select-none cursor-not-allowed"
            />
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            disabled
            className="h-6 px-2 border border-slate-200 bg-white text-slate-400 rounded-sm font-medium text-xs flex items-center gap-1 cursor-not-allowed select-none"
          >
            <SlidersHorizontal size={11} />
            Filter
          </button>

          <button
            type="button"
            className="h-6 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm font-bold uppercase tracking-wide text-[9px] flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
            id="btn-add-purchase"
          >
            <Plus size={11} />
            Add Invoice
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs holding structural filters (Finalized vs Drafts) */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-1 pb-0 shrink-0 gap-3" id="purchases-nav-tabs">
        {["Finalized", "Drafts"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold pb-1 px-1 border-b-2 transition-all cursor-pointer outline-none ${
                isActive
                  ? "border-indigo-600 text-indigo-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
              id={`purchase-tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Frame handling the conditional grid rendering sequence */}
      <div className="flex-1 overflow-auto p-2" id="purchases-table-frame">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs divide-y divide-slate-100" id="purchases-skeleton-pane">
            {/* Table Header skeleton block */}
            <div className="h-6 bg-slate-50 border-b border-slate-200 grid grid-cols-[110px_2.5fr_130px_80px_120px_90px] items-center px-2">
              <div className="h-2.5 bg-slate-200 rounded-xs w-16" />
              <div className="h-2.5 bg-slate-200 rounded-xs w-36" />
              <div className="h-2.5 bg-slate-200 rounded-xs w-20" />
              <div className="h-2.5 bg-slate-200 rounded-xs w-12 justify-self-end" />
              <div className="h-2.5 bg-slate-200 rounded-xs w-16 justify-self-end" />
              <div className="h-2.5 bg-slate-200 rounded-xs w-14 justify-self-center" />
            </div>
            {/* Array lines shimmer skeleton block */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-6 grid grid-cols-[110px_2.5fr_130px_80px_120px_90px] items-center px-2 bg-white animate-pulse">
                <div className="h-2 bg-slate-100 rounded-xs w-14" />
                <div className="h-2 bg-slate-100 rounded-xs w-48" />
                <div className="h-2 bg-slate-100 rounded-xs w-24" />
                <div className="h-2 bg-slate-100 rounded-xs w-10 justify-self-end" />
                <div className="h-2 bg-slate-100 rounded-xs w-16 justify-self-end" />
                <div className="h-1.5 bg-slate-150 rounded-full w-2 justify-self-center shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <PurchaseDataGrid purchases={purchases} vendorLookup={vendorLookup} />
        )}
      </div>
    </div>
  );
}
