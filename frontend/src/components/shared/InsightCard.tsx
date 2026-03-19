interface InsightCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
  subtitle?: string;
}

export default function InsightCard({ label, value, accent, subtitle }: InsightCardProps) {
  return (
    <div className="card card-padded">
      <p className="text-label">{label}</p>
      <p
        className="text-number mt-3"
        style={accent ? { color: "var(--primary)" } : undefined}
      >
        {value}
      </p>
      {subtitle && <p className="text-caption mt-2">{subtitle}</p>}
    </div>
  );
}
