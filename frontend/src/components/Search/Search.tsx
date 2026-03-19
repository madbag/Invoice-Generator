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
  const [results, setResults] = useState<SearchResults>({ invoices: [], clients: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ invoices: [], clients: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/search?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

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
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoices, clients..."
          className="w-full outline-none text-sm"
        />
        {query && (
          <button onClick={() => { setQuery(""); setShowDropdown(false); }} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {loading && <p className="px-4 py-3 text-sm text-gray-500">Searching...</p>}

          {!loading && !hasResults && (
            <p className="px-4 py-3 text-sm text-gray-500">No results found for "{query}"</p>
          )}

          {results.invoices.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">Invoices</p>
              {results.invoices.map((inv) => (
                <div
                  key={inv._id}
                  onClick={() => handleInvoiceClick(inv._id)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">{inv.invoiceNo}</p>
                    <p className="text-xs text-gray-500">{inv.clientName} · {inv.clientEmail}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${inv.status === "paid" ? "bg-green-100 text-green-700" : inv.status === "overdue" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {results.clients.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">Clients</p>
              {results.clients.map((client) => (
                <div
                  key={client._id}
                  onClick={handleClientClick}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer"
                >
                  <p className="text-sm font-medium">{client.clientName}</p>
                  <p className="text-xs text-gray-500">{client.clientEmail} · {client.contactNumber}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}