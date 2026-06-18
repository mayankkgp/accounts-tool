import React from "react";
import useSalesFormState from "./useSalesFormState";
import SalesFormHeader from "./SalesFormHeader";
import SalesFormFeedback from "./SalesFormFeedback";
import SalesFormActionFooter from "./SalesFormActionFooter";
import SalesLogisticsForm from "./SalesLogisticsForm";
import SalesUnstructuredForm from "./SalesUnstructuredForm";
import SalesUploadGrid from "./SalesUploadGrid";
import { brandList, customersList, addressOptions } from "./salesConstants";

/**
 * Workspace Modal used by Sales Managers to formulate new sales invoice requests
 * or review/re-submit requests back into the Queue that need correction.
 * 
 * Separates layout representation from state mapping and document attachments.
 */
export default function SalesRequestFormModal({ isOpen, onClose, editingRequest, onSaveSuccess }) {
  // Leverage custom business state hook for form routines
  const state = useSalesFormState(editingRequest, isOpen, onClose, onSaveSuccess);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 select-none animate-fade-in" id="sales-form-modal">
      <div className="bg-white rounded-sm border border-slate-300 w-[96vw] max-w-7xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Modern Header Module */}
        <SalesFormHeader 
          editingRequest={editingRequest} 
          onClose={onClose} 
        />

        {/* Triage feedback notice if corrections are specified */}
        <SalesFormFeedback 
          editingRequest={editingRequest} 
        />

        {/* Form Body Scrollbox */}
        <form 
          onSubmit={state.handleFormSubmit} 
          className={`flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0 text-xs font-sans transition-opacity duration-200 ${
            state.saving ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          {state.errorMsg && (
            <div className="bg-rose-50 text-rose-800 p-2 rounded-[2px] leading-tight border border-rose-200 font-medium">
              {state.errorMsg}
            </div>
          )}

          {/* 1. Logistics information */}
          <SalesLogisticsForm
            customer={state.customer}
            setCustomer={state.setCustomer}
            smName={state.smName}
            billTo={state.billTo}
            setBillTo={state.setBillTo}
            shipTo={state.shipTo}
            setShipTo={state.setShipTo}
            freight={state.freight}
            setFreight={state.setFreight}
            transporterName={state.transporterName}
            setTransporterName={state.setTransporterName}
            paymentTerms={state.paymentTerms}
            setPaymentTerms={state.setPaymentTerms}
            brand={state.brand}
            setBrand={state.setBrand}
            brandList={brandList}
            customersList={customersList}
            addressOptions={addressOptions}
          />

          {/* 2. Unstructured Specs and Comments */}
          <SalesUnstructuredForm
            lineItems={state.lineItems}
            setLineItems={state.setLineItems}
            greigeDetails={state.greigeDetails}
            setGreigeDetails={state.setGreigeDetails}
            comments={state.comments}
            setComments={state.setComments}
          />

          {/* 3. Document attachments with inline L-Value controls */}
          <SalesUploadGrid
            poList={state.poList}
            packingList={state.packingList}
            invoiceList={state.invoiceList}
            onUploadPO={state.handleUploadPO}
            onUploadPacking={state.handleUploadPacking}
            onUploadInvoice={state.handleUploadInvoice}
            pendingDelete={state.pendingDelete}
            onInitiateDelete={state.initiateDelete}
            onConfirmDelete={state.confirmDelete}
            onCancelDelete={state.cancelDelete}
            onLValueChange={state.handleLValueChange}
          />
        </form>

        {/* Sticky global bottom action toolbar */}
        <SalesFormActionFooter 
          saving={state.saving}
          editingRequest={editingRequest}
          onClose={onClose}
          onSubmit={state.handleFormSubmit}
        />

      </div>
    </div>
  );
}
