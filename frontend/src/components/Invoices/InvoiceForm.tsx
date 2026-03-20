import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceContext } from "../../context/InvoiceContext";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useClients } from "../../context/ClientContext";

type FieldErrors = {
  clientName?: string;
  clientAddress?: string;
  clientEmail?: string;
  contactNumber?: string;
  invoiceDate?: string;
  items?: {
    [index: number]: { description?: string; quantity?: string; cost?: string };
  };
};

export default function CreateInvoice() {
  
  const invoiceContext = useContext(InvoiceContext)!;
  const { form, items, invoiceNo, setInvoiceData } = invoiceContext;
  const { token } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<FieldErrors>({});
  // Load saved invoice from localStorage on mount
  const { clients } = useClients();
  
  const handleSelectClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = clients.find((c) => c._id === e.target.value);
    if (selected) {
      setInvoiceData({
        form: {
          clientName: selected.clientName,
          clientEmail: selected.clientEmail,
          clientAddress: selected.clientAddress,
          contactNumber: selected.contactNumber,
          invoiceDate: form.invoiceDate,
        },
      });
    }
  };

  useEffect(() => {
    if (!token) return;

    const generateInvoiceNo = async () => {
      
      try {
        const res = await axios.get("http://localhost:5000/api/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("INVOICES FROM DB:", res.data)

        const invoices = res.data;
        const numbers = invoices
          .map((inv: any) => parseInt(inv.invoiceNo?.split("-")[1]))
          .filter((n: number) => !isNaN(n) && isFinite(n));

        if (numbers.length === 0) {
          setInvoiceData({ invoiceNo: "INV-001" });
          return;
        }
        const highest = Math.max(...numbers);
        setInvoiceData({
          invoiceNo: `INV-${String(highest + 1).padStart(3, "0")}`,
        });
      } catch (err) {
        console.error("Failed to generate invoice number", err);
      }
    };

    const saved = localStorage.getItem("invoice");
    if (saved) {
      const parsed = JSON.parse(saved);
      setInvoiceData(parsed);
      if (!parsed.invoiceNo) generateInvoiceNo();
    } else {
      generateInvoiceNo();
    }
  }, [token]);

  // Persist invoice to localStorage whenever it changes
  useEffect(() => {
    if (!invoiceNo) return;
    localStorage.setItem(
      "invoice",
      JSON.stringify({ invoiceNo, form, items, total: calculateTotal() }),
    );
  }, [form, items, invoiceNo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoiceData({ form: { ...form, [e.target.name]: e.target.value } });
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [e.target.name]:
        e.target.name === "quantity" || e.target.name === "cost"
          ? Number(e.target.value)
          : e.target.value,
    };
    setInvoiceData({ items: updatedItems });
  };

  const addItem = () =>
    setInvoiceData({
      items: [...items, { description: "", quantity: 1, cost: 0 }],
    });
  const removeItem = (index: number) =>
    setInvoiceData({ items: items.filter((_, i) => i !== index) });

  const calculateTotal = () =>
    items.reduce((sum, i) => sum + i.quantity * i.cost, 0);

  const validateForm = () => {
    const newErrors: FieldErrors = { items: {} };
    if (!form.clientName.trim())
      newErrors.clientName = "Client Name is required";
    if (!form.clientAddress.trim())
      newErrors.clientAddress = "Client Address is required";
    if (!form.clientEmail.trim() || !form.clientEmail.includes("@"))
      newErrors.clientEmail = "Valid email required";
    if (!form.contactNumber.trim() || isNaN(Number(form.contactNumber)))
      newErrors.contactNumber = "Contact number invalid";
    if (!form.invoiceDate) newErrors.invoiceDate = "Invoice date required";

    items.forEach((item, index) => {
      newErrors.items![index] = {};
      if (!item.description.trim())
        newErrors.items![index].description = "Required";
      if (item.quantity <= 0) newErrors.items![index].quantity = "Required";
      if (item.cost <= 0) newErrors.items![index].cost = "Required";
      if (Object.keys(newErrors.items![index]).length === 0)
        delete newErrors.items![index];
    });

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 1 &&
      Object.keys(newErrors.items!).length === 0
    );
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setInvoiceData({ total: calculateTotal(), invoiceNo });
    navigate("/dashboard/invoice-preview");
  };

  const handleCancel = () => {
    // Clear context and localStorage
    setInvoiceData({
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
    localStorage.removeItem("invoice");
    navigate("/dashboard");
  };

  return (
    <div className="invoice-container w-full flex flex-col items-center justify-center">
      <div className="invoice-form flex flex-col gap-4 bg-white p-6 rounded shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <select
          onChange={handleSelectClient}
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">
            -- Select existing client or fill manually --
          </option>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>
              {c.clientName} ({c.clientEmail})
            </option>
          ))}
        </select>

        <div className="grid grid-cols-4 gap-3">
          <label className="font-medium text-sm self-center">
            Client Name:
          </label>
          <input
            name="clientName"
            value={form.clientName}
            placeholder="Client Name"
            onChange={handleChange}
            className={`border p-2 rounded ${errors.clientName ? "border-red-500" : ""}`}
          />
          <label className="font-medium text-sm self-center">
            Client Address:
          </label>
          <input
            name="clientAddress"
            value={form.clientAddress}
            placeholder="Client Address"
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <label className="font-medium text-sm self-center">
            Client Email:
          </label>
          <input
            name="clientEmail"
            value={form.clientEmail}
            placeholder="Client Email"
            onChange={handleChange}
            className={`border p-2 rounded ${errors.clientEmail ? "border-red-500" : ""}`}
          />
          <label className="font-medium text-sm self-center">
            Contact Number:
          </label>
          <input
            name="contactNumber"
            type="tel"
            value={form.contactNumber}
            placeholder="Contact Number"
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <label className="font-medium text-sm self-center">
            Invoice Date:
          </label>
          <input
            name="invoiceDate"
            type="date"
            value={form.invoiceDate}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <label className="font-medium text-sm self-center">Invoice No:</label>
          <input
            value={invoiceNo}
            disabled
            className="border p-2 rounded bg-gray-100"
          />
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Per Pc Cost</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    name="description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, e)}
                    className={`border p-2 rounded my-2 ${errors.items?.[idx]?.description ? "border-red-500" : ""}`}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, e)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="cost"
                    value={item.cost}
                    onChange={(e) => handleItemChange(idx, e)}
                  />
                </td>
                <td>{item.quantity * item.cost}</td>
                <td>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-red-500 hover:text-red-700"
                    disabled={items.length === 1}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addItem}
          className="border border-blue-500 text-blue-500 hover:bg-blue-100 rounded px-3 py-1 mt-2"
        >
          + Add Item
        </button>

        <h2 className="text-xl font-semibold mt-4">
          Grand Total: € {calculateTotal()}
        </h2>

        <div className="actions gap-3 flex flex-row justify-start mt-4">
          <button
            onClick={handleSave}
            className="primary-btn rounded-2xl border px-3"
          >
            Save to Preview
          </button>
          <button
            onClick={handleCancel}
            className="secondary-btn rounded-2xl border px-3"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
