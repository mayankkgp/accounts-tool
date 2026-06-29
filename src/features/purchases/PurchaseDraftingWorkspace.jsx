import React, { useState, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { extractInvoiceAI, savePurchase, calculatePurchaseTaxesSync } from "../../services/purchaseService";
import PurchaseDocViewer from "./PurchaseDocViewer";
import PurchaseDraftingHeader from "./PurchaseDraftingHeader";
import PurchaseDraftingGrid from "./PurchaseDraftingGrid";
import PurchaseDraftingFooter from "./PurchaseDraftingFooter";
import PurchaseDraftingOverlay from "./PurchaseDraftingOverlay";

const getFinancialYear = (d) => {
  if (!d) return "2025-2026";
  const p = d.trim().split(/[-/]/);
  let y = p[0]?.length === 4 ? parseInt(p[0]) : parseInt(p[2]);
  if (!isNaN(y) && y < 100) {
    y = 2000 + y;
  }
  const m = parseInt(p[1]);
  if (isNaN(y) || isNaN(m)) return "2025-2026";
  return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};

export default function PurchaseDraftingWorkspace({ file, onClose, onSaveSuccess }) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStep, setAiStep] = useState(0);
  const [leftWidth, setLeftWidth] = useState(35);
  const [isLeftOpen, setIsLeftOpen] = useState(true);

  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [lValue, setLValue] = useState("");
  const [label, setLabel] = useState("Finished");
  const [isVerifying, setIsVerifying] = useState(false);
  const [overallDiscount, setOverallDiscount] = useState("");
  const [freight, setFreight] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const convertDateToDDMMYY = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      let day = parts[0] || "";
      let month = parts[1] || "";
      let year = parts[2] || "";
      if (day.length === 1) day = "0" + day;
      if (month.length === 1) month = "0" + month;
      if (year.length === 4) year = year.substring(2, 4);
      else if (year.length === 1) year = "0" + year;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 1000);
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setAiProgress((p) => {
        if (p >= 98) { clearInterval(interval); return 98; }
        return p + 2;
      });
    }, 40);
    const s1 = setTimeout(() => setAiStep(1), 500);
    const s2 = setTimeout(() => setAiStep(2), 1100);
    const s3 = setTimeout(() => setAiStep(3), 1700);

    extractInvoiceAI(file).then((data) => {
      clearInterval(interval);
      setAiProgress(100);
      setVendorId(data.vendorId || "");
      setInvoiceNumber(data.invoiceNumber || "");
      setPurchaseDate(convertDateToDDMMYY(data.purchaseDate || ""));
      setPoNumber(data.poNumber || "");
      setLValue(data.lValue || "");
      if (data.label) {
        setLabel(data.label);
      }
      setOverallDiscount(data.overallDiscount || "");
      setFreight(data.freight || "");
      setLineItems(data.items || []);
      setTimeout(() => setIsProcessing(false), 300);
    }).catch(() => {
      clearInterval(interval);
      setIsProcessing(false);
    });

    return () => {
      clearInterval(interval);
      clearTimeout(s1); clearTimeout(s2); clearTimeout(s3);
    };
  }, [file]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("fabrito_entities") || "[]");
    setVendors(stored.filter((ent) => ent.type === "vendor" && ent.status === "active"));
  }, []);

  const handleSeparatorMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX, startW = leftWidth, totalW = window.innerWidth;
    const onMove = (me) => {
      let next = startW + ((me.clientX - startX) / totalW) * 100;
      setLeftWidth(Math.max(15, Math.min(75, next)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleSave = async (status) => {
    if (!vendorId) return alert("Vendor selection is mandatory!");
    setIsSaving(true);
    try {
      const payload = {
        vendorId,
        invoiceNumber: invoiceNumber.trim(),
        purchaseDate: purchaseDate.trim(),
        financialYear: getFinancialYear(purchaseDate),
        poNumber: poNumber.trim(),
        lValue: String(lValue).trim(),
        label,
        overallDiscount: Number(overallDiscount) || 0,
        freight: Number(freight) || 0,
        items: lineItems.map((it) => ({
          itemName: it.itemName.trim(),
          description: (it.description || "").trim(),
          hsnCode: (it.hsnCode || "").trim(),
          rate: Number(it.rate) || 0,
          quantity: Number(it.quantity) || 0,
          uom: it.uom || "m",
          itemDiscount: Number(it.itemDiscount) || 0
        }))
      };
      await savePurchase(payload, status);
      if (status === "finalized") {
        const stock = JSON.parse(localStorage.getItem("fabrito_stock") || "{}");
        lineItems.forEach((it) => {
          const k = it.itemName.trim().toLowerCase();
          if (k) stock[k] = (stock[k] || 0) + (Number(it.quantity) || 0);
        });
        localStorage.setItem("fabrito_stock", JSON.stringify(stock));
      }
      setIsSaving(false);
      onSaveSuccess();
    } catch {
      setIsSaving(false);
    }
  };

  const computedTaxes = calculatePurchaseTaxesSync(lineItems, vendorId, Number(overallDiscount) || 0);

  if (isProcessing) return <PurchaseDraftingOverlay aiProgress={aiProgress} aiStep={aiStep} />;

  return (
    <div className="flex-1 flex flex-col bg-slate-100 font-sans text-xs select-none p-2 h-full gap-2 relative" id="purchase-drafting-workspace">
      <div className="flex-1 flex overflow-hidden min-h-0 items-stretch" id="purchase-drafting-panes">
        {isLeftOpen && (
          <>
            <div style={{ width: `${leftWidth}%` }} className="flex flex-col select-none min-h-0 shrink-0 h-full">
              <PurchaseDocViewer
                file={file}
                extractedData={{ invoiceNumber, purchaseDate, poNumber, overallDiscount, freight, items: lineItems }}
                onCollapse={() => setIsLeftOpen(false)}
              />
            </div>
            <div onMouseDown={handleSeparatorMouseDown} className="w-1 h-full bg-slate-200 hover:bg-slate-300 active:bg-indigo-500 cursor-col-resize flex items-center justify-center transition-colors group z-20" title="Drag to resize">
              <span className="w-0.5 h-6 bg-slate-350 group-hover:bg-indigo-600 transition-colors rounded-xs" />
            </div>
          </>
        )}
        <div style={{ width: isLeftOpen ? `${100 - leftWidth}%` : "100%" }} className="flex-1 flex flex-col min-h-0 h-full bg-transparent pl-2.5 pr-0 py-0 shrink-0 gap-2">
          <PurchaseDraftingHeader
            vendorId={vendorId}
            setVendorId={setVendorId}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            purchaseDate={purchaseDate}
            setPurchaseDate={setPurchaseDate}
            lValue={lValue}
            setLValue={setLValue}
            label={label}
            setLabel={setLabel}
            vendors={vendors}
            isLeftPaneOpen={isLeftOpen}
            onToggleLeftPane={() => setIsLeftOpen(true)}
            onVerify={handleVerify}
            isVerifying={isVerifying}
            isSaving={isSaving}
          />
          <PurchaseDraftingGrid lineItems={lineItems} setLineItems={setLineItems} computedTaxes={computedTaxes} />
          <PurchaseDraftingFooter overallDiscount={overallDiscount} setOverallDiscount={setOverallDiscount} freight={freight} setFreight={setFreight} computedTaxes={computedTaxes} isSaving={isSaving} onCancel={onClose} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
