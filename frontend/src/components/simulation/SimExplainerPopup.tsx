import { lazy, Suspense } from "react";

const BrainCanvas = lazy(() => import("@/components/simulation/BrainCanvas"));

interface SimExplainerPopupProps {
  onClose: () => void;
  onDismiss: () => void;
}

const METRICS = [
  { label: "말을 듣는 중", region: "청각 처리 영역 (측두엽)", color: "#FF6B00" },
  { label: "설명을 이해하는 중", region: "언어 이해 영역 (Wernicke)", color: "#FF9F4A" },
  { label: "개념을 정리하는 중", region: "실행 기능 영역 (전두엽)", color: "#4A90D9" },
  { label: "집중하는 중", region: "주의 집중 영역 (두정엽)", color: "#7B61FF" },
  { label: "화면을 보는 중", region: "시각 처리 영역 (후두엽)", color: "#34C759" },
  { label: "기억에 저장하는 중", region: "기억 부호화 영역 (해마방회)", color: "#FF3B30" },
  { label: "헷갈리는 중", region: "인지 갈등 영역 (전대상회)", color: "#FF9500" },
  { label: "딴생각 가능성", region: "기본 모드 네트워크 (후대상회)", color: "#86868b" },
];

export default function SimExplainerPopup({ onClose, onDismiss }: SimExplainerPopupProps) {
  return (
    <div className="explainer-overlay" onClick={onClose}>
      <div className="explainer-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="explainer-title">뇌 반응 시뮬레이션이란?</h2>
        <p className="explainer-body">
          Meta TRIBE v2 모델이 강의 텍스트를 분석하여 학생의 뇌가 어떻게 반응할지 예측합니다.
          실제 fMRI 데이터 451.6시간으로 훈련된 모델입니다.
        </p>

        {/* 3D Brain — demo mode (mesh only, no colors) */}
        <div style={{ height: 180, marginBottom: 20, borderRadius: 12, overflow: "hidden", background: "#f5f5f7" }}>
          <Suspense
            fallback={
              <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }
          >
            <BrainCanvas
              meshUrl="simulations/brain-mesh.glb"
              intensity={0.3}
            />
          </Suspense>
        </div>

        <div className="explainer-metrics">
          {METRICS.map((m) => (
            <div className="explainer-metric" key={m.label}>
              <span className="explainer-dot" style={{ background: m.color }} />
              <span className="explainer-label">{m.label}</span>
              <span className="explainer-desc">{m.region}</span>
            </div>
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
