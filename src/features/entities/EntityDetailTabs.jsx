import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { MapPin, Briefcase, Phone, Hash, Award, User, Landmark } from "lucide-react";

export default function EntityDetailTabs({ profile, activeTab, onTabChange }) {
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
          {/* Point of Contact Subsection */}
          <div className="flex flex-col gap-1" id="subsection-poc">
            <div className="flex items-center gap-1 select-none" id="header-poc">
              <User size={12} className="text-slate-500" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Point of Contact</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-50 border-l-2 border-l-slate-300 p-1.5 rounded-sm" id="detail-overview-grid">
              <div className="flex items-start gap-1">
                <Briefcase size={11} className="text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Contact Person</span>
                  <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{profile.pocName || "--"}</span>
                </div>
              </div>
              <div className="flex items-start gap-1">
                <Phone size={11} className="text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">POC Contact Info</span>
                  <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">{profile.pocContact || "--"}</span>
                </div>
              </div>
              <div className="flex items-start gap-1">
                <Hash size={11} className="text-slate-505 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">PAN Number</span>
                  <span className="text-[11px] text-slate-800 font-mono font-bold truncate block uppercase leading-tight">
                    {profile.pan || (profile.gst && profile.gst.length >= 12 ? profile.gst.substring(2, 12) : "--")}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-1">
                <Award size={11} className="text-slate-505 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] uppercase tracking-wide text-slate-500 font-semibold block leading-tight">Default Terms</span>
                  <span className="text-[11px] text-slate-800 font-semibold truncate block leading-tight">
                    {profile.terms && typeof profile.terms === "object"
                      ? `${profile.terms.creditDays !== undefined ? `CR: ${profile.terms.creditDays}D` : ""}${profile.terms.creditDays !== undefined && profile.terms.debitDays !== undefined ? " / " : ""}${profile.terms.debitDays !== undefined ? `DB: ${profile.terms.debitDays}D` : ""}`
                      : (typeof profile.terms === "string" ? profile.terms : "Net 30 Days")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Corporate Bank Details Subsection */}
          <div className="flex flex-col gap-1" id="subsection-bank">
            <div className="flex items-center gap-1 select-none" id="header-bank">
              <Landmark size={12} className="text-slate-500" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Bank Details</span>
            </div>
            {profile.bankDetails ? (
              <div className="bg-slate-50 border-l-2 border-l-blue-400 p-1.5 rounded-sm" id="detail-bank-info">
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono text-slate-600">
                  <div className="truncate"><span className="text-slate-500 font-medium">BENEFICIARY:</span> {profile.bankDetails.beneficiary || profile.businessName || "--"}</div>
                  <div className="truncate"><span className="text-slate-500 font-medium">BANK:</span> {profile.bankDetails.bankName || "Corporate Bank"}</div>
                  <div className="truncate"><span className="text-slate-500 font-medium">A/C:</span> {profile.bankDetails.accountNo || "--"}</div>
                  <div className="truncate"><span className="text-slate-500 font-medium">IFSC:</span> {profile.bankDetails.ifscCode || profile.bankDetails.ifsc || "--"}</div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 border-l-2 border-l-blue-400/50 p-1.5 rounded-sm text-[10px] text-slate-500 font-medium italic" id="detail-bank-missing">
                No bank account specified for this entity profile.
              </div>
            )}
          </div>

          {/* Locations Addresses Subsection */}
          <div className="flex flex-col gap-1.5" id="detail-addresses-section">
            <div className="flex items-center gap-1 border-b border-slate-100 pb-0.5 shrink-0 select-none" id="header-addresses">
              <MapPin size={12} className="text-slate-500" />
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Registered Locations ({profile.addresses ? profile.addresses.length : 0})
              </span>
            </div>

            {profile.addresses && profile.addresses.length > 0 ? (
              <div className="flex flex-col gap-1" id="detail-overview-address-cards">
                {profile.addresses.map((addr) => {
                  const hasBadges = addr.isDefaultBilling || addr.isDefaultShipping;
                  return (
                    <div key={addr.id} className="bg-slate-50 border-l-2 border-l-emerald-400 hover:bg-slate-100/50 p-1.5 rounded-sm flex flex-col gap-1 relative text-[10px] transition-all" id={`address-card-${addr.id}`}>
                      {hasBadges && (
                        <div className="flex gap-1 items-center self-start mb-0.5">
                          {addr.isDefaultBilling && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-0.2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[2px]">Default Billing</span>}
                          {addr.isDefaultShipping && <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-[2px]">Default Shipping</span>}
                        </div>
                      )}
                      <p className="text-slate-800 font-medium leading-tight">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                      <div className="text-[9px] text-slate-505 font-bold font-mono flex gap-1.5 uppercase leading-none mt-0.5">
                        <span>City: <strong className="text-slate-700 font-bold">{addr.city || "--"}</strong></span>
                        <span>State: <strong className="text-slate-700 font-bold">{addr.state || "--"}</strong></span>
                        <span>PIN: <strong className="text-slate-800 font-bold">{addr.pincode || "--"}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 font-medium italic py-2 text-center bg-slate-50 border-l-2 border-l-emerald-400/50 rounded-sm" id="detail-no-addresses-card">
                No active addresses found. Configure locations dynamically.
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="ledger" className="outline-none" id="tab-content-ledger">
          <div className="p-4 border border-slate-100 bg-slate-50 rounded-sm text-center text-slate-500 font-medium text-[10px] italic select-none">Financial ledger logs empty. Built in Step 5.</div>
        </Tabs.Content>

        <Tabs.Content value="operations" className="outline-none" id="tab-content-operations">
          <div className="p-4 border border-slate-100 bg-slate-50 rounded-sm text-center text-slate-500 font-medium text-[10px] italic select-none">Active operation pipelines empty. Built in Step 5.</div>
        </Tabs.Content>

        <Tabs.Content value="connections" className="outline-none" id="tab-content-connections">
          <div className="p-4 border border-slate-100 bg-slate-50 rounded-sm text-center text-slate-500 font-medium text-[10px] italic select-none">Supplier mapped connections empty. Built in Step 7.</div>
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
