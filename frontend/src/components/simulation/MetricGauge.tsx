import { metricLevel, metricTone, type MetricType } from "@/lib/simulation";

interface MetricGaugeProps {
  label: string;
  value: number;
  metric: MetricType;
  compact?: boolean;
}

export default function MetricGauge({ label, value, metric, compact }: MetricGaugeProps) {
  const level = metricLevel(value, metric);
  const color = metricTone(value, metric);
  const barPercent = Math.max(2, Math.min(100, value));

  if (compact) {
    return (
      <div className="metric-gauge">
        <div className="metric-gauge-header">
          <span className="text-label">{label}</span>
          <span
            className="metric-gauge-level"
            style={{ color: level.color, background: level.bgColor }}
          >
            {level.label}
          </span>
        </div>
        <div className="metric-gauge-label-row">
          <span className="metric-gauge-value" style={{ color }}>
            {value.toFixed(1)}
          </span>
        </div>
        <div className="metric-gauge-bar">
          <div
            className="metric-gauge-fill"
            style={{ width: `${barPercent}%`, background: color }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="metric-gauge">
      <div className="metric-gauge-header">
        <span className="text-label">{label}</span>
        <span
          className="metric-gauge-level"
          style={{ color: level.color, background: level.bgColor }}
        >
          {level.label}
        </span>
      </div>
      <div className="metric-gauge-label-row">
        <span className="metric-gauge-value" style={{ color }}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="metric-gauge-bar">
        <div
          className="metric-gauge-fill"
          style={{ width: `${barPercent}%`, background: color }}
        />
      </div>
      <p className="metric-gauge-description">{level.description}</p>
    </div>
  );
}
