import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import getTrueDocPath from "./getTrueDocPath";
import DocumentViewerToolbar from "./DocumentViewerToolbar";

/**
 * Left-pane document viewer component for Cost Inwarding.
 * Shows horizontal tabs for matching invoices only.
 */
export default function InwardingDocumentPane({ req, defaultActiveFile, activeIdx, setActiveIdx, onCollapse }) {
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const list = [];
    if (req?.proofs?.purchaseInvoices && req.proofs.purchaseInvoices.length > 0) {
      req.proofs.purchaseInvoices.forEach((f, i) => {
        list.push({ ...f, docType: "VI", label: `INV ${i + 1}`, filename: f.filename });
      });
    } else {
      // Fallback
      list.push({ filename: "Simulated_Vendor_Invoice.pdf", docType: "VI", label: "INV 1" });
    }
    setFiles(list);
  }, [req]);

  useEffect(() => {
    if (activeIdx !== undefined && files[activeIdx]) {
      setActiveTab(files[activeIdx]);
    } else if (defaultActiveFile) {
      const matchIdx = files.findIndex(t => t.filename === defaultActiveFile.filename);
      if (matchIdx !== -1) {
        setActiveTab(files[matchIdx]);
      }
    }
  }, [defaultActiveFile, activeIdx, files]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const resolvedUrl = activeTab 
    ? (activeTab.isLocal ? activeTab.localUrl : getTrueDocPath(activeTab)) 
    : "";

  const handleSelectFile = (file) => {
    const idx = files.findIndex(t => t.filename === file.filename);
    if (idx !== -1 && idx < (req?.proofs?.purchaseInvoices?.length || 1)) {
      if (setActiveIdx) {
        setActiveIdx(idx);
      }
    }
    setActiveTab(file);
    setZoom(1);
    setRotation(0);
  };

  const handleUploadFile = (uploadedFile) => {
    if (!uploadedFile) return;
    const objectUrl = URL.createObjectURL(uploadedFile);
    const nextIndex = files.length + 1;
    const newFileObj = {
      filename: uploadedFile.name,
      label: "INV " + nextIndex,
      docType: "VI",
      isLocal: true,
      localUrl: objectUrl
    };
    setFiles(prev => [...prev, newFileObj]);
    setActiveTab(newFileObj);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-transparent overflow-hidden" id="inwarding-doc-pane">
      {/* 1. Header Toolbar matches Triage Document Viewer exactly */}
      <DocumentViewerToolbar
        files={files}
        selectedFile={activeTab}
        onSelectFile={handleSelectFile}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        resolvedUrl={resolvedUrl}
        onUploadFile={handleUploadFile}
        onCollapse={onCollapse}
      />

      {/* 2. PDF iframe viewer container */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-200/55 p-0.5 min-h-0" id="inwarding-pdf-viewport">
        {activeTab ? (
          <div
            className="w-full h-full shadow-sm bg-white overflow-hidden origin-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
            }}
          >
            <iframe
              src={resolvedUrl}
              className="w-full h-full border-none pointer-events-auto"
              title={activeTab.filename}
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1 select-none py-12 font-mono">
            <FileText size={24} className="text-slate-400 stroke-[1.5]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">No Document Selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
