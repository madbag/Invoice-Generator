import { useState, useRef } from "react";
import InvoicePreview from "./InvoicePreview";
import { useNavigate } from "react-router-dom";

type Item = {
  description: string;
  quantity: number;
  cost: number;
};

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
  const navigate = useNavigate();
  const invoiceCounter = useRef(1);

  // const [invoiceNo] = useState(`INV-${Date.now()}`);
  const [invoiceNo, setInvoiceNo] = useState(
    formatInvoiceNo(invoiceCounter.current),
  );

  const [errors, setErrors] = useState<FieldErrors>({});

  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    contactNumber: "",
    invoiceDate: "",
  });

  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, cost: 0 },
  ]);

  function formatInvoiceNo(counter: number) {
    return `INV-${counter.toString().padStart(3, "0")}`;
  }

  // Handle Client Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Item Change
  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [name]: name === "quantity" || name === "cost" ? Number(value) : value,
    };

    setItems(updatedItems);
  };
  // Add New Item
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, cost: 0 }]);
  };

  // Calculate Total
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.cost;
    }, 0);
  };


  // Enhanced validation
  const validateForm = () => {
    const newErrors: FieldErrors = { items: {} };

    // Client fields
    if (!form.clientName.trim())
      newErrors.clientName = "Client Name is required";
    if (!form.clientAddress.trim())
      newErrors.clientAddress = "Client Address is required";
    if (!form.clientEmail.trim() || !form.clientEmail.includes("@"))
      newErrors.clientEmail = "Enter a valid email with @";
    if (!form.contactNumber.trim() || isNaN(Number(form.contactNumber)))
      newErrors.contactNumber = "Contact Number must be a number";
    if (!form.invoiceDate) newErrors.invoiceDate = "Invoice Date is required";

    // Items
    items.forEach((item, index) => {
      newErrors.items![index] = {};
      if (!item.description.trim())
        newErrors.items![index].description = "Description required";
      if (item.quantity <= 0)
        newErrors.items![index].quantity = "Quantity must be greater than 0";
      if (item.cost <= 0)
        newErrors.items![index].cost = "Cost must be greater than 0";

      // Remove empty object if no errors for this item
      if (
        !newErrors.items![index].description &&
        !newErrors.items![index].quantity &&
        !newErrors.items![index].cost
      ) {
        delete newErrors.items![index];
      }
    });

    setErrors(newErrors);

    // Return true if no errors
    return (
      Object.keys(newErrors).length === 1 &&
      Object.keys(newErrors.items!).length === 0
    );
  };

  const handleSave = () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    // clear errors
    setErrors({});

    // Open preview modal
    setShowPreview(true);

    invoiceCounter.current += 1;
    setInvoiceNo(formatInvoiceNo(invoiceCounter.current));
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return; // prevent removing last row

    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleCancel = () => {
  // Reset form
  setForm({
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    contactNumber: "",
    invoiceDate: "",
  });

  // Reset items
  setItems([{ description: "", quantity: 1, cost: 0 }]);

  // Clear errors
  setErrors({});

  // Hide preview if open
  setShowPreview(false);

  // Navigate back to dashboard
  navigate("/dashboard"); // replace "/dashboard" with your actual dashboard route
};
  return (
    <div className="invoice-container w-full flex flex-col items-center justify-center  bg-gray-100">
      <div className="invoice-form flex flex-col gap-4 bg-white p-6 rounded shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <div className="grid grid-cols-4 gap-3">
          <label className="font-medium text-sm self-center">
            Client Name:
          </label>
          <input
            name="clientName"
            placeholder="Client Name"
            onChange={handleChange}
            className={`border p-2 rounded ${errors.clientName ? "border-red-500" : ""}`}
          />

          <label className="font-medium text-sm self-center">
            Client Address:
          </label>
          <input
            name="clientAddress"
            placeholder="Client Address"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <label className="font-medium text-sm self-center">
            Client Email:
          </label>
          <input
            name="clientEmail"
            placeholder="Client Email"
            onChange={handleChange}
            className={`border p-2 rounded ${errors.clientEmail ? "border-red-500" : ""}`}
          />

          <label className="font-medium text-sm self-center">
            Contact Number:
          </label>
          <input
            type="tel"
            name="contactNumber"
            placeholder="Contact Number"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <label className="font-medium text-sm self-center">
            Invoice Date:
          </label>
          <input
            type="date"
            name="invoiceDate"
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
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    name="description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e)}
                    className={`border p-2 rounded ${
                      errors.items?.[index]?.description ? "border-red-500" : ""
                    }`}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    name="cost"
                    value={item.cost}
                    onChange={(e) => handleItemChange(index, e)}
                  />
                </td>

                <td>{item.quantity * item.cost}</td>
                <td>
                  <button
                    onClick={() => removeItem(index)}
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
        <div className="flex justify-start mt-2 mb-2">
        <button onClick={addItem} className="border border-blue-500 text-blue-500 hover:bg-blue-100 rounded px-3 py-1 mt-2 flex">
          + Add Item
        </button>
        </div>

        {/* Grand Total */}
        <h2 className="text-xl font-semibold">
          Grand Total: € {calculateTotal()}
        </h2>

        {/* Action Buttons */}
        <div className="actions gap-3 flex flex-row justify-start">
          <button
            onClick={handleSave}
            
            className="primary-btn rounded-2xl border px-3"
          >
            Save to Preview
          </button>
          <button onClick={handleCancel} className="secondary-btn rounded-2xl border px-3">
            Cancel
          </button>
        </div>
      </div>

      {/* <-- Put the modal here, outside the form but still inside container --> */}
      {showPreview && (
        <InvoicePreview
          invoiceNo={invoiceNo}
          form={{ ...form, contactNumber: Number(form.contactNumber) }}
          items={items}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
