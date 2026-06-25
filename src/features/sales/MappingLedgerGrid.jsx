import React, { useState, useEffect, useRef } from "react";
import SalesContextHeader from "./SalesContextHeader";
import MappedSalesList from "./MappedSalesList";
import UnlinkedPurchasesList from "./UnlinkedPurchasesList";

/**
 * MappingLedgerGrid Component (Phase 5 Right Mapping Grid)
 * Orchestrator component complying with under 150 lines directive.
 */
export default function MappingLedgerGrid({
  req,
  salesItems,
  setSalesItems,
  unlinkedPurchases,
  setUnlinkedPurchases,
  onTriggerLink,
  isLeftPaneOpen,
  onToggleLeftPane,
  customer,
  setCustomer,
  billTo,
  setBillTo,
  shipTo,
  setShipTo,
  transporter,
  setTransporter,
  freight,
  setFreight,
  paymentTerms,
  setPaymentTerms,
  salesLValue,
  setSalesLValue,
  isFinanceFinalizing
}) {
  
  // Handler helper to dynamically modify selected parent row properties
  const updateParentItem = (id, fields) => {
    setSalesItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...fields };
      }
      return item;
    }));
  };

  const handleRemoveChild = (parentId, childId) => {
    setSalesItems(prev => prev.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          linkedCosts: item.linkedCosts.filter(c => c.id !== childId)
        };
      }
      return item;
    }));
  };

  const handleUpdateChildBucket = (parentId, childId, field, val) => {
    const num = Math.max(0, Number(val) || 0);
    setSalesItems(prev => prev.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          linkedCosts: item.linkedCosts.map(c => {
            if (c.id === childId) {
              return { ...c, [field]: num };
            }
            return c;
          })
        };
      }
      return item;
    }));
  };

  const handleUpdateUnlinkedBucket = (id, field, val) => {
    const num = Math.max(0, Number(val) || 0);
    setUnlinkedPurchases(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: num };
      }
      return item;
    }));
  };

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isSameAsBillTo, setIsSameAsBillTo] = useState(false);
  const headerRef = useRef(null);

  // Sync Ship To with Bill To immediately when isSameAsBillTo is true or when billTo changes
  useEffect(() => {
    if (isSameAsBillTo) {
      setShipTo(billTo);
      if (req) {
        if (!req.logistics) req.logistics = {};
        req.logistics.shipTo = billTo;
      }
    }
  }, [isSameAsBillTo, billTo, req]);

  // Handle outside click to collapse the header
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsHeaderExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCustomerChange = (val) => {
    setCustomer(val);
    if (req) req.customer = val;
  };

  const handleBillToChange = (val) => {
    setBillTo(val);
    if (req) {
      if (!req.logistics) req.logistics = {};
      req.logistics.billTo = val;
    }
  };

  const handleShipToChange = (val) => {
    setShipTo(val);
    if (req) {
      if (!req.logistics) req.logistics = {};
      req.logistics.shipTo = val;
    }
  };

  const handleTransporterChange = (val) => {
    setTransporter(val);
    if (req) {
      if (!req.logistics) req.logistics = {};
      req.logistics.transporterName = val;
    }
  };

  const handleFreightChange = (val) => {
    setFreight(val);
    if (req) {
      if (!req.logistics) req.logistics = {};
      req.logistics.freight = val;
    }
  };

  const handlePaymentTermsChange = (val) => {
    setPaymentTerms(val);
    if (req) {
      if (!req.logistics) req.logistics = {};
      req.logistics.paymentTerms = val;
    }
  };

  return (
    <div className="flex-grow flex flex-col gap-1.5 font-sans text-xs select-none p-1 shrink-0" id="mapping-ledger-container">
      {/* 1. Sales Context Header Component */}
      <SalesContextHeader
        isLeftPaneOpen={isLeftPaneOpen}
        onToggleLeftPane={onToggleLeftPane}
        customer={customer}
        paymentTerms={paymentTerms}
        transporter={transporter}
        freight={freight}
        salesLValue={salesLValue}
        setSalesLValue={setSalesLValue}
        isHeaderExpanded={isHeaderExpanded}
        setIsHeaderExpanded={setIsHeaderExpanded}
        billTo={billTo}
        shipTo={shipTo}
        isSameAsBillTo={isSameAsBillTo}
        setIsSameAsBillTo={setIsSameAsBillTo}
        headerRef={headerRef}
        handleCustomerChange={handleCustomerChange}
        handlePaymentTermsChange={handlePaymentTermsChange}
        handleTransporterChange={handleTransporterChange}
        handleFreightChange={handleFreightChange}
        handleBillToChange={handleBillToChange}
        handleShipToChange={handleShipToChange}
      />

      {/* 2. Mapped Sales List Component */}
      <MappedSalesList
        salesItems={salesItems}
        setSalesItems={setSalesItems}
        updateParentItem={updateParentItem}
        handleRemoveChild={handleRemoveChild}
        handleUpdateChildBucket={handleUpdateChildBucket}
        onTriggerLink={onTriggerLink}
        isFinanceFinalizing={isFinanceFinalizing}
      />

      {/* 3. Unlinked Purchases List Component */}
      <UnlinkedPurchasesList
        unlinkedPurchases={unlinkedPurchases}
        handleUpdateUnlinkedBucket={handleUpdateUnlinkedBucket}
      />
    </div>
  );
}
