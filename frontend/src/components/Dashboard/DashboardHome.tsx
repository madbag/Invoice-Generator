import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useClients } from "../../context/ClientContext";

import StatsCard from "./StatsCard";
import ClientRevenueChart from "./ClientRevenueChart";
import RecentInvoices from "./RecentInvoices";
import { API } from "../../api";

interface Invoice {
  _id: string;
  invoiceNo: string
  clientName: string;
  clientEmail: string;
  invoiceDate: string;
  total: number;
  status: string;
}

interface DashboardStats {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalClients: number;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { clients } = useClients();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    overdueRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalClients: 0,
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await API.get("/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(res.data);

        // Calculate stats
        const data = res.data as Invoice[];
        const totalRevenue = data.reduce((sum, inv) => sum + inv.total, 0);
        const paidInvoices = data.filter((inv) => inv.status === "paid");
        const pendingInvoices = data.filter((inv) => inv.status === "pending");
        const overdueInvoices = data.filter((inv) => inv.status === "overdue");

        setStats({
          totalRevenue,
          paidRevenue: paidInvoices.reduce((sum, inv) => sum + inv.total, 0),
          pendingRevenue: pendingInvoices.reduce(
            (sum, inv) => sum + inv.total,
            0,
          ),
          overdueRevenue: overdueInvoices.reduce(
            (sum, inv) => sum + inv.total,
            0,
          ),
          totalInvoices: data.length,
          paidInvoices: paidInvoices.length,
          pendingInvoices: pendingInvoices.length,
          overdueInvoices: overdueInvoices.length,
          totalClients: clients?.length || 0,
        });
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvoices();
    }
  }, [token, clients]);

  const displayName = user?.firstName || user?.email || "User";

  const handleNewInvoice = () => {
    localStorage.removeItem("invoice");
    navigate("/dashboard/create-invoice");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Welcome back, {displayName}
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Here's what's happening with your invoices today.
          </p>
        </div>
        <button
          onClick={handleNewInvoice}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={stats.totalRevenue.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
          subtitle={`From ${stats.totalInvoices} invoices`}
          icon={<RevenueIcon />}
          color="blue"
        />
        <StatsCard
          title="Paid"
          value={stats.paidRevenue.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
          subtitle={`${stats.paidInvoices} paid invoices`}
          icon={<CheckIcon />}
          color="green"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingRevenue.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
          subtitle={`${stats.pendingInvoices} pending invoices`}
          icon={<ClockIcon />}
          color="amber"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdueRevenue.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
          subtitle={`${stats.overdueInvoices} overdue invoices`}
          icon={<AlertIcon />}
          color="red"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Revenue Chart */}
        <ClientRevenueChart
          clients={
            clients?.map((c) => ({
              clientName: c.clientName,
              totalBilled: c.totalBilled || 0,
              invoiceCount: c.invoiceCount || 0,
            })) || []
          }
        />

        {/* Recent Invoices */}
        <RecentInvoices invoices={invoices.slice(0, 5)} />
      </div>

      {/* Quick Stats */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Quick Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {stats.totalClients}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Total Clients
            </p>
          </div>
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {stats.totalInvoices}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Total Invoices
            </p>
          </div>
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--accent)]">
              {stats.paidInvoices}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Paid</p>
          </div>
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--status-pending)]">
              {stats.pendingInvoices}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Pending
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const RevenueIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AlertIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);
