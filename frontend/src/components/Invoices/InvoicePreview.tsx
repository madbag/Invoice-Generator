import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { InvoiceContext } from "../../context/InvoiceContext";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const invoiceContext = useContext(InvoiceContext);
  const { token } = useAuth();
  const [message, setMessage] = useState("");

  if (!invoiceContext) return <p>No invoice data found.</p>;

  const { invoiceNo, form, items, total } = invoiceContext;
  // console.log("TOKEN SENT TO BACKEND:", token);

  const handleConfirm = async () => {
    console.log("SENDING:", {
      invoiceNo,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      invoiceDate: form.invoiceDate,
      items,
      total,
    });

    try {
      await axios.post(
        "http://localhost:5000/api/invoices",
        {
          invoiceNo,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          invoiceDate: form.invoiceDate,
          items,
          total,
          status: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await axios.post(
        "http://localhost:5000/api/clients",
        {
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientAddress: form.clientAddress,
          contactNumber: form.contactNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage("Invoice saved & sent to " + form.clientEmail + "!");

      localStorage.removeItem("invoice");

      invoiceContext.setInvoiceData({
        invoiceNo: "",
        form: {
          clientName: "",
          clientAddress: "",
          clientEmail: "",
          contactNumber: "",
          invoiceDate: "",
        },
        items: [{ description: "", quantity: 1, cost: 0 }],
        total: 0,
      });

      setTimeout(() => {
        navigate("/dashboard/invoice-list");
      }, 3000);
    } catch (error: any) {
      console.error("Full error:", error.response?.data);
      setMessage("Error saving invoice. Please try again.");
    }
  };

  const handleBack = () => {
    navigate(-1); // goes back to previous page
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoice Preview</h1>

      <p>
        <strong>Invoice No:</strong> {invoiceNo}
      </p>
      <p>
        <strong>Client:</strong> {form.clientName}
      </p>
      <p>
        <strong>Email:</strong> {form.clientEmail}
      </p>
      <p>
        <strong>Date:</strong> {form.invoiceDate}
      </p>

      <h2 className="mt-4 font-semibold">Items</h2>
      {items.map((item, index) => (
        <div key={index}>
          {item.description} — {item.quantity} × €{item.cost}
        </div>
      ))}

      <h2 className="text-xl mt-4 font-bold">Total: € {total}</h2>

      {message && (
        <div
          className={`mt-4 p-2 rounded ${message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
        >
          {message}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleBack}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Back
        </button>

        <button
          onClick={handleConfirm}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
