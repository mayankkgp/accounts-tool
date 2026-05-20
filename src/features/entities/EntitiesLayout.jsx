import React, { useState } from "react";
import EntityList from "./EntityList";

export default function EntitiesLayout() {
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex-1 h-full grid grid-cols-[210px_1fr] overflow-hidden" id="entities-layout-grid">
      {/* High Density Left Column Directory (210px) */}
      <div className="bg-slate-50 border-r border-slate-200 flex flex-col p-2 overflow-hidden justify-between" id="entities-sidebar-pane">
        <EntityList
          selectedEntityId={selectedEntityId}
          onSelectEntity={setSelectedEntityId}
          onAddNew={() => console.log("Form drawer requested (Step 4)")}
          refreshTrigger={refreshTrigger}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Fluid Right Details Pane (1fr) */}
      <div className="bg-white flex flex-col p-2 overflow-hidden justify-between select-none" id="entities-details-pane">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-slate-500 font-mono font-medium">
            Entity Details Column
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Selected Entity ID: {selectedEntityId || "None"}
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-1">
          Workspace Base: Empty
        </div>
      </div>
    </div>
  );
}
