import React from "react";
import Tabs from "../../components/ui/Tabs";
import EntityOverviewTab from "./EntityOverviewTab";
import EntityConnectionsTab from "./EntityConnectionsTab";

export default function EntityDetailTabs({ profile, activeTab, onTabChange, onRefresh }) {
  return (
    <Tabs.Root value={activeTab || "overview"} onValueChange={onTabChange} className="flex-1 flex flex-col overflow-hidden w-full font-sans" id="detail-tabs-root">
      <Tabs.List className="flex border-b border-slate-200 bg-slate-100 p-0.5 rounded-sm gap-0.5 select-none shrink-0 mb-1" id="detail-tabs-list">
        {["overview", "ledger", "operations", "connections"].map((tab) => (
          <Tabs.Trigger
            key={tab}
            value={tab}
            className="flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 px-1.5 rounded-[1px] transition-all cursor-pointer outline-none text-center text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm data-[state=active]:font-bold hover:text-slate-800"
            id={`detail-tab-trigger-${tab}`}
          >
            {tab === "overview" && "Overview"}
            {tab === "ledger" && "Ledger"}
            {tab === "operations" && "Operations"}
            {tab === "connections" && "Connections"}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="flex-1 overflow-y-auto pr-0.5" id="detail-tabs-content-viewport">
        <Tabs.Content value="overview" className="space-y-3 outline-none py-1 flex flex-col flex-1" id="tab-content-overview">
          <EntityOverviewTab profile={profile} onRefresh={onRefresh} />
        </Tabs.Content>

        <Tabs.Content value="ledger" className="outline-none" id="tab-content-ledger">
          <div className="p-4 border border-slate-100 bg-slate-50 rounded-sm text-center text-slate-500 font-medium text-[10px] italic select-none">Financial ledger logs empty. Built in Step 5.</div>
        </Tabs.Content>

        <Tabs.Content value="operations" className="outline-none" id="tab-content-operations">
          <div className="p-4 border border-slate-100 bg-slate-50 rounded-sm text-center text-slate-500 font-medium text-[10px] italic select-none">Active operation pipelines empty. Built in Step 5.</div>
        </Tabs.Content>

        <Tabs.Content value="connections" className="outline-none" id="tab-content-connections">
          <EntityConnectionsTab profile={profile} onRefresh={onRefresh} />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
