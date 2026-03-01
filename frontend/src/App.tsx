import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.tsx";
import SignInPage from "./pages/Login.tsx";
import SignUpPage from "./pages/Signup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CreateInvoice from "./components/Invoices/InvoiceForm.tsx";
import DashboardHome from "./components/Dashboard/DashboardHome.tsx";
import Profile from "./components/Profile/Profile.tsx";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/signup"
          element={!user ? <SignUpPage /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/signin"
          element={
            !user ? <SignInPage /> : <Navigate to="/dashboard" replace />
          }
        />

        {/* Dashboard Layout */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/signin" replace />}
        >
          <Route index element={<DashboardHome />} />
          {/* <Route path="clients" element={<Clients />} />
          <Route path="invoices" element={<Invoices />} /> */}
          <Route path="create-invoice" element={<CreateInvoice />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/signin" />} />
      </Routes>
    </>
  );
}

export default App;
