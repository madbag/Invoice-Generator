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

  useEffect(() => {
    if (!invoiceNo) return;
    localStorage.setItem(
      "invoice",
      JSON.stringify({ invoiceNo, form, items, total: calculateTotal() })
    );
  }, [form, items, invoiceNo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoiceData({ form: { ...form, [e.target.name]: e.target.value } });
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Create Invoice
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Fill in the details to create a new invoice
        </p>
      </div>

      <div className="space-y-6">
        {/* Client Selection */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Client Information
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Select Existing Client
            </label>
            <select
              onChange={handleSelectClient}
              className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            >
              <option value="">-- Select client or fill manually --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.clientName} ({c.clientEmail})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Client Name *
              </label>
              <input
                name="clientName"
                value={form.clientName}
                placeholder="Enter client name"
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--secondary)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  errors.clientName ? "border-[var(--destructive)]" : "border-[var(--border)]"
                }`}
              />
              {errors.clientName && (
                <p className="text-xs text-[var(--destructive)] mt-1">{errors.clientName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Client Email *
              </label>
              <input
                name="clientEmail"
                value={form.clientEmail}
                placeholder="Enter client email"
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--secondary)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  errors.clientEmail ? "border-[var(--destructive)]" : "border-[var(--border)]"
                }`}
              />
              {errors.clientEmail && (
                <p className="text-xs text-[var(--destructive)] mt-1">{errors.clientEmail}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Client Address *
              </label>
              <input
                name="clientAddress"
                value={form.clientAddress}
                placeholder="Enter client address"
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--secondary)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  errors.clientAddress ? "border-[var(--destructive)]" : "border-[var(--border)]"
                }`}
              />
              {errors.clientAddress && (
                <p className="text-xs text-[var(--destructive)] mt-1">{errors.clientAddress}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Contact Number *
              </label>
              <input
                name="contactNumber"
                type="tel"
                value={form.contactNumber}
                placeholder="Enter contact number"
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--secondary)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  errors.contactNumber ? "border-[var(--destructive)]" : "border-[var(--border)]"
                }`}
              />
              {errors.contactNumber && (
                <p className="text-xs text-[var(--destructive)] mt-1">{errors.contactNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Invoice Date *
              </label>
              <input
                name="invoiceDate"
                type="date"
                value={form.invoiceDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--secondary)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors ${
                  errors.invoiceDate ? "border-[var(--destructive)]" : "border-[var(--border)]"
                }`}
              />
              {errors.invoiceDate && (
                <p className="text-xs text-[var(--destructive)] mt-1">{errors.invoiceDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Invoice Number
              </label>
              <input
                value={invoiceNo}
                disabled
                className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--muted-foreground)]"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Invoice Items
          </h2>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left pb-3 text-sm font-medium text-[var(--muted-foreground)]">
                    Description
                  </th>
                  <th className="text-left pb-3 text-sm font-medium text-[var(--muted-foreground)] w-24">
                    Qty
                  </th>
                  <th className="text-left pb-3 text-sm font-medium text-[var(--muted-foreground)] w-32">
                    Price
                  </th>
                  <th className="text-right pb-3 text-sm font-medium text-[var(--muted-foreground)] w-32">
                    Total
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 pr-3">
                      <input
                        name="description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, e)}
                        placeholder="Item description"
                        className={`w-full px-3 py-2 bg-[var(--secondary)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm focus:outline-none focus:border-[var(--primary)] ${
                          errors.items?.[idx]?.description
                            ? "border-[var(--destructive)]"
                            : "border-[var(--border)]"
                        }`}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, e)}
                        min="1"
                        className="w-full px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)]"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        name="cost"
                        value={item.cost}
                        onChange={(e) => handleItemChange(idx, e)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)]"
                      />
                    </td>
                    <td className="py-3 text-right text-[var(--foreground)] font-medium">
                      {(item.quantity * item.cost).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                    </td>
                    <td className="py-3 pl-3">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-2 rounded-lg hover:bg-[var(--destructive)]/10 text-[var(--destructive)] transition-colors disabled:opacity-30"
                        disabled={items.length === 1}
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-[var(--secondary)] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-[var(--muted-foreground)]">Item {idx + 1}</span>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1 text-[var(--destructive)] disabled:opacity-30"
                    disabled={items.length === 1}
                  >
                    <DeleteIcon />
                  </button>
                </div>
                <input
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, e)}
                  placeholder="Description"
                  className="w-full px-3 py-2 mb-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Qty</label>
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, e)}
                      className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Price</label>
                    <input
                      type="number"
                      name="cost"
                      value={item.cost}
                      onChange={(e) => handleItemChange(idx, e)}
                      className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Total</label>
                    <p className="px-3 py-2 font-medium text-[var(--foreground)]">
                      {(item.quantity * item.cost).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="mt-4 flex items-center gap-2 px-4 py-2 border border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors"
          >
            <PlusIcon />
            Add Item
          </button>
        </div>

        {/* Total and Actions */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Grand Total</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {calculateTotal().toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 border border-[var(--border)] text-[var(--muted-foreground)] rounded-lg font-medium hover:bg-[var(--secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Preview Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);