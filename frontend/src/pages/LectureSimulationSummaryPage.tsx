import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Brain, ChevronRight, Sparkles, Waypoints } from "lucide-react";
import BrainCanvas from "@/components/simulation/BrainCanvas";
import { getSimulation, getSimulationColors, getSimulationSummaryVisual } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import {
  hintLabel,
  interpretMetricCombo,
  isFlowZone,
  modalityLabel,
  roiHintDescription,
  roiNeuroscienceHint,
  roiResponseLevel,
} from "@/lib/simulation";
import MetricGauge from "@/components/simulation/MetricGauge";
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
        if (!result.summary_visual) throw new Error("summary_visual missing");
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
  const selectedCombo = useMemo(() => {
    if (!selectedSegment) return null;
    return interpretMetricCombo(
      selectedSegment.proxies.attention_proxy,
      selectedSegment.proxies.load_proxy,
      selectedSegment.proxies.novelty_proxy,
    );
  }, [selectedSegment]);
  const selectedFlowZone = useMemo(() => {
    if (!selectedSegment) return false;
    return isFlowZone(
      selectedSegment.proxies.attention_proxy,
      selectedSegment.proxies.load_proxy,
      selectedSegment.proxies.novelty_proxy,
    );
  }, [selectedSegment]);
  const focusSegmentIds = useMemo(
    () => Array.from(new Set([
      ...(simulation?.lecture_summary.strongest_segment_ids ?? []),
      ...(simulation?.lecture_summary.risk_segment_ids ?? []),
    ])),
    [simulation?.lecture_summary.risk_segment_ids, simulation?.lecture_summary.strongest_segment_ids],
  );

  if (loading) {
    return (
      <div className="card card-padded sim-empty-state">
        <div className="text-body">시뮬레이션 요약을 불러오는 중이에요...</div>
      </div>
    );
  }

  if (error || !simulation || !summaryVisual || !selectedFrame) {
    return (
      <div className="card card-padded sim-empty-state">
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
              {simulation.metadata.subject}
            </span>
          </div>

          <div className="simulation-article-header">
            <Link to={`/lectures/${date}`} className="simulation-inline-link">
              <ArrowLeft size={16} />
              강의 상세로 돌아가기
            </Link>
            <h1 className="simulation-title">{simulation.summary_visual?.hero_statement}</h1>
            <p className="simulation-article-lead">
              {simulation.lecture_summary.summary_text}
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
                <p className="text-label">지금 먼저 볼 구간</p>
                <p className="sim-hero-subtitle">{selectedFrame.title}</p>
                <p className="text-body">{selectedFrame.subtitle}</p>
                <div className="simulation-pill-row">
                  {selectedFrame.labels.map((label) => (
                    <span key={label} className="simulation-pill">{label}</span>
                  ))}
                </div>
                {selectedSegment ? (
                  <div className="simulation-metric-grid">
                    <MetricGauge label="Attention" value={selectedSegment.proxies.attention_proxy} metric="attention" compact />
                    <MetricGauge label="Load" value={selectedSegment.proxies.load_proxy} metric="load" compact />
                    <MetricGauge label="Novelty" value={selectedSegment.proxies.novelty_proxy} metric="novelty" compact />
                  </div>
                ) : null}
              </div>
              <div className="simulation-summary-link-card">
                <div>
                  <p className="text-section">상세 해석은 실시간 화면에서 읽어요</p>
                  <p className="text-body">
                    뇌 반응, playhead, 원문 위치를 같은 화면에서 따라가면서 왜 이런 해석이 나왔는지 볼 수 있어요.
                  </p>
                </div>
                <Link to={`/lectures/${date}/simulation/live`} className="btn-primary">
                  실시간 시뮬레이션 보기
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <aside className="simulation-aside-card">
          <p className="simulation-aside-heading">이 화면에서 알 수 있는 것</p>
          <div className="simulation-aside-list">
            <div className="simulation-aside-item">
              반응이 큰 구간과 주의 구간을 먼저 고르고, 필요한 구간만 live에서 깊게 봅니다.
            </div>
            <div className="simulation-aside-item">
              이 화면의 숫자는 실제 감정 측정이 아니라 attention, load, novelty 프록시를 묶은 실험용 해석입니다.
            </div>
            <div className="simulation-aside-item">
              ROI 이름보다 지금 강의가 어떤 패턴으로 읽히는지에 집중해서 보도록 정리했습니다.
            </div>
          </div>
          <div className="simulation-callout">
            <AlertTriangle size={16} />
            <p>{simulation.lecture_summary.caution_text}</p>
          </div>
        </aside>
      </div>

      <div className="tab-bar" role="tablist">
        <button className="tab-item active" aria-selected="true">요약</button>
        <Link to={`/lectures/${date}/simulation/live`} className="tab-item">
          실시간
        </Link>
      </div>

      <div className="simulation-summary-grid">
        <div className="card card-padded">
          <div className="simulation-panel-header">
            <div>
              <p className="text-section">구간 바로 보기</p>
              <p className="text-caption">주요 장면만 먼저 훑고, 필요한 구간을 눌러 상세 해석으로 이동해요.</p>
            </div>
            <span className="simulation-pill">결론 먼저</span>
          </div>
          <div className="simulation-feature-list">
            {simulation.summary_visual?.highlight_cards.map((card) => (
              <button
                key={card.kind}
                className="simulation-feature-row"
                onClick={() => {
                  const frameIndex = summaryVisual.frames.findIndex((frame) => frame.segment_id === card.segment_id);
                  setSelectedFrameIndex(frameIndex >= 0 ? frameIndex : 0);
                }}
              >
                <div className="simulation-feature-row-copy">
                  <div className="simulation-pill-row">
                    <span className={`simulation-pill ${card.segment_id === selectedFrame.segment_id ? "simulation-pill-primary" : ""}`}>
                      {card.segment_id}
                    </span>
                    <span className="simulation-pill">{highlightLabel(card.kind)}</span>
                  </div>
                  <p className="sim-feature-title">{card.summary}</p>
                  <p className="text-body">
                    {card.segment_id} 구간을 먼저 눌러 고정하고, 실시간 보기에서 같은 위치를 이어서 읽을 수 있어요.
                  </p>
                </div>
                <div className="simulation-feature-row-figure sim-feature-figure">
                  <span className={`simulation-pill ${card.segment_id === selectedFrame.segment_id ? "simulation-pill-primary" : ""}`}>
                    {card.kind === "attention" ? "attention" : card.kind === "load" ? "load" : "novelty"}
                  </span>
                  <div className="sim-feature-figure-detail">
                    <p className="text-label">segment</p>
                    <p className="sim-feature-title">{card.segment_id}</p>
                    <p className="text-caption">proxy score {card.value.toFixed(1)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="simulation-aside-card">
          <p className="simulation-aside-heading">현재 선택한 구간 해석</p>
          {selectedCombo ? (
            <div className="simulation-summary-selected">
              <div className="simulation-pill-row">
                <span className="simulation-pill simulation-pill-primary">{selectedCombo.pattern}</span>
                {selectedFlowZone ? <span className="simulation-pill">flow candidate</span> : null}
              </div>
              <p className="text-body">{selectedCombo.diagnosis}</p>
              <p className="text-caption">{selectedCombo.suggestion}</p>
            </div>
          ) : null}
          {selectedSegment ? (
            <div className="sim-stack-md">
              <div className="sim-stack-xs">
                <p className="text-label">ROI 요약</p>
                <p className="text-body">{selectedSegment.roi_insights?.summary_text}</p>
                {selectedSegment.roi_insights?.top_active_rois[0] ? (
                  <p className="text-caption">
                    {roiNeuroscienceHint(selectedSegment.roi_insights.top_active_rois[0].functional_hint)}
                  </p>
                ) : null}
              </div>
              <div className="simulation-roi-list">
                {simulation.roi_summary?.lecture_top_rois.slice(0, 4).map((roi) => {
                  const level = roiResponseLevel(roi.mean_abs_response);
                  return (
                    <div key={`${roi.hemisphere}-${roi.roi_name}`} className="simulation-roi-item">
                      <div>
                        <p className="text-section">{hintLabel(roi.functional_hint)}</p>
                        <p className="text-caption">{roiHintDescription(roi.functional_hint)}</p>
                      </div>
                      <span className="text-caption sim-flex-shrink-0">{level.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="simulation-pill-row">
                {focusSegmentIds.map((segmentId) => (
                  <Link key={segmentId} to={`/lectures/${date}/simulation/live?segment=${segmentId}`} className="simulation-pill-button">
                    {segmentId}
                  </Link>
                ))}
              </div>
              <div className="simulation-callout">
                <Waypoints size={16} />
                <p>{simulation.roi_summary?.method_explainer.roi_summary}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
