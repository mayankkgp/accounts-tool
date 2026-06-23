import React, { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";

/**
 * Slide-Out Drawer for mapping ledger links (Phase 5).
 * 
 * Props:
 *  - isOpen: Drawer visibility toggle
 *  - onClose: Closes slide-out drawer
 *  - mode: "purchase" | "inventory"
 *  - parentItemName: Name of the sales parent component is referencing
 *  - onSelectItems: Callback returning an array of selected source objects
 */
export default function MappingSlideOutDrawer({
  isOpen,
  onClose,
  mode,
  parentItemName,
  onSelectItems
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Mock search linkable items simulating backend latency
  const mockSearchLinkableItems = async (queryStr) => {
    setLoading(true);
    // Simulated delay 300ms
    await new Promise((r) => setTimeout(r, 400));

    try {
      const dbInv = JSON.parse(localStorage.getItem("fabrito_inventory") || "[]");
      const dbPurchases = JSON.parse(localStorage.getItem("fabrito_purchases") || "[]");

      let source = [];
      if (mode === "purchase") {
        // Flatten staged purchase line items to link
        const targetPurchases = dbPurchases.length > 0 ? dbPurchases : [
          { id: "PI-401", invoiceNo: "PI-401", vendorName: "Arvind Denim Mills", lValue: 98, label: "Yarn", lineItems: [{ itemName: "Indigo Denim Weft Yarn", hsnCode: "520512", quantity: 250, rate: 165 }] },
          { id: "PI-402", invoiceNo: "PI-402", vendorName: "Vardhman Spinning", lValue: 100, label: "Yarn", lineItems: [{ itemName: "Spun Polyester Yarn 30s", hsnCode: "550921", quantity: 300, rate: 135 }] },
          { id: "PI-403", invoiceNo: "PI-403", vendorName: "Trident Group Ltd", lValue: 96, label: "Greige", lineItems: [{ itemName: "Terry Towelling Greige Loop", hsnCode: "520811", quantity: 150, rate: 180 }] },
          { id: "PI-404", invoiceNo: "PI-404", vendorName: "Sutlej Weaving", lValue: 100, label: "Yarn", lineItems: [{ itemName: "Blended Rayon Staple Thread", hsnCode: "551010", quantity: 220, rate: 115 }] },
          { id: "PI-405", invoiceNo: "PI-405", vendorName: "Welspun Corporate", lValue: 95, label: "RFD", lineItems: [{ itemName: "Organic Cotton RFD Percale", hsnCode: "520822", quantity: 400, rate: 210 }] },
          { id: "PI-406", invoiceNo: "PI-406", vendorName: "Raymond Premium", lValue: 102, label: "Finished", lineItems: [{ itemName: "Worsted Suiting Wool Blend", hsnCode: "511211", quantity: 120, rate: 450 }] },
          { id: "PI-407", invoiceNo: "PI-407", vendorName: "Alok Processors", lValue: 99, label: "Finished", lineItems: [{ itemName: "Rotary Printed Satin Finished", hsnCode: "540752", quantity: 500, rate: 125 }] },
          { id: "PI-408", invoiceNo: "PI-408", vendorName: "Bombay Dyeing", lValue: 97, label: "Greige", lineItems: [{ itemName: "Polyester Viscose Satin Weave", hsnCode: "551511", quantity: 350, rate: 145 }] },
          { id: "PI-409", invoiceNo: "PI-409", vendorName: "Century Textiles", lValue: 100, label: "RFD", lineItems: [{ itemName: "Linen Warp Slub RFD fabric", hsnCode: "530911", quantity: 180, rate: 280 }] },
          { id: "PI-410", invoiceNo: "PI-410", vendorName: "Madura Fashion", lValue: 104, label: "Greige", lineItems: [{ itemName: "Structured Jacquard Greige", hsnCode: "520912", quantity: 280, rate: 160 }] },
          { id: "PI-411", invoiceNo: "PI-411", vendorName: "Grasim Industries", lValue: 98, label: "Jobwork", lineItems: [{ itemName: "Viscose Staple Dyeing Batch", hsnCode: "550410", quantity: 600, rate: 85 }] },
          { id: "PI-412", invoiceNo: "PI-412", vendorName: "JCT Mill Stores", lValue: 99, label: "Greige", lineItems: [{ itemName: "Heavy Canvas Duck Greige", hsnCode: "520911", quantity: 240, rate: 135 }] },
          { id: "PI-413", invoiceNo: "PI-413", vendorName: "Loyal Textile Mills", lValue: 100, label: "Yarn", lineItems: [{ itemName: "Carded Cotton Yarn 20s", hsnCode: "520511", quantity: 450, rate: 110 }] },
          { id: "PI-414", invoiceNo: "PI-414", vendorName: "Nahar Spinning", lValue: 101, label: "Yarn", lineItems: [{ itemName: "Mercerized Gassed Yarn 2/40s", hsnCode: "520523", quantity: 320, rate: 230 }] },
          { id: "PI-415", invoiceNo: "PI-415", vendorName: "Morarjee Weaves", lValue: 100, label: "Finished", lineItems: [{ itemName: "Poplin Solid Dyed Shirting", hsnCode: "520831", quantity: 410, rate: 195 }] },
          { id: "PI-416", invoiceNo: "PI-416", vendorName: "Birla Century Fabric", lValue: 97, label: "RFD", lineItems: [{ itemName: "Chambray Light Plain RFD", hsnCode: "520821", quantity: 190, rate: 155 }] },
          { id: "PI-417", invoiceNo: "PI-417", vendorName: "Sangam Processors", lValue: 96, label: "Greige", lineItems: [{ itemName: "Polyester Textured Weft Loom", hsnCode: "540761", quantity: 380, rate: 105 }] },
          { id: "PI-418", invoiceNo: "PI-418", vendorName: "RSWM Spinning", lValue: 100, label: "Yarn", lineItems: [{ itemName: "Acrylic Worsted Knit Spun", hsnCode: "550931", quantity: 270, rate: 140 }] },
          { id: "PI-419", invoiceNo: "PI-419", vendorName: "GHCL Chemicals Unit", lValue: 103, label: "Yarn", lineItems: [{ itemName: "Weft-Way Spandex Core Slub", hsnCode: "520542", quantity: 210, rate: 185 }] },
          { id: "PI-420", invoiceNo: "PI-420", vendorName: "Himatsingka Seide", lValue: 98, label: "Jobwork", lineItems: [{ itemName: "Pure Silk Organza RFD", hsnCode: "500720", quantity: 130, rate: 650 }] }
        ];

        targetPurchases.forEach((p) => {
          const lines = p.lineItems || [
            { itemName: "Premium Cotton Greige Fabric", hsnCode: "520212", quantity: 200, rate: 110 }
          ];
          lines.forEach((l, idx) => {
            source.push({
              id: `${p.id || "PI"}-${idx}-${l.itemName}`,
              itemId: l.hsnCode || "520212",
              itemName: l.itemName,
              invoiceNo: p.invoiceNo || p.id || "PI-092",
              supplier: p.vendorName || "Direct Bill",
              availableQty: l.quantity || 100,
              rate: l.rate || 100,
              lValue: p.lValue || 100,
              label: p.label || l.label || "Greige",
              isPurchase: true
            });
          });
        });
      } else {
        // Fetch from stock inventory. Fill in default SKU items.
        const defaultInv = [
          { itemId: "SKU-YARN-40S", itemName: "Premium Cotton Yarn 40s", availableQty: 300, rate: 140, invoiceNo: "PI-402", vendorName: "Auro Textiles", label: "Yarn", location: "Surat Dyeing Unit" },
          { itemId: "SKU-POLY-30S", itemName: "Poly Blend Fabric 30s", availableQty: 250, rate: 110, invoiceNo: "PI-419", vendorName: "Sutlej Weaves", label: "Finished", location: "Surat Dyeing Unit" },
          { itemId: "SKU-GREIGE-ST", itemName: "Greige Standard Loom", availableQty: 180, rate: 90, invoiceNo: "PI-502", vendorName: "Birla Century", label: "Greige", location: "Bhiwandi Loom Shed" },
          { itemId: "SKU-RFD-SATIN", itemName: "RFD Heavy Satin Silk", availableQty: 350, rate: 220, invoiceNo: "PI-601", vendorName: "Panipat Processors", label: "RFD", location: "Panipat Processing Plant" },
          { itemId: "SKU-DENIM-12OZ", itemName: "Indigo Denim fabric 12oz", availableQty: 420, rate: 185, invoiceNo: "PI-602", vendorName: "Arvind Denim Mills", label: "Finished", location: "Ahmedabad Composite Unit" },
          { itemId: "SKU-SILK-ORGAN", itemName: "Pure Organza Weaved Silk", availableQty: 110, rate: 750, invoiceNo: "PI-603", vendorName: "Varanasi Silk Weavers", label: "Finished", location: "Varanasi Weaver Hub" },
          { itemId: "SKU-LINEN-SLUB", itemName: "100% Linen Slub RFD", availableQty: 150, rate: 310, invoiceNo: "PI-604", vendorName: "Loyal Textiles", label: "RFD", location: "Coimbatore Spinning Hub" },
          { itemId: "SKU-JOB-BLEACH", itemName: "Bleaching Processed Twill", availableQty: 500, rate: 45, invoiceNo: "PI-605", vendorName: "Surat Dyeing Unit", label: "Jobwork", location: "Surat Processing Zone" },
          { itemId: "SKU-KNIT-LYCRA", itemName: "Cotton Lycra Single Jersey", availableQty: 600, rate: 160, invoiceNo: "PI-606", vendorName: "Tirupur Knitwear hub", label: "Finished", location: "Tirupur Finishing Unit" },
          { itemId: "SKU-YARN-CD20S", itemName: "Carded Cotton Yarn 20s Ring", availableQty: 400, rate: 125, invoiceNo: "PI-607", vendorName: "RSWM Spinners", label: "Yarn", location: "Bhilwara Mills Shed" },
          { itemId: "SKU-RFD-POPLIN", itemName: "Structured RFD Poplin 40x40", availableQty: 270, rate: 115, invoiceNo: "PI-608", vendorName: "Ichalkaranji Textiles", label: "RFD", location: "Ichalkaranji Powerloom Unit" },
          { itemId: "SKU-GREIGE-TW", itemName: "Twill Greige Heavy Drill", availableQty: 310, rate: 95, invoiceNo: "PI-609", vendorName: "Nallur Handloom Corp", label: "Greige", location: "Karur Handloom Hub" },
          { itemId: "SKU-JOB-PRINT", itemName: "Screen Printing Jobwork Rayon", availableQty: 800, rate: 35, invoiceNo: "PI-610", vendorName: "Sanganer Handprinters", label: "Jobwork", location: "Sanganer Jaipur Cluster" },
          { itemId: "SKU-KHADI-RAW", itemName: "Handspun Raw Khadi Cotton", availableQty: 130, rate: 210, invoiceNo: "PI-611", vendorName: "KVIC Central Store", label: "Greige", location: "Wardha Village Unit" },
          { itemId: "SKU-WOOL-GREY", itemName: "Grey Blanket Woolen Yarn", availableQty: 220, rate: 190, invoiceNo: "PI-612", vendorName: "Amritsar Woolens", label: "Yarn", location: "Ludhiana Wool House" },
          { itemId: "SKU-POLY-GEO", itemName: "Georgette RFD Polyester 60g", availableQty: 450, rate: 75, invoiceNo: "PI-613", vendorName: "Sachin Silk Mills", label: "RFD", location: "Surat GIDC Cluster" },
          { itemId: "SKU-FLEECE-BR", itemName: "Brushed Fleece Heavy Knit", availableQty: 280, rate: 245, invoiceNo: "PI-614", vendorName: "Ludhiana Hosiery Unit", label: "Finished", location: "Ludhiana Fabric Hub" },
          { itemId: "SKU-JUTE-NAT", itemName: "Natural Fine Weave Jute Roll", availableQty: 330, rate: 110, invoiceNo: "PI-615", vendorName: "Hooghly Jute Processing", label: "Greige", location: "Kolkata River GIDC" },
          { itemId: "SKU-JOB-EMB", itemName: "Embroidery Jobwork Pashmina", availableQty: 90, rate: 450, invoiceNo: "PI-616", vendorName: "Kashmir Arts Association", label: "Jobwork", location: "Srinagar Craft Center" },
          { itemId: "SKU-COT-VOILE", itemName: "Cotton Voile RFD Mulmul", availableQty: 390, rate: 98, invoiceNo: "PI-617", vendorName: "Anokhi Prints Unit", label: "RFD", location: "Jaipur Printing Fields" }
        ];
        
        const trackingInv = dbInv.length > 0 ? dbInv : defaultInv;

        source = trackingInv.map((item, idx) => ({
          id: `SKU-${idx}-${item.itemName}`,
          skuId: item.itemId ? item.itemId.replace("INV", "SKU") : `SKU-FAB-${100 + idx}`,
          itemId: item.itemId || `SKU-FAB-${100 + idx}`,
          itemName: item.itemName,
          invoiceNo: item.invoiceNo || `PI-8${idx}1`,
          supplier: item.vendorName || "General Mill Store",
          location: item.location || (idx % 2 === 0 ? "Warehouse A" : "Warehouse B"),
          availableQty: item.availableQty || 400,
          rate: item.rate || 135,
          lValue: 100,
          label: item.label || "Finished",
          isPurchase: false
        }));
      }

      // Filter matches
      if (queryStr) {
        const q = queryStr.toLowerCase();
        source = source.filter(
          (x) =>
            x.itemName.toLowerCase().includes(q) ||
            x.itemId.toLowerCase().includes(q)
        );
      }
      setItems(source);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      mockSearchLinkableItems(search);
    }
  }, [isOpen, mode]);

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      mockSearchLinkableItems(search);
    }
  };

  const handleCheckboxToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirmAdd = () => {
    const selected = items.filter((x) => selectedIds.includes(x.id));
    onSelectItems(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-[520px] bg-white border-l border-slate-300 shadow-2xl z-50 flex flex-col min-h-0 font-sans text-xs animate-slide-in select-none">
      {/* Drawer Header Toolbar */}
      <div className="h-8 shrink-0 bg-slate-900 text-slate-100 flex items-center justify-between px-3">
        <span className="font-bold uppercase tracking-wider text-[10px]">
          Link {mode === "purchase" ? "Staged Purchase" : "Inventory Stock"}
        </span>
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-0"
        >
          <X size={14} className="stroke-[2.5]" />
        </button>
      </div>



      {/* Search Filter Bar */}
      <div className="p-2 border-b border-slate-200 bg-slate-5 font-sans flex gap-1 items-center shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input
            type="text"
            placeholder={`Search linkable ${mode === "purchase" ? "purchases" : "stock"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full h-6 bg-white border border-slate-300 rounded-sm pl-5 pr-2 text-[11px] placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => mockSearchLinkableItems(search)}
          className="h-6 bg-slate-850 hover:bg-slate-750 text-white rounded-sm px-2.5 font-bold border-none cursor-pointer text-[10px]"
        >
          Find
        </button>
      </div>

      {/* Selectable Stack List */}
      <div className="flex-1 overflow-y-auto p-2" id="drawer-items-scroller">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-24 select-none">
            <Loader2 size={18} className="animate-spin text-slate-500" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none font-mono">
              RETRIEVING LEDGER RECORDS...
            </span>
          </div>
        ) : items.length > 0 ? (
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              {mode === "purchase" ? (
                // 1. Column Layout (Purchase): Checkbox, Invoice (No ID), Item, Qty/Rate
                <tr className="bg-slate-100/90 border-b border-slate-250 text-slate-500 text-[10px] uppercase font-bold text-center">
                  <th className="py-2.5 px-1.5 text-center w-[8%]"></th>
                  <th className="py-2.5 px-1.5 text-left w-[32%]">Invoice</th>
                  <th className="py-2.5 px-1.5 text-left w-[40%]">Item</th>
                  <th className="py-2.5 px-1.5 text-right w-[20%] pr-1.5">Qty / Rate</th>
                </tr>
              ) : (
                // 2. Column Layout (Inventory): Checkbox, SKU, Invoice, Item, Location, Qty/Rate
                <tr className="bg-slate-100/90 border-b border-slate-250 text-slate-500 text-[10px] uppercase font-bold text-center">
                  <th className="py-2.5 px-1.5 text-center w-[6%]"></th>
                  <th className="py-2.5 px-1.5 text-left w-[18%]">SKU</th>
                  <th className="py-2.5 px-1.5 text-left w-[28%]">Invoice</th>
                  <th className="py-2.5 px-1.5 text-left w-[24%]">Item</th>
                  <th className="py-2.5 px-1.5 text-left w-[12%]">Location</th>
                  <th className="py-2.5 px-1.5 text-right w-[12%] pr-1.5">Qty / Rate</th>
                </tr>
              )}
            </thead>
            <tbody>
              {items.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleCheckboxToggle(item.id)}
                    className={`border-b border-slate-150 h-10 hover:bg-slate-50/70 cursor-pointer ${
                      isChecked ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {/* Checkbox column */}
                    <td className="py-1 px-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Swallowed: Row click handles toggle
                        className="cursor-pointer"
                      />
                    </td>

                    {mode === "purchase" ? (
                      // PURCHASE ROW cells
                      <>
                        {/* Invoice column (stacked Invoice ID and Category Label) */}
                        <td className="py-1 px-1.5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-mono text-[10px] font-bold text-slate-700">{item.invoiceNo}</span>
                            <span className="text-[9px] text-slate-400 font-medium uppercase truncate max-w-[120px]">{item.label || "Greige"}</span>
                          </div>
                        </td>
                        {/* Item renamed header Column */}
                        <td className="py-1 px-1.5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-extrabold text-slate-800 text-[11px] truncate max-w-[170px]">{item.itemName}</span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[170px]">{item.supplier}</span>
                          </div>
                        </td>
                        {/* Qty / Rate with appends */}
                        <td className="py-1 px-1.5 text-right pr-1.5 font-mono">
                          <div className="flex flex-col text-[10px] leading-tight">
                            <span className="font-bold text-slate-800">{item.availableQty}m</span>
                            <span className="text-slate-400">₹{item.rate}/m</span>
                          </div>
                        </td>
                      </>
                    ) : (
                      // INVENTORY ROW cells
                      <>
                        {/* SKU column */}
                        <td className="py-1 px-1.5 font-mono text-[10px] font-bold text-slate-650">
                          {item.skuId}
                        </td>
                        {/* Original Invoice column stacked */}
                        <td className="py-1 px-1.5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-mono text-[10px] font-bold text-slate-700">{item.invoiceNo || "Stock Entry"}</span>
                            <span className="text-[9px] text-slate-400 font-medium uppercase truncate max-w-[100px]">{item.label || "Finished"}</span>
                          </div>
                        </td>
                        {/* Item name column */}
                        <td className="py-1 px-1.5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-extrabold text-slate-800 text-[11px] truncate max-w-[130px]">{item.itemName}</span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">{item.supplier}</span>
                          </div>
                        </td>
                        {/* Location Mock Column */}
                        <td className="py-1 px-1.5 font-semibold text-slate-500">
                          {item.location}
                        </td>
                        {/* Qty / Rate with appends */}
                        <td className="py-1 px-1.5 text-right pr-1.5 font-mono">
                          <div className="flex flex-col text-[10px] leading-tight">
                            <span className="font-bold text-slate-800">{item.availableQty}m</span>
                            <span className="text-slate-400">₹{item.rate}/m</span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium leading-normal">
            No linkable matches located inside database.
          </div>
        )}
      </div>

      {/* Sticky Bottom Confirmer Button */}
      <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <span className="text-slate-500 font-bold text-[10px]">
          {selectedIds.length} source records selected
        </span>
        <button
          type="button"
          onClick={handleConfirmAdd}
          disabled={selectedIds.length === 0}
          className="h-6 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-sm disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer text-[10px] uppercase tracking-wider"
        >
          Compile Link Items
        </button>
      </div>
    </div>
  );
}
