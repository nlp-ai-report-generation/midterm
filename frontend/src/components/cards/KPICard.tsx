interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  accentColor?: string;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "var(--primary)",
}: KPICardProps) {
  const isTrendPositive = trend && trend.value >= 0;

  return (
    <div className="surface-card-strong cursor-default rounded-[26px] p-6 hover:-translate-y-0.5">
      <div className="mb-5 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-[18px]"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)`,
          }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        {trend && (
          <span
            className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
            style={{
              backgroundColor: isTrendPositive
                ? "color-mix(in srgb, var(--success) 10%, white)"
                : "color-mix(in srgb, var(--error) 10%, white)",
              color: isTrendPositive ? "var(--success)" : "var(--error)",
            }}
          >
            {isTrendPositive ? "+" : ""}
            {trend.value}
            {trend.label}
          </span>
        )}
      </div>
      <p className="mb-1 text-[13px] font-semibold text-text-tertiary">{title}</p>
      <p className="text-[30px] font-bold tracking-tight text-foreground">{value}</p>
      {subtitle && (
        <p className="mt-2 text-[13px] text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
