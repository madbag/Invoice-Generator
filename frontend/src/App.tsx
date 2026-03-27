import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.tsx";
import SignInPage from "./pages/Login.tsx";
import SignUpPage from "./pages/Signup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CreateInvoice from "./components/Invoices/InvoiceForm.tsx";
import DashboardHome from "./components/Dashboard/DashboardHome.tsx";
import Profile from "./components/Profile/Profile.tsx";
import InvoicePreview from "./components/Invoices/InvoicePreview.tsx";
import InvoiceList from "./components/Invoices/InvoiceList.tsx";
import ClientList from "./components/Clients/ClientList.tsx";
import { ForgotPassword } from "./components/Auth/ForgotPassword.tsx";
import ResetPassword from "./components/Auth/ResetPassword.tsx";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard Layout */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/signin" replace />}
        >
          <Route index element={<DashboardHome />} />

          <Route path="create-invoice" element={<CreateInvoice />} />
          <Route path="invoice-preview" element={<InvoicePreview />} />
          <Route path="invoice-list" element={<InvoiceList />} />
          <Route path="profile" element={<Profile />} />
          <Route path="clients" element={<ClientList />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
