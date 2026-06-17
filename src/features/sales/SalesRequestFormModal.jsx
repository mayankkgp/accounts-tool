import React, { useState, useEffect } from "react";
import { X, HelpCircle, Loader2 } from "lucide-react";
import { saveSalesRequest } from "../../services/salesService";
import SalesLogisticsForm from "./SalesLogisticsForm";
import SalesUnstructuredForm from "./SalesUnstructuredForm";
import SalesUploadGrid from "./SalesUploadGrid";

export default function SalesRequestFormModal({ isOpen, onClose, editingRequest, onSaveSuccess }) {
  const [customer, setCustomer] = useState("");
  const [smName, setSmName] = useState("Rahul Sharma");
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [freight, setFreight] = useState("To Pay");
  const [transporterName, setTransporterName] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [brand, setBrand] = useState("");
  
  const [lineItems, setLineItems] = useState("");
  const [greigeDetails, setGreigeDetails] = useState("");
  const [comments, setComments] = useState("");

  const [poList, setPoList] = useState([]);
  const [packingList, setPackingList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const customersList = [
    "Apex Textiles", "Loom & Co.", "Vogue Fashions", "Sutra Silks", "Nexus Garments",
    "FabTex Industries", "Zenith Apparels", "Metro Fabrics", "Prime Weavers", "Orchid Designs",
    "Global Threads", "Urban Outfitters", "Nova Textiles", "Silver Threads", "Crimson Exports",
    "Heritage Silks", "Elite Traders", "Oasis Fabrics", "Aurora Synthetics"
  ];

  const addressOptions = [
    "Apex Mill - Surat", "Loom & Co. Warehouse 2", "Vogue Retail Dist", "Sutra Boutique - Blr",
    "Nexus Unit 4", "FabTex Processing Unit", "Zenith Apparels - Noida", "Metro Godown",
    "Prime Weavers", "Orchid Designs", "Global Threads Warehouse B", "Urban Outfitters Store 1",
    "Nova Textiles", "Silver Threads Unit", "Crimson Unit 2", "Heritage Silks Warehouse",
    "Elite Traders Hub", "Oasis Unit 1", "Aurora Mill"
  ];

  const brandList = [
    "Fabrito Primary", "Acme Apparel", "Levis Premium", "ZARA White", "Zara Blue", "H&M Organics", "Raymond Custom"
  ];

  // Seed default values & pre-populate for Correction views
  useEffect(() => {
    if (editingRequest) {
      setCustomer(editingRequest.customer || "");
      setSmName(editingRequest.smName || "Rahul Sharma");
      setBillTo(editingRequest.logistics?.billTo || "");
      setShipTo(editingRequest.logistics?.shipTo || "");
      setFreight(editingRequest.logistics?.freight || "To Pay");
      setTransporterName(editingRequest.logistics?.transporterName || "");
      setPaymentTerms(editingRequest.logistics?.paymentTerms || "");
      setBrand(editingRequest.logistics?.brand || "");

      setLineItems(editingRequest.unstructuredData?.lineItems || "");
      setGreigeDetails(editingRequest.unstructuredData?.greigeDetails || "");
      setComments(editingRequest.unstructuredData?.comments || "");

      setPoList(editingRequest.proofs?.po || []);
      setPackingList(editingRequest.proofs?.packingList || []);
      setInvoiceList(editingRequest.proofs?.purchaseInvoices || []);
    } else {
      setCustomer(customersList[0]);
      setSmName("Rahul Sharma");
      setBillTo("Apex Textiles - HO");
      setShipTo("Apex Mill - Surat");
      setFreight("To Pay");
      setTransporterName("VRL Logistics");
      setPaymentTerms("30 Days Credit");
      setBrand("Fabrito Primary");
      setLineItems("");
      setGreigeDetails("");
      setComments("");
      setPoList([]);
      setPackingList([]);
      setInvoiceList([]);
    }
    setPendingDelete(null);
    setErrorMsg("");
  }, [editingRequest, isOpen]);

  if (!isOpen) return null;

  // Simulated 1500-2000ms Document Upload Flow
  const handleUploadPO = () => {
    const tempId = Date.now().toString() + Math.random().toString();
    setPoList(prev => [...prev, { tempId, uploading: true }]);

    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setPoList(prev => prev.map(item => {
        if (item.tempId === tempId) {
          return {
            filename: "GAR-PO-23-FY26-27-Rev#1 (1).pdf",
            url: "/GAR-PO-23-FY26-27-Rev#1 (1).pdf",
            type: "application/pdf",
            uploading: false
          };
        }
        return item;
      }));
    }, delay);
  };

  const handleUploadPacking = () => {
    const tempId = Date.now().toString() + Math.random().toString();
    setPackingList(prev => [...prev, { tempId, uploading: true }]);

    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setPackingList(prev => prev.map(item => {
        if (item.tempId === tempId) {
          return {
            filename: "HOPSCOTCH PACKING LIST - 6556.pdf",
            url: "/HOPSCOTCH PACKING LIST - 6556.pdf",
            type: "application/pdf",
            uploading: false
          };
        }
        return item;
      }));
    }, delay);
  };

  const handleUploadInvoice = (selectedFilename, isFromLedger = false) => {
    const tempId = Date.now().toString() + Math.random().toString();
    setInvoiceList(prev => [...prev, { tempId, uploading: true, filename: selectedFilename, isFromLedger, isLedger: isFromLedger }]);

    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setInvoiceList(prev => prev.map(item => {
        if (item.tempId === tempId) {
          // Create an array containing the root paths of the three new dummy invoice PDFs
          const dummyInvoices = [
            "/761 Arvind Textile.pdf",
            "/Bill No -145 Fabrito.pdf",
            "/Dummy_Fabric_Invoice_Fabrito_Fixed.pdf"
          ];
          // Programmatically select a random index from this array
          const randomIndex = Math.floor(Math.random() * dummyInvoices.length);
          const chosenPath = dummyInvoices[randomIndex];
          
          let url = chosenPath;
          let filename = selectedFilename || chosenPath.substring(1);

          if (selectedFilename) {
            if (selectedFilename === "761 Arvind Textile.pdf" || selectedFilename.includes("Arvind")) {
              url = "/761 Arvind Textile.pdf";
            } else if (selectedFilename === "Bill No -145 Fabrito.pdf" || selectedFilename.includes("145")) {
              url = "/Bill No -145 Fabrito.pdf";
            } else if (selectedFilename === "Dummy_Fabric_Invoice_Fabrito_Fixed.pdf" || selectedFilename.includes("Dummy_Fabric")) {
              url = "/Dummy_Fabric_Invoice_Fabrito_Fixed.pdf";
            }
            filename = selectedFilename;
          }

          return {
            filename: filename,
            url: url,
            type: "application/pdf",
            lValue: 100,
            isFromLedger: item.isFromLedger,
            isLedger: item.isFromLedger,
            uploading: false
          };
        }
        return item;
      }));
    }, delay);
  };

  const handleLValueChange = (index, value) => {
    const updated = [...invoiceList];
    updated[index].lValue = Number(value) || 0;
    setInvoiceList(updated);
  };

  const initiateDelete = (type, index) => {
    setPendingDelete({ type, index });
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { type, index } = pendingDelete;
    if (type === "po") {
      setPoList(poList.filter((_, i) => i !== index));
    } else if (type === "packingList") {
      setPackingList(packingList.filter((_, i) => i !== index));
    } else if (type === "invoice") {
      setInvoiceList(invoiceList.filter((_, i) => i !== index));
    }
    setPendingDelete(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!lineItems.trim()) {
      setErrorMsg("Please specify line items description.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    // Simulated 1000-1500ms submit latency
    const submitDelay = 1000 + Math.random() * 500;

    setTimeout(async () => {
      const payload = {
        id: editingRequest?.id || `REQ-${Math.floor(Math.random() * 10000)}`,
        smName,
        customer,
        status: "Invoice Pending", // Sets status strictly to Invoice Pending
        unstructuredData: {
          lineItems,
          greigeDetails,
          comments
        },
        logistics: {
          billTo,
          shipTo,
          freight,
          transporterName,
          paymentTerms,
          brand
        },
        proofs: {
          po: poList.filter(p => !p.uploading),
          packingList: packingList.filter(p => !p.uploading),
          purchaseInvoices: invoiceList.filter(p => !p.uploading)
        }
      };

      try {
        await saveSalesRequest(payload);
        setSaving(false);
        onSaveSuccess();
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to save transaction request. Try again.");
        setSaving(false);
      }
    }, submitDelay);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 select-none" id="sales-form-modal">
      <div className="bg-white rounded-sm border border-slate-300 w-[96vw] max-w-7xl max-h-[92vh] flex flex-col shadow-2xl relative animate-fade-in overflow-hidden">
        
        {/* Form Header Title */}
        <div className="h-8 bg-slate-950 px-3 flex items-center justify-between text-slate-100 border-b border-slate-800 tracking-wider shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">WORKSPACE</span>
            <span className="text-slate-700">|</span>
            <span className="text-xs font-bold font-sans">
              {editingRequest ? `Correction Request View: ${editingRequest.id}` : "Configure New Sales Invoice Request"}
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none p-0 flex items-center justify-center shrink-0"
            id="btn-close-sales-form"
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Feedback block for rejections */}
        {editingRequest && editingRequest.financeFeedback && (
          <div className="bg-red-50 border-b border-red-200 p-2 text-rose-900 text-xs flex flex-col font-sans select-none shrink-0" id="form-feedback-block">
            <span className="font-bold text-[10px] uppercase tracking-wider text-rose-700">Finance Team Block Comment:</span>
            <p className="font-sans italic font-medium mt-0.5 text-slate-850 leading-tight">
              "{editingRequest.financeFeedback}"
            </p>
          </div>
        )}

        {/* Form Scrollbox */}
        <form 
          onSubmit={handleFormSubmit} 
          className={`flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0 text-xs font-sans transition-opacity duration-200 ${
            saving ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 p-2 rounded-[2px] leading-tight border border-rose-200">
              {errorMsg}
            </div>
          )}

          <SalesLogisticsForm
            customer={customer}
            setCustomer={setCustomer}
            smName={smName}
            billTo={billTo}
            setBillTo={setBillTo}
            shipTo={shipTo}
            setShipTo={setShipTo}
            freight={freight}
            setFreight={setFreight}
            transporterName={transporterName}
            setTransporterName={setTransporterName}
            paymentTerms={paymentTerms}
            setPaymentTerms={setPaymentTerms}
            brand={brand}
            setBrand={setBrand}
            brandList={brandList}
            customersList={customersList}
            addressOptions={addressOptions}
          />

          <SalesUnstructuredForm
            lineItems={lineItems}
            setLineItems={setLineItems}
            greigeDetails={greigeDetails}
            setGreigeDetails={setGreigeDetails}
            comments={comments}
            setComments={setComments}
          />

          <SalesUploadGrid
            poList={poList}
            packingList={packingList}
            invoiceList={invoiceList}
            onUploadPO={handleUploadPO}
            onUploadPacking={handleUploadPacking}
            onUploadInvoice={handleUploadInvoice}
            pendingDelete={pendingDelete}
            onInitiateDelete={initiateDelete}
            onConfirmDelete={confirmDelete}
            onCancelDelete={cancelDelete}
            onLValueChange={handleLValueChange}
          />
        </form>

        {/* Sticky global bottom footer */}
        <div className="bg-slate-900 h-11 px-4 flex items-center justify-between border-t border-slate-800 shrink-0 select-none">
          <div>
            <span className="text-[10px] font-mono text-slate-400">STATUS ROUTING: Sets to 'Invoice Pending'</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="h-6 px-3 bg-slate-800 text-slate-300 hover:text-white rounded-sm text-xs font-sans tracking-wide transition-all border-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              type="button"
              disabled={saving}
              id="form-btn-submit"
              className="h-6 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-805 text-white font-bold rounded-sm text-xs font-sans tracking-wide transition-all border-none flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              {saving && <Loader2 size={11} className="animate-spin" />}
              <span>{saving ? "Submitting..." : (editingRequest ? "Resubmit For Triage" : "Submit Request to Queue")}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
