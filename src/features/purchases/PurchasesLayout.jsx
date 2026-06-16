import React, { useState, useEffect } from "react";
import PurchaseListToolbar from "./PurchaseListToolbar";
import PurchaseDataGrid from "./PurchaseDataGrid";
import PurchaseDetailPane from "./PurchaseDetailPane";
import PurchaseCreateForm from "./PurchaseCreateForm";
import PurchaseAIVerification from "./PurchaseAIVerification";
import { fetchPurchases } from "../../services/purchaseService";
import { getVendorLookupMap } from "../../services/entityService";
import useDebounce from "../../hooks/useDebounce";

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
  const [activePurchaseId, setActivePurchaseId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("finalized"); // "finalized" or "draft"
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorLookup, setVendorLookup] = useState({});

  // Operational states for the new create/edit form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [initialAiFile, setInitialAiFile] = useState(null);

  // States for Phase 7 AI bot validation workspace
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiFile, setAiFile] = useState(null);

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

  // Generate lookup mapping from entityService on component load and triggers
  useEffect(() => {
    try {
      const lookup = getVendorLookupMap();
      setVendorLookup(lookup);
    } catch (e) {
      console.error("Critical: Failed to generate fast supplier identity lookup caches.", e);
    }
  }, [refreshTrigger]);

  // Pessimistic list loading cycle (fetch everything matching active filters from service)
  useEffect(() => {
    let isCurrentFetch = true;

    async function loadPurchaseRegister() {
      setIsLoading(true);
      try {
        const results = await fetchPurchases({
          query: debouncedQuery,
          status: activeTab,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          financialYear: filters.financialYear,
          vendorIds: filters.vendorIds,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
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
  }, [activeTab, debouncedQuery, filters, refreshTrigger]);

  // --- Multi-Column Sort Logic mapping grid headers in order ---
  const sortedPurchases = [...purchases].sort((a, b) => {
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

  const isPaneSelected = !!activePurchaseId;

  return (
    <div
      className={`flex-1 h-full grid ${
        isPaneSelected ? "grid-cols-[210px_1fr] gap-0" : "grid-cols-[1fr_0px]"
      } transition-all duration-300 ease-in-out overflow-hidden`}
      id="purchases-layout-grid"
    >
      <div className="bg-slate-50 border-r border-slate-200 flex flex-col p-2 justify-between animate-none z-10 min-h-0" id="purchases-sidebar-pane">
        <div className="flex-1 flex flex-col min-h-0 h-full" id="purchase-list-container">
          <PurchaseListToolbar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setActivePurchaseId(null); // Clear selected item on tab change
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            vendorLookup={vendorLookup}
            onAddNew={(mode, file) => {
              setEditingPurchase(null);
              if (mode === "manual") {
                setInitialAiFile(null);
                setIsCreateOpen(true);
              } else if (mode === "ai" && file) {
                setAiFile(file);
                setIsAiOpen(true);
              }
            }}
            isCompressed={isPaneSelected}
          />

          <PurchaseDataGrid
            purchases={sortedPurchases}
            isLoading={isLoading}
            activePurchaseId={activePurchaseId}
            setActivePurchaseId={setActivePurchaseId}
            vendorLookup={vendorLookup}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        </div>
      </div>

      <div
        className={`bg-white overflow-hidden min-h-0 h-full relative transition-all duration-300 ease-in-out ${
          isPaneSelected ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        id="purchases-details-pane"
      >
        <div className="absolute inset-0">
          <PurchaseDetailPane
            activePurchaseId={activePurchaseId}
            onClose={() => setActivePurchaseId(null)}
            vendorLookup={vendorLookup}
            onEditDraft={(draft) => {
              setEditingPurchase(draft);
              setInitialAiFile(null);
              setIsCreateOpen(true);
            }}
          />
        </div>
      </div>

      {isCreateOpen && (
        <PurchaseCreateForm
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingPurchase(null);
            setInitialAiFile(null);
          }}
          editingPurchase={editingPurchase}
          initialAiFile={initialAiFile}
          onSaveSuccess={() => {
            setRefreshTrigger((prev) => prev + 1);
            setActivePurchaseId(null);
          }}
        />
      )}

      {isAiOpen && (
        <PurchaseAIVerification
          isOpen={isAiOpen}
          file={aiFile}
          onClose={() => {
            setIsAiOpen(false);
            setAiFile(null);
          }}
          onSaveSuccess={() => {
            setIsAiOpen(false);
            setAiFile(null);
            setRefreshTrigger((prev) => prev + 1);
            setActivePurchaseId(null);
          }}
        />
      )}
    </div>
  );
}
