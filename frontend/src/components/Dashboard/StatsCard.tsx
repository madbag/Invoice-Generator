interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "amber" | "red";
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-[var(--primary)]/10 text-[var(--primary)]",
    green: "bg-[var(--accent)]/10 text-[var(--accent)]",
    amber: "bg-[var(--status-pending)]/10 text-[var(--status-pending)]",
    red: "bg-[var(--destructive)]/10 text-[var(--destructive)]",
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">{value}</p>
          {subtitle && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-[var(--accent)]" : "text-[var(--destructive)]"
                }`}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
