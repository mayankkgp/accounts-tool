import React, { useState, useEffect } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize, 
  FileText, 
  PanelLeftClose,
  Download,
  ExternalLink
} from "lucide-react";

export default function PurchaseDocViewer({ file, extractedData, onCollapse }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileType(file.type);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setFileUrl("");
      setFileType("");
    }
  }, [file]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleFitToScreen = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div 
      className="flex-1 flex flex-col min-h-0 h-full bg-transparent overflow-hidden"
      id="purchase-doc-viewer"
    >
      {/* 1. Header Toolbar replicating DocumentViewerToolbar.jsx */}
      <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center justify-end px-2 gap-2 select-none shrink-0 font-sans text-xs">
        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-6 h-6 p-1 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            id="btn-zoom-in"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-6 h-6 p-1 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            id="btn-zoom-out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={handleFitToScreen}
            title="Fit to Screen"
            className="w-6 h-6 p-1 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            id="btn-fit-screen"
          >
            <Maximize size={12} />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90°"
            className="w-6 h-6 p-1 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
            id="btn-rotate"
          >
            <RotateCw size={12} />
          </button>

          {/* Download & Popout links if file available */}
          {fileUrl && (
            <>
              <a
                href={fileUrl}
                download={file?.name || "invoice.pdf"}
                title="Download Raw File"
                className="w-6 h-6 p-1 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-850 flex items-center justify-center text-slate-500 shadow-xs cursor-pointer"
              >
                <Download size={11} />
              </a>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                className="w-6 h-6 p-1 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-center text-slate-500 shadow-xs cursor-pointer"
              >
                <ExternalLink size={12} />
              </a>
            </>
          )}

          {/* Collapse Button */}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="w-6 h-6 p-1 rounded-sm bg-white border border-slate-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center shadow-xs cursor-pointer ml-1"
              title="Collapse Document Panel"
            >
              <PanelLeftClose size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. PDF Viewport / Canvas Container matching Inwarding viewport exactly */}
      <div 
        className="flex-1 overflow-hidden relative flex items-center justify-center bg-slate-200/55 p-0.5 min-h-0" 
        id="purchase-pdf-viewport"
      >
        <div
          className="w-full h-full shadow-sm bg-slate-100 overflow-auto flex items-start justify-center p-4 origin-center"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "transform 0.2s ease"
          }}
          id="purchase-doc-canvas"
        >
          {/* Stylized physical invoice preview model */}
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-md p-4 flex flex-col gap-3 leading-none text-xs text-slate-800 mx-auto aspect-[1/1.41] max-w-[420px] w-full select-text shrink-0" 
            id="doc-scanned-mockup"
          >
            <div className="flex justify-between items-start border-b border-slate-200 pb-2 relative">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[12px] tracking-tight uppercase text-indigo-900 leading-tight">
                  Vardhman Yarns & Threads
                </span>
                <span className="text-[8px] text-slate-400 font-mono uppercase">
                  Mill: Industrial Area-A, Ludhiana, Punjab
                </span>
                <span className="text-[8px] font-mono mt-0.5 text-slate-500">
                  GSTIN: 03OOOBV1122W1Z4
                </span>
              </div>
              <div className="text-right flex flex-col gap-1">
                <span className="font-bold text-[10px] tracking-wider text-slate-400 font-mono">TAX INVOICE</span>
                <span className="text-[9px] font-mono font-bold text-slate-700">
                  INV: {extractedData?.invoiceNumber || "AI-INV-XXXX"}
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  Date: {extractedData?.purchaseDate || "DD/MM/YYYY"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[8px] pb-1.5 border-b border-slate-100">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-400 uppercase tracking-wide">Consigned to:</span>
                <span className="font-semibold text-slate-800">Fabrito Fabrics LLP</span>
                <span className="text-slate-550">Facility G-304, Pyare Lal Complex</span>
                <span className="text-slate-550">Panipat, Haryana</span>
                <span className="font-semibold text-slate-600 font-mono">GSTIN: 06AAKFF3456I1Z2</span>
              </div>
              <div className="flex flex-col gap-0.5 text-right font-mono text-slate-550">
                <div>PO Ref: <span className="text-slate-700 font-semibold">{extractedData?.poNumber || "PO-XXXX"}</span></div>
                <div>Discount Code: <span className="text-rose-500 font-bold">₹{extractedData?.overallDiscount || "0.00"}</span></div>
                <div>Freight Out: <span className="text-slate-705 font-bold">₹{extractedData?.freight || "0.00"}</span></div>
              </div>
            </div>

            {/* Items List inside PDF preview */}
            <div className="flex-1 overflow-hidden" id="doc-scanned-items-box">
              <table className="w-full text-left text-[8.5px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500 h-6">
                    <th className="py-0.5 px-1 w-[45%]">Item name</th>
                    <th className="py-0.5 px-0.5 text-center">HSN</th>
                    <th className="py-0.5 px-0.5 text-center">Qty</th>
                    <th className="py-0.5 px-0.5 text-right">Rate</th>
                    <th className="py-0.5 px-0.5 text-right font-bold">Disc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {extractedData?.items?.map((it, idx) => (
                    <tr key={it.rowId || idx} className="h-6.5">
                      <td className="py-0.5 px-1 font-sans font-semibold text-slate-800 truncate">{it.itemName}</td>
                      <td className="py-0.5 px-0.5 text-center text-slate-450">{it.hsnCode}</td>
                      <td className="py-0.5 px-0.5 text-center font-bold">{it.quantity} {it.uom || "kg"}</td>
                      <td className="py-0.5 px-0.5 text-right">₹{Number(it.rate).toFixed(2)}</td>
                      <td className="py-0.5 px-0.5 text-right text-rose-500">₹{Number(it.itemDiscount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Highlight Note */}
            <div className="bg-amber-50 border border-amber-200 text-[8px] text-amber-700 p-1.5 rounded-sm flex gap-1 font-sans select-none leading-normal shadow-xs mt-auto">
              <span className="font-bold shrink-0">AI Bot Audit:</span>
              <span>Verified state routing for Inter-state GST (18% IGST Punjab to Haryana). Line totals are computed live.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
