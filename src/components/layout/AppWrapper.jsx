import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function AppWrapper({ activeModule, setActiveModule, userRole, setUserRole, children }) {
  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden text-slate-900 font-sans" id="app-container">
      {/* Dynamic Top Nav Header */}
      <TopNav activeModule={activeModule} userRole={userRole} setUserRole={setUserRole} />

      {/* Main Content Area: Sidebar + Active Workspace */}
      <div className="flex-1 flex overflow-hidden w-full relative" id="app-body">
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        
        {/* Full-width Workspace for nested module layout */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative" id="app-workspace">
          {children}
        </main>
      </div>
    </div>
  );
}
