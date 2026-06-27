import React from "react";
import InventoryPendingAction from "./InventoryPendingAction";
import InventoryReviewedAction from "./InventoryReviewedAction";

/**
 * InventoryActionModule Component (Orchestrator)
 * Evaluates item status and renders the correct action module.
 */
export default function InventoryActionModule({ item, onUpdateSuccess }) {
  if (item.status === "Pending") {
    return (
      <InventoryPendingAction
        item={item}
        onUpdateSuccess={onUpdateSuccess}
      />
    );
  }

  return (
    <InventoryReviewedAction
      item={item}
      onUpdateSuccess={onUpdateSuccess}
    />
  );
}
