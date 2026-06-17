import { useState, useEffect } from "react";
import { saveSalesRequest } from "../../services/salesService";
import { customersList } from "./salesConstants";

/**
 * Handles state, file attachment simulations, and submission timers for the Sales invoice request form.
 * Separating logic from representation ensures visual and state files remain clean and easy to test.
 * 
 * @param {object} editingRequest - Key-value pair of the active correction request being resubmitted.
 * @param {boolean} isOpen - Boolean defining whether the modal frame is active.
 * @param {function} onClose - Closes the modal.
 * @param {function} onSaveSuccess - Refreshes lists and closes workspace on completion.
 */
export default function useSalesFormState(editingRequest, isOpen, onClose, onSaveSuccess) {
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

  // Simulated 1500-2000ms Document Upload Flow
  const handleUploadPO = () => {
    const tempId = Date.now().toString() + Math.random().toString();
    setPoList(prev => [...prev, { tempId, uploading: true }]);

    // Using a 1500ms timeout here to simulate network latency before transitioning to the success state
    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setPoList(prev => prev.map(item => {
        if (item.tempId === tempId) {
          return {
            filename: "GAR-PO-23-FY26-27-Rev#1 (1).pdf",
            url: "/GAR-PO-23-FY26-27-Rev%231%20(1).pdf",
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

    // Using a 1500ms timeout here to simulate network latency before transitioning to the success state
    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setPackingList(prev => prev.map(item => {
        if (item.tempId === tempId) {
          return {
            filename: "HOPSCOTCH PACKING LIST - 6556.pdf",
            url: "/HOPSCOTCH%20PACKING%20LIST%20-%206556.pdf",
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

    // Using a 1500ms timeout here to simulate network latency before transitioning to the success state
    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setInvoiceList(prev => prev.map(item => {
        if (item.tempId === tempId) {
          const dummyInvoices = [
            "/761%20Arvind%20Textile.pdf",
            "/Bill%20No%20-145%20Fabrito.pdf",
            "/Dummy_Fabric_Invoice_Fabrito_Fixed.pdf"
          ];
          const randomIndex = Math.floor(Math.random() * dummyInvoices.length);
          const chosenPath = dummyInvoices[randomIndex];
          
          let url = chosenPath;
          let filename = selectedFilename;

          if (selectedFilename) {
            if (selectedFilename.includes("761") || selectedFilename.includes("Arvind")) {
              url = "/761%20Arvind%20Textile.pdf";
            } else if (selectedFilename.includes("145") || selectedFilename.includes("Bill")) {
              url = "/Bill%20No%20-145%20Fabrito.pdf";
            } else if (selectedFilename.includes("Dummy") || selectedFilename.includes("Fixed")) {
              url = "/Dummy_Fabric_Invoice_Fabrito_Fixed.pdf";
            }
          } else {
            if (chosenPath.includes("761")) filename = "761 Arvind Textile.pdf";
            else if (chosenPath.includes("145")) filename = "Bill No -145 Fabrito.pdf";
            else filename = "Dummy_Fabric_Invoice_Fabrito_Fixed.pdf";
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
    if (e && e.preventDefault) e.preventDefault();
    if (!lineItems.trim()) {
      setErrorMsg("Please specify line items description.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    // Simulate database write mapping latency
    const submitDelay = 1000 + Math.random() * 500;

    setTimeout(async () => {
      const payload = {
        id: editingRequest?.id || `REQ-${Math.floor(Math.random() * 10000)}`,
        smName,
        customer,
        status: "Invoice Pending",
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

  return {
    customer, setCustomer,
    smName,
    billTo, setBillTo,
    shipTo, setShipTo,
    freight, setFreight,
    transporterName, setTransporterName,
    paymentTerms, setPaymentTerms,
    brand, setBrand,
    lineItems, setLineItems,
    greigeDetails, setGreigeDetails,
    comments, setComments,
    poList,
    packingList,
    invoiceList,
    pendingDelete,
    saving,
    errorMsg,
    handleUploadPO,
    handleUploadPacking,
    handleUploadInvoice,
    handleLValueChange,
    initiateDelete,
    cancelDelete,
    confirmDelete,
    handleFormSubmit
  };
}
