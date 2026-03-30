import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  FileText,
  Layers3,
  Pause,
  Play,
  ScanText,
  Sparkles,
  Waypoints,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import BrainCanvas from "@/components/simulation/BrainCanvas";
import {
  getSimulation,
  getSimulationColors,
  getSimulationLiveFrames,
  getSimulationTimelineFrames,
  getSimulationTranscript,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";
import {
  buildSegmentTags,
  flattenTranscript,
  hintLabel,
  metricTone,
  modalityLabel,
  segmentTone,
} from "@/lib/simulation";
import type {
  LiveBrainFramePayload,
  LiveTimelineFramePayload,
  SegmentColorPayload,
  SimulationResult,
  TranscriptBrowserData,
} from "@/types/simulation";

function playbackIntervalMs(currentRelativeSeconds: number, nextRelativeSeconds: number | undefined) {
  if (typeof nextRelativeSeconds !== "number") return 900;
  const delta = Math.max(1, nextRelativeSeconds - currentRelativeSeconds);
  return Math.min(1600, Math.max(650, delta * 130));
}

export default function LectureSimulationLivePage() {
  const { date = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptBrowserData | null>(null);
  const [colors, setColors] = useState<SegmentColorPayload | null>(null);
  const [liveFrames, setLiveFrames] = useState<LiveBrainFramePayload | null>(null);
  const [timelineFrames, setTimelineFrames] = useState<LiveTimelineFramePayload | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      getSimulation(date),
      getSimulationTranscript(date),
    ])
      .then(async ([simulationResult, transcriptResult]) => {
        const [colorPayload, liveFramePayload, timelinePayload] = await Promise.all([
          getSimulationColors(simulationResult.assets.segment_colors_json),
          getSimulationLiveFrames(simulationResult.live_assets.brain_frames_json),
          getSimulationTimelineFrames(simulationResult.live_assets.timeline_frames_json),
        ]);

        if (cancelled) return;
        setSimulation(simulationResult);
        setTranscript(transcriptResult);
        setColors(colorPayload);
        setLiveFrames(liveFramePayload);
        setTimelineFrames(timelinePayload);

        const initialSegment = searchParams.get("segment");
        if (initialSegment) {
          const firstIndex = liveFramePayload.frames.findIndex((frame) => frame.segment_id === initialSegment);
          setCurrentFrameIndex(firstIndex >= 0 ? firstIndex : 0);
        } else {
          setCurrentFrameIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) setError("실시간 시뮬레이션 데이터를 불러오지 못했어요");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, searchParams]);

  const flattenedLines = useMemo(() => {
    if (!transcript || !simulation) return [];
    return flattenTranscript(transcript, simulation);
  }, [simulation, transcript]);

  const currentLine = flattenedLines[currentFrameIndex];
  const currentFrame = liveFrames?.frames[currentFrameIndex];
  const currentTimelineFrame = timelineFrames?.frames[currentFrameIndex];
  const currentSegment = simulation?.segments[currentLine?.segment_index ?? 0];
  const currentColorSegment = colors?.segments[currentFrame?.color_segment_index ?? currentLine?.segment_index ?? 0];
  const timelineData = useMemo(() => {
    if (!simulation) return [];
    return simulation.segments.map((segment, index) => ({
      name: `${index + 1}`,
      segment_id: segment.segment_id,
      attention: segment.proxies.attention_proxy,
      load: segment.proxies.load_proxy,
      novelty: segment.proxies.novelty_proxy,
    }));
  }, [simulation]);

  const currentSegmentIndex = currentLine?.segment_index ?? 0;
  const nearbyLines = useMemo(() => {
    if (!currentLine) return [];
    const start = Math.max(0, currentFrameIndex - 2);
    const end = Math.min(flattenedLines.length, currentFrameIndex + 3);
    return flattenedLines.slice(start, end);
  }, [currentFrameIndex, currentLine, flattenedLines]);

  useEffect(() => {
    if (!simulation || !currentSegment) return;
    const segmentId = currentSegment.segment_id;
    if (searchParams.get("segment") === segmentId) return;
    const next = new URLSearchParams(searchParams);
    next.set("segment", segmentId);
    setSearchParams(next, { replace: true });
  }, [currentSegment, searchParams, setSearchParams, simulation]);

  useEffect(() => {
    if (!isPlaying || !liveFrames || liveFrames.frames.length === 0) return;
    const frame = liveFrames.frames[currentFrameIndex];
    const nextFrame = liveFrames.frames[currentFrameIndex + 1];
    const timer = window.setTimeout(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % liveFrames.frames.length);
    }, playbackIntervalMs(frame?.relative_seconds ?? 0, nextFrame?.relative_seconds));

    return () => window.clearTimeout(timer);
  }, [currentFrameIndex, isPlaying, liveFrames]);

  if (loading) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <div className="text-body">실시간 시뮬레이션을 준비하는 중이에요...</div>
      </div>
    );
  }

  if (error || !simulation || !transcript || !colors || !liveFrames || !timelineFrames || !currentLine || !currentSegment || !currentColorSegment) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center", gap: 12 }}>
        <div className="text-body">{error || "실시간 시뮬레이션을 아직 준비하지 못했어요"}</div>
        <Link to={`/lectures/${date}/simulation`} className="btn-secondary">
          요약 화면으로 돌아가기
        </Link>
      </div>
    );
  }

  const segmentTags = buildSegmentTags(simulation, currentSegmentIndex);

  return (
    <div className="page-content">
      <div className="simulation-hero">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="simulation-pill-row">
            <span className="simulation-pill simulation-pill-primary">
              <Sparkles size={14} />
              실시간 보기
            </span>
            <span className="simulation-pill">
              <Brain size={14} />
              {modalityLabel(simulation.source_modality)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to={`/lectures/${date}/simulation`} className="simulation-inline-link">
              <ArrowLeft size={16} />
              요약 화면으로 돌아가기
            </Link>
            <h1 className="simulation-title">{simulation.metadata.subject} 실시간 시뮬레이션</h1>
            <p className="text-body" style={{ maxWidth: 740 }}>
              지금 설명 중인 스크립트 라인에 맞춰 뇌 시뮬레이션, Risk Timeline, ROI 요약을 같이 따라가요.
            </p>
            <div className="simulation-meta-row">
              <span>{formatDate(simulation.lecture_date)}</span>
              <span>·</span>
              <span>{simulation.metadata.instructor}</span>
              <span>·</span>
              <span>{liveFrames.frames.length}개 라인 프레임</span>
            </div>
          </div>
        </div>

        <div className="card card-padded simulation-side-card">
          <p className="text-label" style={{ marginBottom: 12 }}>이 화면은 이렇게 봐요</p>
          <div className="simulation-live-line-card">
            <div style={{ display: "grid", gap: 10 }}>
              <p className="text-body">왼쪽에서는 뇌 반응과 Risk Timeline이 같이 움직여요.</p>
              <p className="text-body">오른쪽에서는 지금 줄과 바로 앞뒤 줄을 같이 읽을 수 있어요.</p>
              <p className="text-body">더 긴 원문이 필요하면 원문 전체 보기로 바로 넘어갈 수 있어요.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-bar" role="tablist">
        <Link to={`/lectures/${date}/simulation`} className="tab-item" style={{ display: "inline-flex", alignItems: "center" }}>
          요약 보기
        </Link>
        <button className="tab-item active" aria-selected="true">실시간 보기</button>
        <Link to={`/lectures/${date}/simulation/live/transcript?segment=${currentSegment.segment_id}`} className="tab-item" style={{ display: "inline-flex", alignItems: "center" }}>
          원문 보기
        </Link>
      </div>

      <div className="simulation-main-grid">
        <div className="card card-padded">
          <div className="simulation-panel-header">
            <div>
              <p className="text-section">Brain Live Panel</p>
              <p className="text-caption">라인 선택과 재생 위치에 맞춰 현재 구간을 같이 보여줘요.</p>
            </div>
            <button className="btn-secondary" onClick={() => setIsPlaying((prev) => !prev)}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "일시정지" : "재생하기"}
            </button>
          </div>

          <div className="simulation-brain-shell">
            <BrainCanvas meshUrl={simulation.assets.mesh_glb} colors={currentColorSegment.hemispheres} />
          </div>

          <div className="simulation-live-controls">
            <div className="simulation-slider-head">
              <span className="text-label">라인 스크럽</span>
              <span className="text-caption">
                {currentFrameIndex + 1} / {liveFrames.frames.length} · {currentLine.start_time} - {currentLine.end_time}
              </span>
            </div>
            <input
              className="progress-bar"
              type="range"
              min={0}
              max={liveFrames.frames.length - 1}
              value={currentFrameIndex}
              onChange={(event) => {
                setIsPlaying(false);
                setCurrentFrameIndex(Number(event.target.value));
              }}
            />
            <div className="simulation-pill-row">
              {simulation.lecture_summary.strongest_segment_ids.concat(simulation.lecture_summary.risk_segment_ids).slice(0, 4).map((segmentId) => (
                <button
                  key={segmentId}
                  className="simulation-pill-button"
                  onClick={() => {
                    const nextIndex = liveFrames.frames.findIndex((frame) => frame.segment_id === segmentId);
                    if (nextIndex >= 0) {
                      setIsPlaying(false);
                      setCurrentFrameIndex(nextIndex);
                    }
                  }}
                >
                  {segmentId}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 238, marginTop: 22 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
                onClick={(state) => {
                  const segmentId = (state as { activePayload?: Array<{ payload?: { segment_id?: string } }> } | undefined)
                    ?.activePayload?.[0]?.payload?.segment_id;
                  if (!segmentId) return;
                  const nextIndex = liveFrames.frames.findIndex((frame) => frame.segment_id === segmentId);
                  if (nextIndex >= 0) {
                    setIsPlaying(false);
                    setCurrentFrameIndex(nextIndex);
                  }
                }}
              >
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
                <ReferenceArea
                  x1={`${currentSegmentIndex + 1}`}
                  x2={`${currentSegmentIndex + 1}`}
                  fill="rgba(255,107,0,0.08)"
                />
                <Line type="monotone" dataKey="attention" stroke="var(--primary)" strokeWidth={3} dot={{ r: 3 }} name="Attention" />
                <Line type="monotone" dataKey="load" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Load" />
                <Line type="monotone" dataKey="novelty" stroke="#0f172a" strokeWidth={2} dot={{ r: 2 }} name="Novelty" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="simulation-callout" style={{ marginTop: 18 }}>
            <Waypoints size={16} />
            <p>
              지금은 {currentSegment.segment_id}의 {currentLine.line_index + 1}번째 줄이에요. playhead와 뇌 반응이 같은 위치를 따라가요.
              {currentTimelineFrame ? ` 현재 lecture time은 ${Math.round(currentTimelineFrame.lecture_seconds)}초예요.` : ""}
            </p>
          </div>
        </div>

        <div className="simulation-insight-column">
          <div className="card card-padded">
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">지금 설명 중인 줄</p>
                <p className="text-caption">{currentSegment.segment_id} · {currentLine.timestamp}</p>
              </div>
              <span className="simulation-state-dot" style={{ background: segmentTone(currentSegment) }} />
            </div>

            <div className="simulation-live-now-card">
              <p className="text-body">{currentLine.text}</p>
            </div>

            <div className="simulation-live-nearby-list">
              {nearbyLines.map((line) => {
                const active = line.frame_index === currentFrameIndex;
                return (
                  <button
                    key={`${line.segment_id}-${line.line_index}`}
                    className="simulation-live-nearby-button"
                    style={{
                      borderColor: active ? "rgba(255, 107, 0, 0.22)" : "rgba(226, 232, 240, 0.85)",
                      background: active ? "rgba(255, 107, 0, 0.08)" : "var(--surface)",
                    }}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrameIndex(line.frame_index ?? currentFrameIndex);
                    }}
                  >
                    <div className="simulation-meta-row">
                      <span>{line.timestamp}</span>
                      <span>·</span>
                      <span>{line.segment_id}</span>
                      <span>·</span>
                      <span>{line.line_index + 1}번째 줄</span>
                    </div>
                    <p className="text-body" style={{ marginTop: 8 }}>{line.text}</p>
                  </button>
                );
              })}
            </div>

            <div className="simulation-panel-header" style={{ marginTop: 18 }}>
              <div>
                <p className="text-section">현재 구간 요약</p>
                <p className="text-caption">지금 줄이 속한 세그먼트를 같이 읽어요.</p>
              </div>
              <Link
                to={`/lectures/${date}/simulation/live/transcript?segment=${currentSegment.segment_id}`}
                className="simulation-inline-link"
              >
                <FileText size={16} />
                원문 전체 보기
              </Link>
            </div>

            <div className="simulation-metric-grid" style={{ marginTop: 16 }}>
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
              {segmentTags.map((tag) => (
                <span key={tag} className="simulation-pill">{tag}</span>
              ))}
            </div>
            <p className="text-body" style={{ marginTop: 18 }}>{currentSegment.roi_insights.summary_text}</p>
            <div className="simulation-callout" style={{ marginTop: 18 }}>
              <ScanText size={16} />
              <p>지금 보는 줄과 바로 앞뒤 줄을 같은 화면에서 같이 읽을 수 있어요.</p>
            </div>
          </div>

          <div className="card card-padded">
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">ROI Lens</p>
                <p className="text-caption">현재 줄이 속한 구간의 영역 패턴이에요.</p>
              </div>
              <span className="simulation-pill">
                <Layers3 size={14} />
                {simulation.roi_summary.atlas_name}
              </span>
            </div>
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
                  <Waypoints size={16} color="var(--grey-700)" />
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
    </div>
  );
}
