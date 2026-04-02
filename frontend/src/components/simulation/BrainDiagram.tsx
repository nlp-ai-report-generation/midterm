/** 간단한 2D 뇌 다이어그램 — 영역별 하이라이트 */
interface BrainDiagramProps {
  highlighted?: string | null; // "auditory" | "language" | "executive" | "attention" | "visual" | "memory" | "conflict" | "dmn"
}

const REGIONS: Record<string, { cx: number; cy: number; rx: number; ry: number; label: string }> = {
  executive:  { cx: 85,  cy: 55,  rx: 35, ry: 25, label: "전두엽" },
  attention:  { cx: 150, cy: 50,  rx: 30, ry: 22, label: "두정엽" },
  auditory:   { cx: 55,  cy: 110, rx: 28, ry: 20, label: "측두엽" },
  language:   { cx: 95,  cy: 120, rx: 25, ry: 18, label: "Wernicke" },
  visual:     { cx: 195, cy: 100, rx: 30, ry: 25, label: "후두엽" },
  memory:     { cx: 130, cy: 130, rx: 22, ry: 16, label: "해마" },
  conflict:   { cx: 120, cy: 70,  rx: 20, ry: 15, label: "전대상회" },
  dmn:        { cx: 165, cy: 75,  rx: 25, ry: 20, label: "DMN" },
};

const COLORS: Record<string, string> = {
  executive: "#4A90D9",
  attention: "#7B61FF",
  auditory: "#FF6B00",
  language: "#FF9F4A",
  visual: "#34C759",
  memory: "#FF3B30",
  conflict: "#FF9500",
  dmn: "#86868b",
};

export default function BrainDiagram({ highlighted }: BrainDiagramProps) {
  return (
    <svg viewBox="0 0 240 170" width="100%" height="100%" style={{ maxHeight: 200 }}>
      {/* 뇌 윤곽 */}
      <ellipse cx={120} cy={90} rx={110} ry={80} fill="#f5f5f7" stroke="#e8e8ed" strokeWidth={1.5} />

      {/* 영역들 */}
      {Object.entries(REGIONS).map(([key, r]) => {
        const isOn = highlighted === key;
        return (
          <g key={key}>
            <ellipse
              cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry}
              fill={isOn ? COLORS[key] : "#e8e8ed"}
              opacity={isOn ? 0.7 : 0.4}
              stroke={isOn ? COLORS[key] : "transparent"}
              strokeWidth={isOn ? 2 : 0}
            />
            <text
              x={r.cx} y={r.cy + 4}
              textAnchor="middle"
              fontSize={isOn ? 10 : 8}
              fontWeight={isOn ? 600 : 400}
              fill={isOn ? "#fff" : "#86868b"}
            >
              {r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
