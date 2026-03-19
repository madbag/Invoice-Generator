import GreetingCard from "./GreetingCard";

// pages/DashboardHome.tsx
const DashboardHome = () => {
  return (
    <div className="dashboard-home ">
      <div className="flex flex-col p-6 bg-white rounded shadow">
        <GreetingCard />
        {/* <div className="mt-6">
          <p>My invoices</p>
          <p>Monthly Summary</p>
        </div> */}
      </div>
    </div>
  );
};

export default DashboardHome;
