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
  ReferenceLine,
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
  computeFunctionalProfile,
  computeLectureStats,
  computeSegmentDerivedMetrics,
  deduplicateRois,
  flattenTranscript,
  hintLabel,
  interpretLineHeuristics,
  interpretMetricCombo,
  isFlowZone,
  modalityLabel,
  roiHintDescription,
  roiNeuroscienceHint,
  roiResponseLevel,
  segmentTone,
} from "@/lib/simulation";
import MetricGauge from "@/components/simulation/MetricGauge";
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
  const [initialSegment] = useState(() => searchParams.get("segment"));
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptBrowserData | null>(null);
  const [colors, setColors] = useState<SegmentColorPayload | null>(null);
  const [liveFrames, setLiveFrames] = useState<LiveBrainFramePayload | null>(null);
  const [timelineFrames, setTimelineFrames] = useState<LiveTimelineFramePayload | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
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
        if (!simulationResult.live_assets) throw new Error("live_assets missing");
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
  }, [date, initialSegment]);

  const flattenedLines = useMemo(() => {
    if (!transcript || !simulation) return [];
    return flattenTranscript(transcript, simulation);
  }, [simulation, transcript]);

  const currentLine = flattenedLines[currentFrameIndex];
  const currentFrame = liveFrames?.frames[currentFrameIndex];
  const currentTimelineFrame = timelineFrames?.frames[currentFrameIndex];
  const currentSegment = simulation?.segments[currentLine?.segment_index ?? 0];
  const currentColorSegment = colors?.segments[currentFrame?.color_segment_index ?? currentLine?.segment_index ?? 0];
  const timelineData = timelineFrames?.frames ?? [];
  const lectureStats = useMemo(() => {
    if (!timelineData.length) return undefined;
    return computeLectureStats(timelineData);
  }, [timelineData]);
  const segmentFrameBounds = useMemo(() => {
    if (!liveFrames) return new Map<string, { start: number; end: number }>();
    const bounds = new Map<string, { start: number; end: number }>();
    for (const frame of liveFrames.frames) {
      const existing = bounds.get(frame.segment_id);
      if (!existing) {
        bounds.set(frame.segment_id, { start: frame.lecture_seconds, end: frame.lecture_seconds });
      } else {
        existing.start = Math.min(existing.start, frame.lecture_seconds);
        existing.end = Math.max(existing.end, frame.lecture_seconds);
      }
    }
    return bounds;
  }, [liveFrames]);

  const currentSegmentIndex = currentLine?.segment_index ?? 0;
  const nearbyLines = useMemo(() => {
    if (!currentLine) return [];
    const start = Math.max(0, currentFrameIndex - 2);
    const end = Math.min(flattenedLines.length, currentFrameIndex + 3);
    return flattenedLines.slice(start, end);
  }, [currentFrameIndex, currentLine, flattenedLines]);

  useEffect(() => {
    if (!isPlaying || !liveFrames || liveFrames.frames.length === 0) return;
    const frame = liveFrames.frames[currentFrameIndex];
    const nextFrame = liveFrames.frames[currentFrameIndex + 1];
    const baseMs = playbackIntervalMs(frame?.relative_seconds ?? 0, nextFrame?.relative_seconds);
    const timer = window.setTimeout(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % liveFrames.frames.length);
    }, baseMs / playbackSpeed);

    return () => window.clearTimeout(timer);
  }, [currentFrameIndex, isPlaying, liveFrames, playbackSpeed]);

  if (loading) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center" }}>
        <div className="text-body">실시간 시뮬레이션을 준비하는 중이에요...</div>
      </div>
    );
  }

  if (
    error ||
    !simulation ||
    !transcript ||
    !colors ||
    !liveFrames ||
    !timelineFrames ||
    !currentLine ||
    !currentFrame ||
    !currentTimelineFrame ||
    !currentSegment ||
    !currentColorSegment
  ) {
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

  const syncSegmentParam = (segmentId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("segment", segmentId);
    setSearchParams(next, { replace: true });
  };

  const jumpToFrame = (frameIndex: number, syncUrl = true) => {
    const nextIndex = Math.max(0, Math.min(frameIndex, liveFrames.frames.length - 1));
    setIsPlaying(false);
    setCurrentFrameIndex(nextIndex);
    if (syncUrl) {
      syncSegmentParam(liveFrames.frames[nextIndex].segment_id);
    }
  };

  const lineInterpretation = interpretLineHeuristics(currentFrame);
  const derivedMetrics = useMemo(() => {
    if (!transcript || currentSegmentIndex == null) return null;
    const seg = transcript.segments[currentSegmentIndex];
    if (!seg) return null;
    return computeSegmentDerivedMetrics(seg.lines);
  }, [transcript, currentSegmentIndex]);
  const currentMetricSet = {
    attention: timelineData[currentFrameIndex]?.attention_display ?? currentSegment.proxies.attention_proxy,
    load: timelineData[currentFrameIndex]?.load_display ?? currentSegment.proxies.load_proxy,
    novelty: timelineData[currentFrameIndex]?.novelty_display ?? currentSegment.proxies.novelty_proxy,
  };
  const comboInterpretation = interpretMetricCombo(
    currentMetricSet.attention,
    currentMetricSet.load,
    currentMetricSet.novelty,
    lectureStats,
  );
  const currentFlowZone = isFlowZone(currentMetricSet.attention, currentMetricSet.load, currentMetricSet.novelty);

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
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn-secondary" onClick={() => setIsPlaying((prev) => !prev)}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "정지" : "재생"}
              </button>
              <div style={{ display: "flex", gap: 2 }}>
                {[0.5, 1, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    style={{
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: playbackSpeed === speed ? 800 : 600,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid",
                      borderColor: playbackSpeed === speed ? "var(--primary)" : "var(--border)",
                      background: playbackSpeed === speed ? "var(--primary-light)" : "var(--surface)",
                      color: playbackSpeed === speed ? "var(--primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="simulation-brain-shell">
            <BrainCanvas
              meshUrl={simulation.assets.mesh_glb}
              colors={currentColorSegment.hemispheres}
              intensity={currentFrame.heuristic_intensity}
              changeBoost={currentFrame.heuristic_change_boost}
            />
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
                      jumpToFrame(nextIndex);
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
                  const lineIndex = (state as { activePayload?: Array<{ payload?: { line_index?: number } }> } | undefined)
                    ?.activePayload?.[0]?.payload?.line_index;
                  if (typeof lineIndex !== "number") return;
                  jumpToFrame(lineIndex);
                }}
              >
                <CartesianGrid stroke="var(--grey-100)" vertical={false} />
                {simulation.lecture_summary.strongest_segment_ids.map((segmentId) => {
                  const bounds = segmentFrameBounds.get(segmentId);
                  if (!bounds) return null;
                  return (
                    <ReferenceArea
                      key={`strong-${segmentId}`}
                      x1={bounds.start}
                      x2={bounds.end}
                      fill="rgba(255, 107, 0, 0.06)"
                      strokeOpacity={0}
                    />
                  );
                })}
                {simulation.lecture_summary.risk_segment_ids.map((segmentId) => {
                  const bounds = segmentFrameBounds.get(segmentId);
                  if (!bounds) return null;
                  return (
                    <ReferenceArea
                      key={`risk-${segmentId}`}
                      x1={bounds.start}
                      x2={bounds.end}
                      fill="rgba(239, 68, 68, 0.07)"
                      strokeOpacity={0}
                    />
                  );
                })}
                <ReferenceLine
                  x={currentTimelineFrame.lecture_seconds}
                  stroke="var(--primary)"
                  strokeWidth={2}
                />
                <XAxis
                  dataKey="lecture_seconds"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  tickFormatter={(value) => {
                    const minutes = Math.floor(Number(value) / 60);
                    const seconds = Math.floor(Number(value) % 60);
                    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
                  }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <Tooltip
                  formatter={(value, key) => {
                    const numeric = typeof value === "number" ? value : Number(value ?? 0);
                    return [`${numeric.toFixed(1)}`, String(key)];
                  }}
                  labelFormatter={(label) => {
                    const minutes = Math.floor(Number(label) / 60);
                    const seconds = Math.floor(Number(label) % 60);
                    return `재생 위치 ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
                  }}
                />
                <Line type="basis" dataKey="attention_display" stroke="var(--primary)" strokeWidth={2.5} dot={false} name="Attention" connectNulls />
                <Line type="basis" dataKey="load_display" stroke="#ef4444" strokeWidth={2} dot={false} name="Load" connectNulls />
                <Line type="basis" dataKey="novelty_display" stroke="#0f172a" strokeWidth={2} dot={false} name="Novelty" connectNulls />
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
            <div className="simulation-panel-header" style={{ marginTop: 18 }}>
              <div>
                <p className="text-section">지금 읽히는 패턴</p>
                <p className="text-caption">현재 줄에서 왜 이렇게 보이는지 바로 읽어요.</p>
              </div>
              <Link
                to={`/lectures/${date}/simulation/live/transcript?segment=${currentSegment.segment_id}`}
                className="simulation-inline-link"
              >
                <FileText size={16} />
                원문 전체 보기
              </Link>
            </div>

            <div className="simulation-combo-card" style={{
              marginTop: 16,
              background: comboInterpretation.severity === "success" ? "rgba(34,197,94,0.06)" :
                comboInterpretation.severity === "warning" ? "rgba(239,68,68,0.06)" :
                comboInterpretation.severity === "caution" ? "rgba(245,158,11,0.06)" : "var(--grey-50)",
              borderColor: comboInterpretation.severity === "success" ? "rgba(34,197,94,0.2)" :
                comboInterpretation.severity === "warning" ? "rgba(239,68,68,0.2)" :
                comboInterpretation.severity === "caution" ? "rgba(245,158,11,0.2)" : "var(--border)",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span className="simulation-combo-badge" style={{
                    color: comboInterpretation.severity === "success" ? "var(--color-flow)" :
                      comboInterpretation.severity === "warning" ? "var(--color-risk)" :
                      comboInterpretation.severity === "caution" ? "var(--color-caution)" : "var(--grey-700)",
                    background: comboInterpretation.severity === "success" ? "rgba(34,197,94,0.12)" :
                      comboInterpretation.severity === "warning" ? "rgba(239,68,68,0.12)" :
                      comboInterpretation.severity === "caution" ? "rgba(245,158,11,0.12)" : "rgba(51,65,85,0.08)",
                  }}>
                    {comboInterpretation.pattern}
                  </span>
                  {currentFlowZone && (
                    <span className="simulation-flow-indicator" style={{ color: "var(--color-flow)", borderColor: "rgba(34,197,94,0.3)" }}>
                      <Sparkles size={12} />
                      Flow
                    </span>
                  )}
                </div>
                <p className="text-body">{comboInterpretation.diagnosis}</p>
                {comboInterpretation.suggestion && (
                  <p className="text-caption" style={{ marginTop: 6 }}>{comboInterpretation.suggestion}</p>
                )}
              </div>
            </div>

            <div className="simulation-metric-grid" style={{ marginTop: 16 }}>
              <MetricGauge label="Attention" value={currentMetricSet.attention} metric="attention" />
              <MetricGauge label="Load" value={currentMetricSet.load} metric="load" />
              <MetricGauge label="Novelty" value={currentMetricSet.novelty} metric="novelty" />
            </div>

            {derivedMetrics && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <div style={{ padding: "10px 14px", borderRadius: "var(--radius-inner)", background: "var(--grey-50)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-label">리듬 변이</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                      color: derivedMetrics.pacing >= 35 ? "var(--color-flow)" : "var(--color-caution)",
                      background: derivedMetrics.pacing >= 35 ? "rgba(34,197,94,0.10)" : "rgba(245,158,11,0.10)",
                    }}>
                      {derivedMetrics.pacingLabel}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.45 }}>
                    문장 길이 변이 — {derivedMetrics.pacing >= 35 ? "설명에 강약이 있어요" : "단조로운 흐름이에요"}
                  </p>
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "var(--radius-inner)", background: "var(--grey-50)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-label">참여 유도</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                      color: derivedMetrics.engagementCue >= 20 ? "var(--color-flow)" : "var(--color-caution)",
                      background: derivedMetrics.engagementCue >= 20 ? "rgba(34,197,94,0.10)" : "rgba(245,158,11,0.10)",
                    }}>
                      {derivedMetrics.engagementLabel}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.45 }}>
                    질문·예시·격려·전환 — {derivedMetrics.engagementCue >= 20 ? "참여 유도가 활발해요" : "유도 신호가 적어요"}
                  </p>
                </div>
              </div>
            )}

            <div className="simulation-pill-row" style={{ marginTop: 18 }}>
              {segmentTags.map((tag) => (
                <span key={tag} className="simulation-pill">{tag}</span>
              ))}
            </div>

            <div className="simulation-callout" style={{ marginTop: 18 }}>
              <ScanText size={16} />
              <p><strong>{lineInterpretation.dominantSignal}</strong> — {lineInterpretation.microSummary}</p>
            </div>
          </div>

          <div className="card card-padded">
            <div className="simulation-panel-header">
              <div>
                <p className="text-section">뇌 기능 프로필</p>
                <p className="text-caption">단순 크기가 아니라 어떤 뇌 영역이 활발한지 보여줘요.</p>
              </div>
              <span className="simulation-pill">
                <Brain size={14} />
                영역별 해석
              </span>
            </div>

            {(() => {
              const profile = computeFunctionalProfile(
                currentSegment.roi_insights?.top_active_rois,
                currentSegment.roi_insights?.top_changed_rois,
              );
              return (
                <>
                  <div className="simulation-combo-card" style={{
                    marginTop: 14,
                    background: "rgba(255,107,0,0.04)",
                    borderColor: "rgba(255,107,0,0.15)",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="simulation-combo-badge" style={{
                          color: "var(--primary)",
                          background: "rgba(255,107,0,0.12)",
                        }}>
                          {profile.profilePattern}
                        </span>
                      </div>
                      <p className="text-body">{profile.dominantInterpretation}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                    {profile.categories.map((cat) => (
                      <div key={cat.key} style={{
                        display: "grid",
                        gridTemplateColumns: "90px minmax(0, 1fr) 40px",
                        gap: 10,
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: cat.isTop ? "rgba(255,107,0,0.06)" : "var(--grey-50)",
                        border: cat.isTop ? "1px solid rgba(255,107,0,0.15)" : "1px solid transparent",
                      }}>
                        <span style={{
                          fontSize: 12, fontWeight: cat.isTop ? 800 : 600,
                          color: cat.isTop ? "var(--primary)" : "var(--text-secondary)",
                        }}>
                          {cat.label}
                        </span>
                        <div style={{ height: 6, borderRadius: 999, background: "var(--grey-200)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 999,
                            width: `${Math.max(3, cat.value)}%`,
                            background: cat.isTop ? "var(--primary)" : "var(--grey-400)",
                            transition: "width 0.3s ease",
                          }} />
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 700, textAlign: "right",
                          color: cat.isTop ? "var(--primary)" : "var(--text-muted)",
                        }}>
                          {cat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            <div className="simulation-summary-selected" style={{ marginTop: 14 }}>
              <p className="text-label">영역별 해석 근거</p>
              <p className="text-body" style={{ marginTop: 8 }}>{currentSegment.roi_insights?.summary_text}</p>
              {currentSegment.roi_insights?.top_active_rois[0] && (
                <p className="text-caption" style={{ marginTop: 6 }}>
                  {roiNeuroscienceHint(currentSegment.roi_insights?.top_active_rois[0].functional_hint)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
