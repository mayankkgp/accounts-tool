import React from "react";
import { ZoomIn, ZoomOut, RotateCw, ExternalLink, FileText, Download } from "lucide-react";

/**
 * Top control bar component of the document comparison interface.
 * Handles document list selectors, zoom actions, page rotation triggers,
 * and direct downloads.
 */
export default function DocumentViewerToolbar({
  files,
  selectedFile,
  onSelectFile,
  onZoomIn,
  onZoomOut,
  onRotate,
  resolvedUrl
}) {
  return (
    <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-2 gap-2 select-none shrink-0 font-sans text-xs">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <FileText size={12} className="text-slate-500 shrink-0" />
        {files.length > 0 ? (
          <>
            <select
              value={selectedFile ? selectedFile.filename : ""}
              onChange={(e) => {
                const found = files.find(f => f.filename === e.target.value);
                if (found) {
                  onSelectFile(found);
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

      {/* Action control indicators */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          disabled={!selectedFile}
          className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
          id="btn-zoom-in"
        >
          <ZoomIn size={12} />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          disabled={!selectedFile}
          className="w-5 h-5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-slate-500 shadow-xs"
          id="btn-zoom-out"
        >
          <ZoomOut size={12} />
        </button>
        <button
          type="button"
          onClick={onRotate}
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
  );
}
