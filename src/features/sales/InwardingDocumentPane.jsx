import React, { useState, useEffect } from "react";
import { FileText, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from "lucide-react";
import getTrueDocPath from "./getTrueDocPath";

/**
 * Left-pane document viewer component for Cost Inwarding.
 * Shows horizontal tabs for matching invoices only.
 */
export default function InwardingDocumentPane({ req, defaultActiveFile, activeIdx, setActiveIdx }) {
  const [tabs, setTabs] = useState([]);
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
    setTabs(list);
    
    // Default to the activeIdx or provided active invoice file
    if (activeIdx !== undefined && list[activeIdx]) {
      setActiveTab(list[activeIdx]);
    } else if (defaultActiveFile) {
      const matchIdx = list.findIndex(t => t.filename === defaultActiveFile.filename);
      if (matchIdx !== -1) {
        setActiveTab(list[matchIdx]);
      } else if (list.length > 0) {
        setActiveTab(list[0]);
      }
    } else if (list.length > 0) {
      setActiveTab(list[0]);
    }
  }, [req, defaultActiveFile, activeIdx]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const resolvedUrl = activeTab ? getTrueDocPath(activeTab) : "";

  const handleTabClick = (idx, tab) => {
    if (setActiveIdx) {
      setActiveIdx(idx);
    } else {
      setActiveTab(tab);
      setZoom(1);
      setRotation(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 border border-slate-200 rounded-sm overflow-hidden" id="inwarding-doc-pane">
      {/* 1. Header Toolbar matches Triage Document Viewer exactly */}
      <div className="h-8 bg-slate-50 border-b border-slate-200 px-2 flex items-center justify-between shrink-0 select-none font-sans text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {tabs.map((tab, idx) => {
            const isActive = activeIdx !== undefined ? activeIdx === idx : activeTab && activeTab.filename === tab.filename;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTabClick(idx, tab)}
                className={`h-5.5 px-2.5 text-[10px] uppercase font-bold tracking-wider rounded-sm cursor-pointer transition-all border-none font-sans whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white font-extrabold shadow-sm"
                    : "bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300"
                }`}
                title={tab.filename}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action controllers matches Triage exactement */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={!activeTab}
            className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={!activeTab}
            className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            disabled={!activeTab}
            className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            title="Rotate 90°"
          >
            <RotateCw size={12} />
          </button>
          {activeTab && (
            <a
              href={resolvedUrl || "#"}
              download={activeTab.filename}
              title="Download File"
              className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-xs cursor-pointer"
            >
              <Download size={12} />
            </a>
          )}
          {activeTab && (
            <a
              href={resolvedUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              title="Pop-out (New Tab)"
              className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center shadow-xs"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* 2. PDF iframe viewer container */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-200/55 p-3 min-h-0" id="inwarding-pdf-viewport">
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
