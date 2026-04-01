import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Brain, Pause, Play } from "lucide-react";
import { getSimulation, getSimulationLiveFrames, getSimulationTranscript } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { flattenTranscript } from "@/lib/simulation";
import type { LiveBrainFramePayload, SimulationResult, TranscriptBrowserData } from "@/types/simulation";

/* ─── Constants ─── */

const PLAYBACK_SPEEDS = [0.5, 1, 2] as const;

/* ─── Helpers ─── */

function playbackIntervalMs(currentSec: number, nextSec: number | undefined): number {
  if (typeof nextSec !== "number") return 900;
  const delta = Math.max(1, nextSec - currentSec);
  return Math.min(1600, Math.max(650, delta * 130));
}

/* ─── Component ─── */

export default function LectureSimulationTranscriptPage() {
  const { date = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialSegment] = useState(() => searchParams.get("segment"));

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptBrowserData | null>(null);
  const [liveFrames, setLiveFrames] = useState<LiveBrainFramePayload | null>(null);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const lineRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* ── Data fetch ── */

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([getSimulation(date), getSimulationTranscript(date)])
      .then(async ([sim, trans]) => {
        if (!sim.live_assets) throw new Error("live_assets missing");
        const payload = await getSimulationLiveFrames(sim.live_assets.brain_frames_json);
        if (cancelled) return;

        setSimulation(sim);
        setTranscript(trans);
        setLiveFrames(payload);

        if (initialSegment) {
          const idx = payload.frames.findIndex((f) => f.segment_id === initialSegment);
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
  const currentSegment = simulation?.segments[currentLine?.segment_index ?? 0];

  /* ── Auto-scroll to active line ── */

  useEffect(() => {
    if (!currentLine) return;
    const key = `${currentLine.segment_id}-${currentLine.line_index}`;
    lineRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentLine]);

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

  /* ── Navigation ── */

  const syncSegmentParam = (segmentId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("segment", segmentId);
    setSearchParams(next, { replace: true });
  };

  const jumpToFrame = (idx: number) => {
    if (!liveFrames) return;
    const clamped = Math.max(0, Math.min(idx, liveFrames.frames.length - 1));
    setIsPlaying(false);
    setCurrentFrameIndex(clamped);
    syncSegmentParam(liveFrames.frames[clamped].segment_id);
  };

  /* ── Loading / Error ── */

  if (loading) {
    return (
      <div className="sim-empty-state">
        <p className="text-body">준비 중...</p>
      </div>
    );
  }

  if (error || !simulation || !transcript || !liveFrames || !currentLine || !currentSegment) {
    return (
      <div className="sim-empty-state">
        <p className="text-body">{error || "데이터가 준비되지 않았습니다"}</p>
        <Link to={`/lectures/${date}/simulation`} className="btn-secondary">돌아가기</Link>
      </div>
    );
  }

  /* ── Render ── */

  return (
    <div className="page-content">
      {/* Header */}
      <div className="sim-header">
        <Link
          to={`/lectures/${date}/simulation/live?segment=${currentSegment.segment_id}`}
          className="simulation-inline-link"
        >
          <ArrowLeft size={16} />
          실시간 보기
        </Link>
        <h1 className="simulation-title">{simulation.metadata.subject} 원문</h1>
        <div className="simulation-meta-row">
          <span>{formatDate(simulation.lecture_date)}</span>
          <span>·</span>
          <span>{simulation.metadata.instructor}</span>
        </div>
      </div>

      {/* Tab bar + playback controls */}
      <div className="sim-tab-row">
        <div className="tab-bar" role="tablist">
          <Link to={`/lectures/${date}/simulation`} className="tab-item">요약</Link>
          <Link
            to={`/lectures/${date}/simulation/live?segment=${currentSegment.segment_id}`}
            className="tab-item"
          >
            실시간
          </Link>
          <button className="tab-item active" aria-selected="true">원문</button>
        </div>
        <div className="sim-playback">
          <button className="btn-secondary" onClick={() => setIsPlaying((p) => !p)}>
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
      </div>

      {/* Two-column layout */}
      <div className="simulation-reading-grid">
        {/* Left: Segment nav */}
        <aside className="sim-segment-nav">
          {transcript.segments.map((seg, i) => {
            const active = i === currentLine.segment_index;
            return (
              <button
                key={seg.segment_id}
                className={`sim-segment-item${active ? " sim-segment-item-active" : ""}`}
                onClick={() => {
                  const idx = liveFrames.frames.findIndex((f) => f.segment_id === seg.segment_id);
                  if (idx >= 0) jumpToFrame(idx);
                }}
              >
                <span className="sim-segment-item-id">{seg.segment_id}</span>
                <span className="text-caption">{seg.lines.length}줄</span>
              </button>
            );
          })}
        </aside>

        {/* Right: Content */}
        <div className="sim-transcript-main">
          {/* Current line card */}
          <div className="sim-current-line-card">
            <div className="sim-section-header">
              <span className="text-section">현재 줄</span>
              <Link
                to={`/lectures/${date}/simulation/live?segment=${currentSegment.segment_id}`}
                className="simulation-inline-link"
              >
                <Brain size={14} />
                3D 보기
              </Link>
            </div>
            <div className="simulation-live-now-card">
              <span className="simulation-mini-meta">{currentSegment.segment_id} · {currentLine.timestamp}</span>
              <p className="sim-current-text">{currentLine.text}</p>
            </div>
            {currentSegment.roi_insights?.summary_text && (
              <p className="text-caption">{currentSegment.roi_insights.summary_text}</p>
            )}
          </div>

          {/* Transcript reader */}
          <div className="sim-transcript-reader">
            <span className="text-section">전체 원문</span>

            {transcript.segments.map((seg, segIdx) => {
              const isActiveSeg = segIdx === currentLine.segment_index;
              return (
                <div
                  key={seg.segment_id}
                  className={`sim-transcript-segment${isActiveSeg ? " sim-transcript-segment-active" : ""}`}
                >
                  <div className="sim-section-header">
                    <span className="text-section">{seg.segment_id}</span>
                    <span className="text-caption">{seg.start_time} – {seg.end_time}</span>
                  </div>

                  <div className="sim-transcript-lines">
                    {seg.lines.map((line, lineIdx) => {
                      const active = (line.frame_index ?? 0) === currentFrameIndex;
                      const refKey = `${seg.segment_id}-${lineIdx}`;
                      return (
                        <button
                          key={refKey}
                          ref={(el) => { lineRefs.current[refKey] = el; }}
                          className={`simulation-line-row${active ? " simulation-line-row-active" : ""}`}
                          onClick={() => jumpToFrame(line.frame_index ?? 0)}
                        >
                          <span className="simulation-line-row-time">{line.timestamp}</span>
                          <div className="simulation-line-row-copy">
                            <span className="simulation-line-row-speaker">{line.speaker}</span>
                            <p className="simulation-line-row-text">{line.text}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
