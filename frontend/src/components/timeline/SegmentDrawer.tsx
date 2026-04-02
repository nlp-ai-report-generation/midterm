import type { SegmentHealth, BrainProfile8 } from "@/lib/simulation";
import type { Section } from "./TimelineBar";

const TYPE_LABELS: Record<string, string> = {
  intro: "도입",
  concept: "개념설명",
  practice: "실습",
  review: "복습",
  break: "쉬는 시간",
  wrapup: "마무리",
};

interface SectionDrawerProps {
  section: Section;
  evidences: Array<{ itemName: string; score: number; text: string }>;
  brainProfile?: BrainProfile8;
  health?: SegmentHealth;
  prescription?: { text: string; urgency: string };
  onClose: () => void;
}

function formatTime(t: string): string {
  // "09:15:00" → "09:15"
  return t.slice(0, 5);
}

export default function SectionDrawer({
  section,
  evidences,
  brainProfile,
  health,
  prescription,
  onClose,
}: SectionDrawerProps) {
  return (
    <div className="section-drawer" style={{ animation: "seg-drawer-slide 0.2s ease" }}>
      {/* 1. Header */}
      <div className="section-drawer-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="section-drawer-title">
            {formatTime(section.start)}~{formatTime(section.end)} · {section.label}
          </span>
          <span className="section-drawer-type">
            {TYPE_LABELS[section.type] ?? section.type}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            color: "#86868b",
            cursor: "pointer",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      </div>

      {/* 2. Related evaluation evidence */}
      <div style={{ marginBottom: 12 }}>
        {evidences.length > 0 ? (
          <>
            <p style={{ fontSize: 11, fontWeight: 590, color: "#86868b", letterSpacing: "0.02em", textTransform: "uppercase" as const, marginBottom: 8 }}>
              관련 평가 ({evidences.length})
            </p>
            <div className="section-evidence">
              {evidences.map((ev, i) => (
                <div key={i} className="section-evidence-item">
                  <span className="section-evidence-score">{ev.score.toFixed(1)}</span>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{ev.itemName}</span>
                    <p style={{ fontSize: 13, color: "#86868b", lineHeight: 1.47, marginTop: 2 }}>
                      {ev.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ fontSize: 14, color: "#86868b", lineHeight: 1.47 }}>
            이 구간에 대한 평가 증거가 아직 없어요.
          </p>
        )}
      </div>

      {/* 3. Prescription */}
      {prescription && (
        <div className="section-prescription">
          <p>{prescription.text}</p>
        </div>
      )}

      {/* 4. Brain state (last) */}
      {brainProfile && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 590, color: "#86868b", letterSpacing: "0.02em", textTransform: "uppercase" as const, marginBottom: 8 }}>
            뇌 상태
          </p>
          {health && (
            <p style={{ fontSize: 13, fontWeight: 600, color: health.color, marginBottom: 8 }}>
              {health.label} ({health.score})
            </p>
          )}
          <p style={{ fontSize: 13, color: "#86868b", lineHeight: 1.47, marginBottom: 10 }}>
            {brainProfile.interpretation}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {brainProfile.categories
              .filter((c) => c.value > 0)
              .sort((a, b) => b.value - a.value)
              .map((cat) => (
                <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#86868b", width: 100, flexShrink: 0, textAlign: "right" }}>
                    {cat.label}
                  </span>
                  <div style={{ flex: 1, height: 6, background: "#f5f5f7", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${cat.value}%`,
                        background: cat.isTop ? "#0071e3" : "#d2d2d7",
                        borderRadius: 999,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#1d1d1f", width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {cat.value}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
