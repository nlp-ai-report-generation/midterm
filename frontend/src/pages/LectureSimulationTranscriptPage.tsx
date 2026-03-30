import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Brain, FileText, Layers3, Pause, Play, Sparkles, Waypoints } from "lucide-react";
import { getSimulation, getSimulationLiveFrames, getSimulationTranscript } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { buildSegmentTags, flattenTranscript, hintLabel } from "@/lib/simulation";
import type { LiveBrainFramePayload, SimulationResult, TranscriptBrowserData } from "@/types/simulation";

function playbackIntervalMs(currentRelativeSeconds: number, nextRelativeSeconds: number | undefined) {
  if (typeof nextRelativeSeconds !== "number") return 900;
  const delta = Math.max(1, nextRelativeSeconds - currentRelativeSeconds);
  return Math.min(1600, Math.max(650, delta * 130));
}

export default function LectureSimulationTranscriptPage() {
  const { date = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialSegment] = useState(() => searchParams.get("segment"));
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptBrowserData | null>(null);
  const [liveFrames, setLiveFrames] = useState<LiveBrainFramePayload | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lineRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([getSimulation(date), getSimulationTranscript(date)])
      .then(async ([simulationResult, transcriptResult]) => {
        const liveFramePayload = await getSimulationLiveFrames(simulationResult.live_assets.brain_frames_json);
        if (cancelled) return;
        setSimulation(simulationResult);
        setTranscript(transcriptResult);
        setLiveFrames(liveFramePayload);

        if (initialSegment) {
          const frameIndex = liveFramePayload.frames.findIndex((frame) => frame.segment_id === initialSegment);
          setCurrentFrameIndex(frameIndex >= 0 ? frameIndex : 0);
        } else {
          setCurrentFrameIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) setError("원문 브라우저를 불러오지 못했어요");
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
  const currentSegment = simulation?.segments[currentLine?.segment_index ?? 0];

  useEffect(() => {
    if (!currentLine) return;
    const key = `${currentLine.segment_id}-${currentLine.line_index}`;
    lineRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [currentLine]);

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
        <div className="text-body">원문 브라우저를 준비하는 중이에요...</div>
      </div>
    );
  }

  if (error || !simulation || !transcript || !liveFrames || !currentLine || !currentSegment) {
    return (
      <div className="card card-padded" style={{ minHeight: 280, display: "grid", placeItems: "center", gap: 12 }}>
        <div className="text-body">{error || "원문 브라우저가 아직 준비되지 않았어요"}</div>
        <Link to={`/lectures/${date}/simulation`} className="btn-secondary">
          요약 화면으로 돌아가기
        </Link>
      </div>
    );
  }

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

  return (
    <div className="page-content">
      <div className="simulation-hero">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="simulation-pill-row">
            <span className="simulation-pill simulation-pill-primary">
              <Sparkles size={14} />
              원문 보기
            </span>
            <span className="simulation-pill">
              <FileText size={14} />
              라인 단위 동기화
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to={`/lectures/${date}/simulation/live?segment=${currentSegment.segment_id}`} className="simulation-inline-link">
              <ArrowLeft size={16} />
              실시간 보기로 돌아가기
            </Link>
            <h1 className="simulation-title">{simulation.metadata.subject} 원문 브라우저</h1>
            <p className="text-body" style={{ maxWidth: 740 }}>
              지금 읽는 줄이 어느 구간에 있는지 바로 확인하고, 같은 위치의 반응 요약을 함께 따라갈 수 있어요.
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
          <div className="simulation-panel-header">
            <div>
              <p className="text-label">Brain Sync Summary</p>
              <p className="text-caption">{currentSegment.segment_id} · {currentLine.timestamp}</p>
            </div>
            <button className="btn-secondary" onClick={() => setIsPlaying((prev) => !prev)}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "일시정지" : "재생하기"}
            </button>
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
            {buildSegmentTags(simulation, currentLine.segment_index).map((tag) => (
              <span key={tag} className="simulation-pill">{tag}</span>
            ))}
          </div>
          <p className="text-body" style={{ marginTop: 18 }}>{currentSegment.roi_insights.summary_text}</p>
        </div>
      </div>

      <div className="tab-bar" role="tablist">
        <Link to={`/lectures/${date}/simulation`} className="tab-item" style={{ display: "inline-flex", alignItems: "center" }}>
          요약 보기
        </Link>
        <Link to={`/lectures/${date}/simulation/live?segment=${currentSegment.segment_id}`} className="tab-item" style={{ display: "inline-flex", alignItems: "center" }}>
          실시간 보기
        </Link>
        <button className="tab-item active" aria-selected="true">원문 보기</button>
      </div>

      <div className="simulation-transcript-grid">
        <aside className="card card-padded simulation-segment-nav">
          <div className="simulation-panel-header">
            <div>
              <p className="text-section">세그먼트 이동</p>
              <p className="text-caption">구간별로 원문을 빠르게 이동할 수 있어요.</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            {transcript.segments.map((segment, segmentIndex) => {
              const active = segmentIndex === currentLine.segment_index;
              return (
                <button
                  key={segment.segment_id}
                  onClick={() => {
                    const nextFrameIndex = liveFrames.frames.findIndex((frame) => frame.segment_id === segment.segment_id);
                    if (nextFrameIndex >= 0) {
                      jumpToFrame(nextFrameIndex);
                    }
                  }}
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
                <p className="text-section">현재 구간 해석</p>
                <p className="text-caption">라인 위치와 같은 구간의 영역 패턴을 같이 봐요.</p>
              </div>
              <Link to={`/lectures/${date}/simulation/live?segment=${currentSegment.segment_id}`} className="simulation-inline-link">
                <Brain size={16} />
                3D로 보기
              </Link>
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
                        <p className="text-section" style={{ fontSize: 14 }}>{hintLabel(roi.functional_hint)}</p>
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
                        <p className="text-section" style={{ fontSize: 14 }}>{hintLabel(roi.functional_hint)}</p>
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
                <p className="text-caption">현재 줄을 기준으로 자동 스크롤과 하이라이트가 같이 움직여요.</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              {transcript.segments.map((segment, segmentIndex) => (
                <div
                  key={segment.segment_id}
                  className="simulation-transcript-card"
                  style={{
                    borderColor: segmentIndex === currentLine.segment_index ? "var(--primary)" : "var(--border)",
                    background: segmentIndex === currentLine.segment_index ? "linear-gradient(180deg, rgba(255,244,235,0.8), rgba(255,255,255,1))" : "var(--surface)",
                  }}
                >
                  <div className="simulation-panel-header">
                    <div>
                      <p className="text-section">{segment.segment_id}</p>
                      <p className="text-caption">{segment.start_time} - {segment.end_time}</p>
                    </div>
                    <div className="simulation-pill-row">
                      {buildSegmentTags(simulation, segmentIndex).map((tag) => (
                        <span key={`${segment.segment_id}-${tag}`} className="simulation-pill">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
                    {segment.lines.map((line, lineIndex) => {
                      const active = (line.frame_index ?? 0) === currentFrameIndex;
                      const refKey = `${segment.segment_id}-${lineIndex}`;
                      return (
                        <button
                          key={`${segment.segment_id}-${lineIndex}`}
                          ref={(element) => {
                            lineRefs.current[refKey] = element;
                          }}
                          className="simulation-live-line-button"
                          style={{
                            borderColor: active ? "rgba(255, 107, 0, 0.22)" : "transparent",
                            background: active ? "rgba(255, 107, 0, 0.08)" : "transparent",
                          }}
                      onClick={() => {
                        jumpToFrame(line.frame_index ?? 0);
                      }}
                    >
                          <span className="simulation-transcript-time">{line.timestamp}</span>
                          <span className="simulation-transcript-speaker">{line.speaker}</span>
                          <p className="text-body" style={{ flex: 1 }}>{line.text}</p>
                        </button>
                      );
                    })}
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
