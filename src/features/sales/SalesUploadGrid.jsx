import React from "react";
import PoUploadCol from "./PoUploadCol";
import PackingListUploadCol from "./PackingListUploadCol";
import InvoiceUploadCol from "./InvoiceUploadCol";

/**
 * Top-level document attachment grid containing columns for Purchase Orders,
 * Packing Lists, and Vendor Invoice files, delegating listing and actions to column modules.
 */
export default function SalesUploadGrid({
  poList,
  packingList,
  invoiceList,
  onUploadPO,
  onUploadPacking,
  onUploadInvoice,
  pendingDelete,
  onInitiateDelete,
  onConfirmDelete,
  onCancelDelete,
  onLValueChange
}) {
  return (
    <div className="flex flex-col gap-2.5" id="sm-uploads-section">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start">
        
        {/* Column 1: PO */}
        <PoUploadCol
          poList={poList}
          onUploadPO={onUploadPO}
          pendingDelete={pendingDelete}
          onInitiateDelete={onInitiateDelete}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />

        {/* Column 2: Packing List */}
        <PackingListUploadCol
          packingList={packingList}
          onUploadPacking={onUploadPacking}
          pendingDelete={pendingDelete}
          onInitiateDelete={onInitiateDelete}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />

        {/* Column 3: Vendor Invoices */}
        <InvoiceUploadCol
          invoiceList={invoiceList}
          onUploadInvoice={onUploadInvoice}
          onLValueChange={onLValueChange}
          pendingDelete={pendingDelete}
          onInitiateDelete={onInitiateDelete}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />

      </div>
    </div>
  );
}
