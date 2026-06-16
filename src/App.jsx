import React, { useState } from "react";
import AppWrapper from "./components/layout/AppWrapper";
import EntitiesLayout from "./features/entities/EntitiesLayout";
import PurchasesLayout from "./features/purchases/PurchasesLayout";
import SalesLayout from "./features/sales/SalesLayout";
import InventoryLayout from "./features/inventory/InventoryLayout";
import LedgerLayout from "./features/ledger/LedgerLayout";
import { useInitializeData } from "./hooks/useInitializeData";

export default function App() {
  // Seed local storage with B2B mock dataset if not present
  useInitializeData();

  const [activeModule, setActiveModule] = useState("Entities");
  const [userRole, setUserRole] = useState("SM"); // "SM" or "Finance"

  // Render the appropriate layout for the active module
  const renderModuleContent = () => {
    switch (activeModule) {
      case "Entities":
        return <EntitiesLayout />;
      case "Purchases":
        return <PurchasesLayout />;
      case "Sales":
        return <SalesLayout userRole={userRole} />;
      case "Inventory":
        return <InventoryLayout />;
      case "Ledger":
        return <LedgerLayout />;
      default:
        return <EntitiesLayout />;
    }
  };

  return (
    <AppWrapper 
      activeModule={activeModule} 
      setActiveModule={setActiveModule}
      userRole={userRole}
      setUserRole={setUserRole}
    >
      {renderModuleContent()}
    </AppWrapper>
  );
}
