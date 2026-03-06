import { useClients } from "../../context/ClientContext";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function ClientList() {
  const { clients, fetchClients } = useClients();
  const { token } = useAuth();

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchClients();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <table className="w-full border-collapse shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Contact</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">Invoices</th>
            <th className="border px-4 py-2">Total Billed</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{client.clientName}</td>
              <td className="border px-4 py-2">{client.clientEmail}</td>
              <td className="border px-4 py-2">{client.contactNumber}</td>
              <td className="border px-4 py-2">{client.clientAddress}</td>
              <td className="border px-4 py-2">{client.invoiceCount}</td>
              <td className="border px-4 py-2">€ {client.totalBilled}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleDelete(client._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}