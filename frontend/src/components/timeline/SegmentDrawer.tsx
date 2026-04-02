import type { SimulationSegment } from "@/types/simulation";
import type { SegmentHealth, BrainProfile8 } from "@/lib/simulation";

const PHASE_LABELS: Record<string, string> = {
  intro: "도입",
  concept: "개념설명",
  practice: "실습",
  review: "복습",
  wrap: "마무리",
};

interface SegmentDrawerProps {
  segment: SimulationSegment;
  phase?: string;
  transcript?: { lines: Array<{ text: string }> };
  evidences: Array<{ itemName: string; score: number; text: string }>;
  brainProfile: BrainProfile8;
  health: SegmentHealth;
  prescription: { text: string; urgency: string };
  onClose: () => void;
}

export default function SegmentDrawer({
  segment,
  phase,
  transcript,
  evidences,
  brainProfile,
  health,
  prescription,
  onClose,
}: SegmentDrawerProps) {
  const firstLine = transcript?.lines[0]?.text ?? segment.interpretation;
  const phaseLabel = phase ? PHASE_LABELS[phase] ?? phase : "";

  return (
    <div className="seg-drawer seg-drawer-open">
      {/* Header */}
      <div className="seg-drawer-header">
        <div>
          <p className="text-label" style={{ marginBottom: 4 }}>
            {segment.start_time}~{segment.end_time}{phaseLabel ? ` \u00b7 ${phaseLabel}` : ""}
          </p>
          <span
            className="seg-drawer-health"
            style={{ color: health.color }}
          >
            {health.label} ({health.score})
          </span>
        </div>
        <button className="seg-drawer-close" onClick={onClose} aria-label="닫기">
          &times;
        </button>
      </div>

      {/* 1. 구간 텍스트 */}
      <div className="seg-drawer-section">
        <p className="text-label">구간 텍스트</p>
        <p className="text-body" style={{ marginTop: 6, lineHeight: 1.7 }}>
          &ldquo;{firstLine}&rdquo;
        </p>
      </div>

      {/* 2. 관련 평가 */}
      {evidences.length > 0 && (
        <div className="seg-drawer-section">
          <p className="text-label">관련 평가 ({evidences.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {evidences.map((ev, i) => (
              <div key={i} className="seg-drawer-evidence">
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <span className="font-semibold" style={{ fontSize: 13 }}>{ev.itemName}</span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: ev.score >= 4 ? "var(--color-flow)" : ev.score >= 3 ? "var(--color-caution)" : "var(--color-risk)",
                    }}
                  >
                    {ev.score.toFixed(1)}
                  </span>
                </div>
                <p className="text-body italic" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  &ldquo;{ev.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 처방 */}
      <div className="seg-drawer-section">
        <p className="text-label">처방</p>
        <div
          className={`seg-drawer-prescription seg-drawer-prescription-${prescription.urgency}`}
          style={{ marginTop: 6 }}
        >
          <p className="text-body" style={{ lineHeight: 1.7 }}>{prescription.text}</p>
        </div>
      </div>

      {/* 4. 뇌 상태 (마지막) */}
      <div className="seg-drawer-section">
        <p className="text-label">뇌 상태</p>
        <p className="text-caption" style={{ marginTop: 4, marginBottom: 8 }}>
          {brainProfile.interpretation}
        </p>
        <div className="seg-drawer-brain-bars">
          {brainProfile.categories
            .filter((c) => c.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((cat) => (
              <div key={cat.key} className="seg-drawer-brain-row">
                <span className="seg-drawer-brain-label">{cat.label}</span>
                <div className="seg-drawer-brain-track">
                  <div
                    className="seg-drawer-brain-fill"
                    style={{
                      width: `${cat.value}%`,
                      background: cat.isTop ? "var(--primary)" : "var(--grey-300)",
                    }}
                  />
                </div>
                <span className="seg-drawer-brain-value">{cat.value}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
