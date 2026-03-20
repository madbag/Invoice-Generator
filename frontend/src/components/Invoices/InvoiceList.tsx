import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Invoice {
  _id: string;
  invoiceNo: string;
  clientName: string;
  invoiceDate: string;
  status: string;
}

export default function InvoiceList({ limit }: { limit?: number }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleDelete = async (invoiceId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?",
    );

    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice._id !== invoiceId),
        );

        console.log("Invoice successfully deleted!");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete the invoice. Please try again");
      }
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/invoices", {
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

  if (loading) return <p>Loading invoices...</p>;
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-md m-3 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoices</h1>
        <p className="text-gray-500 italic">
          You do not have any invoices right now.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <table className="w-full border-collapse shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">Invoice No</th>
            <th className="border px-4 py-2">Client Name</th>
            <th className="border px-4 py-2">Invoice Date</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{invoice.invoiceNo}</td>
              <td className="border px-4 py-2">{invoice.clientName}</td>
              <td className="border px-4 py-2">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </td>
              <td className="border px-4 py-2">{invoice.status}</td>
              <td className="border px-4 py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(invoice._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(invoice._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
