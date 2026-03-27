import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";

interface Invoice {
  _id: string;
  invoiceNo: string;
  clientName: string;
  clientEmail: string;
  invoiceDate: string;
  total: number;
  status: string;
}

export default function InvoiceList({ limit }: { limit?: number }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    setUpdatingStatus(invoiceId);
    try {
      const res = await API.put(
        `/invoices/${invoiceId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice._id === invoiceId
            ? { ...invoice, status: res.data.status }
            : invoice,
        ),
      );
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      alert("Failed to update invoice status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?",
    );

    if (confirmDelete) {
      try {
        await API.delete(`/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice._id !== invoiceId),
        );
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete the invoice. Please try again");
      }
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await API.get("/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = limit ? res.data.slice(0, limit) : res.data;
        setInvoices(data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token, limit]);

  const handleView = (invoiceId: string) => {
    navigate(`/dashboard/invoice-preview/${invoiceId}`);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-[var(--status-paid)]/10 text-[var(--status-paid)]";
      case "overdue":
        return "bg-[var(--status-overdue)]/10 text-[var(--status-overdue)]";
      default:
        return "bg-[var(--status-pending)]/10 text-[var(--status-pending)]";
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--secondary)] flex items-center justify-center">
          <InvoiceIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          No Invoices Yet
        </h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          Create your first invoice to get started
        </p>
        <button
          onClick={() => navigate("/dashboard/create-invoice")}
          className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Create Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      {!limit && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Invoices
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm mt-1">
              Manage and track all your invoices
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-invoice")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <PlusIcon />
            New Invoice
          </button>
        </div>
      )}

      {/* Filters */}
      {!limit && (
        <div className="flex flex-wrap gap-2 mb-4">
          {["all", "pending", "paid", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* Desktop Table */}
       <div className="hidden md:block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Invoice
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Client
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Date
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Amount
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Status
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice._id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div
                    className="relative"
                    ref={openDropdownId === invoice._id ? dropdownRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === invoice._id ? null : invoice._id,
                        )
                      }
                      disabled={updatingStatus === invoice._id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize cursor-pointer hover:opacity-80 transition-opacity ${getStatusStyles(
                        invoice.status,
                      )} ${updatingStatus === invoice._id ? "opacity-50" : ""}`}
                    >
                      {updatingStatus === invoice._id ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {invoice.status}
                          <ChevronDownIcon />
                        </>
                      )}
                    </button>
                    {openDropdownId === invoice._id && (
                       <div className="absolute z-50 top-full left-0 mt-1 bg-[var(--popover)] border border-[var(--border)] rounded-lg shadow-xl min-w-[120px] py-1">
                        {["pending", "paid", "overdue"].map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              handleStatusChange(invoice._id, status)
                            }
                            className={`w-full px-3 py-2 text-left text-sm capitalize hover:bg-[var(--secondary)] transition-colors ${
                              invoice.status === status
                                ? "text-[var(--primary)] font-medium"
                                : "text-[var(--foreground)]"
                            }`}
                          >
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                status === "paid"
                                  ? "bg-[var(--status-paid)]"
                                  : status === "overdue"
                                    ? "bg-[var(--status-overdue)]"
                                    : "bg-[var(--status-pending)]"
                              }`}
                            />
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-[var(--foreground)]">
                      {invoice.clientName}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {invoice.clientEmail}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-[var(--foreground)]">
                    {invoice.total?.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles(
                      invoice.status,
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleView(invoice._id)}
                      className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--primary)] transition-colors"
                      title="View"
                    >
                      <ViewIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice._id)}
                      className="p-2 rounded-lg hover:bg-[var(--destructive)]/10 text-[var(--destructive)] transition-colors"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredInvoices.map((invoice) => (
          <div
            key={invoice._id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {invoice.invoiceNo}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {invoice.clientName}
                </p>
              </div>
              <div
                className="relative"
                ref={
                  openDropdownId === `mobile-${invoice._id}`
                    ? dropdownRef
                    : null
                }
              >
                <button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === `mobile-${invoice._id}`
                        ? null
                        : `mobile-${invoice._id}`,
                    )
                  }
                  disabled={updatingStatus === invoice._id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize cursor-pointer hover:opacity-80 transition-opacity ${getStatusStyles(
                    invoice.status,
                  )} ${updatingStatus === invoice._id ? "opacity-50" : ""}`}
                >
                  {updatingStatus === invoice._id ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {invoice.status}
                      <ChevronDownIcon />
                    </>
                  )}
                </button>
                {openDropdownId === `mobile-${invoice._id}` && (
                  <div className="absolute z-10 top-full right-0 mt-1 bg-[var(--popover)] border border-[var(--border)] rounded-lg shadow-lg min-w-[120px] py-1">
                    {["pending", "paid", "overdue"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(invoice._id, status)}
                        className={`w-full px-3 py-2 text-left text-sm capitalize hover:bg-[var(--secondary)] transition-colors ${
                          invoice.status === status
                            ? "text-[var(--primary)] font-medium"
                            : "text-[var(--foreground)]"
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            status === "paid"
                              ? "bg-[var(--status-paid)]"
                              : status === "overdue"
                                ? "bg-[var(--status-overdue)]"
                                : "bg-[var(--status-pending)]"
                          }`}
                        />
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {invoice.total?.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleView(invoice._id)}
                  className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]"
                >
                  <ViewIcon />
                </button>
                <button
                  onClick={() => handleDelete(invoice._id)}
                  className="p-2 rounded-lg bg-[var(--destructive)]/10 text-[var(--destructive)]"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const InvoiceIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const ViewIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);
