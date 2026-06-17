import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import getTrueDocPath from "./getTrueDocPath";
import DocumentViewerToolbar from "./DocumentViewerToolbar";

/**
 * Renders the PDF Document comparison container.
 * Loads documents assigned to the transaction, allows select filtering index,
 * supports panning/scaling modifiers, and handles native iframe focus rendering.
 */
export default function DocumentViewerPane({ req }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Group files belonging to this request and tag them with human friendly category prefixes
  useEffect(() => {
    const list = [];
    if (req?.proofs) {
      if (req.proofs.po) {
        req.proofs.po.forEach(f => {
          list.push({ ...f, docType: "Purchase Order", label: `PO: ${f.filename}` });
        });
      }
      if (req.proofs.packingList) {
        req.proofs.packingList.forEach(f => {
          list.push({ ...f, docType: "Packing List", label: `PL: ${f.filename}` });
        });
      }
      if (req.proofs.purchaseInvoices) {
        req.proofs.purchaseInvoices.forEach(f => {
          list.push({ ...f, docType: "Vendor Bill", label: `VI: ${f.filename}` });
        });
      }
    }
    setFiles(list);
    if (list.length > 0) {
      setSelectedFile(list[0]);
    } else {
      setSelectedFile(null);
    }
  }, [req]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const resolvedUrl = selectedFile ? getTrueDocPath(selectedFile) : "";

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 border border-slate-200 rounded-sm overflow-hidden animate-fade-in" id="document-viewer-pane-root">
      
      {/* Detached Action Controls Toolbar */}
      <DocumentViewerToolbar
        files={files}
        selectedFile={selectedFile}
        onSelectFile={(f) => {
          setSelectedFile(f);
          setZoom(1);
          setRotation(0);
        }}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        resolvedUrl={resolvedUrl}
      />

      {/* Viewing Canvas */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-200/55 p-3 min-h-0" id="document-canvas-container">
        {selectedFile ? (
          <div
            className="w-full h-full shadow-sm bg-white overflow-hidden origin-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
          >
            {/* Native iframe representation of static PDF file path */}
            <iframe
              src={resolvedUrl}
              className="w-full h-full border-none pointer-events-auto"
              title={selectedFile.filename}
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-slate-450 text-center select-none p-4 font-mono">
            <FileText size={24} className="stroke-[1.5] text-slate-400" />
            <span className="text-[10px] uppercase font-bold tracking-widest">No Document Loaded</span>
            <span className="text-[9px] font-medium leading-normal text-slate-400">Attach files in Sales Manager form.</span>
          </div>
        )}
      </div>
    </div>
  );
}
