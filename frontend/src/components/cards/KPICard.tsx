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
    <div className="panel-card cursor-default p-6 hover:-translate-y-0.5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-[18px]"
          style={{
            background:
              `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 15%, white), color-mix(in srgb, ${accentColor} 7%, white))`,
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
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
        {title}
      </p>
      <p className="mt-2 text-[38px] font-bold tracking-[-0.06em] text-foreground">
        {value}
      </p>
      {subtitle && (
        <p className="mt-2 text-[13px] leading-5 text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
