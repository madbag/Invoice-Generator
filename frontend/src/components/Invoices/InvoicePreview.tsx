import { useNavigate } from "react-router-dom";

import { useContext, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { InvoiceContext } from "../../context/InvoiceContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {API} from "../../api";

export default function InvoicePreview() {
  const navigate = useNavigate();
  const invoiceContext = useContext(InvoiceContext);
  const { token } = useAuth();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!invoiceContext) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--muted-foreground)]">No invoice data found.</p>
      </div>
    );
  }

  const { invoiceNo, form, items, total } = invoiceContext;

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoiceNo}.pdf`);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await API.post(
        "/invoices",
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
        }
      );

      await API.post(
        `/invoices/${res.data._id}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await API.post(
        "/clients",
        {
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientAddress: form.clientAddress,
          contactNumber: form.contactNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ text: `Invoice saved & sent to ${form.clientEmail}!`, type: "success" });

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
      }, 2000);
    } catch (error: any) {
      console.error("Full error:", error.response?.data);
      setMessage({ text: "Error saving invoice. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Invoice Preview
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Review before sending to client
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--secondary)] transition-colors"
        >
          <DownloadIcon />
          Download PDF
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
              : "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Invoice Document */}
      <div
        ref={invoiceRef}
        className="bg-white text-gray-900 rounded-xl overflow-hidden shadow-lg"
      >
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">INVOICE</h2>
              <p className="text-blue-100 mt-1">{invoiceNo}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Invoice Date</p>
              <p className="text-lg font-medium">
                {form.invoiceDate ? new Date(form.invoiceDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8">
          {/* Client Info */}
          <div className="mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Bill To</p>
            <h3 className="text-xl font-semibold text-gray-900">{form.clientName}</h3>
            <p className="text-gray-600">{form.clientEmail}</p>
            <p className="text-gray-600">{form.clientAddress}</p>
            {form.contactNumber && (
              <p className="text-gray-600">{form.contactNumber}</p>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-xs text-gray-500 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="text-center py-3 text-xs text-gray-500 uppercase tracking-wide w-20">
                    Qty
                  </th>
                  <th className="text-right py-3 text-xs text-gray-500 uppercase tracking-wide w-28">
                    Price
                  </th>
                  <th className="text-right py-3 text-xs text-gray-500 uppercase tracking-wide w-28">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 text-gray-900">{item.description}</td>
                    <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-600">
                      {item.cost.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="py-4 text-right font-medium text-gray-900">
                      {(item.quantity * item.cost).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  {total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={handleBack}
          className="px-6 py-2.5 border border-[var(--border)] text-[var(--muted-foreground)] rounded-lg font-medium hover:bg-[var(--secondary)] transition-colors"
        >
          Back to Edit
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <SendIcon />
              Confirm & Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);