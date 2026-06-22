import React, { useState, useEffect } from "react";
import { FileText, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink, PanelLeftClose } from "lucide-react";
import getTrueDocPath from "./getTrueDocPath";

/**
 * MappingDocumentPane Component (Phase 5 Left Reference Pane)
 * 
 * Supports tabs: PO, Packing List, Invoices, SM Request Details
 */
export default function MappingDocumentPane({ req, onCollapse }) {
  const [activeTab, setActiveTab] = useState("DETAILS"); // "DETAILS" | "PO" | "PL"
  const [subFiles, setSubFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Group sub-files based on active category tab
  useEffect(() => {
    if (!req) return;
    let list = [];
    if (activeTab === "PO") {
      list = req.proofs?.po || [];
    } else if (activeTab === "PL") {
      list = req.proofs?.packingList || [];
    } else {
      list = [];
    }
    setSubFiles(list);
    if (list.length > 0) {
      setSelectedFile(list[0]);
    } else {
      setSelectedFile(null);
    }
    // Always reset zoom and rotation on tab toggle
    setZoom(1);
    setRotation(0);
  }, [req, activeTab]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Derive resolved preview URL
  const resolvedUrl = selectedFile ? getTrueDocPath(selectedFile) : "";

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden" id="mapping-doc-pane">
      {/* 1. Main Category Tab Row */}
      <div className="h-8 bg-slate-50 border-b border-slate-200 px-2 flex items-center justify-between shrink-0 select-none font-sans text-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: "DETAILS", label: "Details" },
            { id: "PO", label: "PO" },
            { id: "PL", label: "Packing List" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-5.5 px-2 text-[10px] uppercase font-bold tracking-wider rounded-sm cursor-pointer transition-all border-none font-sans whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white font-extrabold shadow-sm"
                    : "bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panel controls including collapse btn */}
        <div className="flex items-center gap-1 shrink-0">
          {activeTab !== "DETAILS" && (
            <>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={!selectedFile}
                className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
                title="Zoom In"
              >
                <ZoomIn size={12} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={!selectedFile}
                className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
                title="Zoom Out"
              >
                <ZoomOut size={12} />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                disabled={!selectedFile}
                className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
                title="Rotate 90°"
              >
                <RotateCw size={12} />
              </button>
              {selectedFile && (
                <a
                  href={resolvedUrl}
                  download={selectedFile.filename}
                  className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-850 flex items-center justify-center text-slate-500 shadow-xs"
                  title="Download Raw File"
                >
                  <Download size={11} />
                </a>
              )}
              {selectedFile && (
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-center text-slate-500 shadow-xs"
                  title="Open in new tab"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </>
          )}

          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-xs cursor-pointer ml-1"
              title="Collapse Reference Panel"
            >
              <PanelLeftClose size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Files Tabs (Only if multiple files in selected category) */}
      {activeTab !== "DETAILS" && subFiles.length > 1 && (
        <div className="h-6 bg-slate-100 border-b border-slate-200/60 px-2 flex items-center gap-1 shrink-0 select-none">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mr-1">Available:</span>
          {subFiles.map((file, idx) => {
            const isSubActive = selectedFile?.filename === file.filename;
            const shortName = file.filename.length > 25 ? `${file.filename.slice(0, 22)}...` : file.filename;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedFile(file);
                  setZoom(1);
                  setRotation(0);
                }}
                className={`h-4.5 px-1.5 text-[9px] font-medium rounded-xs cursor-pointer transition-all border font-sans max-w-[150px] truncate ${
                  isSubActive
                    ? "bg-slate-200 border-slate-400 text-slate-900 font-semibold"
                    : "bg-white border-slate-250 text-slate-500 hover:bg-slate-50"
                }`}
                title={file.filename}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Document Workspace Content Panel */}
      <div className="flex-1 overflow-hidden min-h-0 relative bg-white" id="mapping-doc-canvas-workspace">
        {activeTab === "DETAILS" ? (
          <div className="w-full h-full p-3 overflow-y-auto select-text font-sans text-xs bg-white text-slate-800 flex flex-col gap-4" id="sm-req-details">
            {/* Section A: Logistics & Meta Grid */}
            <div className="text-slate-705">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Customer Name</span>
                  <span className="font-semibold">{req.customer || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Submitted Date</span>
                  <span className="font-mono">{req.submittedDate || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Bill To</span>
                  <span className="truncate">{req.logistics?.billTo || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Ship To</span>
                  <span className="truncate">{req.logistics?.shipTo || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Freight Terms</span>
                  <span className="font-semibold">{req.logistics?.freight || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Transporter Name</span>
                  <span>{req.logistics?.transporterName || "N/A"}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Payment Terms</span>
                  <span className="font-semibold text-indigo-700">{req.logistics?.paymentTerms || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Section B: Unstructured Text Area */}
            <div className="flex flex-col gap-2 flex-grow">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Line Items Specifications</span>
                <pre className="bg-white border border-slate-200 p-2 rounded-sm text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-tight h-24 overflow-y-auto">
                  {req.unstructuredData?.lineItems || "No line items described."}
                </pre>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Greige details</span>
                <pre className="bg-white border border-slate-200 p-1.5 rounded-sm text-[11px] text-slate-700 font-sans whitespace-pre-wrap leading-tight">
                  {req.unstructuredData?.greigeDetails || "N/A"}
                </pre>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Internal Comments</span>
                <div className="bg-white border border-amber-100 p-1.5 rounded-sm text-[11px] text-slate-650 font-sans italic bg-amber-50/30">
                  "{req.unstructuredData?.comments || "No comments uploaded."}"
                </div>
              </div>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="w-full h-full overflow-hidden relative flex items-center justify-center bg-slate-200/55 p-0" id="iframe-viewport-wrapper">
            <div
              className="w-full h-full shadow-sm bg-white overflow-hidden origin-center"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease"
              }}
            >
              <iframe
                src={resolvedUrl}
                className="w-full h-full border-none pointer-events-auto"
                title={selectedFile.filename}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-slate-450 text-center select-none p-4 font-mono h-full bg-slate-50">
            <FileText size={24} className="stroke-[1.5] text-slate-400" />
            <span className="text-[10px] uppercase font-bold tracking-widest">No Document Attached</span>
            <span className="text-[9px] font-medium leading-normal text-slate-400">
              No files are loaded for tab "{activeTab}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
