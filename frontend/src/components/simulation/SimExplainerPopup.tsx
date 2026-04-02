import { useState } from "react";
import BrainDiagram from "./BrainDiagram";

interface SimExplainerPopupProps {
  onClose: () => void;
  onDismiss: () => void;
}

const METRICS = [
  { key: "auditory", label: "말을 듣는 중", region: "측두엽", color: "#FF6B00", intensity: 0.7, changeBoost: 0.2 },
  { key: "language", label: "설명을 이해하는 중", region: "Wernicke 영역", color: "#FF9F4A", intensity: 0.6, changeBoost: 0.3 },
  { key: "executive", label: "개념을 정리하는 중", region: "전두엽 (DLPFC)", color: "#4A90D9", intensity: 0.8, changeBoost: 0.5 },
  { key: "attention", label: "집중하는 중", region: "두정엽", color: "#7B61FF", intensity: 0.5, changeBoost: 0.7 },
  { key: "visual", label: "화면을 보는 중", region: "후두엽", color: "#34C759", intensity: 0.4, changeBoost: 0.4 },
  { key: "memory", label: "기억에 저장하는 중", region: "해마방회", color: "#FF3B30", intensity: 0.65, changeBoost: 0.6 },
  { key: "conflict", label: "헷갈리는 중", region: "전대상회", color: "#FF9500", intensity: 0.75, changeBoost: 0.8 },
  { key: "dmn", label: "딴생각 가능성", region: "후대상회 (DMN)", color: "#86868b", intensity: 0.3, changeBoost: 0.1 },
];

export default function SimExplainerPopup({ onClose, onDismiss }: SimExplainerPopupProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const metric = METRICS.find((m) => m.key === selected);

  return (
    <div className="explainer-overlay" onClick={onClose}>
      <div className="explainer-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="explainer-title">뇌 반응 시뮬레이션이란?</h2>
        <p className="explainer-body">
          Meta TRIBE v2 모델이 강의 텍스트를 분석하여 학생의 뇌가 어떻게 반응할지 예측합니다.
          아래 지표를 클릭하면 관련 뇌 영역이 활성화됩니다.
        </p>

        {/* 2D 뇌 다이어그램 — 클릭한 지표의 영역이 하이라이트 */}
        <div style={{ height: 200, marginBottom: 16, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <BrainDiagram highlighted={selected} />
        </div>

        {/* 지표 목록 — 클릭 가능 */}
        <div className="explainer-metrics">
          {METRICS.map((m) => (
            <button
              className={`explainer-metric${selected === m.key ? " explainer-metric-on" : ""}`}
              key={m.key}
              onClick={() => setSelected(selected === m.key ? null : m.key)}
              style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: "6px 4px", borderRadius: 8 }}
            >
              <span className="explainer-dot" style={{ background: selected === m.key ? m.color : "#d2d2d7" }} />
              <span className="explainer-label" style={{ color: selected === m.key ? "#1d1d1f" : "#86868b" }}>{m.label}</span>
              <span className="explainer-desc" style={{ color: selected === m.key ? "#6e6e73" : "#d2d2d7" }}>{m.region}</span>
            </button>
          ))}
        </div>

        <div className="explainer-actions">
          <button className="explainer-dismiss" onClick={onDismiss}>
            다시 보지 않기
          </button>
          <button className="btn-primary" style={{ borderRadius: 980, padding: "10px 28px" }} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
