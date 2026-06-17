import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { staticPurchaseInvoices } from "./salesConstants";

/**
 * Handles purchase/vendor bill attachments, selection from
 * predefined purchase ledgers in our simulated data, the inline L-value input state,
 * and the floating dropdown selection menu.
 */
export default function InvoiceUploadCol({
  invoiceList = [],
  onUploadInvoice,
  onLValueChange,
  pendingDelete,
  onInitiateDelete,
  onConfirmDelete,
  onCancelDelete
}) {
  const invoiceInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const portalRef = useRef(null);

  const [invoiceDropdownOpen, setInvoiceDropdownOpen] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedButton = dropdownRef.current && dropdownRef.current.contains(event.target);
      const clickedPortal = portalRef.current && portalRef.current.contains(event.target);
      if (!clickedButton && !clickedPortal) {
        setInvoiceDropdownOpen(false);
        setInvoiceSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function updateCoords() {
      if (invoiceDropdownOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.right - 192 + window.scrollX, // 192px width dropdown positioning
        });
      }
    }
    updateCoords();
    if (invoiceDropdownOpen) {
      window.addEventListener("scroll", updateCoords);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords);
      window.removeEventListener("resize", updateCoords);
    };
  }, [invoiceDropdownOpen]);

  const filteredInvoices = staticPurchaseInvoices.filter((inv) =>
    `${inv.id} ${inv.name} ${inv.filename}`.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2 rounded-sm h-[145px] overflow-y-auto">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">
          3. Vendor Invoices
        </span>
        <div className="flex items-center gap-1">
          {/* Custom Searchable Vendor Invoice Selector */}
          <div ref={dropdownRef} className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setInvoiceDropdownOpen(!invoiceDropdownOpen)}
              className="h-5 px-1.5 text-[9px] font-mono border border-slate-355 rounded-[1px] bg-slate-50 text-indigo-700 font-bold outline-none cursor-pointer flex items-center justify-between select-none"
            >
              <span>select</span>
              <span className="text-[7px] text-indigo-500 ml-1">▼</span>
            </button>
            {invoiceDropdownOpen && createPortal(
              <div 
                ref={portalRef}
                style={{
                  position: "absolute",
                  top: `${coords.top + 2}px`,
                  left: `${coords.left}px`,
                }}
                className="w-48 bg-white border border-slate-200 shadow-xl rounded-sm z-[999] p-1.5 flex flex-col gap-1 select-none font-sans"
              >
                <input
                  type="text"
                  placeholder="Search..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  className="h-6 px-1.5 text-xs border border-slate-300 rounded-sm outline-none focus:border-indigo-500 w-full"
                  autoFocus
                />
                <div className="max-h-64 overflow-y-auto flex flex-col">
                  {filteredInvoices.map((inv) => {
                    const isAttached = invoiceList.some(
                      (attached) => attached.filename === inv.filename
                    );
                    return (
                      <button
                        key={inv.id}
                        type="button"
                        disabled={isAttached}
                        onClick={() => {
                          onUploadInvoice(inv.filename, true);
                          setInvoiceDropdownOpen(false);
                          setInvoiceSearchQuery("");
                        }}
                        className={`w-full text-left px-1.5 py-1 text-[11px] font-mono rounded-[1px] border-none bg-transparent cursor-pointer ${
                          isAttached
                            ? "text-slate-300 cursor-not-allowed bg-slate-50"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {inv.id} {inv.name} {isAttached ? "(attached)" : ""}
                      </button>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic px-1.5 py-1">No matches</span>
                  )}
                </div>
              </div>,
              document.body
            )}
          </div>

          <button
            type="button"
            onClick={() => invoiceInputRef.current?.click()}
            className="h-5 px-1.5 text-[9px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-[1px] font-semibold cursor-pointer shrink-0"
          >
            + Add Invoice
          </button>
          <input
            type="file"
            ref={invoiceInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const chosenName = e.target.files[0].name;
                const matchedName = staticPurchaseInvoices.find(
                  i => i.filename.toLowerCase() === chosenName.toLowerCase()
                )?.filename;
                
                if (matchedName) {
                  onUploadInvoice(matchedName);
                } else {
                  const unattached = staticPurchaseInvoices.find(
                    inv => !invoiceList.some(attached => attached.filename === inv.filename)
                  );
                  if (unattached) {
                    onUploadInvoice(unattached.filename);
                  } else {
                    alert("All available mock purchase invoices are attached.");
                  }
                }
              }
            }}
            className="hidden"
            accept=".pdf,.jpg,.png"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {invoiceList.map((pi, idx) => {
          return (
            <div key={idx} className="flex items-center justify-between h-7 bg-slate-50 hover:bg-slate-100/80 px-1.5 border border-slate-150 rounded-sm gap-2">
              {pi.uploading ? (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Loader2 size={10} className="animate-spin text-indigo-500 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-mono italic truncate">Uploading invoice...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-between">
                  <a
                    href={pi.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-700 hover:text-indigo-600 font-mono truncate max-w-[100px]"
                    title={pi.filename}
                  >
                    {pi.filename}
                  </a>
                  
                  {/* INLINE L-VALUE INPUT */}
                  <div className="flex items-center gap-1 text-[9px] font-mono shrink-0">
                    <span className="text-slate-500 font-bold shrink-0">L - </span>
                    <input
                      type="text"
                      maxLength={3}
                      value={pi.lValue !== undefined ? pi.lValue : 100}
                      onChange={(e) => {
                        if (pi.isFromLedger) return;
                        const val = e.target.value;
                        if (val === "" || /^\d{1,3}$/.test(val)) {
                          onLValueChange(idx, val);
                        }
                      }}
                      readOnly={pi.isFromLedger}
                      className={`w-8 h-5 text-center text-xs rounded-sm outline-none ${
                        pi.isFromLedger
                          ? "bg-slate-50 text-slate-500 cursor-not-allowed border-transparent"
                          : "border border-slate-300 focus:border-indigo-500 bg-white"
                      }`}
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="relative flex items-center justify-center shrink-0">
                {pi.uploading ? (
                  <Loader2 size={12} className="animate-spin text-slate-350 shrink-0" />
                ) : (
                  <>
                    {pendingDelete && pendingDelete.type === "invoice" && pendingDelete.index === idx ? (
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
                      onClick={() => onInitiateDelete("invoice", idx)}
                      className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer border-none bg-transparent"
                    >
                      <Trash2 size={11} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {invoiceList.length === 0 && (
          <div className="text-[10px] text-slate-450 text-center py-6 border border-dashed border-slate-200 rounded-sm mt-1">
            <span>No Vendor Bills attached</span>
          </div>
        )}
      </div>
    </div>
  );
}
