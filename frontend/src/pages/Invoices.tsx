// pages/CreateInvoice.tsx

import InvoiceForm from "../components/Invoices/InvoiceForm";

export default function CreateInvoice() {
  return (
    <div className="invoice-page">
      <h1>Create Invoice</h1>

      {/* You can add more sections here later */}
      <InvoiceForm />
    </div>
  );
}