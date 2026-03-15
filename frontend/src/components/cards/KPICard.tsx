"use client";

import { cn } from "@/lib/utils";

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
    <div className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light hover:shadow-[var(--shadow-lg)] hover:border-border hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-lg",
              isTrendPositive
                ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success"
                : "bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-error"
            )}
          >
            {isTrendPositive ? "+" : ""}
            {trend.value}
            {trend.label}
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary mb-1">{title}</p>
      <p className="text-3xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-text-tertiary mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}
