import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Brain, FileText, Pause, Play } from "lucide-react";
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
  computeFunctionalProfile,
  computeLectureStats,
  flattenTranscript,
  interpretLineHeuristics,
  interpretMetricCombo,
  isFlowZone,
  roiNeuroscienceHint,
} from "@/lib/simulation";
import MetricGauge from "@/components/simulation/MetricGauge";
import type {
  LiveBrainFramePayload,
  LiveTimelineFramePayload,
  SegmentColorPayload,
  SimulationResult,
  TranscriptBrowserData,
} from "@/types/simulation";

/* ─── Constants ─── */

const PLAYBACK_SPEEDS = [0.5, 1, 2] as const;
const MAX_SEGMENT_JUMPS = 4;
const CHART_HEIGHT = 220;
const CHART_MARGIN = { top: 10, right: 8, left: -20, bottom: 0 };

/* ─── Helpers ─── */

function playbackIntervalMs(
  currentSec: number,
  nextSec: number | undefined,
): number {
  if (typeof nextSec !== "number") return 900;
  const delta = Math.max(1, nextSec - currentSec);
  return Math.min(1600, Math.max(650, delta * 130));
}

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ─── Component ─── */

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

  /* ── Data fetch ── */

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([getSimulation(date), getSimulationTranscript(date)])
      .then(async ([sim, trans]) => {
        if (!sim.live_assets) throw new Error("live_assets missing");
        const [colorPayload, livePayload, timelinePayload] = await Promise.all([
          getSimulationColors(sim.assets.segment_colors_json),
          getSimulationLiveFrames(sim.live_assets.brain_frames_json),
          getSimulationTimelineFrames(sim.live_assets.timeline_frames_json),
        ]);
        if (cancelled) return;

        setSimulation(sim);
        setTranscript(trans);
        setColors(colorPayload);
        setLiveFrames(livePayload);
        setTimelineFrames(timelinePayload);

        if (initialSegment) {
          const idx = livePayload.frames.findIndex((f) => f.segment_id === initialSegment);
          setCurrentFrameIndex(idx >= 0 ? idx : 0);
        }
      })
      .catch(() => {
        if (!cancelled) setError("데이터를 불러오지 못했습니다");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [date, initialSegment]);

  /* ── Derived state ── */

  const flattenedLines = useMemo(
    () => (transcript && simulation ? flattenTranscript(transcript, simulation) : []),
    [simulation, transcript],
  );

  const currentLine = flattenedLines[currentFrameIndex];
  const currentFrame = liveFrames?.frames[currentFrameIndex];
  const currentTimelineFrame = timelineFrames?.frames[currentFrameIndex];
  const currentSegment = simulation?.segments[currentLine?.segment_index ?? 0];
  const currentColorSegment =
    colors?.segments[currentFrame?.color_segment_index ?? currentLine?.segment_index ?? 0];
  const timelineData = timelineFrames?.frames ?? [];

  const lectureStats = useMemo(
    () => (timelineData.length ? computeLectureStats(timelineData) : undefined),
    [timelineData],
  );

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

  const jumpSegmentIds = useMemo(() => {
    if (!simulation) return [];
    return simulation.lecture_summary.strongest_segment_ids
      .concat(simulation.lecture_summary.risk_segment_ids)
      .slice(0, MAX_SEGMENT_JUMPS);
  }, [simulation]);

  /* ── Playback ── */

  useEffect(() => {
    if (!isPlaying || !liveFrames || !liveFrames.frames.length) return;
    const frame = liveFrames.frames[currentFrameIndex];
    const next = liveFrames.frames[currentFrameIndex + 1];
    const ms = playbackIntervalMs(frame?.relative_seconds ?? 0, next?.relative_seconds);
    const timer = window.setTimeout(
      () => setCurrentFrameIndex((prev) => (prev + 1) % liveFrames.frames.length),
      ms / playbackSpeed,
    );
    return () => window.clearTimeout(timer);
  }, [currentFrameIndex, isPlaying, liveFrames, playbackSpeed]);

  /* ── Navigation helpers ── */

  const syncSegmentParam = (segmentId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("segment", segmentId);
    setSearchParams(next, { replace: true });
  };

  const jumpToFrame = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, (liveFrames?.frames.length ?? 1) - 1));
    setIsPlaying(false);
    setCurrentFrameIndex(clamped);
    if (liveFrames) syncSegmentParam(liveFrames.frames[clamped].segment_id);
  };

  /* ── Loading / Error ── */

  if (loading) {
    return (
      <div className="sim-empty-state">
        <p className="text-body">준비 중...</p>
      </div>
    );
  }

  if (
    error || !simulation || !transcript || !colors || !liveFrames || !timelineFrames ||
    !currentLine || !currentFrame || !currentTimelineFrame || !currentSegment || !currentColorSegment
  ) {
    return (
      <div className="sim-empty-state">
        <p className="text-body">{error || "데이터가 준비되지 않았습니다"}</p>
        <Link to={`/lectures/${date}/simulation`} className="btn-secondary">돌아가기</Link>
      </div>
    );
  }

  /* ── Interpretation ── */

  const lineInterp = interpretLineHeuristics(currentFrame);
  const metrics = {
    attention: currentTimelineFrame.attention_display ?? currentSegment.proxies.attention_proxy,
    load: currentTimelineFrame.load_display ?? currentSegment.proxies.load_proxy,
    novelty: currentTimelineFrame.novelty_display ?? currentSegment.proxies.novelty_proxy,
  };
  const combo = interpretMetricCombo(metrics.attention, metrics.load, metrics.novelty, lectureStats);
  const inFlowZone = isFlowZone(metrics.attention, metrics.load, metrics.novelty);

  /* ── Render ── */

  return (
    <div className="page-content">
      {/* Header */}
      <div className="sim-header">
        <Link to={`/lectures/${date}/simulation`} className="simulation-inline-link">
          <ArrowLeft size={16} />
          요약
        </Link>
        <h1 className="simulation-title">{simulation.metadata.subject}</h1>
        <div className="simulation-meta-row">
          <span>{formatDate(simulation.lecture_date)}</span>
          <span>·</span>
          <span>{simulation.metadata.instructor}</span>
          <span>·</span>
          <span>{liveFrames.frames.length}줄</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" role="tablist">
        <Link to={`/lectures/${date}/simulation`} className="tab-item">요약</Link>
        <button className="tab-item active" aria-selected="true">실시간</button>
        <Link
          to={`/lectures/${date}/simulation/live/transcript?segment=${currentSegment.segment_id}`}
          className="tab-item"
        >
          원문
        </Link>
      </div>

      {/* Main two-column layout */}
      <div className="simulation-main-grid">

        {/* Left: Brain + Controls */}
        <div className="sim-stage">
          {/* Brain 3D */}
          <div className="simulation-brain-shell">
            <BrainCanvas
              meshUrl={simulation.assets.mesh_glb}
              colors={currentColorSegment.hemispheres}
              intensity={currentFrame.heuristic_intensity}
              changeBoost={currentFrame.heuristic_change_boost}
            />
          </div>

          {/* Controls */}
          <div className="sim-controls">
            <div className="sim-controls-top">
              <div className="sim-playback">
                <button
                  className="btn-secondary"
                  onClick={() => setIsPlaying((p) => !p)}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "정지" : "재생"}
                </button>
                <div className="simulation-speed-group">
                  {PLAYBACK_SPEEDS.map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`simulation-speed-button${playbackSpeed === spd ? " simulation-speed-button-active" : ""}`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
              <span className="sim-frame-counter">
                {currentFrameIndex + 1} / {liveFrames.frames.length}
              </span>
            </div>
            <input
              className="progress-bar"
              type="range"
              min={0}
              max={liveFrames.frames.length - 1}
              value={currentFrameIndex}
              onChange={(e) => jumpToFrame(Number(e.target.value))}
            />
            <div className="sim-segment-jumps">
              {jumpSegmentIds.map((id) => (
                <button
                  key={id}
                  className={`simulation-pill-button${id === currentSegment.segment_id ? " simulation-pill-button-active" : ""}`}
                  onClick={() => {
                    const idx = liveFrames.frames.findIndex((f) => f.segment_id === id);
                    if (idx >= 0) jumpToFrame(idx);
                  }}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="sim-divider" />

          {/* Timeline Chart */}
          <div className="sim-timeline-section">
            <div className="sim-section-header">
              <span className="text-section">타임라인</span>
              <Link
                to={`/lectures/${date}/simulation/live/transcript?segment=${currentSegment.segment_id}`}
                className="simulation-inline-link"
              >
                <FileText size={14} />
                원문
              </Link>
            </div>
            <div className="sim-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineData}
                  margin={CHART_MARGIN}
                  onClick={(state) => {
                    const idx = (state as { activePayload?: Array<{ payload?: { line_index?: number } }> } | undefined)
                      ?.activePayload?.[0]?.payload?.line_index;
                    if (typeof idx === "number") jumpToFrame(idx);
                  }}
                >
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                  {simulation.lecture_summary.strongest_segment_ids.map((id) => {
                    const b = segmentFrameBounds.get(id);
                    return b ? (
                      <ReferenceArea key={`s-${id}`} x1={b.start} x2={b.end} fill="var(--chart-strong-fill)" strokeOpacity={0} />
                    ) : null;
                  })}
                  {simulation.lecture_summary.risk_segment_ids.map((id) => {
                    const b = segmentFrameBounds.get(id);
                    return b ? (
                      <ReferenceArea key={`r-${id}`} x1={b.start} x2={b.end} fill="var(--chart-risk-fill)" strokeOpacity={0} />
                    ) : null;
                  })}
                  <ReferenceLine x={currentTimelineFrame.lecture_seconds} stroke="var(--primary)" strokeWidth={2} />
                  <XAxis
                    dataKey="lecture_seconds"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
                    tickFormatter={formatSeconds}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} />
                  <Tooltip
                    formatter={(v, k) => [`${(typeof v === "number" ? v : Number(v ?? 0)).toFixed(1)}`, String(k)]}
                    labelFormatter={(l) => formatSeconds(Number(l))}
                  />
                  <Line type="basis" dataKey="attention_display" stroke="var(--primary)" strokeWidth={2} dot={false} name="Attention" connectNulls />
                  <Line type="basis" dataKey="load_display" stroke="var(--grey-800)" strokeWidth={1.5} dot={false} name="Load" connectNulls />
                  <Line type="basis" dataKey="novelty_display" stroke="var(--grey-400)" strokeWidth={1.5} dot={false} name="Novelty" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Insight panel */}
        <aside className="sim-insight">
          {/* Current text */}
          <section className="sim-insight-section">
            <div className="sim-section-header">
              <span className="simulation-pill simulation-pill-primary">{currentSegment.segment_id}</span>
              <span className="text-caption">{currentLine.timestamp}</span>
            </div>
            <div className="simulation-live-now-card">
              <p className="text-body">{currentLine.text}</p>
            </div>
            <p className="text-caption">
              <strong>{lineInterp.dominantSignal}</strong> — {lineInterp.microSummary}
            </p>
          </section>

          <hr className="sim-divider" />

          {/* Pattern diagnosis */}
          <section className="sim-insight-section">
            <div className="sim-section-header">
              <span className="text-section">패턴</span>
              {inFlowZone && <span className="sim-flow-badge">Flow</span>}
            </div>
            <div className="sim-pattern-card">
              <span className="sim-pattern-label">{combo.pattern}</span>
              <p className="text-body">{combo.diagnosis}</p>
              {combo.suggestion && <p className="text-caption">{combo.suggestion}</p>}
            </div>
          </section>

          <hr className="sim-divider" />

          {/* Metrics */}
          <section className="sim-insight-section">
            <span className="text-section">지표</span>
            <div className="simulation-metric-grid">
              <MetricGauge label="Attention" value={metrics.attention} metric="attention" />
              <MetricGauge label="Load" value={metrics.load} metric="load" />
              <MetricGauge label="Novelty" value={metrics.novelty} metric="novelty" />
            </div>
          </section>

          <hr className="sim-divider" />

          {/* Brain functional profile */}
          <section className="sim-insight-section">
            <div className="sim-section-header">
              <span className="text-section">뇌 기능 프로필</span>
              <Brain size={14} className="text-muted" />
            </div>

            {(() => {
              const profile = computeFunctionalProfile(
                currentSegment.roi_insights?.top_active_rois,
                currentSegment.roi_insights?.top_changed_rois,
              );
              return (
                <>
                  <div className="sim-pattern-card">
                    <span className="sim-pattern-label">{profile.profilePattern}</span>
                    <p className="text-body">{profile.dominantInterpretation}</p>
                  </div>

                  <div className="sim-roi-bars">
                    {profile.categories.map((cat) => (
                      <div key={cat.key} className={`sim-roi-bar-row${cat.isTop ? " sim-roi-bar-row-top" : ""}`}>
                        <span className="sim-roi-bar-label">{cat.label}</span>
                        <div className="sim-roi-bar-track">
                          <div
                            className="sim-roi-bar-fill"
                            style={{ width: `${Math.max(3, cat.value)}%` }}
                          />
                        </div>
                        <span className="sim-roi-bar-value">{cat.value}</span>
                      </div>
                    ))}
                  </div>

                  {currentSegment.roi_insights?.summary_text && (
                    <p className="text-caption">{currentSegment.roi_insights.summary_text}</p>
                  )}
                  {currentSegment.roi_insights?.top_active_rois?.[0] && (
                    <p className="text-caption" style={{ opacity: 0.7 }}>
                      {roiNeuroscienceHint(currentSegment.roi_insights.top_active_rois[0].functional_hint)}
                    </p>
                  )}
                </>
              );
            })()}
          </section>
        </aside>
      </div>
    </div>
  );
}
