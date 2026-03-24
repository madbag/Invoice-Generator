import { useClients } from "../../context/ClientContext";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ClientList() {
  const { clients, fetchClients } = useClients();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
    } catch (error) {
      console.error("Error deleting clients:", error);
      alert("Failed to delete client. Please try again");
    }
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Clients</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Manage your client database
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--secondary)] flex items-center justify-center">
            <ClientIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Clients Yet</h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            Clients will appear here when you create invoices
          </p>
          <button
            onClick={() => navigate("/dashboard/create-invoice")}
            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Clients</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} in your database
          </p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Client
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Contact
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Address
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Invoices
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Total Billed
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[var(--muted-foreground)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client._id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-[var(--primary)]">
                        {client.clientName[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{client.clientName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{client.clientEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                  {client.contactNumber || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] max-w-[200px] truncate">
                  {client.clientAddress || "-"}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--secondary)] text-sm font-medium text-[var(--foreground)]">
                    {client.invoiceCount || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-[var(--foreground)]">
                    {(client.totalBilled || 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDelete(client._id)}
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
        {clients.map((client) => (
          <div
            key={client._id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-[var(--primary)]">
                    {client.clientName[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">{client.clientName}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{client.clientEmail}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(client._id)}
                className="p-2 rounded-lg bg-[var(--destructive)]/10 text-[var(--destructive)]"
              >
                <DeleteIcon />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Invoices</p>
                <p className="font-medium text-[var(--foreground)]">{client.invoiceCount || 0}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Total Billed</p>
                <p className="font-medium text-[var(--foreground)]">
                  {(client.totalBilled || 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                </p>
              </div>
              {client.contactNumber && (
                <div className="col-span-2">
                  <p className="text-xs text-[var(--muted-foreground)]">Contact</p>
                  <p className="text-sm text-[var(--foreground)]">{client.contactNumber}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ClientIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);