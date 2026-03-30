import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Layers3,
  Pause,
  Play,
  ScanText,
  Sparkles,
  Waypoints,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import BrainCanvas from "@/components/simulation/BrainCanvas";
import { getSimulation, getSimulationColors } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type {
  RoiMetricSummary,
  SegmentColorPayload,
  SimulationResult,
  SimulationSegment,
} from "@/types/simulation";

function metricTone(value: number) {
  if (value >= 70) return "var(--primary)";
  if (value >= 45) return "var(--grey-700)";
  return "var(--grey-500)";
}

function segmentTone(segment: SimulationSegment) {
  if (segment.labels.includes("부하 높음")) return "#EF4444";
  if (segment.labels.includes("집중 상승")) return "var(--primary)";
  if (segment.labels.includes("집중 하락")) return "#F59E0B";
  return "var(--grey-500)";
}

function findSegmentIndex(result: SimulationResult, id: string | null): number {
  if (!id) return 0;
  const idx = result.segments.findIndex((segment) => segment.segment_id === id);
  return idx >= 0 ? idx : 0;
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

function modalityLabel(sourceModality: SimulationResult["source_modality"]) {
  return sourceModality === "audio_only_fallback" ? "오디오 fallback" : "텍스트 TTS";
}

export default function LectureSimulationPage() {
  const { date = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [colors, setColors] = useState<SegmentColorPayload | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const autoplayRef = useRef<number | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getSimulation(date)
      .then(async (result) => {
        const colorPayload = await getSimulationColors(result.assets.segment_colors_json);
        if (cancelled) return;
        setSimulation(result);
        setColors(colorPayload);
        setSelectedIndex(findSegmentIndex(result, searchParams.get("segment")));
      })
      .catch(() => {
        if (!cancelled) setError("시뮬레이션 데이터를 불러오지 못했어요");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  useEffect(() => {
    if (!simulation) return;
    const segmentId = simulation.segments[selectedIndex]?.segment_id;
    if (!segmentId) return;
    if (searchParams.get("segment") === segmentId) return;
    const next = new URLSearchParams(searchParams);
    next.set("segment", segmentId);
    setSearchParams(next, { replace: true });
  }, [selectedIndex, searchParams, setSearchParams, simulation]);

  useEffect(() => {
    if (!simulation || !isPlaying) return;
    autoplayRef.current = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % simulation.segments.length);
    }, 2400);
    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
      }
    };
  }, [isPlaying, simulation]);

  if (loading) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <div className="text-body">시뮬레이션을 불러오는 중입니다...</div>
      </div>
    );
  }

  if (error || !simulation || !colors) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center", gap: 12 }}>
        <div className="text-body">{error || "시뮬레이션 데이터가 없습니다"}</div>
        <Link to={`/lectures/${date}`} className="btn-secondary">
          강의 상세로 돌아가기
        </Link>
      </div>
    );
  }

  const currentSegment = simulation.segments[selectedIndex];
  const currentColorSegment = colors.segments[selectedIndex];
  const topNoveltySegments = [...simulation.segments]
    .sort((a, b) => b.proxies.novelty_proxy - a.proxies.novelty_proxy)
    .slice(0, 3);
  const topLoadSegments = [...simulation.segments]
    .sort((a, b) => b.proxies.load_proxy - a.proxies.load_proxy)
    .slice(0, 3);
  const timelineData = simulation.segments.map((segment, index) => ({
    name: `${index + 1}`,
    segment_id: segment.segment_id,
    attention: segment.proxies.attention_proxy,
    load: segment.proxies.load_proxy,
    novelty: segment.proxies.novelty_proxy,
    highlight: index === selectedIndex,
  }));

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
              <Brain size={14} />
              TRIBE v2 기반 신경 반응 프록시
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to={`/lectures/${date}`} className="simulation-inline-link">
              <ArrowLeft size={16} />
              강의 상세로 돌아가기
            </Link>
            <h1 className="simulation-title">{simulation.metadata.subject}</h1>
            <p className="text-body" style={{ maxWidth: 720 }}>
              {simulation.metadata.content}
            </p>
            <div className="simulation-meta-row">
              <span>{formatDate(simulation.lecture_date)}</span>
              <span>·</span>
              <span>{simulation.metadata.instructor}</span>
              <span>·</span>
              <span>{simulation.metadata.segment_minutes}분 세그먼트</span>
              <span>·</span>
              <span>{simulation.segments.length}개 세그먼트 완료</span>
            </div>
          </div>
        </div>

        <div className="card card-padded simulation-side-card">
          <p className="text-label" style={{ marginBottom: 12 }}>TRIBE 결과를 이렇게 읽어요</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
            <div className="simulation-meta-row">
              <span>{modalityLabel(simulation.source_modality)}</span>
              <span>·</span>
              <span>{simulation.roi_summary.atlas_name} atlas</span>
            </div>
            <div className="simulation-callout">
              <AlertTriangle size={16} />
              <p>{simulation.lecture_summary.caution_text}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-bar" role="tablist">
        <button className="tab-item active" aria-selected="true">시뮬레이션 보기</button>
        <Link
          to={`/lectures/${date}/simulation/transcript?segment=${currentSegment.segment_id}`}
          className="tab-item"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          원문 브라우저
        </Link>
      </div>

      <div className="simulation-main-grid">
        <div className="card card-padded">
          <div className="simulation-panel-header">
            <div>
              <p className="text-section">3D Brain Panel</p>
              <p className="text-caption">회전, 확대/축소, 세그먼트 스크럽으로 전체 반응 히트맵을 탐색합니다.</p>
            </div>
            <button className="btn-secondary" onClick={() => setIsPlaying((prev) => !prev)}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "일시정지" : "자동 재생"}
            </button>
          </div>

          <div className="simulation-brain-shell">
            <BrainCanvas meshUrl={simulation.assets.mesh_glb} colors={currentColorSegment?.hemispheres} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
            <div className="simulation-slider-head">
              <span className="text-label">세그먼트 선택</span>
              <span className="text-caption">
                {selectedIndex + 1} / {simulation.segments.length} · {currentSegment.start_time} - {currentSegment.end_time}
              </span>
            </div>
            <input
              className="progress-bar"
              type="range"
              min={0}
              max={simulation.segments.length - 1}
              value={selectedIndex}
              onChange={(event) => {
                setIsPlaying(false);
                setSelectedIndex(Number(event.target.value));
              }}
            />
          </div>
        </div>

        <div className="simulation-insight-column">
          <div className="card card-padded">
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">Insight Panel</p>
                <p className="text-caption">{currentSegment.segment_id} · {currentSegment.start_time} - {currentSegment.end_time}</p>
              </div>
              <span
                className="simulation-state-dot"
                style={{ background: segmentTone(currentSegment) }}
                aria-hidden="true"
              />
            </div>

            <div className="simulation-metric-grid">
              {[
                ["Attention", currentSegment.proxies.attention_proxy],
                ["Load", currentSegment.proxies.load_proxy],
                ["Novelty", currentSegment.proxies.novelty_proxy],
              ].map(([label, value]) => (
                <div key={label} className="simulation-metric-card">
                  <p className="text-label">{label}</p>
                  <p className="simulation-metric-value" style={{ color: metricTone(Number(value)) }}>
                    {Number(value).toFixed(1)}
                  </p>
                </div>
              ))}
            </div>

            <div className="simulation-pill-row" style={{ marginTop: 18 }}>
              {currentSegment.labels.map((label) => (
                <span key={label} className="simulation-pill">{label}</span>
              ))}
            </div>

            <p className="text-body" style={{ marginTop: 18 }}>{currentSegment.interpretation}</p>
            <div className="simulation-callout" style={{ marginTop: 18 }}>
              <ScanText size={16} />
              <p>이 구간의 전체 원문은 원문 브라우저에서 확인할 수 있습니다.</p>
            </div>
          </div>

          <div className="card card-padded">
            <p className="text-section" style={{ marginBottom: 8 }}>강의 요약</p>
            <p className="text-body">{simulation.lecture_summary.summary_text}</p>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <div className="simulation-summary-row">
                <span className="text-label">강한 반응 구간</span>
                <div className="simulation-pill-row">
                  {simulation.lecture_summary.strongest_segment_ids.map((id) => (
                    <button key={id} className="simulation-pill-button" onClick={() => setSelectedIndex(findSegmentIndex(simulation, id))}>
                      {id}
                    </button>
                  ))}
                </div>
              </div>
              <div className="simulation-summary-row">
                <span className="text-label">주의 구간</span>
                <div className="simulation-pill-row">
                  {simulation.lecture_summary.risk_segment_ids.map((id) => (
                    <button key={id} className="simulation-pill-button" onClick={() => setSelectedIndex(findSegmentIndex(simulation, id))}>
                      {id}
                    </button>
                  ))}
                </div>
              </div>
              <div className="simulation-summary-row">
                <span className="text-label">영역 상위 패턴</span>
                <div className="simulation-roi-list">
                  {simulation.roi_summary.lecture_top_rois.slice(0, 4).map((roi) => (
                    <div key={`${roi.hemisphere}-${roi.roi_name}`} className="simulation-roi-item">
                      <div>
                        <p className="text-section" style={{ fontSize: 14 }}>{roi.roi_display_name}</p>
                        <p className="text-caption">{roi.hemisphere === "left" ? "왼쪽" : "오른쪽"} · {hintLabel(roi.functional_hint)}</p>
                      </div>
                      <p className="text-caption">{roi.mean_abs_response?.toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card card-padded">
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">ROI Lens</p>
                <p className="text-caption">현재 구간에서 눈에 띄는 영역 패턴이에요.</p>
              </div>
              <span className="simulation-pill">
                <Layers3 size={14} />
                {simulation.roi_summary.atlas_name}
              </span>
            </div>

            <p className="text-body" style={{ marginTop: 16 }}>{currentSegment.roi_insights.summary_text}</p>

            <div className="simulation-roi-grid" style={{ marginTop: 18 }}>
              <div className="simulation-roi-card">
                <div className="simulation-panel-header">
                  <p className="text-label">활성 ROI Top 3</p>
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
                  <p className="text-label">변화 ROI Top 3</p>
                  <Waypoints size={16} color="#0f172a" />
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
          </div>
        </div>
      </div>

      <div className="simulation-explainer-grid">
        <div className="card card-padded">
          <p className="text-section" style={{ marginBottom: 8 }}>이 결과는 이렇게 만들어요</p>
          <p className="text-body">숫자만 보면 어렵기 때문에 입력, 프록시, 영역 해석을 따로 나눠서 보여줘요.</p>
          <div className="simulation-method-grid" style={{ marginTop: 18 }}>
            <div className="simulation-method-card">
              <p className="text-label">입력</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.input_summary}</p>
            </div>
            <div className="simulation-method-card">
              <p className="text-label">숫자</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.proxy_summary}</p>
            </div>
            <div className="simulation-method-card">
              <p className="text-label">영역</p>
              <p className="text-body">{simulation.roi_summary.method_explainer.roi_summary}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-padded">
        <div className="simulation-panel-header">
          <div>
            <p className="text-section">Risk Timeline</p>
            <p className="text-caption">세그먼트별 집중, 부하, 새로움 프록시의 흐름을 한 번에 봅니다.</p>
          </div>
        </div>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--grey-100)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
              <Tooltip
                formatter={(value, key) => {
                  const numeric = typeof value === "number" ? value : Number(value ?? 0);
                  return [`${numeric.toFixed(1)}`, String(key)];
                }}
                labelFormatter={(label) => `세그먼트 ${label}`}
              />
              <Legend />
              <ReferenceArea x1={`${selectedIndex + 1}`} x2={`${selectedIndex + 1}`} fill="rgba(255,107,0,0.08)" />
              <Line type="monotone" dataKey="attention" stroke="var(--primary)" strokeWidth={3} dot={{ r: 3 }} name="Attention" />
              <Line type="monotone" dataKey="load" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Load" />
              <Line type="monotone" dataKey="novelty" stroke="#0f172a" strokeWidth={2} dot={{ r: 2 }} name="Novelty" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="simulation-summary-grid">
        <div className="card card-padded">
          <p className="text-section" style={{ marginBottom: 8 }}>핵심 전환 구간</p>
          <p className="text-body">novelty가 큰 세그먼트를 먼저 보면 흐름이 어디서 바뀌는지 빨리 읽을 수 있어요.</p>
          <div className="simulation-pill-row" style={{ marginTop: 16 }}>
            {topNoveltySegments.map((segment) => (
              <button key={segment.segment_id} className="simulation-pill-button" onClick={() => setSelectedIndex(findSegmentIndex(simulation, segment.segment_id))}>
                {segment.segment_id} · {segment.proxies.novelty_proxy.toFixed(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card card-padded">
          <p className="text-section" style={{ marginBottom: 8 }}>부하 주의 구간</p>
          <p className="text-body">load가 높은 구간은 설명 밀도와 리듬을 같이 봐야 해요.</p>
          <div className="simulation-pill-row" style={{ marginTop: 16 }}>
            {topLoadSegments.map((segment) => (
              <button key={segment.segment_id} className="simulation-pill-button" onClick={() => setSelectedIndex(findSegmentIndex(simulation, segment.segment_id))}>
                {segment.segment_id} · {segment.proxies.load_proxy.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="simulation-persona-grid">
        {simulation.personas.map((persona) => (
          <div key={persona.persona_id} className="card card-padded">
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">{persona.label}</p>
                <p className="text-caption">{persona.persona_id}</p>
              </div>
              <p className="simulation-metric-value" style={{ fontSize: 28 }}>{persona.overall_score.toFixed(1)}</p>
            </div>
            <p className="text-body" style={{ marginTop: 14 }}>{persona.reaction_summary}</p>
            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <div className="simulation-summary-row">
                <span className="text-label">반응 좋음</span>
                <div className="simulation-pill-row">
                  {persona.top_positive_segment_ids.map((id) => (
                    <button key={id} className="simulation-pill-button" onClick={() => setSelectedIndex(findSegmentIndex(simulation, id))}>
                      {id}
                    </button>
                  ))}
                </div>
              </div>
              <div className="simulation-summary-row">
                <span className="text-label">리스크</span>
                <div className="simulation-pill-row">
                  {persona.top_risk_segment_ids.map((id) => (
                    <button key={id} className="simulation-pill-button" onClick={() => setSelectedIndex(findSegmentIndex(simulation, id))}>
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
