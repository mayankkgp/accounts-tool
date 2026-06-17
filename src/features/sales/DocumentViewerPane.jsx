import React, { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCw, ExternalLink, FileText, Download } from "lucide-react";

function resolveDocumentUrl(file) {
  if (!file) return "";
  const url = file.url || "";
  const name = file.filename || "";
  
  const realPdfs = ["GAR-PO", "HOPSCOTCH", "Arvind", "Bill No", "Dummy_Fabric"];
  if (realPdfs.some(p => url.includes(p) || name.includes(p))) {
    return url.startsWith("/") ? url : `/${url}`;
  }
  
  if (file.docType === "Purchase Order") {
    return "/GAR-PO-23-FY26-27-Rev#1 (1).pdf";
  }
  if (file.docType === "Packing List") {
    return "/HOPSCOTCH PACKING LIST - 6556.pdf";
  }
  if (file.docType === "Vendor Bill") {
    const idx = name.length % 3;
    if (idx === 0) return "/761 Arvind Textile.pdf";
    if (idx === 1) return "/Bill No -145 Fabrito.pdf";
    return "/Dummy_Fabric_Invoice_Fabrito_Fixed.pdf";
  }
  
  return url;
}

export default function DocumentViewerPane({ req }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

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

  const resolvedUrl = selectedFile ? resolveDocumentUrl(selectedFile) : "";

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100 border border-slate-200 rounded-sm overflow-hidden" id="document-viewer-pane-root">
      {/* Top control bar */}
      <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-2 gap-2 select-none shrink-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <FileText size={12} className="text-slate-500 shrink-0" />
          {files.length > 0 ? (
            <>
              <select
                value={selectedFile ? selectedFile.filename : ""}
                onChange={(e) => {
                  const found = files.find(f => f.filename === e.target.value);
                  if (found) {
                    setSelectedFile(found);
                    setZoom(1);
                    setRotation(0);
                  }
                }}
                className="h-5 px-1 bg-white border border-slate-300 rounded-sm text-[10px] text-slate-700 outline-none focus:border-indigo-500 max-w-[200px]"
                id="triage-doc-picker"
              >
                {files.map((f, i) => (
                  <option key={i} value={f.filename}>{f.label}</option>
                ))}
              </select>
              {selectedFile && selectedFile.docType === "Vendor Bill" && (
                <span className="text-[11px] text-slate-500 font-medium px-1.5 py-0.5 bg-slate-200/50 rounded-[1px] shrink-0 font-sans">
                  L- {selectedFile.lValue ?? 100}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">NO DOCUMENTS AVAILABLE</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            disabled={!selectedFile}
            className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            id="btn-zoom-in"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            disabled={!selectedFile}
            className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            id="btn-zoom-out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90°"
            disabled={!selectedFile}
            className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            id="btn-rotate"
          >
            <RotateCw size={12} />
          </button>
          {selectedFile && (
            <a
              href={resolvedUrl || "#"}
              download={selectedFile.filename}
              title="Download File"
              className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-xs cursor-pointer"
              id="btn-download-file"
            >
              <Download size={12} />
            </a>
          )}
          {selectedFile && (
            <a
              href={resolvedUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              title="Pop-out (New Tab)"
              className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center shadow-xs text-xs"
              id="btn-popout"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Viewing Canvas */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-200/55 p-3 min-h-0" id="document-canvas-container">
        {selectedFile ? (
          <div
            className="w-full h-full shadow-sm bg-white overflow-hidden"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
          >
            {/* Real iframe / PDF reader */}
            <iframe
              src={resolvedUrl}
              className="w-full h-full border-0"
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
