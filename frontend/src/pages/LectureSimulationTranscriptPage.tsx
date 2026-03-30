import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Brain, ExternalLink, FileText, Layers3, Sparkles, Waypoints } from "lucide-react";
import { getSimulation, getSimulationTranscript } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { RoiMetricSummary, SimulationResult, TranscriptBrowserData } from "@/types/simulation";

function findSegmentIndex(simulation: SimulationResult, segmentId: string | null) {
  if (!segmentId) return 0;
  const index = simulation.segments.findIndex((segment) => segment.segment_id === segmentId);
  return index >= 0 ? index : 0;
}

function hintLabel(hint: RoiMetricSummary["functional_hint"]) {
  switch (hint) {
    case "auditory_or_language_related":
      return "설명 추적 반응";
    case "frontal_control_or_action_related":
      return "통제와 전환 반응";
    case "visual_processing_related":
      return "시각 처리 반응";
    case "sensorimotor_or_attention_related":
      return "주의 전환 반응";
    case "association_or_default_mode_related":
      return "연결 패턴 반응";
    default:
      return "표면 반응 변화";
  }
}

function buildSegmentTags(simulation: SimulationResult, index: number) {
  const segment = simulation.segments[index];
  if (!segment) return [];

  const tags = [...segment.labels];
  const firstHint = segment.roi_insights.top_active_rois[0]?.functional_hint;
  if (firstHint) {
    tags.push(hintLabel(firstHint));
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

export default function LectureSimulationTranscriptPage() {
  const { date = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptBrowserData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([getSimulation(date), getSimulationTranscript(date)])
      .then(([simulationResult, transcriptResult]) => {
        if (cancelled) return;
        setSimulation(simulationResult);
        setTranscript(transcriptResult);
        setSelectedIndex(findSegmentIndex(simulationResult, searchParams.get("segment")));
      })
      .catch(() => {
        if (!cancelled) setError("원문 브라우저 데이터를 불러오지 못했어요");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  useEffect(() => {
    if (!simulation || !transcript) return;
    const segmentId = transcript.segments[selectedIndex]?.segment_id;
    if (!segmentId) return;
    if (searchParams.get("segment") !== segmentId) {
      const next = new URLSearchParams(searchParams);
      next.set("segment", segmentId);
      setSearchParams(next, { replace: true });
    }
    segmentRefs.current[segmentId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedIndex, searchParams, setSearchParams, simulation, transcript]);

  if (loading) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <div className="text-body">원문 브라우저를 준비하는 중입니다...</div>
      </div>
    );
  }

  if (error || !simulation || !transcript) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center", gap: 12 }}>
        <div className="text-body">{error || "원문 데이터를 찾지 못했습니다"}</div>
        <Link to={`/lectures/${date}/simulation`} className="btn-secondary">
          시뮬레이션으로 돌아가기
        </Link>
      </div>
    );
  }

  const currentSegment = simulation.segments[selectedIndex];

  return (
    <div className="page-content">
      <div className="simulation-hero">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="simulation-pill-row">
            <span className="simulation-pill simulation-pill-primary">
              <Sparkles size={14} />
              실험 기능
            </span>
            <span className="simulation-pill">
              <FileText size={14} />
              전체 원문 브라우저
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to={`/lectures/${date}/simulation?segment=${currentSegment.segment_id}`} className="simulation-inline-link">
              <ArrowLeft size={16} />
              시뮬레이션으로 돌아가기
            </Link>
            <h1 className="simulation-title">{simulation.metadata.subject} 원문 브라우저</h1>
            <p className="text-body" style={{ maxWidth: 720 }}>
              세그먼트 단위로 전체 원문을 탐색하면서 현재 선택 구간의 뇌 반응 프록시와 함께 읽을 수 있습니다.
            </p>
            <div className="simulation-meta-row">
              <span>{formatDate(simulation.lecture_date)}</span>
              <span>·</span>
              <span>{simulation.metadata.instructor}</span>
              <span>·</span>
              <span>{transcript.segments.length}개 세그먼트</span>
            </div>
          </div>
        </div>

        <div className="card card-padded simulation-side-card">
          <p className="text-label" style={{ marginBottom: 12 }}>이 화면은 이렇게 읽어요</p>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <p className="text-section" style={{ marginBottom: 4 }}>사용법</p>
              <p className="text-body">좌측 세그먼트를 누르면 원문과 반응 요약이 같이 바뀌어요.</p>
            </div>
            <div>
              <p className="text-section" style={{ marginBottom: 4 }}>입력</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.input_summary}</p>
            </div>
            <div>
              <p className="text-section" style={{ marginBottom: 4 }}>영역</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.roi_summary}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-bar" role="tablist">
        <Link
          to={`/lectures/${date}/simulation?segment=${currentSegment.segment_id}`}
          className="tab-item"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          시뮬레이션 보기
        </Link>
        <button className="tab-item active" aria-selected="true">원문 브라우저</button>
      </div>

      <div className="simulation-transcript-grid">
        <aside className="card card-padded simulation-segment-nav">
          <div className="simulation-panel-header">
            <div>
              <p className="text-section">Segment Navigator</p>
              <p className="text-caption">시간순 세그먼트 목록</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            {transcript.segments.map((segment, index) => {
              const active = index === selectedIndex;
              return (
                <button
                  key={segment.segment_id}
                  onClick={() => setSelectedIndex(index)}
                  className="simulation-segment-button"
                  style={{
                    borderColor: active ? "var(--primary)" : "var(--border)",
                    background: active ? "var(--primary-light)" : "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{segment.segment_id}</span>
                    <span className="text-caption">{segment.start_time}</span>
                  </div>
                  <p className="text-caption" style={{ marginTop: 4 }}>
                    {segment.lines.length}줄 · {segment.start_time} - {segment.end_time}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="simulation-transcript-reader">
          <div className="card card-padded">
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">Brain Sync Summary</p>
                <p className="text-caption">{currentSegment.segment_id} 구간과 동기화된 요약입니다.</p>
              </div>
              <Link
                to={`/lectures/${date}/simulation?segment=${currentSegment.segment_id}`}
                className="simulation-inline-link"
              >
                <Brain size={16} />
                3D로 보기
              </Link>
            </div>
            <div className="simulation-metric-grid" style={{ marginTop: 18 }}>
              {[
                ["Attention", currentSegment.proxies.attention_proxy],
                ["Load", currentSegment.proxies.load_proxy],
                ["Novelty", currentSegment.proxies.novelty_proxy],
              ].map(([label, value]) => (
                <div key={label} className="simulation-metric-card">
                  <p className="text-label">{label}</p>
                  <p className="simulation-metric-value">{Number(value).toFixed(1)}</p>
                </div>
              ))}
            </div>
            <div className="simulation-pill-row" style={{ marginTop: 18 }}>
              {currentSegment.labels.map((label) => (
                <span key={label} className="simulation-pill">{label}</span>
              ))}
            </div>
            <p className="text-body" style={{ marginTop: 18 }}>{currentSegment.interpretation}</p>
            <div className="simulation-roi-grid" style={{ marginTop: 18 }}>
              <div className="simulation-roi-card">
                <div className="simulation-panel-header">
                  <p className="text-label">활성 ROI</p>
                  <Waypoints size={16} color="var(--primary)" />
                </div>
                <div className="simulation-roi-list" style={{ marginTop: 14 }}>
                  {currentSegment.roi_insights.top_active_rois.slice(0, 3).map((roi) => (
                    <div key={`active-${roi.hemisphere}-${roi.roi_name}`} className="simulation-roi-item">
                      <div>
                        <p className="text-section" style={{ fontSize: 14 }}>{roi.roi_display_name}</p>
                        <p className="text-caption">{roi.hemisphere === "left" ? "왼쪽" : "오른쪽"} · {hintLabel(roi.functional_hint)}</p>
                      </div>
                      <p className="text-caption">{roi.mean_abs_response?.toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="simulation-roi-card">
                <div className="simulation-panel-header">
                  <p className="text-label">변화 ROI</p>
                  <Layers3 size={16} color="var(--grey-700)" />
                </div>
                <div className="simulation-roi-list" style={{ marginTop: 14 }}>
                  {currentSegment.roi_insights.top_changed_rois.slice(0, 3).map((roi) => (
                    <div key={`changed-${roi.hemisphere}-${roi.roi_name}`} className="simulation-roi-item">
                      <div>
                        <p className="text-section" style={{ fontSize: 14 }}>{roi.roi_display_name}</p>
                        <p className="text-caption">{roi.hemisphere === "left" ? "왼쪽" : "오른쪽"} · {hintLabel(roi.functional_hint)}</p>
                      </div>
                      <p className="text-caption">{roi.delta_abs_response?.toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="simulation-callout" style={{ marginTop: 18 }}>
              <Brain size={16} />
              <p>{currentSegment.roi_insights.summary_text}</p>
            </div>
          </div>

          <div className="card card-padded" style={{ marginTop: 20 }}>
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">Transcript Reader</p>
                <p className="text-caption">전체 원문을 세그먼트 단위로 탐색합니다.</p>
              </div>
              <span className="simulation-pill">
                <ExternalLink size={14} />
                공개 배포 포함
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              {transcript.segments.map((segment, index) => (
                <div
                  key={segment.segment_id}
                  ref={(element) => {
                    segmentRefs.current[segment.segment_id] = element;
                  }}
                  className="simulation-transcript-card"
                  style={{
                    borderColor: index === selectedIndex ? "var(--primary)" : "var(--border)",
                    background: index === selectedIndex ? "linear-gradient(180deg, rgba(255,244,235,0.8), rgba(255,255,255,1))" : "var(--surface)",
                  }}
                  >
                  <div className="simulation-panel-header">
                    <div>
                      <p className="text-section">{segment.segment_id}</p>
                      <p className="text-caption">{segment.start_time} - {segment.end_time}</p>
                    </div>
                    <button className="simulation-pill-button" onClick={() => setSelectedIndex(index)}>
                      이 구간 보기
                    </button>
                  </div>
                  <div className="simulation-pill-row" style={{ marginTop: 14 }}>
                    {buildSegmentTags(simulation, index).map((tag) => (
                      <span key={`${segment.segment_id}-${tag}`} className="simulation-pill">{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                    {segment.lines.map((line, lineIndex) => (
                      <div key={`${line.timestamp}-${lineIndex}`} className="simulation-transcript-line">
                        <span className="simulation-transcript-time">{line.timestamp}</span>
                        <span className="simulation-transcript-speaker">{line.speaker}</span>
                        <p className="text-body" style={{ flex: 1 }}>{line.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
