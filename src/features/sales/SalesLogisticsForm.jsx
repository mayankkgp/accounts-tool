import React from "react";
import Combobox from "./Combobox";

/**
 * Renders the logistical detail fields for building/editing a Sales Invoice request.
 * Contains bindings for Customer, Sales Agent, billing details, freight, transporter details,
 * payment terms, and brands.
 */
export default function SalesLogisticsForm({
  customer,
  setCustomer,
  smName,
  billTo,
  setBillTo,
  shipTo,
  setShipTo,
  freight,
  setFreight,
  transporterName,
  setTransporterName,
  paymentTerms,
  setPaymentTerms,
  brand,
  setBrand,
  brandList = [],
  customersList = [],
  addressOptions = []
}) {
  const billToOptions = customer ? [`${customer} - HO`, ...addressOptions] : addressOptions;

  return (
    <div className="flex flex-col gap-2" id="sm-logistics-section">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 items-end">
        {/* Customer Selector */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Customer *</label>
          <Combobox
            value={customer}
            onChange={setCustomer}
            options={customersList}
            id="form-select-customer"
            required
          />
        </div>

        {/* SM Agent (Read Only) */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Sales Manager Agent</label>
          <input
            type="text"
            value={smName}
            className="w-full h-6 text-[11px] px-1.5 border border-slate-300 rounded-sm bg-slate-100 text-slate-500 font-medium outline-none"
            readOnly
          />
        </div>

        {/* Bill To */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Bill to *</label>
          <Combobox
            value={billTo}
            onChange={setBillTo}
            options={billToOptions}
            required
          />
        </div>

        {/* Ship To */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Ship to *</label>
          <Combobox
            value={shipTo}
            onChange={setShipTo}
            options={addressOptions}
            required
          />
        </div>

        {/* Freight Terms */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Freight terms</label>
          <input
            type="text"
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
            className="w-full h-6 text-[11px] px-1.5 border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-500 outline-none font-sans"
            placeholder="e.g. To Pay"
          />
        </div>

        {/* Transporter Name */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Transporter Name *</label>
          <input
            type="text"
            value={transporterName}
            onChange={(e) => setTransporterName(e.target.value)}
            className="w-full h-6 text-[11px] px-1.5 border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-500 outline-none font-sans"
            required
          />
        </div>

        {/* Payment Terms */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Payment term *</label>
          <input
            type="text"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full h-6 text-[11px] px-1.5 border border-slate-300 rounded-sm hover:border-slate-400 focus:border-indigo-500 outline-none font-sans"
            placeholder="e.g. 30 Days Credit"
            required
          />
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Brand</label>
          <Combobox
            value={brand}
            onChange={setBrand}
            options={brandList || []}
          />
        </div>
      </div>
    </div>
  );
}
