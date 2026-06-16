import React, { useState, useEffect } from "react";
import { X, Trash2, HelpCircle } from "lucide-react";
import { saveSalesRequest } from "../../services/salesService";

export default function SalesRequestFormModal({ isOpen, onClose, editingRequest, onSaveSuccess }) {
  const [customer, setCustomer] = useState("");
  const [smName, setSmName] = useState("Rahul Sharma");
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [freight, setFreight] = useState("To Pay");
  const [transporterName, setTransporterName] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  
  const [lineItems, setLineItems] = useState("");
  const [greigeDetails, setGreigeDetails] = useState("");
  const [comments, setComments] = useState("");

  // Proofs Attachment Arrays
  const [poList, setPoList] = useState([]);
  const [packingList, setPackingList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);

  // accidental deletion track states
  // contains e.g., { type: 'po'|'packingList'|'invoice', index: number }
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

  // Load editing request data if present (Correction View)
  useEffect(() => {
    if (editingRequest) {
      setCustomer(editingRequest.customer || "");
      setSmName(editingRequest.smName || "Rahul Sharma");
      setBillTo(editingRequest.logistics?.billTo || "");
      setShipTo(editingRequest.logistics?.shipTo || "");
      setFreight(editingRequest.logistics?.freight || "To Pay");
      setTransporterName(editingRequest.logistics?.transporterName || "");
      setPaymentTerms(editingRequest.logistics?.paymentTerms || "");

      setLineItems(editingRequest.unstructuredData?.lineItems || "");
      setGreigeDetails(editingRequest.unstructuredData?.greigeDetails || "");
      setComments(editingRequest.unstructuredData?.comments || "");

      setPoList(editingRequest.proofs?.po || []);
      setPackingList(editingRequest.proofs?.packingList || []);
      setInvoiceList(editingRequest.proofs?.purchaseInvoices || []);
    } else {
      // Defaults for a clean New Request
      setCustomer(customersList[0]);
      setSmName("Rahul Sharma");
      setBillTo("Apex Textiles - HO");
      setShipTo("Apex Mill - Surat");
      setFreight("To Pay");
      setTransporterName("VRL Logistics");
      setPaymentTerms("30 Days Credit");
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

  // Mock File Creator Trigger
  const handleSimulateUpload = (type) => {
    const randomId = Math.floor(100 + Math.random() * 900);
    const sanitizedCustomer = customer.replace(/\s+/g, "_");
    
    if (type === "po") {
      const filename = `PO_${sanitizedCustomer}_${randomId}.pdf`;
      setPoList([...poList, { filename, url: `/mock-files/po_${randomId}.pdf`, type: "application/pdf" }]);
    } else if (type === "packing") {
      const filename = `PL_${sanitizedCustomer}_June.pdf`;
      setPackingList([...packingList, { filename, url: `/mock-files/pl_${randomId}.pdf`, type: "application/pdf" }]);
    } else if (type === "invoice") {
      const filename = `PI_VendorBill_${randomId}.pdf`;
      setInvoiceList([...invoiceList, { filename, url: `/mock-files/pi_${randomId}.pdf`, type: "application/pdf", lValue: 100 }]);
    }
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!lineItems.trim()) {
      setErrorMsg("Please specify line items description.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    const payload = {
      id: editingRequest?.id || null,
      smName,
      customer,
      status: "Invoice Pending", // Routing: Sets status to Invoice Pending and routes to Finance
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
        paymentTerms
      },
      proofs: {
        po: poList,
        packingList,
        purchaseInvoices: invoiceList
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
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 select-none" id="sales-form-modal">
      <div className="bg-white rounded-sm border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative animate-fade-in overflow-hidden">
        
        {/* 1. Form Header Title */}
        <div className="h-8 bg-slate-950 px-3 flex items-center justify-between text-slate-100 border-b border-slate-800 tracking-wider">
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

        {/* 2. Feedback block for Rejections (Only visible in Correction context) */}
        {editingRequest && editingRequest.financeFeedback && (
          <div className="bg-red-50 border-b border-red-200 p-2 text-rose-900 text-xs flex flex-col font-sans select-none shrink-0" id="form-feedback-block">
            <span className="font-bold text-[10px] uppercase tracking-wider text-rose-700">Finance Team Block Comment:</span>
            <p className="font-sans italic font-medium mt-0.5 text-slate-800 leading-tight">
              "{editingRequest.financeFeedback}"
            </p>
          </div>
        )}

        {/* 3. Form Scrollbox */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0 text-xs font-sans">
          
          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 p-2 rounded-[2px] leading-tight border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* SECTION A: Core Logistics Multi-column Data Grid */}
          <div className="border border-slate-200 rounded-sm p-3 bg-slate-50/50 flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono inline-block mb-1">
              Section A: Logistics & Accounts Metadata
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 items-end">
              
              {/* Customer Selector */}
              <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Customer Entity *</label>
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full h-6 text-[11px] px-1 border border-slate-300 rounded-sm bg-white hover:border-slate-400 focus:border-indigo-505 outline-none font-medium text-slate-800"
                  id="form-select-customer"
                  required
                >
                  {customersList.map((cust) => (
                    <option key={cust} value={cust}>{cust}</option>
                  ))}
                </select>
              </div>

              {/* SM Agent (Hidden or Pre-filled) */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Sales Manager Agent</label>
                <input
                  type="text"
                  value={smName}
                  onChange={(e) => setSmName(e.target.value)}
                  className="w-full h-6 text-[11px] px-1.5 border border-slate-300 rounded-sm bg-slate-100 text-slate-505 font-medium outline-none"
                  readOnly
                />
              </div>

              {/* Bill To */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Bill To Address *</label>
                <select
                  value={billTo}
                  onChange={(e) => setBillTo(e.target.value)}
                  className="w-full h-6 text-[11px] px-1 border border-slate-300 rounded-sm bg-white hover:border-slate-400 focus:border-indigo-505 outline-none font-medium text-slate-800"
                  required
                >
                  {addressOptions.map((addr) => (
                    <option key={addr} value={`${customer} - HO`}>{customer} - HO</option>
                  ))}
                  <option value="FabTex Mumbai">FabTex Mumbai</option>
                  <option value="Apex Textiles - HO">Apex Textiles - HO</option>
                  <option value="Vogue Fashions HQ">Vogue Fashions HQ</option>
                </select>
              </div>

              {/* Ship To */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Ship To Address *</label>
                <select
                  value={shipTo}
                  onChange={(e) => setShipTo(e.target.value)}
                  className="w-full h-6 text-[11px] px-1 border border-slate-300 rounded-sm bg-white hover:border-slate-400 focus:border-indigo-505 outline-none font-medium text-slate-800"
                  required
                >
                  {addressOptions.map((addr) => (
                    <option key={addr} value={addr}>{addr}</option>
                  ))}
                </select>
              </div>

              {/* Freight */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Freight Policy</label>
                <select
                  value={freight}
                  onChange={(e) => setFreight(e.target.value)}
                  className="w-full h-6 text-[11px] px-1 border border-slate-300 rounded-sm bg-white focus:border-indigo-505 outline-none font-medium text-slate-800"
                >
                  <option value="To Pay">TO PAY (Pay at destination)</option>
                  <option value="Prepaid">PREPAID (Integrated invoice)</option>
                </select>
              </div>

              {/* Transporter Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Transporter Name *</label>
                <input
                  type="text"
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                  className="w-full h-6 text-[11px] px-1.5 border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-505 outline-none"
                  required
                />
              </div>

              {/* Payment Terms */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Payment Term Code *</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full h-6 text-[11px] px-1.5 border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-505 outline-none"
                  placeholder="e.g. 30 Days Credit"
                  required
                />
              </div>

            </div>
          </div>

          {/* SECTION B: Textareas for Unstructured data & Items description */}
          <div className="border border-slate-200 rounded-sm p-3 bg-white flex flex-col gap-3">
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
              Section B: Unstructured Natural Language Details
            </span>

            {/* Line Items description */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wide flex items-center justify-between">
                <span>Line Items Specifications *</span>
                <span className="text-[8.5px] text-slate-450 uppercase font-mono font-normal">Mention description, quantities, and rates</span>
              </label>
              <textarea
                value={lineItems}
                onChange={(e) => setLineItems(e.target.value)}
                rows={3}
                placeholder="- 500 kgs cotton yarn 40s @ 250 rs/kg&#10;- poly blend 30s 300kg at 180"
                className="w-full p-1.5 text-xs font-mono border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-505 outline-none resize-none leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Greige details */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Greige Material Details</label>
                <textarea
                  value={greigeDetails}
                  onChange={(e) => setGreigeDetails(e.target.value)}
                  rows={2}
                  placeholder="e.g. 100% cotton 60x60 greige, 150 kg, lying at Apex Whouse A"
                  className="w-full p-1.5 text-[11px] font-sans border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-505 outline-none resize-none leading-normal"
                />
              </div>

              {/* Comments */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Dispatch Agent Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={2}
                  placeholder="e.g. client needs this dispatched by tonight, pls do it fast"
                  className="w-full p-1.5 text-[11px] font-sans border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-505 outline-none resize-none leading-normal"
                />
              </div>
            </div>
          </div>

          {/* SECTION C: 3-column Document Uploads Grid */}
          <div className="border border-slate-200 rounded-sm p-3 bg-slate-50/50 flex flex-col gap-2.5">
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono">
              Section C: Verify Proof Documents Upload Panel (Simulation)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start">
              
              {/* Column 1: PO */}
              <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-sm h-[135px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">1. Purchase Order (PO)</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateUpload("po")}
                    className="h-4 px-1.5 text-[9px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-[1px] font-semibold cursor-pointer"
                  >
                    + Add PO
                  </button>
                </div>

                {/* stacked rows */}
                <div className="flex flex-col gap-1">
                  {poList.map((po, idx) => (
                    <div key={idx} className="flex items-center justify-between h-5 bg-slate-50 hover:bg-slate-100/80 px-1 border border-slate-150 rounded-sm">
                      <a
                        href={po.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-700 hover:text-indigo-600 font-mono truncate max-w-[120px]"
                        title={po.filename}
                      >
                        {po.filename}
                      </a>
                      
                      {/* ACCIDENTAL DELETION SAFEGUARD */}
                      <div className="relative flex items-center justify-center">
                        {pendingDelete && pendingDelete.type === "po" && pendingDelete.index === idx ? (
                          <div className="absolute right-0 bg-white border border-red-200 rounded-sm flex items-center gap-1 shadow-md z-30 px-1 py-0.5 whitespace-nowrap -top-6">
                            <span className="text-[8px] text-red-600 font-bold uppercase">Remove?</span>
                            <button
                              type="button"
                              onClick={confirmDelete}
                              className="text-[8px] font-bold text-white bg-red-600 px-1 hover:bg-red-700 rounded-[1px] border-none font-mono cursor-pointer"
                            >
                              YES
                            </button>
                            <button
                              type="button"
                              onClick={cancelDelete}
                              className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 hover:bg-slate-200 rounded-[1px] border-none font-mono cursor-pointer"
                            >
                              NO
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => initiateDelete("po", idx)}
                          className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {poList.length === 0 && (
                    <div className="text-[10px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-sm mt-1 flex flex-col items-center justify-center">
                      <span>No files yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Packing List */}
              <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-sm h-[135px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">2. Packing List</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateUpload("packing")}
                    className="h-4 px-1.5 text-[9px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-[1px] font-semibold cursor-pointer"
                  >
                    + Add List
                  </button>
                </div>

                {/* stacked rows */}
                <div className="flex flex-col gap-1">
                  {packingList.map((pl, idx) => (
                    <div key={idx} className="flex items-center justify-between h-5 bg-slate-50 hover:bg-slate-100/80 px-1 border border-slate-150 rounded-sm">
                      <a
                        href={pl.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-slate-700 hover:text-indigo-600 font-mono truncate max-w-[120px]"
                        title={pl.filename}
                      >
                        {pl.filename}
                      </a>
                      
                      <div className="relative flex items-center justify-center">
                        {pendingDelete && pendingDelete.type === "packingList" && pendingDelete.index === idx ? (
                          <div className="absolute right-0 bg-white border border-red-200 rounded-sm flex items-center gap-1 shadow-md z-30 px-1 py-0.5 whitespace-nowrap -top-6">
                            <span className="text-[8px] text-red-600 font-bold uppercase">Remove?</span>
                            <button
                              type="button"
                              onClick={confirmDelete}
                              className="text-[8px] font-bold text-white bg-red-600 px-1 hover:bg-red-700 rounded-[1px] border-none font-mono cursor-pointer"
                            >
                              YES
                            </button>
                            <button
                              type="button"
                              onClick={cancelDelete}
                              className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 hover:bg-slate-200 rounded-[1px] border-none font-mono cursor-pointer"
                            >
                              NO
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => initiateDelete("packingList", idx)}
                          className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {packingList.length === 0 && (
                    <div className="text-[10px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-sm mt-1 flex flex-col items-center justify-center">
                      <span>No files yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Purchase Invoices with inline L-value input */}
              <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-sm h-[135px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">3. Vendor Invoices</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateUpload("invoice")}
                    className="h-4 px-1.5 text-[9px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-[1px] font-semibold cursor-pointer"
                  >
                    + Add Bill
                  </button>
                </div>

                {/* stacked rows */}
                <div className="flex flex-col gap-1">
                  {invoiceList.map((pi, idx) => (
                    <div key={idx} className="flex flex-col gap-1 bg-slate-50 p-1.5 border border-slate-150 rounded-sm">
                      <div className="flex items-center justify-between h-5">
                        <a
                          href={pi.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-700 hover:text-indigo-600 font-mono truncate max-w-[150px]"
                          title={pi.filename}
                        >
                          {pi.filename}
                        </a>
                        
                        <div className="relative flex items-center justify-center">
                          {pendingDelete && pendingDelete.type === "invoice" && pendingDelete.index === idx ? (
                            <div className="absolute right-0 bg-white border border-red-200 rounded-sm flex items-center gap-1 shadow-md z-30 px-1 py-0.5 whitespace-nowrap -top-6">
                              <span className="text-[8px] text-red-600 font-bold uppercase">Remove?</span>
                              <button
                                type="button"
                                onClick={confirmDelete}
                                className="text-[8px] font-bold text-white bg-red-600 px-1 hover:bg-red-700 rounded-[1px] border-none font-mono cursor-pointer"
                              >
                                YES
                              </button>
                              <button
                                type="button"
                                onClick={cancelDelete}
                                className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 hover:bg-slate-200 rounded-[1px] border-none font-mono cursor-pointer"
                              >
                                NO
                              </button>
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => initiateDelete("invoice", idx)}
                            className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer border-none bg-transparent"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* INLINE L-VALUE INPUT */}
                      <div className="flex items-center gap-1.5 mt-1 border-t border-dashed border-slate-200 pt-1 text-[9px] font-mono leading-none">
                        <span className="text-slate-500 font-bold shrink-0 uppercase">Verified L-value Cost %:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={pi.lValue !== undefined ? pi.lValue : 100}
                          onChange={(e) => handleLValueChange(idx, e.target.value)}
                          className="w-10 h-4 px-1 text-[10px] font-mono border border-slate-300 rounded-[1px] text-right bg-white select-text"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  {invoiceList.length === 0 && (
                    <div className="text-[10px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-sm mt-1 flex flex-col items-center justify-center">
                      <span>No files yet</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
            <HelpCircle size={11} className="text-indigo-400 shrink-0" />
            <span>Note: File links click-trigger mockup documents to open securely in target="_blank" new browser tabs.</span>
          </p>

        </form>

        {/* 4. Footer Actions (Submit, Cancel) */}
        <div className="bg-slate-900 h-10 px-4 flex items-center justify-between border-t border-slate-800 shrink-0">
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
              className="h-6 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-bold rounded-sm text-xs font-sans tracking-wide transition-all border-none flex items-center justify-center cursor-pointer shadow-md"
            >
              {saving ? "Registering Request..." : (editingRequest ? "Resubmit For Triage" : "Submit Request to Queue")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
