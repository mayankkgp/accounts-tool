import React, { useState, useEffect, useRef } from "react";
import { 
  X, Save, Check, Loader2, Trash2, Plus, FileText, 
  AlertTriangle, GripVertical, CheckCircle2, RefreshCw 
} from "lucide-react";
import { simulateNetwork } from "../../utils/simulateNetwork";
import { 
  calculatePurchaseTaxesSync, 
  checkDuplicatePurchase, 
  savePurchase,
  extractInvoiceAI
} from "../../services/purchaseService";

const getDerivedFinancialYear = (dateStr) => {
  if (!dateStr) return "2025-2026";
  const parts = dateStr.trim().split(/[-/]/);
  let year, month;
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    } else {
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
    } else {
      return "2025-2026";
    }
  }

  if (isNaN(year) || isNaN(month)) return "2025-2026";

  if (month >= 4) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

/**
 * PurchaseCreateForm Component
 * Renders as a full-screen workspace overlay for new purchase creations (Manual OR AI-assisted).
 * Designed for high density, strict constraints (24px heights), and advanced live math feedback.
 */
export default function PurchaseCreateForm({
  isOpen,
  onClose,
  editingPurchase = null,
  initialAiFile = null,
  onSaveSuccess,
  onRefresh
}) {
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);

  // Split-pane layout sizing
  const [isAiMode, setIsAiMode] = useState(false);
  const [leftWidth, setLeftWidth] = useState(33); // percent width of document pane

  // State elements for header fields
  const [vendorId, setVendorId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [lValue, setLValue] = useState("");
  const [overallDiscount, setOverallDiscount] = useState("");
  const [freight, setFreight] = useState("");
  const [poNumber, setPoNumber] = useState("");

  // Derive Financial Year dynamically from Purchase Date
  const financialYear = getDerivedFinancialYear(purchaseDate);

  // State elements for line items spreadsheet grid
  const [lineItems, setLineItems] = useState([
    {
      rowId: "r_1",
      itemName: "",
      description: "",
      hsnCode: "",
      rate: "",
      quantity: "",
      uom: "kg",
      itemDiscount: ""
    }
  ]);

  // Master vendor collection
  const [vendors, setVendors] = useState([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  
  // Validation Errors mapping for high precision layout highlights
  const [validationErrors, setValidationErrors] = useState({
    vendor: false,
    invoiceNumber: false,
    purchaseDate: false,
    lineItems: {}
  });

  // Status and dynamic math calculation loading triggers
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState("");
  const [infoMessage, setInfoMessage] = useState(null);

  // Ref container for debounced math calculator timer
  const calculationsTimeoutRef = useRef(null);
  const duplicateWatchdogRef = useRef(null);

  // Synchronous computed taxes based on active state variables
  const computedTaxes = calculatePurchaseTaxesSync(lineItems, vendorId, Number(overallDiscount) || 0);

  // Fetch standard vendor entities
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("fabrito_entities") || "[]");
      const activeVendors = stored.filter(
        (ent) => ent.type === "vendor" && ent.status === "active"
      );
      setVendors(activeVendors);
      if (activeVendors.length > 0 && !vendorId) {
        setVendorId(activeVendors[0].id);
      }
    } catch (e) {
      console.error("Failed to query active suppliers list context.", e);
    }
  }, []);

  // Handle Initial AI Upload or Editing Draft state
  useEffect(() => {
    if (!isOpen) return;

    if (editingPurchase) {
      // Reopen draft mode
      setIsAiMode(false);
      setIsProcessingAi(false);
      setVendorId(editingPurchase.vendorId || "");
      setInvoiceNumber(editingPurchase.invoiceNumber || "");
      setPurchaseDate(editingPurchase.purchaseDate || "");
      setLValue(editingPurchase.lValue || "");
      setOverallDiscount(editingPurchase.overallDiscount || "");
      setFreight(editingPurchase.freight || "");
      setPoNumber(editingPurchase.poNumber || "");
      setLineItems(editingPurchase.items || []);
    } else if (initialAiFile) {
      // Launch AI Upload
      setIsAiMode(true);
      runAiExtractionFlow(initialAiFile);
    } else {
      // Normal blank manual form reset
      setIsAiMode(false);
      setIsProcessingAi(false);
      setVendorId(vendors[0]?.id || "");
      setInvoiceNumber("");
      // Default to today in DD-MM-YYYY
      const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
      setPurchaseDate(todayStr);
      setLValue("");
      setOverallDiscount("");
      setFreight("");
      setPoNumber("");
      setLineItems([
        {
          rowId: "r_1",
          itemName: "",
          description: "",
          hsnCode: "",
          rate: "",
          quantity: "",
          uom: "kg",
          itemDiscount: ""
        }
      ]);
    }
  }, [isOpen, editingPurchase, initialAiFile]);

  // Run simulated AI PDF extraction timeline
  const runAiExtractionFlow = async (file) => {
    setIsProcessingAi(true);
    setAiProgress(0);
    setAiStep(0);

    // Setup an interval to increment progress bar naturally
    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return prev + 1;
      });
    }, 22);

    // Dynamic label changes simulating background parsing sub-tasks
    const labelTimeout1 = setTimeout(() => setAiStep(1), 600);
    const labelTimeout2 = setTimeout(() => setAiStep(2), 1200);
    const labelTimeout3 = setTimeout(() => setAiStep(3), 1800);

    try {
      // Calls standard extraction service implementing dual large simulateNetwork delays (~2.4s)
      const extracted = await extractInvoiceAI(file);
      
      clearInterval(interval);
      setAiProgress(100);
      
      // Auto-prepopulate state variables based on AI extracted layout
      setVendorId(extracted.vendorId || "");
      setInvoiceNumber(extracted.invoiceNumber || "");
      setPurchaseDate(extracted.purchaseDate || "");
      setPoNumber(extracted.poNumber || "");
      setOverallDiscount(extracted.overallDiscount || "");
      setFreight(extracted.freight || "");
      
      // Calculate realistic L-value based on sum total
      const extractedSubtotal = extracted.items.reduce((sum, item) => {
        const rawTotal = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
        return sum + Math.max(0, rawTotal - (Number(item.itemDiscount) || 0));
      }, 0);
      const estTotal = extractedSubtotal - Number(extracted.overallDiscount) + Number(extracted.freight);
      const randomLValue = Math.round(estTotal * 1.18); // rough estimate
      setLValue(String(randomLValue));

      setLineItems(
        extracted.items.map((it, idx) => ({
          ...it,
          rowId: "r_ai_" + idx
        }))
      );
      
      setTimeout(() => {
        setIsProcessingAi(false);
      }, 200);

    } catch (err) {
      clearInterval(interval);
      clearTimeout(labelTimeout1);
      clearTimeout(labelTimeout2);
      clearTimeout(labelTimeout3);
      alert("AI Scan failed. Defaulting to manual layout entry.");
      setIsProcessingAi(false);
      setIsAiMode(false);
    }
  };

  // Draggable Split Pane Divider
  const handleSeparatorMouseDown = (e) => {
    e.preventDefault();
    const parent = e.currentTarget.parentElement;
    const parentWidth = parent.getBoundingClientRect().width;
    const startX = e.clientX;
    const startLeftWidth = leftWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newPercent = startLeftWidth + (deltaX / parentWidth) * 100;
      if (newPercent < 15) newPercent = 15;
      if (newPercent > 70) newPercent = 70;
      setLeftWidth(newPercent);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Live Math calculation debounce
  const triggerDebouncedCalculation = () => {
    setIsCalculating(true);
    if (calculationsTimeoutRef.current) {
      clearTimeout(calculationsTimeoutRef.current);
    }

    calculationsTimeoutRef.current = setTimeout(async () => {
      // Call simulated network small 200ms delay to enforce shimmer display
      await simulateNetwork("small");
      setIsCalculating(false);
    }, 300);
  };

  // Duplicate Watchdog onBlur Trigger
  const triggerDuplicateCheck = () => {
    if (!vendorId || !invoiceNumber) return;
    setIsCheckingDuplicate(true);

    if (duplicateWatchdogRef.current) {
      clearTimeout(duplicateWatchdogRef.current);
    }

    duplicateWatchdogRef.current = setTimeout(async () => {
      try {
        const res = await checkDuplicatePurchase(vendorId, invoiceNumber);
        // Exclude checking against itself if editing the same record
        if (res.isDuplicate && editingPurchase && editingPurchase.invoiceNumber === invoiceNumber && editingPurchase.vendorId === vendorId) {
          setIsDuplicate(false);
        } else {
          setIsDuplicate(res.isDuplicate);
        }
      } catch (err) {
        console.error("Duplicate checking fail safely.", err);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 200);
  };

  // Row operations
  const addLineRow = () => {
    setLineItems((prev) => [
      ...prev,
      {
        rowId: "r_" + Math.random().toString(36).substr(2, 9),
        itemName: "",
        description: "",
        hsnCode: "",
        rate: "",
        quantity: "",
        uom: "kg",
        itemDiscount: ""
      }
    ]);
    triggerDebouncedCalculation();
  };

  const deleteLineRow = (rId) => {
    if (lineItems.length === 1) {
      // Keep at least one empty row
      setLineItems([
        {
          rowId: "r_" + Math.random().toString(36).substr(2, 9),
          itemName: "",
          description: "",
          hsnCode: "",
          rate: "",
          quantity: "",
          uom: "kg",
          itemDiscount: ""
        }
      ]);
      return;
    }
    setLineItems((prev) => prev.filter((it) => it.rowId !== rId));
    triggerDebouncedCalculation();
  };

  const handleRowFieldChange = (rowId, field, value) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.rowId === rowId) {
          const updated = { ...item, [field]: value };
          return updated;
        }
        return item;
      })
    );
    setValidationErrors((prev) => {
      if (prev.lineItems?.[rowId]?.[field]) {
        return {
          ...prev,
          lineItems: {
            ...prev.lineItems,
            [rowId]: {
              ...prev.lineItems[rowId],
              [field]: false
            }
          }
        };
      }
      return prev;
    });
    triggerDebouncedCalculation();
  };

  // Save / Finalize Handler
  const handleSaveAction = async (statusToSet) => {
    // Reset validations first
    setValidationErrors({
      vendor: false,
      invoiceNumber: false,
      purchaseDate: false,
      lineItems: {}
    });

    // 1. Validation Rules by Action click intention
    if (statusToSet === "finalized") {
      const errors = {
        vendor: !vendorId,
        invoiceNumber: !invoiceNumber || !invoiceNumber.trim(),
        purchaseDate: !purchaseDate || !purchaseDate.trim(),
        lineItems: {}
      };

      let validLineItemCount = 0;
      lineItems.forEach((it) => {
        const isItemNameEmpty = !it.itemName || !it.itemName.trim();
        const isRateInvalid = !it.rate || Number(it.rate) <= 0;
        const isQtyInvalid = !it.quantity || Number(it.quantity) <= 0;

        const hasError = isItemNameEmpty || isRateInvalid || isQtyInvalid;
        
        errors.lineItems[it.rowId] = {
          itemName: isItemNameEmpty,
          rate: isRateInvalid,
          quantity: isQtyInvalid
        };

        if (!hasError) {
          validLineItemCount++;
        }
      });

      const isHeaderInvalid = errors.vendor || errors.invoiceNumber || errors.purchaseDate;
      const isLineItemsInvalid = validLineItemCount === 0;

      if (isHeaderInvalid || isLineItemsInvalid) {
        setValidationErrors(errors);
        setInfoMessage({
          type: "error",
          msg: "Validation Failed: Please fill in all required fields (Vendor, Invoice, Date) and ensure at least one line item has a name, rate, and quantity."
        });
        return;
      }

      if (isDuplicate) {
        setInfoMessage({
          type: "error",
          msg: "Duplicate Check Error: This Vendor Invoice already exists as a Finalized ledger booking."
        });
        return;
      }
    } else if (statusToSet === "draft") {
      // Draft rules: only Vendor selection is mandatory, others (including invoice and date) can be empty
      const errors = {
        vendor: !vendorId,
        invoiceNumber: false,
        purchaseDate: false,
        lineItems: {}
      };

      if (errors.vendor) {
        setValidationErrors(errors);
        setInfoMessage({
          type: "error",
          msg: "Validation Failed: Vendor selection is mandatory to save a draft."
        });
        return;
      }
    }

    setIsSaving(true);
    setSaveStatusMsg(statusToSet);

    try {
      // Prepare fully parsed payload structures
      const savePayload = {
        id: editingPurchase?.id || undefined,
        vendorId,
        invoiceNumber: (invoiceNumber || "").trim(),
        purchaseDate: (purchaseDate || "").trim(),
        financialYear,
        poNumber: (poNumber || "").trim(),
        lValue: (lValue || "").trim(),
        overallDiscount: overallDiscount === "" ? 0 : Number(overallDiscount),
        freight: freight === "" ? 0 : Number(freight),
        items: lineItems.map((it) => ({
          itemName: (it.itemName || "").trim(),
          description: (it.description || "").trim(),
          hsnCode: (it.hsnCode || "").trim(),
          rate: Number(it.rate) || 0,
          quantity: Number(it.quantity) || 0,
          uom: it.uom,
          itemDiscount: Number(it.itemDiscount) || 0
        }))
      };

      // Call savePurchase service instead of finalizePurchase
      const savedRecord = await savePurchase(savePayload, statusToSet);

      // If finalized, push to mock stock inventory increases automatically
      if (statusToSet === "finalized") {
        try {
          const currentStock = JSON.parse(localStorage.getItem("fabrito_stock") || "{}");
          lineItems.forEach((it) => {
            const key = (it.itemName || "").trim().toLowerCase();
            if (key) {
              const currentQty = currentStock[key] || 0;
              currentStock[key] = currentQty + (Number(it.quantity) || 0);
            }
          });
          localStorage.setItem("fabrito_stock", JSON.stringify(currentStock));
        } catch (stockErr) {
          console.error("Non-blocking fail during automated stock updating:", stockErr);
        }
      }

      setInfoMessage({
        type: "success",
        msg: statusToSet === "finalized" 
          ? "Ledger entry finalized & stock levels propagated successfully!" 
          : "Draft purchase saved successfully!"
      });

      // Close and trigger callback on UI layout
      setTimeout(() => {
        setIsSaving(false);
        if (onSaveSuccess) onSaveSuccess();
        if (onRefresh) onRefresh();
        onClose();
      }, 1200);

    } catch (err) {
      console.error("Save error:", err);
      setIsSaving(false);
      setInfoMessage({ type: "error", msg: err?.message || "Failed to commit purchase records" });
    }
  };

  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => setInfoMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-2 select-none" id="purchase-overlay-root">
      {/* 2. Loading State overlay of AI Bot */}
      {isProcessingAi && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center font-sans text-white p-4 animate-fade-in" id="ai-processing-modal">
          <div className="bg-slate-950 p-6 rounded-sm border border-slate-800 shadow-2xl max-w-sm w-full flex flex-col gap-4 text-center">
            <Loader2 className="animate-spin text-indigo-400 mx-auto" size={32} />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">AI Invoice Bot Processing</h3>
              <p className="text-[10px] text-indigo-300 font-mono">Running OCR computer-vision pipeline</p>
            </div>

            {/* Simulated Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 transition-all duration-300 rounded-full ease-out"
                style={{ width: `${aiProgress}%` }}
              />
            </div>

            {/* Step messages */}
            <div className="h-5 text-center text-xs text-slate-400 transition-all font-mono">
              {aiStep === 0 && <span className="text-[10px] text-slate-400">Analyzing Document Layout Matrix...</span>}
              {aiStep === 1 && <span className="text-[10px] text-amber-400">Scanning Vendor Header Registry...</span>}
              {aiStep === 2 && <span className="text-[10px] text-emerald-400">Extracting Dense Invoice Rows & HSN Codes...</span>}
              {aiStep === 3 && <span className="text-[10px] text-indigo-400">Performing State Taxation Boundary Audit...</span>}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Form Drawer Workspace */}
      <div className="bg-slate-100 flex flex-col w-full h-full border border-slate-300 shadow-2xl overflow-hidden rounded-[4px] relative" id="purchase-form-body-outer">
        
        {/* Banner Alert Toast Overlay */}
        {infoMessage && (
          <div className={`absolute top-10 right-4 z-40 p-2 rounded-sm text-xs shadow-md border animate-bounce flex items-center gap-2 font-sans font-medium ${
            infoMessage.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
            <AlertTriangle size={14} className={infoMessage.type === "error" ? "text-rose-600" : "text-emerald-600"} />
            <span>{infoMessage.msg}</span>
          </div>
        )}

        {/* Global form header */}
        <div className="h-8 shrink-0 bg-slate-900 px-3 flex items-center justify-between font-sans border-b border-slate-950" id="purchase-form-header">
          <div className="flex items-center gap-2">
            <FileText className="text-slate-400" size={14} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
              {editingPurchase ? "Verify & Resume Draft Invoice" : isAiMode ? "AI Invoice Extracted Record Validation" : "Manual Purchase Invoice Entry"}
            </span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer border-none bg-transparent p-0 flex items-center justify-center shrink-0"
            id="btn-close-form"
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Dynamic Split Screen Body */}
        <div className="flex-1 flex overflow-hidden min-h-0" id="purchase-form-split-view">
          
          {/* LEFT SIDE: Visual Mock Document scan window (Only shown in AI mode) */}
          {isAiMode && (
            <div 
              style={{ width: `${leftWidth}%` }} 
              className="bg-slate-200/90 border-r border-slate-300/80 flex flex-col p-2 overflow-auto select-none font-sans relative"
              id="purchase-source-document-panel"
            >
              {/* Document bar */}
              <div className="flex items-center justify-between mb-1.5 border-b border-slate-300 pb-1.5 shrink-0">
                <span className="text-[10px] uppercase tracking-wide font-bold text-slate-500 font-mono">Source Scan: AI-INVOICE.pdf</span>
                <span className="text-[9px] px-1 bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-[2px] font-mono shrink-0">CV Match 99%</span>
              </div>

              {/* Physical Scanned Invoice Mock Paper Sheet UI */}
              <div className="bg-white rounded-sm border border-slate-300 shadow-md p-3 flex flex-col gap-2 leading-none text-xs text-slate-800 mx-auto aspect-[1/1.41] max-w-[420px] w-full" id="mock-paper-invoice">
                <div className="flex justify-between items-start border-b border-slate-200 pb-2 relative">
                  {/* Bounding box highlighter */}
                  <div className="absolute inset-0 border border-dotted border-indigo-400 bg-indigo-50/10 pointer-events-none rounded-xs" title="Extracted Vendor Node" />
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[13px] tracking-tight uppercase text-indigo-900 leading-tight">Arvind Denims Co.</span>
                    <span className="text-[8px] text-slate-400 font-mono uppercase">Mill: Ahmedabad Industrial Zone, Gujarat</span>
                    <span className="text-[8px] font-mono mt-0.5 text-slate-500">GSTIN: 24DDBCV7890J1Z3</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="font-bold text-[10px] tracking-wider text-slate-400 font-mono">TAX INVOICE</span>
                    <span className="text-[9px] font-mono font-bold text-slate-700">INV: {invoiceNumber || "AI-INV-XXXX"}</span>
                    <span className="text-[9px] font-mono text-slate-500">Date: {purchaseDate || "DD/MM/YYYY"}</span>
                  </div>
                </div>

                {/* Shipped/Consigned */}
                <div className="grid grid-cols-2 gap-2 text-[8px] pb-1.5 border-b border-slate-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-400 uppercase tracking-wide">Consigned to (Buyer):</span>
                    <span className="font-semibold text-slate-800">Fabrito Fabrics LLP</span>
                    <span className="text-slate-500">Facility G-304, Industrial Park</span>
                    <span className="text-slate-500">Panipat, Haryana</span>
                    <span className="font-semibold text-slate-600 font-mono">GSTIN: 06AAKFF3456I1Z2</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right font-mono text-slate-500">
                    <div>PO Ref: <span className="text-slate-705 font-bold">{poNumber || "PO-XXXX"}</span></div>
                    <div>FY: <span>{financialYear}</span></div>
                    <div>Overall Discount: <span>₹{overallDiscount || "0.00"}</span></div>
                    <div>Freight charges: <span>₹{freight || "0.00"}</span></div>
                  </div>
                </div>

                {/* Table items list */}
                <div className="flex-1 overflow-hidden" id="mock-paper-items">
                  <table className="w-full text-left text-[8px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 font-semibold border-b border-slate-200 text-slate-500 font-sans h-5 select-none">
                        <th className="py-0.5 px-0.5 w-1/2">Item Description</th>
                        <th className="py-0.5 px-0.5 text-center">Qty</th>
                        <th className="py-0.5 px-0.5 text-right">Rate</th>
                        <th className="py-0.5 px-0.5 text-right">Discount</th>
                        <th className="py-0.5 px-0.5 text-right">Taxable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-slate-605">
                      {lineItems.map((it, idx) => {
                        const rawTotal = (Number(it.rate) || 0) * (Number(it.quantity) || 0);
                        const taxable = Math.max(0, rawTotal - (Number(it.itemDiscount) || 0));
                        return (
                          <tr key={it.rowId || idx} className="h-5 relative group/item">
                            <td className="py-0.5 px-0.5 font-sans font-semibold text-slate-800 truncate">
                              {it.itemName || "Combed Cotton Yarn..."}
                            </td>
                            <td className="py-0.5 px-0.5 text-center font-bold text-slate-900">{it.quantity || "0"} {it.uom}</td>
                            <td className="py-0.5 px-0.5 text-right">₹{Number(it.rate || 0).toFixed(2)}</td>
                            <td className="py-0.5 px-0.5 text-right text-rose-500">₹{Number(it.itemDiscount || 0).toFixed(2)}</td>
                            <td className="py-0.5 px-0.5 text-right font-bold text-slate-900">₹{taxable.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="border-t border-slate-200 pt-1 flex flex-col gap-0.5 font-mono text-[8px] text-slate-500 items-end shrink-0" id="mock-paper-totals">
                  <div className="flex gap-4">
                    <span>Taxable Subtotal:</span>
                    <span className="font-bold text-slate-800">₹{computedTaxes.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>Freight charges:</span>
                    <span className="font-bold text-slate-800">₹{freight || "0.00"}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>IGST (Inter-state - 18%):</span>
                    <span className="font-bold text-slate-800">₹{computedTaxes.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4 border-t border-slate-100 pt-0.5 text-[9px] font-bold text-slate-900">
                    <span>GRAND TOTAL:</span>
                    <span className="text-indigo-805 bg-indigo-50 px-1 border border-indigo-200 rounded-[2px]">
                      ₹{Number(computedTaxes.grandTotal + (Number(freight) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DRAGGABLE BAR */}
          {isAiMode && (
            <div 
              onMouseDown={handleSeparatorMouseDown}
              className="w-1.5 h-full bg-slate-200 hover:bg-slate-400 cursor-col-resize flex items-center justify-center transition-colors group z-20"
              title="Drag to resize panels"
            >
              <GripVertical size={12} className="text-slate-400 group-hover:text-slate-700" />
            </div>
          )}

          {/* RIGHT SIDE: Interactive Edit Form Panel */}
          <div 
            style={{ width: isAiMode ? `${100 - leftWidth}%` : "100%" }} 
            className="flex-1 flex flex-col min-h-0 bg-white"
            id="purchase-form-fields-wrapper"
          >
            {/* Split View toolbar */}
            {isAiMode && (
              <div className="h-6 bg-indigo-50 border-b border-indigo-100 px-3 flex items-center justify-between font-sans shrink-0">
                <span className="text-[10px] font-bold text-indigo-705 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-indigo-600" />
                  <span>Verify pre-filled parameters match invoice document structure</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAiMode(false)}
                  className="text-[9px] uppercase tracking-wider font-bold text-indigo-650 hover:text-indigo-800 border-none bg-transparent cursor-pointer"
                  id="btn-dismiss-split"
                >
                  Dismiss Document Split Panels
                </button>
              </div>
            )}

            {/* Scrolling Form Fields and Data Grid */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0" id="purchase-entry-form-scrollbox">
              {/* SECTION A: Document Header details */}
              <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-sm flex flex-col gap-2 shrink-0 select-none font-sans" id="purchase-form-header-box">
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 items-end">
                  {/* Vendor Dropdown Selector */}
                  <div className="flex flex-col gap-1 lg:col-span-2">
                    <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Vendor Entity *</span>
                    <select
                      value={vendorId}
                      onChange={(e) => {
                        setVendorId(e.target.value);
                        setValidationErrors(prev => ({ ...prev, vendor: false }));
                        triggerDebouncedCalculation();
                      }}
                      disabled={isSaving}
                      className={`w-full h-6 text-xs px-1 hover:border-slate-400 outline-none border rounded-sm bg-white font-sans font-medium ${
                        validationErrors.vendor 
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                          : "border-slate-300 focus:border-indigo-500"
                      }`}
                      id="input-form-vendor"
                    >
                      {vendors.length === 0 ? (
                        <option value=""></option>
                      ) : (
                        vendors.map((ven) => (
                          <option key={ven.id} value={ven.id}>
                            {ven.businessName || ven.brandName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Vendor Invoice Number with duplicate check */}
                  <div className="flex flex-col gap-1 relative">
                    <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Vendor Invoice No *</span>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => {
                        setInvoiceNumber(e.target.value);
                        setIsDuplicate(false); // Reset duplicate warnings on change
                        setValidationErrors(prev => ({ ...prev, invoiceNumber: false }));
                      }}
                      onBlur={triggerDuplicateCheck}
                      disabled={isSaving}
                      className={`w-full h-6 text-xs font-mono px-1.5 outline-none border ${
                        isDuplicate 
                          ? "border-red-500 bg-rose-50/10 text-rose-909 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                          : validationErrors.invoiceNumber
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-300 focus:border-indigo-500"
                      } rounded-sm`}
                      id="input-form-invoice-no"
                      required
                    />
                    {isCheckingDuplicate && (
                      <Loader2 size={10} className="animate-spin text-slate-400 absolute right-1.5 top-6" />
                    )}
                    {isDuplicate && (
                      <span className="text-[9px] text-red-600 font-bold mt-0.5 block" id="warning-duplicate">
                        Duplicate Invoice Combo!
                      </span>
                    )}
                  </div>

                  {/* Purchase Date */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Invoice Date *</span>
                    <input
                      type="text"
                      value={purchaseDate}
                      onChange={(e) => {
                        setPurchaseDate(e.target.value);
                        setValidationErrors(prev => ({ ...prev, purchaseDate: false }));
                      }}
                      disabled={isSaving}
                      className={`w-full h-6 text-xs font-mono px-1.5 outline-none border ${
                        validationErrors.purchaseDate 
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                          : "border-slate-300 focus:border-indigo-500"
                      } rounded-sm`}
                      id="input-form-date"
                      required
                    />
                  </div>

                  {/* L-Value Input (Total Invoice value match verification) with HTML constraints min=90 max=100 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">L-VALUE</span>
                    <input
                      type="number"
                      min="90"
                      max="100"
                      value={lValue}
                      onChange={(e) => setLValue(e.target.value)}
                      disabled={isSaving}
                      className="w-full h-6 text-xs text-right font-mono px-1.5 border border-slate-300 focus:border-indigo-500 rounded-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                      id="input-form-lvalue"
                      required
                    />
                  </div>

                  {/* Ref PO order number */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">PO NO</span>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      disabled={isSaving}
                      className="w-full h-6 text-xs font-mono px-1.5 outline-none border border-slate-300 focus:border-indigo-505 rounded-sm"
                      id="input-form-po-number"
                    />
                  </div>

                   {/* Overall Discount */}
                   <div className="flex flex-col gap-1">
                     <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Overall Discount (₹)</span>
                     <input
                       type="number"
                       value={overallDiscount}
                       onChange={(e) => {
                         setOverallDiscount(e.target.value);
                         triggerDebouncedCalculation();
                       }}
                       disabled={isSaving}
                       className="w-full h-6 text-xs font-mono px-1.5 outline-none border border-slate-300 focus:border-indigo-500 rounded-sm text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                       id="input-form-overall-discount"
                     />
                   </div>
 
                   {/* Freight Charges */}
                   <div className="flex flex-col gap-1">
                     <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Freight (₹)</span>
                     <input
                       type="number"
                       value={freight}
                       onChange={(e) => setFreight(e.target.value)}
                       disabled={isSaving}
                       className="w-full h-6 text-xs font-mono px-1.5 outline-none border border-slate-300 focus:border-indigo-500 rounded-sm text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                       id="input-form-freight"
                     />
                   </div>
                </div>

               </div>

               

              {/* SECTION B: Editable Spreadsheet Grid */}
              <div className="flex-1 flex flex-col min-h-[160px] border border-slate-200/80 rounded-sm bg-white overflow-hidden" id="purchase-form-spreadsheet-container">
                <div className="h-6 bg-slate-900 px-3 flex items-center justify-between shrink-0 font-sans border-b border-slate-950">
                  <span className="text-[9px] uppercase tracking-wide font-bold text-slate-400">Invoice Items Spreadsheet</span>
                  <div className="flex items-center gap-1.5">
                    {isCalculating && (
                      <span className="text-[8px] font-mono font-bold text-amber-400 flex items-center gap-1">
                        <RefreshCw size={8} className="animate-spin text-amber-400 shrink-0" />
                        <span>Recalculating math live...</span>
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-slate-405">
                      {lineItems.length} lines entries
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-slate-205/10" id="form-spreadsheet-viewport">
                  <table className="w-full border-collapse text-left text-slate-700 text-xs" id="form-spreadsheet-table">
                    <thead className="bg-slate-150 text-[10px] uppercase tracking-wider text-slate-500 font-bold h-6 sticky top-0 border-b border-slate-250 select-none z-10 font-sans">
                      <tr>
                        <th className="py-0.5 px-1 text-center w-[3%]">#</th>
                        <th className="py-0.5 px-1 text-left w-[24%]">Item Name *</th>
                        <th className="py-0.5 px-1 text-left w-[18%]">Desc / Remarks</th>
                        <th className="py-0.5 px-1 text-center w-[7%]">HSN</th>
                        <th className="py-0.5 px-1 text-center w-[7%]">Rate *</th>
                        <th className="py-0.5 px-1 text-center w-[6%]">Qty *</th>
                        <th className="py-0.5 px-1 text-center w-[6%]">UOM</th>
                        <th className="py-0.5 px-1 text-center w-[7%]">Disc. (₹)</th>
                        <th className="py-0.5 px-1 text-center w-[8%]">Taxable Value</th>
                        <th className="py-0.5 px-1 text-center w-[9%]">Tax Rate & Amt</th>
                        <th className="py-0.5 px-1 text-right w-[10%]">Total (After Tax)</th>
                        <th className="py-0.5 px-1 text-center w-[5%]">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-xs bg-white">
                      {lineItems.map((it, idx) => {
                        const calculatedRow = computedTaxes.items?.[idx] || {};
                        const rawTotal = (Number(it.rate) || 0) * (Number(it.quantity) || 0);
                        const baseTaxable = Math.max(0, rawTotal - (Number(it.itemDiscount) || 0));
                        const rowErrors = validationErrors.lineItems?.[it.rowId] || {};
                        
                        return (
                          <tr key={it.rowId} className="h-6 hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                            {/* Sequence */}
                            <td className="py-0.5 px-1 text-center text-[10px] font-sans font-bold text-slate-400">
                               {idx + 1}
                            </td>

                            {/* Item name input */}
                            <td className="py-0.5 px-1">
                              <input
                                type="text"
                                value={it.itemName}
                                onChange={(e) => handleRowFieldChange(it.rowId, "itemName", e.target.value)}
                                disabled={isSaving}
                                className={`w-full bg-transparent px-1 font-sans focus:bg-slate-50/80 hover:border-slate-300 rounded-sm text-xs h-5 font-medium text-slate-900 leading-none outline-none truncate border ${
                                  rowErrors.itemName 
                                    ? "!border-red-500 bg-rose-50/10 focus:ring-1 focus:ring-red-500" 
                                    : "border-transparent focus:border-indigo-505"
                                }`}
                                required
                              />
                            </td>

                            {/* Description optional remark input */}
                            <td className="py-0.5 px-1">
                              <input
                                type="text"
                                value={it.description || ""}
                                onChange={(e) => handleRowFieldChange(it.rowId, "description", e.target.value)}
                                disabled={isSaving}
                                className="w-full bg-transparent px-1 font-sans focus:bg-slate-50/80 hover:border-slate-300 border border-transparent rounded-sm text-[10px] h-5 leading-none text-slate-500 outline-none truncate"
                              />
                            </td>

                            {/* HSN Code */}
                            <td className="py-0.5 px-1 text-center">
                              <input
                                type="text"
                                value={it.hsnCode}
                                onChange={(e) => handleRowFieldChange(it.rowId, "hsnCode", e.target.value)}
                                disabled={isSaving}
                                className="w-full text-center bg-transparent px-1 font-mono focus:bg-slate-50/85 hover:border-slate-300 border border-transparent rounded-sm text-xs h-5 text-slate-550 outline-none"
                              />
                            </td>

                            {/* Unit Rate */}
                            <td className="py-0.5 px-1 text-center">
                              <input
                                type="number"
                                value={it.rate}
                                onChange={(e) => handleRowFieldChange(it.rowId, "rate", e.target.value)}
                                disabled={isSaving}
                                className={`w-full text-center bg-transparent px-1 font-mono focus:bg-slate-50/80 hover:border-slate-300 rounded-sm text-xs h-5 text-slate-900 font-medium outline-none text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] border ${
                                  rowErrors.rate 
                                    ? "!border-red-500 bg-rose-50/10 focus:ring-1 focus:ring-red-500" 
                                    : "border-transparent focus:border-indigo-505"
                                }`}
                                required
                              />
                            </td>

                            {/* Quantity */}
                            <td className="py-0.5 px-1 text-center">
                              <input
                                type="number"
                                value={it.quantity}
                                onChange={(e) => handleRowFieldChange(it.rowId, "quantity", e.target.value)}
                                disabled={isSaving}
                                className={`w-full text-center bg-transparent px-1 font-mono focus:bg-slate-50/80 hover:border-slate-300 rounded-sm text-xs h-5 text-slate-900 font-bold outline-none text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] border ${
                                  rowErrors.quantity 
                                    ? "!border-red-500 bg-rose-50/10 focus:ring-1 focus:ring-red-500" 
                                    : "border-transparent focus:border-indigo-505"
                                }`}
                                required
                              />
                            </td>

                            {/* UOM restricted only to m and kg */}
                            <td className="py-0.5 px-1 text-center">
                              <select
                                value={it.uom}
                                onChange={(e) => handleRowFieldChange(it.rowId, "uom", e.target.value)}
                                disabled={isSaving}
                                className="h-5 text-[10px] px-1 font-sans font-medium focus:bg-slate-50/80 hover:border-slate-300 border border-transparent rounded-sm outline-none bg-white text-slate-600"
                              >
                                <option value="kg">kg</option>
                                <option value="m">m</option>
                              </select>
                            </td>

                            {/* Item Discount */}
                            <td className="py-0.5 px-1 text-center">
                              <input
                                type="number"
                                value={it.itemDiscount}
                                onChange={(e) => handleRowFieldChange(it.rowId, "itemDiscount", e.target.value)}
                                className="w-full text-center bg-transparent px-1 font-mono focus:bg-slate-50/80 hover:border-slate-300 focus:border-indigo-505 border border-transparent rounded-sm text-xs h-5 text-rose-600 outline-none text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                              />
                            </td>

                            {/* Dynamic Taxable calculations featuring shimmer delay feedback */}
                            <td className="py-0.5 px-1 text-center font-bold text-slate-900 text-xs">
                              {isCalculating ? (
                                <div className="h-3.5 bg-slate-205/65 animate-pulse rounded-xs w-12 mx-auto" />
                              ) : (
                                <span>{Number(calculatedRow.lineTotal || baseTaxable).toFixed(2)}</span>
                              )}
                            </td>

                            {/* CGST/SGST 9%+9% or IGST 18% based on state routing */}
                            <td className="py-0.5 px-1 text-center text-slate-500 text-[10px] leading-tight">
                              {isCalculating ? (
                                <div className="h-3.5 bg-slate-205/65 animate-pulse rounded-xs w-10 mx-auto" />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-slate-700">₹{Number(calculatedRow.taxAmount || 0).toFixed(2)}</span>
                                  <span className="text-[9px] text-slate-400 font-sans">
                                    {computedTaxes.isIntrastate ? "CGST+SGST (18%)" : "IGST (18%)"}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* After tax line Total */}
                            <td className="py-0.5 px-1 text-right text-slate-950 font-bold text-xs pr-2">
                              {isCalculating ? (
                                <div className="h-3.5 bg-slate-205/65 animate-pulse rounded-xs w-16 ml-auto" />
                              ) : (
                                <span>{Number(calculatedRow.totalAfterTax || (baseTaxable * 1.18)).toFixed(2)}</span>
                              )}
                            </td>

                            {/* Delete row handler */}
                            <td className="py-0.5 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => deleteLineRow(it.rowId)}
                                className="h-5 w-5 rounded-xs flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-none bg-transparent cursor-pointer shrink-0 mx-auto"
                                title="Remove item line row"
                                id={`delete-row-${it.rowId}`}
                              >
                                <Trash2 size={11} />
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add column bottom operations button */}
                <div className="h-8 shrink-0 bg-slate-50/50 border-t border-slate-200 px-3 flex items-center justify-between" id="form-spreadsheet-toolbar">
                  <button
                    type="button"
                    onClick={addLineRow}
                    className="h-5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-sm px-2 text-[10px] uppercase font-bold tracking-wider cursor-pointer flex items-center justify-center gap-1"
                    id="btn-form-add-row"
                  >
                    <Plus size={10} className="stroke-[2.5]" />
                    <span>Add Invoice Line Item</span>
                  </button>
                  
                  {isAiMode && (
                    <div className="text-[9px] font-medium text-amber-600 bg-amber-50 border border-amber-205/40 rounded-[2px] px-1.5 h-4.5 flex items-center leading-none">
                      Warning: Verify item descriptions correspond perfectly to PDF scanned data points
                    </div>
                  )}
                </div>

              </div>

              {/* SECTION C: Totals Footer */}
              <div className="bg-slate-100 border border-slate-200 p-2 text-[10px] rounded-sm shrink-0 flex flex-col md:flex-row gap-4 md:items-center md:justify-end select-none font-sans" id="purchase-form-footer-box">
                
                {/* Main dynamic numeric columns */}
                <div className="flex-1 flex gap-4 md:justify-end flex-wrap">
                  <div className="flex flex-col items-center px-2 py-0.5 border-r border-slate-200 bg-white shadow-xs rounded-[2px]">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wide leading-none">Subtotal (Before Tax)</span>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-1 leading-none">
                      {isCalculating ? (
                        <span className="block animate-pulse bg-slate-200 h-3 w-12 rounded-xs" />
                      ) : (
                        `₹${computedTaxes.subtotal.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-2 py-0.5 border-r border-slate-200 bg-white shadow-xs rounded-[2px]">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wide leading-none">Freight Charges</span>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-1 leading-none">
                      ₹{parseFloat(freight || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-2 py-0.5 border-r border-slate-200 bg-white shadow-xs rounded-[2px]">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wide leading-none">Total Tax Value</span>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-1 leading-none text-indigo-700">
                      {isCalculating ? (
                        <span className="block animate-pulse bg-slate-200 h-3 w-12 rounded-xs" />
                      ) : (
                        `₹${computedTaxes.totalTax.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col items-end px-3 py-1 bg-indigo-900 text-white shadow-md rounded-[2px] min-w-[120px]">
                    <span className="text-[8px] uppercase font-bold text-indigo-200 tracking-wide leading-none">Invoice Total (INR)</span>
                    <span className="text-sm font-mono font-bold mt-1.5 leading-none">
                      {isCalculating ? (
                        <span className="block animate-pulse bg-indigo-700 h-3.5 w-16 rounded-xs" />
                      ) : (
                        `₹${Number(computedTaxes.grandTotal + (Number(freight) || 0)).toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Global form operations footer */}
            <div className="h-10 shrink-0 bg-slate-900 px-3 flex items-center justify-between font-sans border-t border-slate-950" id="purchase-form-actions-toolbar">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="h-6 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300 rounded-sm px-3 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all disabled:opacity-40"
                id="btn-form-cancel"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveAction("draft")}
                  disabled={isSaving || isCheckingDuplicate || isDuplicate}
                  className="h-6 bg-amber-600 hover:bg-amber-500 text-white rounded-sm px-3 text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-amber-700/50 shadow-sm transition-all disabled:opacity-40 flex items-center gap-1"
                  id="btn-form-save-draft"
                >
                  {isSaving && saveStatusMsg === "draft" ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-white shrink-0" />
                      <span>Saving Draft...</span>
                    </>
                  ) : (
                    <>
                      <Save size={11} className="stroke-[2.5]" />
                      <span>Save as Draft</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAction("finalized")}
                  disabled={isSaving || isCheckingDuplicate || isDuplicate}
                  className="h-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm px-3 text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-indigo-700/50 shadow-sm transition-all disabled:opacity-40 flex items-center gap-1"
                  id="btn-form-finalize"
                >
                  {isSaving && saveStatusMsg === "finalized" ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-white shrink-0" />
                      <span>Finalizing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={11} className="stroke-[2.5]" />
                      <span>Finalize Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
