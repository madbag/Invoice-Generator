import GreetingCard from "./GreetingCard";
import InvoiceList from "../Invoices/InvoiceList";
import { useNavigate } from "react-router-dom";

// pages/DashboardHome.tsx
const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-home">
      <div className="flex flex-col p-6 bg-white rounded shadow ">
        <GreetingCard />
        <hr />
        <div>
          {/* <h2 className="text-xl font-bold">Recent Invoices</h2> */}
          {/* <p>Monthly Summary</p> */}
          <InvoiceList limit={3} />

          <div className="mt-4 text-right">
            <button
              onClick={() => navigate("/dashboard/invoice-list")}
              className="text-blue-600 hover:underline font-medium"
            >
              Show More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
