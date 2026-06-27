import React from "react";
import InventoryProfileHeader from "./InventoryProfileHeader";
import InventoryActionModule from "./InventoryActionModule";

/**
 * InventoryOverviewTab Component
 * Coordinates Tab A structure (Profile Info display + Action mapping).
 */
export default function InventoryOverviewTab({ item, onUpdateSuccess }) {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto" id="inventory-overview-tab-container">
      {/* Read-Only Profile Header */}
      <InventoryProfileHeader item={item} />

      {/* Action Module */}
      <InventoryActionModule item={item} onUpdateSuccess={onUpdateSuccess} />
    </div>
  );
}
