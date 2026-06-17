import React, { useRef } from "react";
import { Loader2, Trash2 } from "lucide-react";

/**
 * Purchase Order column that triggers simulation uploads and handles
 * visual presentation and delete confirmations for PO attachment entries.
 */
export default function PoUploadCol({
  poList = [],
  onUploadPO,
  pendingDelete,
  onInitiateDelete,
  onConfirmDelete,
  onCancelDelete
}) {
  const poInputRef = useRef(null);

  return (
    <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-sm h-[145px] overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">
          1. Purchase Order (PO)
        </span>
        <button
          type="button"
          onClick={() => poInputRef.current?.click()}
          className="h-5 px-1.5 text-[9px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-[1px] font-semibold cursor-pointer shrink-0"
        >
          + Add PO
        </button>
        <input
          type="file"
          ref={poInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onUploadPO();
            }
          }}
          className="hidden"
          accept=".pdf,.jpg,.png"
        />
      </div>

      <div className="flex flex-col gap-1">
        {poList.map((po, idx) => (
          <div key={idx} className="flex items-center justify-between h-6 bg-slate-50 hover:bg-slate-100/80 px-1 border border-slate-150 rounded-sm">
            {po.uploading ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <Loader2 size={10} className="animate-spin text-indigo-500 shrink-0" />
                <span className="text-[10px] text-slate-400 font-mono italic truncate">Uploading PO...</span>
              </div>
            ) : (
              <a
                href={po.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-700 hover:text-indigo-600 font-mono truncate max-w-[150px]"
                title={po.filename}
              >
                {po.filename}
              </a>
            )}
            
            <div className="relative flex items-center justify-center">
              {po.uploading ? (
                <Loader2 size={12} className="animate-spin text-slate-350 shrink-0" />
              ) : (
                <>
                  {pendingDelete && pendingDelete.type === "po" && pendingDelete.index === idx ? (
                    <div className="absolute right-0 bg-white border border-red-200 rounded-sm flex items-center gap-1 shadow-md z-30 px-1 py-0.5 whitespace-nowrap -top-7">
                      <span className="text-[8px] text-red-600 font-bold uppercase">Remove?</span>
                      <button
                        type="button"
                        onClick={onConfirmDelete}
                        className="text-[8px] font-bold text-white bg-red-600 px-1 hover:bg-red-700 rounded-[1px] border-none font-mono cursor-pointer"
                      >
                        YES
                      </button>
                      <button
                        type="button"
                        onClick={onCancelDelete}
                        className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 hover:bg-slate-200 rounded-[1px] border-none font-mono cursor-pointer"
                      >
                        NO
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onInitiateDelete("po", idx)}
                    className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 size={11} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {poList.length === 0 && (
          <div className="text-[10px] text-slate-450 text-center py-6 border border-dashed border-slate-200 rounded-sm mt-1">
            <span>No PO files attached</span>
          </div>
        )}
      </div>
    </div>
  );
}
