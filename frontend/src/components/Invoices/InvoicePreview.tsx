import { useNavigate, Link } from "react-router-dom";

import { useContext, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { InvoiceContext } from "../../context/InvoiceContext";
import { API, downloadInvoicePdf } from "../../api";
import { getInitials } from "../../utils/initials";

const GUEST_SEND_COUNT_KEY = "guestInvoiceSendCount";
const GUEST_SEND_LIMIT = 5;

const getGuestSendCount = () =>
  Number(localStorage.getItem(GUEST_SEND_COUNT_KEY)) || 0;

export default function InvoicePreview() {
  const navigate = useNavigate();
  const invoiceContext = useContext(InvoiceContext);
  const { token, user } = useAuth();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestSendCount, setGuestSendCount] = useState(() =>
    !token ? getGuestSendCount() : 0
  );
  const guestLimitReached = !token && guestSendCount >= GUEST_SEND_LIMIT;

  if (!invoiceContext) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--muted-foreground)]">No invoice data found.</p>
      </div>
    );
  }

  const { invoiceNo, form, items, total } = invoiceContext;

  const handleDownloadPDF = async () => {
    try {
      const res = await downloadInvoicePdf({
        invoiceNo,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientAddress: form.clientAddress,
        contactNumber: form.contactNumber,
        invoiceDate: form.invoiceDate,
        items,
        profilePicture: user?.profilePicture,
        profileInitials: user ? getInitials(user) : undefined,
        businessName: user?.businessDetails?.businessName,
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF", error);
      setMessage({ text: "Failed to download PDF. Please try again.", type: "error" });
    }
  };

  const resetInvoice = () => {
    localStorage.removeItem("invoice");
    invoiceContext!.setInvoiceData({
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
  };

  const handleGuestConfirm = async () => {
    setLoading(true);
    try {
      await API.post("/invoices/guest-send", {
        invoiceNo,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientAddress: form.clientAddress,
        contactNumber: form.contactNumber,
        invoiceDate: form.invoiceDate,
        items,
      });

      const nextCount = getGuestSendCount() + 1;
      localStorage.setItem(GUEST_SEND_COUNT_KEY, String(nextCount));
      setGuestSendCount(nextCount);

      const remaining = GUEST_SEND_LIMIT - nextCount;
      setMessage({
        text:
          remaining > 0
            ? `Invoice sent to ${form.clientEmail}! You have ${remaining} free invoice${remaining === 1 ? "" : "s"} left before you'll need to sign up.`
            : `Invoice sent to ${form.clientEmail}! Sign up to save this client and send more invoices.`,
        type: "success",
      });
      resetInvoice();
    } catch (error: any) {
      console.error("Full error:", error.response?.data);
      setMessage({ text: "Error sending invoice. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!token) {
      await handleGuestConfirm();
      return;
    }

    setLoading(true);
    try {
      const res = await API.post(
        "/invoices",
        {
          invoiceNo,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientAddress: form.clientAddress,
          contactNumber: form.contactNumber,
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

      resetInvoice();

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
      <div className="bg-white text-gray-900 rounded-xl overflow-hidden shadow-lg">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-4">
            <div className="flex items-center gap-4">
              {user && (
                <div className="w-14 h-14 rounded-full ring-2 ring-white flex-shrink-0 overflow-hidden flex items-center justify-center bg-white/15">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">{getInitials(user)}</span>
                  )}
                </div>
              )}
              {user?.businessDetails?.businessName && (
                <p className="text-lg font-semibold">{user.businessDetails.businessName}</p>
              )}
            </div>
            <div className="text-center">
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
        {guestLimitReached ? (
          <Link
            to="/signup"
            className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Sign up to send more invoices
          </Link>
        ) : (
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
        )}
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