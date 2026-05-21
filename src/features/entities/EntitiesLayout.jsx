import React, { useState } from "react";
import EntityList from "./EntityList";
import EntityDetailPane from "./EntityDetailPane";
import EntityCreateDrawer from "./EntityCreateDrawer";
import { updateEntity } from "../../services/entityService";

export default function EntitiesLayout() {
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleToggleArchive = async (entity) => {
    if (!entity) return;
    const isNowArchived = entity.status === "archived";
    const nextStatus = isNowArchived ? "active" : "archived";
    try {
      await updateEntity(entity.id, { status: nextStatus });
      handleRefresh();
    } catch (e) {
      console.error("Failed to update entity archiving state", e);
    }
  };

  const isPaneSelected = !!selectedEntityId;

  return (
    <div
      className={`flex-1 h-full grid ${
        isPaneSelected ? "grid-cols-[210px_1fr]" : "grid-cols-[1fr_0px]"
      } transition-all duration-300 ease-in-out overflow-hidden`}
      id="entities-layout-grid"
    >
      {/* High Density Left Column Directory (210px or 100% fluid) */}
      <div className="bg-slate-50 border-r border-slate-200 flex flex-col p-2 overflow-hidden justify-between" id="entities-sidebar-pane">
        <EntityList
          selectedEntityId={selectedEntityId}
          onSelectEntity={setSelectedEntityId}
          onAddNew={() => setIsCreateDrawerOpen(true)}
          refreshTrigger={refreshTrigger}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Fluid Right Details Pane with zero-collapse transition controls */}
      <div
        className={`bg-white flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isPaneSelected ? "p-2 border-l border-slate-200 opacity-100" : "p-0 border-0 opacity-0 pointer-events-none"
        }`}
        id="entities-details-pane"
      >
        <EntityDetailPane
          selectedEntityId={selectedEntityId}
          onClose={() => setSelectedEntityId(null)}
          onToggleArchive={handleToggleArchive}
          refreshTrigger={refreshTrigger}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={handleRefresh}
        />
      </div>

      <EntityCreateDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
