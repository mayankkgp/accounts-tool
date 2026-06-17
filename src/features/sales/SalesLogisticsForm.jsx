import React from "react";

function Combobox({ value, onChange, options, placeholder, required, id }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes((value || "").toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        className="w-full h-6 bg-white border border-slate-300 rounded-sm px-2 text-xs font-medium focus:border-indigo-500 outline-none"
      />
      {isOpen && (
        <ul className="absolute left-0 top-[calc(100%+2px)] w-full max-h-40 overflow-y-auto bg-white border border-slate-200 shadow-md rounded-sm z-50 text-xs py-1 list-none m-0 p-0">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={idx}
                onMouseDown={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="px-2 py-1 hover:bg-slate-100 cursor-pointer text-slate-700"
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-2 py-1 text-slate-400 italic">No matches found</li>
          )}
        </ul>
      )}
    </div>
  );
}

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
  brandList,
  customersList,
  addressOptions
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

        {/* SM Agent */}
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


        {/* Freight */}
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
