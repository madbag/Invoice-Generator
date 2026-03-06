import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import { InvoiceContext } from "../../context/InvoiceContext.tsx";

export default function GreetingCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const invoiceContext = useContext(InvoiceContext)!;

  const handleNewInvoice = () => {
    localStorage.removeItem("invoice");
    invoiceContext.setInvoiceData({
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
    navigate("/dashboard/create-invoice");
  };

  // Display user's full name if available, else email, else "User"
  const displayName =
    user?.firstName && user?.lastName ? `${user.firstName}` : user?.email;

  return (
    <div className="flex flex-row items-center gap-10 p-8">
      <h1 className=" text-2xl font-bold mb-4">Hello, {displayName}</h1>
      <button
        onClick={handleNewInvoice}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        + New Invoice
      </button>
    </div>
  );
}
