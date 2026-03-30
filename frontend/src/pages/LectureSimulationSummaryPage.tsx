import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Brain, ChevronRight, Sparkles, Waypoints } from "lucide-react";
import BrainCanvas from "@/components/simulation/BrainCanvas";
import { getSimulation, getSimulationColors, getSimulationSummaryVisual } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { hintLabel, modalityLabel, roiHintDescription } from "@/lib/simulation";
import type { BrainIconFramePayload, SegmentColorPayload, SimulationResult } from "@/types/simulation";

function highlightLabel(kind: "attention" | "load" | "novelty") {
  return {
    attention: "가장 반응이 큰 구간",
    load: "가장 부하가 큰 구간",
    novelty: "가장 많이 바뀐 구간",
  }[kind];
}

export default function LectureSimulationSummaryPage() {
  const { date = "" } = useParams();
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [summaryVisual, setSummaryVisual] = useState<BrainIconFramePayload | null>(null);
  const [segmentColors, setSegmentColors] = useState<SegmentColorPayload | null>(null);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getSimulation(date)
      .then(async (result) => {
        const [visual, colorPayload] = await Promise.all([
          getSimulationSummaryVisual(result.summary_visual.brain_icon_frames_json),
          getSimulationColors(result.assets.segment_colors_json),
        ]);
        if (cancelled) return;
        setSimulation(result);
        setSummaryVisual(visual);
        setSegmentColors(colorPayload);
      })
      .catch(() => {
        if (!cancelled) setError("시뮬레이션 요약을 준비하지 못했어요");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  useEffect(() => {
    if (!summaryVisual?.frames.length) return;
    const timer = window.setInterval(() => {
      setSelectedFrameIndex((prev) => (prev + 1) % summaryVisual.frames.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [summaryVisual]);

  const selectedFrame = summaryVisual?.frames[selectedFrameIndex];
  const selectedSegment = useMemo(() => {
    if (!simulation || !selectedFrame) return null;
    return simulation.segments.find((segment) => segment.segment_id === selectedFrame.segment_id) ?? null;
  }, [selectedFrame, simulation]);
  const selectedColorSegment = useMemo(() => {
    if (!segmentColors || !selectedFrame) return null;
    return segmentColors.segments.find((segment) => segment.segment_id === selectedFrame.segment_id) ?? null;
  }, [segmentColors, selectedFrame]);

  if (loading) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <div className="text-body">시뮬레이션 요약을 불러오는 중이에요...</div>
      </div>
    );
  }

  if (error || !simulation || !summaryVisual || !selectedFrame) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center", gap: 12 }}>
        <div className="text-body">{error || "시뮬레이션 요약이 아직 준비되지 않았어요"}</div>
        <Link to={`/lectures/${date}`} className="btn-secondary">
          강의 상세로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="simulation-summary-hero">
        <div className="card card-padded simulation-summary-stage">
          <div className="simulation-pill-row">
            <span className="simulation-pill simulation-pill-primary">
              <Sparkles size={14} />
              실험 기능
            </span>
            <span className="simulation-pill">
              <Brain size={14} />
              빠르게 읽는 수강자 반응 요약
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            <Link to={`/lectures/${date}`} className="simulation-inline-link">
              <ArrowLeft size={16} />
              강의 상세로 돌아가기
            </Link>
            <h1 className="simulation-title">{simulation.metadata.subject}</h1>
            <p className="text-body" style={{ maxWidth: 720 }}>
              {simulation.summary_visual.hero_statement}
            </p>
            <div className="simulation-meta-row">
              <span>{formatDate(simulation.lecture_date)}</span>
              <span>·</span>
              <span>{simulation.metadata.instructor}</span>
              <span>·</span>
              <span>{simulation.segments.length}개 세그먼트</span>
              <span>·</span>
              <span>{modalityLabel(simulation.source_modality)}</span>
            </div>
          </div>

          <div className="simulation-summary-stage-grid">
            <div className="simulation-summary-mesh-shell">
              {selectedColorSegment ? (
                <BrainCanvas
                  meshUrl={simulation.assets.mesh_glb}
                  colors={selectedColorSegment.hemispheres}
                  intensity={Math.min(1, 0.54 + selectedFrame.proxies.attention / 140)}
                  changeBoost={Math.min(1, 0.42 + selectedFrame.proxies.novelty / 140)}
                  variant="summary"
                />
              ) : null}
            </div>
            <div className="simulation-summary-stack">
              <div className="simulation-summary-card simulation-summary-card-strong">
                <p className="text-label">한 줄 결론</p>
                <p className="text-section" style={{ marginTop: 6 }}>{selectedFrame.title}</p>
                <p className="text-body" style={{ marginTop: 10 }}>{selectedFrame.subtitle}</p>
                <div className="simulation-pill-row" style={{ marginTop: 14 }}>
                  {selectedFrame.labels.map((label) => (
                    <span key={label} className="simulation-pill">{label}</span>
                  ))}
                </div>
              </div>
              <div className="simulation-summary-link-card">
                <div>
                  <p className="text-section">실시간으로 자세히 볼 수 있어요</p>
                  <p className="text-body" style={{ marginTop: 6 }}>
                    스크립트 라인과 반응 패턴을 같이 보면서 지금 설명 중인 위치를 바로 따라갈 수 있어요.
                  </p>
                </div>
                <Link to={`/lectures/${date}/simulation/live`} className="btn-secondary">
                  실시간 보기
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-padded simulation-side-card">
          <p className="text-label" style={{ marginBottom: 12 }}>이 결과를 이렇게 읽어요</p>
          <div className="simulation-method-card-stack">
            <div>
              <p className="text-section" style={{ marginBottom: 4 }}>입력</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.input_summary}</p>
            </div>
            <div>
              <p className="text-section" style={{ marginBottom: 4 }}>숫자</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.proxy_summary}</p>
            </div>
            <div>
              <p className="text-section" style={{ marginBottom: 4 }}>영역</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.roi_summary}</p>
            </div>
            <div>
              <p className="text-section" style={{ marginBottom: 4 }}>주의할 점</p>
              <p className="text-body">실측 감정이 아니라 강도와 변화량을 묶어 읽는 실험용 프록시예요.</p>
            </div>
            <div className="simulation-callout">
              <AlertTriangle size={16} />
              <p>{simulation.lecture_summary.caution_text}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-bar" role="tablist">
        <button className="tab-item active" aria-selected="true">요약 보기</button>
        <Link to={`/lectures/${date}/simulation/live`} className="tab-item" style={{ display: "inline-flex", alignItems: "center" }}>
          실시간 보기
        </Link>
        <Link to={`/lectures/${date}/simulation/live/transcript`} className="tab-item" style={{ display: "inline-flex", alignItems: "center" }}>
          원문 보기
        </Link>
      </div>

      <div className="simulation-summary-card-grid">
        {simulation.summary_visual.highlight_cards.map((card) => (
          <button
            key={card.kind}
            className="card card-padded simulation-highlight-card"
            onClick={() => {
              const frameIndex = summaryVisual.frames.findIndex((frame) => frame.segment_id === card.segment_id);
              setSelectedFrameIndex(frameIndex >= 0 ? frameIndex : 0);
            }}
          >
            <p className="text-label">{highlightLabel(card.kind)}</p>
            <p className="text-section" style={{ marginTop: 8 }}>{card.segment_id}</p>
            <p className="text-body" style={{ marginTop: 10 }}>{card.summary}</p>
            <p className="simulation-highlight-value">{card.value.toFixed(1)}</p>
          </button>
        ))}
      </div>

      <div className="simulation-summary-grid">
        <div className="card card-padded">
          <div className="simulation-panel-header">
            <div>
              <p className="text-section">강의 리듬 요약</p>
              <p className="text-caption">눈에 띄는 구간만 먼저 빠르게 읽어요.</p>
            </div>
            <span className="simulation-pill">결론 먼저</span>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div className="simulation-summary-row">
              <span className="text-label">반응이 큰 구간</span>
              <div className="simulation-pill-row">
                {simulation.lecture_summary.strongest_segment_ids.map((segmentId) => (
                  <Link key={segmentId} to={`/lectures/${date}/simulation/live?segment=${segmentId}`} className="simulation-pill-button">
                    {segmentId}
                  </Link>
                ))}
              </div>
            </div>
            <div className="simulation-summary-row">
              <span className="text-label">주의 구간</span>
              <div className="simulation-pill-row">
                {simulation.lecture_summary.risk_segment_ids.map((segmentId) => (
                  <Link key={segmentId} to={`/lectures/${date}/simulation/live?segment=${segmentId}`} className="simulation-pill-button">
                    {segmentId}
                  </Link>
                ))}
              </div>
            </div>
            <div className="simulation-callout">
              <Sparkles size={16} />
              <p>{simulation.lecture_summary.summary_text}</p>
            </div>
          </div>
        </div>

        <div className="card card-padded">
          <p className="text-section" style={{ marginBottom: 10 }}>영역 상위 패턴</p>
          <div className="simulation-roi-list">
            {simulation.roi_summary.lecture_top_rois.slice(0, 5).map((roi) => (
              <div key={`${roi.hemisphere}-${roi.roi_name}`} className="simulation-roi-item">
                <div>
                  <p className="text-section" style={{ fontSize: 14 }}>{hintLabel(roi.functional_hint)}</p>
                  <p className="text-caption">{roiHintDescription(roi.functional_hint)}</p>
                </div>
                <p className="text-caption">{roi.hemisphere === "left" ? "왼쪽" : "오른쪽"}</p>
              </div>
            ))}
          </div>
          {selectedSegment && (
            <div className="simulation-summary-selected">
              <p className="text-label">지금 보고 있는 구간</p>
              <p className="text-body" style={{ marginTop: 8 }}>{selectedSegment.roi_insights.summary_text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
