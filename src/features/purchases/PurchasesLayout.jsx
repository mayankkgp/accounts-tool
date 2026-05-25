import React, { useState, useEffect } from "react";
import PurchaseListToolbar from "./PurchaseListToolbar";
import PurchaseDataGrid from "./PurchaseDataGrid";
import { fetchPurchases } from "../../services/purchaseService";
import { getVendorLookupMap } from "../../services/entityService";

// Helper parsers for robust date boundary checks
const parseDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

const parseDateYYYYMMDD = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

// Reusable math engine mapping for amount filtering and sorting
const calculateTotalAmount = (pur) => {
  const subtotal = (pur.items || []).reduce((sum, item) => {
    const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const lineTotal = Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));
    return sum + lineTotal;
  }, 0);

  const netTaxableValue = Math.max(0, subtotal - (Number(pur.overallDiscount) || 0));
  const tax = netTaxableValue * 0.18; // standard 18% standard GST rate
  const grandTotal = netTaxableValue + tax + (Number(pur.freight) || 0);
  return Math.max(0, parseFloat(grandTotal.toFixed(2)));
};

/**
 * PurchasesLayout Component
 * Primary workspace component of the Purchases module.
 */
export default function PurchasesLayout() {
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("finalized"); // "finalized" or "draft"
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorLookup, setVendorLookup] = useState({});

  // Core advanced filters state integration
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    financialYear: "",
    vendorIds: [], // Selected vendor ids Array helper
    minAmount: "",
    maxAmount: "",
  });

  // Sort Config state tracking
  const [sortConfig, setSortConfig] = useState({
    column: "purchaseDate", // Default sort
    direction: "desc", // Newest first
  });

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

  // Pessimistic list loading cycle (fetch everything matching active tab)
  useEffect(() => {
    let isCurrentFetch = true;

    async function loadPurchaseRegister() {
      setIsLoading(true);
      try {
        const results = await fetchPurchases({
          query: "", // Apply search locally or fetch all to allow immediate local sub-filtering
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
  }, [activeTab, refreshTrigger]);

  // --- Real-time Filter & Search Logic mapping client-side results ---
  const filteredPurchases = purchases.filter((item) => {
    // 1. Text Search across multiple keys (Vendor name lookup, Invoice#, PO#)
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase().trim();
      const vendorName = (vendorLookup[item.vendorId] || "").toLowerCase();
      const matchVendor = vendorName.includes(q);
      const matchInvoice = (item.invoiceNumber || "").toLowerCase().includes(q);
      const matchPO = (item.poNumber || "").toLowerCase().includes(q);

      if (!matchVendor && !matchInvoice && !matchPO) {
        return false;
      }
    }

    // 2. Date Boundary Checking
    const itemDate = parseDateDDMMYYYY(item.purchaseDate);
    const fromDateObj = filters.fromDate ? parseDateYYYYMMDD(filters.fromDate) : null;
    const toDateObj = filters.toDate ? parseDateYYYYMMDD(filters.toDate) : null;
    if (fromDateObj && itemDate && itemDate < fromDateObj) return false;
    if (toDateObj && itemDate && itemDate > toDateObj) return false;

    // 3. Financial Year Filters
    if (filters.financialYear && item.financialYear !== filters.financialYear) {
      return false;
    }

    // 4. Multi-Select Vendor Filter Checklist
    if (filters.vendorIds.length > 0 && !filters.vendorIds.includes(item.vendorId)) {
      return false;
    }

    // 5. Amount Ranges
    const computedTotal = calculateTotalAmount(item);
    if (filters.minAmount !== "" && computedTotal < Number(filters.minAmount)) return false;
    if (filters.maxAmount !== "" && computedTotal > Number(filters.maxAmount)) return false;

    return true;
  });

  // --- Multi-Column Sort Logic mapping grid headers in order ---
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    if (sortConfig.column === "default" || !sortConfig.column) {
      return 0; // Natural unsorted fallback
    }

    let valA, valB;

    if (sortConfig.column === "purchaseDate") {
      valA = parseDateDDMMYYYY(a.purchaseDate)?.getTime() || 0;
      valB = parseDateDDMMYYYY(b.purchaseDate)?.getTime() || 0;
    } else if (sortConfig.column === "vendorName") {
      valA = vendorLookup[a.vendorId] || "";
      valB = vendorLookup[b.vendorId] || "";
    } else if (sortConfig.column === "invoiceNumber") {
      valA = a.invoiceNumber || "";
      valB = b.invoiceNumber || "";
    } else if (sortConfig.column === "totalAmount") {
      valA = calculateTotalAmount(a);
      valB = calculateTotalAmount(b);
    } else {
      valA = a[sortConfig.column] || "";
      valB = b[sortConfig.column] || "";
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortConfig.direction === "asc"
        ? (valA > valB ? 1 : -1)
        : (valA < valB ? 1 : -1);
    }
  });

  const isPaneSelected = !!selectedPurchaseId;

  return (
    <div
      className={`flex-1 h-full grid ${
        isPaneSelected ? "grid-cols-[210px_1fr]" : "grid-cols-[1fr_0px]"
      } transition-all duration-300 ease-in-out overflow-hidden`}
      id="purchases-layout-grid"
    >
      <div className="bg-slate-50 border-r border-slate-200 flex flex-col p-2 overflow-hidden justify-between animate-none" id="purchases-sidebar-pane">
        <div className="flex-1 flex flex-col overflow-hidden h-full" id="purchase-list-container">
          <PurchaseListToolbar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSelectedPurchaseId(null); // Clear selected item on tab change
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            vendorLookup={vendorLookup}
            onAddNew={() => {}} // Visual placeholder
            isCompressed={isPaneSelected}
          />

          <PurchaseDataGrid
            purchases={sortedPurchases}
            isLoading={isLoading}
            selectedPurchaseId={selectedPurchaseId}
            onSelectPurchase={setSelectedPurchaseId}
            vendorLookup={vendorLookup}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        </div>
      </div>

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
