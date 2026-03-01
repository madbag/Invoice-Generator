import React, { useState } from "react";

type Item = {
  description: string;
  quantity: number;
  cost: number;
};

interface InvoicePreviewProps {
  invoiceNo: string;
  form: {
    clientName: string;
    clientAddress: string;
    clientEmail: string;
    contactNumber: number;
    invoiceDate: string;
    emailMessage?: string; // optional message to send
  };
  items: Item[];
  onClose: () => void;
}

export default function InvoicePreview({
  invoiceNo,
  form,
  items,
  onClose,
}: InvoicePreviewProps) {
  const [loading, setLoading] = useState(false);
  const total = items.reduce((sum, item) => sum + item.quantity * item.cost, 0);

  const handleSaveAndSend = async () => {
    setLoading(true);
    try {
      const total = items.reduce(
        (sum, item) => sum + item.quantity * item.cost,
        0,
      );

      // 1️⃣ Save invoice first
      const saveResponse = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNo, form, items, total }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save invoice");

      // 2️⃣ Attempt to send email
      try {
        const emailResponse = await fetch(
          "http://localhost:5000/api/send-invoice",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoiceNo,
              clientEmail: form.clientEmail,
              message: form.emailMessage || "Here is your invoice.",
              items,
              total,
            }),
          },
        );

        if (!emailResponse.ok) throw new Error("Failed to send email");

        alert("Invoice saved and sent successfully!");
      } catch (emailErr) {
        console.error(emailErr);
        alert("Invoice saved, but failed to send email.");
      }

      onClose(); // optionally close the modal
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-4">Invoice Preview</h1>
        <p>
          <strong>Invoice No:</strong> {invoiceNo}
        </p>
        <p>
          <strong>Date:</strong> {form.invoiceDate}
        </p>
        <p>
          <strong>Client:</strong> {form.clientName}
        </p>
        <p>
          <strong>Address:</strong> {form.clientAddress}
        </p>
        <p>
          <strong>Email:</strong> {form.clientEmail}
        </p>
        <p>
          <strong>Contact:</strong> {form.contactNumber}
        </p>

        <table className="w-full border-collapse mt-4">
          <thead className="bg-gray-200">
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>€ {item.cost}</td>
                <td>€ {item.quantity * item.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-semibold mt-4">Grand Total: € {total}</h2>

        {/* Buttons */}
        <button
          onClick={handleSaveAndSend}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Save & Send Invoice
        </button>
      </div>
    </div>
  );
}
