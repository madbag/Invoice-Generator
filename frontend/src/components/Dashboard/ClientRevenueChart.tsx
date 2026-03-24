interface ClientRevenue {
  clientName: string;
  totalBilled: number;
  invoiceCount: number;
}

interface ClientRevenueChartProps {
  clients: ClientRevenue[];
}

export default function ClientRevenueChart({ clients }: ClientRevenueChartProps) {
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalBilled, 0);
  const maxRevenue = Math.max(...clients.map((c) => c.totalBilled), 1);

  // Color palette for bars
  const colors = [
    "bg-[var(--primary)]",
    "bg-[var(--accent)]",
    "bg-[var(--status-pending)]",
    "bg-purple-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];

  if (clients.length === 0) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Revenue by Client
        </h3>
        <div className="flex items-center justify-center h-48 text-[var(--muted-foreground)]">
          No client data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Revenue by Client
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {totalRevenue.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">Total Revenue</p>
        </div>
      </div>

      <div className="space-y-4">
        {clients.slice(0, 6).map((client, index) => {
          const percentage = (client.totalBilled / totalRevenue) * 100;
          const barWidth = (client.totalBilled / maxRevenue) * 100;

          return (
            <div key={client.clientName} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                  <span className="text-sm text-[var(--foreground)] truncate max-w-[150px] md:max-w-none">
                    {client.clientName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    {client.invoiceCount} invoice{client.invoiceCount !== 1 ? "s" : ""}
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {client.totalBilled.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {percentage.toFixed(1)}% of total
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
