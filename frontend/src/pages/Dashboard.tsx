import Sidebar from "../components/Layout/Sidebar";
import Topbar from "../components/Layout/Topbar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex ">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        <Topbar />

        {/* Dashboard Content */}
        <main className="p-6 flex flex-row items-center justify-center w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
