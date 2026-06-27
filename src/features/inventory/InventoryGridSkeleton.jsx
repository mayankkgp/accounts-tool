import React from "react";

/**
 * InventoryGridSkeleton Component
 * Renders high-fidelity animated row outlines matching current columns.
 */
export default function InventoryGridSkeleton({
  isCompressed,
  gridLayoutClass,
  activeTab,
}) {
  return (
    <div className="flex flex-col select-none divide-y divide-slate-100" id="inventory-list-skeleton-loader">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={`${isCompressed ? "py-1.5 min-h-[40px]" : "h-6"} flex items-center px-1.5 bg-slate-50/50 animate-pulse border-b border-slate-100`}>
          <div className={`flex-grow grid gap-1 items-center ${gridLayoutClass}`}>
            {isCompressed ? (
              <>
                <div className="flex flex-col gap-1">
                  <div className="h-2 bg-slate-200 rounded-xs w-3/4" />
                  <div className="h-1.5 bg-slate-200 rounded-xs w-1/2" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-2 bg-slate-200 rounded-xs w-2/3" />
                  <div className="h-1.5 bg-slate-200 rounded-xs w-1/2" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-2 bg-slate-200 rounded-xs w-4/5" />
                  <div className="h-1.5 bg-slate-200 rounded-xs w-1/2" />
                </div>
              </>
            ) : (
              <>
                <div className="h-2 bg-slate-200 rounded-xs w-2/3" />
                <div className="h-2 bg-slate-200 rounded-xs w-4/5" />
                <div className="h-2 bg-slate-200 rounded-xs w-1/2" />
                <div className="h-2 bg-slate-200 rounded-xs w-3/4" />
                <div className="h-2 bg-slate-200 rounded-xs w-1/2 text-left" />
                <div className="h-2 bg-slate-200 rounded-xs w-1/2 text-left" />
                <div className="h-2 bg-slate-200 rounded-xs w-1/2 text-left" />
                <div className="h-2 bg-slate-200 rounded-xs w-2/3" />
                <div className="h-2 bg-slate-200 rounded-xs w-1/3 text-left" />
                {activeTab === "Reviewed" && <div className="h-2 bg-slate-200 rounded-xs w-2/3" />}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
