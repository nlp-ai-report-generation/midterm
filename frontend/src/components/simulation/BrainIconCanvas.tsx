import type { BrainIconFrame } from "@/types/simulation";

interface BrainIconCanvasProps {
  frame?: BrainIconFrame;
  compact?: boolean;
}

function zoneColor(value: number): string {
  if (value >= 0.9) return "#ff6b00";
  if (value >= 0.72) return "#ff8a3d";
  if (value >= 0.5) return "#ffb16f";
  if (value >= 0.3) return "#ffd7ac";
  return "#fff3df";
}

function zoneOpacity(value: number): number {
  return Math.min(1, Math.max(0.4, value));
}

export default function BrainIconCanvas({ frame, compact = false }: BrainIconCanvasProps) {
  const leftZones = frame?.zones.left ?? [0.26, 0.38, 0.28, 0.24];
  const rightZones = frame?.zones.right ?? [0.3, 0.42, 0.28, 0.26];

  return (
    <div className={`brain-graphic ${compact ? "brain-graphic-compact" : ""}`}>
      <div className="brain-graphic-stage">
        <div className="brain-graphic-ridge" />

        <div className="brain-graphic-hemisphere brain-graphic-hemisphere-left">
          {leftZones.map((value, index) => (
            <span
              key={`left-${index}`}
              className={`brain-graphic-zone brain-graphic-zone-${index + 1}`}
              style={{
                background: zoneColor(value),
                opacity: zoneOpacity(value),
              }}
            />
          ))}
        </div>

        <div className="brain-graphic-hemisphere brain-graphic-hemisphere-right">
          {rightZones.map((value, index) => (
            <span
              key={`right-${index}`}
              className={`brain-graphic-zone brain-graphic-zone-${index + 1}`}
              style={{
                background: zoneColor(value),
                opacity: zoneOpacity(value),
              }}
            />
          ))}
        </div>

        <div className="brain-graphic-shadow" />
      </div>

      {!compact && frame ? (
        <div className="brain-graphic-meta">
          <div>
            <p className="text-label">현재 대표 구간</p>
            <p className="text-section" style={{ marginTop: 6 }}>{frame.title}</p>
          </div>
          <div className="simulation-pill-row">
            {frame.labels.slice(0, 3).map((label) => (
              <span key={label} className="simulation-pill">{label}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
