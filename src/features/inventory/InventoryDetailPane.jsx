import React, { useEffect } from "react";
import { X } from "lucide-react";
import TabsComponent from "../../components/ui/Tabs";
import InventoryOverviewTab from "./InventoryOverviewTab";
import InventoryHistoryTab from "./InventoryHistoryTab";
import { calculateAge } from "./inventoryUtils";

/**
 * InventoryDetailPane Component
 * Master container representing the sliding Right Side Drawer details workspace.
 * Conforms to the strict 150-line size limit by routing to modular sub-components.
 */
export default function InventoryDetailPane({
  activeInventoryId,
  inventory = [],
  onClose,
  onUpdateSuccess,
}) {
  // Support closing the pane via Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!activeInventoryId) return null;

  // Find the selected item across both pending and reviewed partitions
  const item = inventory.find((x) => x.id === activeInventoryId);

  if (!item) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-slate-400 text-xs font-medium" id="detail-pane-missing-record">
        <span>Failed to fetch inventory item details</span>
        <span className="text-[10px] font-mono mt-1 text-slate-350">record_not_found</span>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col bg-white animate-in slide-in-from-right-4 duration-200 font-sans select-none overflow-hidden"
      id="inventory-interactive-detail-pane"
    >
      <TabsComponent.Root defaultValue="overview" className="flex flex-col h-full" id="inventory-detail-tabs-root">
        {/* Header containing tabs controls and close button */}
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 shrink-0 select-none bg-slate-50/50" id="detail-header-nav">
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Status Badge */}
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.25 border rounded-[2px] shrink-0 font-sans ${
                item.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-250" : "bg-emerald-50 text-emerald-700 border-emerald-250"
              }`}>
                {item.status}
              </span>
              <h2 className="text-[13px] font-bold text-slate-900 leading-normal truncate" title={item.item}>
                {item.item && item.item.length > 40 ? `${item.item.slice(0, 40)}...` : item.item}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium font-mono leading-none mt-1.5 flex-wrap">
              <span>{item.sku || "—"}</span>
              <span className="text-slate-300">•</span>
              <span>{item.type || "—"}</span>
              <span className="text-slate-300">•</span>
              <span>{new Intl.NumberFormat("en-IN").format(item.qty || 0)}m</span>
              <span className="text-slate-300">•</span>
              <span>{calculateAge(item.inwardDate)}d</span>
            </div>
          </div>

          {/* Radix Tabs List Trigger Controls */}
          <TabsComponent.List className="flex items-center gap-1 border-b-0 h-6">
            <TabsComponent.Trigger
              value="overview"
              className="h-6 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 border-b border-transparent transition-all cursor-pointer flex items-center"
              id="tab-overview-trigger"
            >
              Overview
            </TabsComponent.Trigger>
            <TabsComponent.Trigger
              value="history"
              className="h-6 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 border-b border-transparent transition-all cursor-pointer flex items-center"
              id="tab-history-trigger"
            >
              History
            </TabsComponent.Trigger>
          </TabsComponent.List>

          {/* Close Details Button */}
          <button
            onClick={onClose}
            className="h-6 w-6 rounded-sm flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer p-0 shrink-0 ml-2"
            title="Close details (Esc)"
            id="close-detail-pane-btn"
            type="button"
          >
            <X size={13} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Content Tabs Area */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white" id="detail-pane-contents-wrapper">
          <TabsComponent.Content value="overview" className="p-3 focus-visible:outline-none" id="tab-overview-content">
            <InventoryOverviewTab item={item} onUpdateSuccess={onUpdateSuccess} />
          </TabsComponent.Content>

          <TabsComponent.Content value="history" className="p-3 focus-visible:outline-none h-full" id="tab-history-content">
            <InventoryHistoryTab item={item} />
          </TabsComponent.Content>
        </div>
      </TabsComponent.Root>
    </div>
  );
}
