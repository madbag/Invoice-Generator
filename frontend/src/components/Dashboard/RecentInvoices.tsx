import { useNavigate } from "react-router-dom";

interface Invoice {
  _id: string;
  invoiceNo: string;
  clientName: string;
  clientEmail: string;
  invoiceDate: string;
  total: number;
  status: string;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const navigate = useNavigate();

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

  if (invoices.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Recent Invoices
        </h3>
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <InvoiceIcon className="w-12 h-12 text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">No invoices yet</p>
          <button
            onClick={() => navigate("/dashboard/create-invoice")}
            className="mt-3 text-sm text-[var(--primary)] hover:underline"
          >
            Create your first invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Recent Invoices
        </h3>
        <button
          onClick={() => navigate("/dashboard/invoice-list")}
          className="text-sm text-[var(--primary)] hover:underline"
        >
          View all
        </button>
      </div>

      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice._id}
            onClick={() => navigate(`/dashboard/invoice-preview/${invoice._id}`)}
            className="flex items-center justify-between p-3 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                <InvoiceIcon className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {invoice.invoiceNo}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {invoice.clientName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {invoice.total.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusStyles(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const InvoiceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
