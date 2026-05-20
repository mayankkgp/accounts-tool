import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { MapPin, Briefcase, Phone, Hash, Award } from "lucide-react";

export default function EntityDetailTabs({ profile }) {
  return (
    <Tabs.Root defaultValue="overview" className="flex-1 flex flex-col overflow-hidden w-full font-sans" id="detail-tabs-root">
      {/* Dynamic Tab List Header */}
      <Tabs.List className="flex border-b border-slate-200 bg-slate-105 p-0.5 rounded-sm gap-0.5 select-none shrink-0 mb-1" id="detail-tabs-list">
        {["overview", "ledger", "operations", "connections"].map((tab) => (
          <Tabs.Trigger
            key={tab}
            value={tab}
            className="flex-1 text-[9px] uppercase tracking-wider font-semibold py-1 px-1.5 rounded-[1px] transition-all cursor-pointer outline-none text-center text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-bold hover:text-slate-800"
            id={`detail-tab-trigger-${tab}`}
          >
            {tab === "overview" && "Overview"}
            {tab === "ledger" && "Ledger"}
            {tab === "operations" && "Operations"}
            {tab === "connections" && "Connections"}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Contents Area */}
      <div className="flex-1 overflow-y-auto pr-0.5" id="detail-tabs-content-viewport">
        {/* 1. OVERVIEW TAB */}
        <Tabs.Content value="overview" className="space-y-2 outline-none py-0.5" id="tab-content-overview">
          
          {/* Profile Core Highlights Details Grid */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 border border-slate-200/60 p-1.5 rounded-sm" id="detail-overview-grid">
            {/* POC name */}
            <div className="flex items-start gap-1">
              <Briefcase size={11} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[8px] uppercase tracking-wide text-slate-450 block leading-tight">Contact Person</span>
                <span className="text-[11px] text-slate-800 font-medium truncate block leading-tight">{profile.pocName || "--"}</span>
              </div>
            </div>

            {/* Phone/POC contact */}
            <div className="flex items-start gap-1">
              <Phone size={11} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[8px] uppercase tracking-wide text-slate-450 block leading-tight">POC Contact Info</span>
                <span className="text-[11px] text-slate-800 font-medium truncate block leading-tight">{profile.pocContact || "--"}</span>
              </div>
            </div>

            {/* PAN number */}
            <div className="flex items-start gap-1">
              <Hash size={11} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[8px] uppercase tracking-wide text-slate-455 block leading-tight">PAN Number</span>
                <span className="text-[11px] text-slate-800 font-mono font-medium truncate block uppercase leading-tight">
                  {profile.pan || (profile.gst && profile.gst.length >= 12 ? profile.gst.substring(2, 12) : "--")}
                </span>
              </div>
            </div>

            {/* Default terms etc */}
            <div className="flex items-start gap-1">
              <Award size={11} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-[8px] uppercase tracking-wide text-slate-455 block leading-tight">Default Terms</span>
                <span className="text-[11px] text-slate-800 font-medium truncate block leading-tight">
                  {profile.terms && typeof profile.terms === "object"
                    ? `${profile.terms.creditDays !== undefined ? `CR: ${profile.terms.creditDays}D` : ""}${profile.terms.creditDays !== undefined && profile.terms.debitDays !== undefined ? " / " : ""}${profile.terms.debitDays !== undefined ? `DB: ${profile.terms.debitDays}D` : ""}`
                    : (typeof profile.terms === "string" ? profile.terms : "Net 30 Days")}
                </span>
              </div>
            </div>
          </div>

          {/* Bank details subsection */}
          {profile.bankDetails ? (
            <div className="border border-slate-205 p-1.5 rounded-sm bg-slate-50/50" id="detail-bank-info">
              <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">Corporate Bank Details</span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono text-slate-600">
                <div className="truncate">
                  <span className="text-slate-400">BENEFICIARY:</span> {profile.bankDetails.beneficiary || profile.businessName || "--"}
                </div>
                <div className="truncate">
                  <span className="text-slate-400">BANK:</span> {profile.bankDetails.bankName || "Corporate Bank"}
                </div>
                <div className="truncate">
                  <span className="text-slate-400">A/C:</span> {profile.bankDetails.accountNo || "--"}
                </div>
                <div className="truncate">
                  <span className="text-slate-400">IFSC:</span> {profile.bankDetails.ifscCode || profile.bankDetails.ifsc || "--"}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 p-1.5 rounded-sm bg-slate-50/30 text-[9px] text-slate-400" id="detail-bank-missing">
              No bank account specified for this entity profile.
            </div>
          )}

          {/* Mapped Address Stack */}
          <div className="flex flex-col gap-1.5" id="detail-addresses-section">
            <div className="flex items-center justify-between border-b border-slate-100 pb-0.5 shrink-0 select-none">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-405 flex items-center gap-1">
                <MapPin size={10} /> Registered Locations ({profile.addresses ? profile.addresses.length : 0})
              </span>
            </div>

            {profile.addresses && profile.addresses.length > 0 ? (
              <div className="flex flex-col gap-1" id="detail-overview-address-cards">
                {profile.addresses.map((addr) => {
                  const hasBadges = addr.isDefaultBilling || addr.isDefaultShipping;
                  return (
                    <div
                      key={addr.id}
                      className="border border-slate-200 bg-white hover:border-slate-300 p-1.5 rounded-[2px] flex flex-col gap-1 relative text-[10px] transition-colors"
                      id={`address-card-${addr.id}`}
                    >
                      {/* Top labels for Billing / Shipping Default badge */}
                      {hasBadges && (
                        <div className="flex gap-1 items-center self-start mb-0.5">
                          {addr.isDefaultBilling && (
                            <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-0.2 bg-indigo-50 border border-indigo-205 text-indigo-600 rounded-[2px]" title="Default Billing Directs">
                              Default Billing
                            </span>
                          )}
                          {addr.isDefaultShipping && (
                            <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-0.2 bg-emerald-50 border border-emerald-205 text-emerald-600 rounded-[2px]" title="Default Shipping Directs">
                              Default Shipping
                            </span>
                          )}
                        </div>
                      )}

                      {/* Content details of the address */}
                      <p className="text-slate-700 leading-tight">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                      </p>
                      
                      <div className="text-[9px] text-slate-400 font-mono flex gap-1.5 uppercase leading-none mt-0.5">
                        <span>City: <strong className="text-slate-500 font-medium">{addr.city || "--"}</strong></span>
                        <span>State: <strong className="text-slate-500 font-medium">{addr.state || "--"}</strong></span>
                        <span>PIN: <strong className="text-slate-500 font-bold">{addr.pincode || "--"}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 italic py-2 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-sm" id="detail-no-addresses-card">
                No active addresses found. Configure profiles to bind locations.
              </div>
            )}
          </div>
        </Tabs.Content>

        {/* 2. LEDGER TAB (Placeholder) */}
        <Tabs.Content value="ledger" className="outline-none" id="tab-content-ledger">
          <div className="p-4 border border-dashed border-slate-200 rounded-sm text-center text-slate-400 text-[10px] italic select-none">
            Financial ledger logs empty for this record context. Built in Step 5.
          </div>
        </Tabs.Content>

        {/* 3. OPERATIONS TAB (Placeholder) */}
        <Tabs.Content value="operations" className="outline-none" id="tab-content-operations">
          <div className="p-4 border border-dashed border-slate-200 rounded-sm text-center text-slate-400 text-[10px] italic select-none">
            Active operation pipelines empty for this record context. Built in Step 5.
          </div>
        </Tabs.Content>

        {/* 4. CONNECTIONS TAB (Placeholder) */}
        <Tabs.Content value="connections" className="outline-none" id="tab-content-connections">
          <div className="p-4 border border-dashed border-slate-200 rounded-sm text-center text-slate-400 text-[10px] italic select-none">
            Supplier mapped connections empty. Built in Step 7.
          </div>
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
