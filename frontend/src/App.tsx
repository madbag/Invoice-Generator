import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.tsx";
import LandingPage from "./pages/Landing.tsx";
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
        <Route path="/" element={<LandingPage />} />

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

        {/* Dashboard Layout — the shell and invoice creation are open to
            everyone; pages backed by saved account data require signup */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />

          <Route path="create-invoice" element={<CreateInvoice />} />
          <Route path="invoice-preview" element={<InvoicePreview />} />
          <Route
            path="invoice-list"
            element={user ? <InvoiceList /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="profile"
            element={user ? <Profile /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="clients"
            element={user ? <ClientList /> : <Navigate to="/signup" replace />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
