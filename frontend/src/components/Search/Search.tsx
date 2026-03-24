import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface SearchResults {
  invoices: any[];
  clients: any[];
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    invoices: [],
    clients: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ invoices: [], clients: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/search?q=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, token]);

  const hasResults = results.invoices.length > 0 || results.clients.length > 0;

  const handleInvoiceClick = (id: string) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/dashboard/invoice-list`);
  };

  const handleClientClick = () => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/dashboard/clients`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg focus-within:border-[var(--primary)] transition-colors">
        <SearchIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoices, clients..."
          className="w-full bg-transparent outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setShowDropdown(false);
            }}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 w-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">
          {loading && (
            <p className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
              Searching...
            </p>
          )}

          {!loading && !hasResults && (
            <p className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
              No results found for "{query}"
            </p>
          )}

          {results.invoices.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase bg-[var(--secondary)]">
                Invoices
              </p>
              {results.invoices.map((inv) => (
                <div
                  key={inv._id}
                  onClick={() => handleInvoiceClick(inv._id)}
                  className="px-4 py-3 hover:bg-[var(--secondary)] cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {inv.invoiceNo}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {inv.clientName} · {inv.clientEmail}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      inv.status === "paid"
                        ? "bg-[var(--status-paid)]/20 text-[var(--status-paid)]"
                        : inv.status === "overdue"
                          ? "bg-[var(--status-overdue)]/20 text-[var(--status-overdue)]"
                          : "bg-[var(--status-pending)]/20 text-[var(--status-pending)]"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {results.clients.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase bg-[var(--secondary)]">
                Clients
              </p>
              {results.clients.map((client) => (
                <div
                  key={client._id}
                  onClick={handleClientClick}
                  className="px-4 py-3 hover:bg-[var(--secondary)] cursor-pointer"
                >
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {client.clientName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {client.clientEmail} · {client.contactNumber}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SearchIcon = ({ className }: { className?: string }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
