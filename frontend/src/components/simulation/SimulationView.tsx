import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Brain, Pause, Play } from "lucide-react";
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
  learningEfficiency,
  mindWanderingRisk,
  roiNeuroscienceHint,
  segmentHealthScore,
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
const SPEEDS = [0.5, 1, 2] as const;
const MAX_JUMPS = 4;
const CHART_MARGIN = { top: 10, right: 8, left: -20, bottom: 0 };

function pbMs(cur: number, nxt: number | undefined): number {
  if (typeof nxt !== "number") return 900;
  return Math.min(1600, Math.max(650, Math.max(1, nxt - cur) * 130));
}
function fmtSec(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

interface SimulationViewProps {
  date: string;
}

/* ─── Component ─── */
export default function SimulationView({ date }: SimulationViewProps) {
  const [sp, setSp] = useSearchParams();
  const [initSeg] = useState(() => sp.get("segment"));

  const [sim, setSim] = useState<SimulationResult | null>(null);
  const [trans, setTrans] = useState<TranscriptBrowserData | null>(null);
  const [colors, setColors] = useState<SegmentColorPayload | null>(null);
  const [liveFrames, setLiveFrames] = useState<LiveBrainFramePayload | null>(null);
  const [tlFrames, setTlFrames] = useState<LiveTimelineFramePayload | null>(null);
  const [fi, setFi] = useState(0); // frame index
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /* ── fetch ── */
  useEffect(() => {
    if (!date) return;
    let c = false;
    setLoading(true);
    setErr("");
    Promise.all([getSimulation(date), getSimulationTranscript(date)])
      .then(async ([s, t]) => {
        if (!s.live_assets) throw new Error("live_assets missing");
        const [cp, lp, tp] = await Promise.all([
          getSimulationColors(s.assets.segment_colors_json),
          getSimulationLiveFrames(s.live_assets.brain_frames_json),
          getSimulationTimelineFrames(s.live_assets.timeline_frames_json),
        ]);
        if (c) return;
        setSim(s); setTrans(t); setColors(cp); setLiveFrames(lp); setTlFrames(tp);
        if (initSeg) { const i = lp.frames.findIndex((f) => f.segment_id === initSeg); setFi(i >= 0 ? i : 0); }
      })
      .catch(() => { if (!c) setErr("데이터를 불러오지 못했습니다"); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, [date, initSeg]);

  /* ── derived ── */
  const lines = useMemo(() => (trans && sim ? flattenTranscript(trans, sim) : []), [sim, trans]);
  const line = lines[fi];
  const frame = liveFrames?.frames[fi];
  const tlFrame = tlFrames?.frames[fi];
  const seg = sim?.segments[line?.segment_index ?? 0];
  const colorSeg = colors?.segments[frame?.color_segment_index ?? line?.segment_index ?? 0];
  const tlData = tlFrames?.frames ?? [];
  const stats = useMemo(() => (tlData.length ? computeLectureStats(tlData) : undefined), [tlData]);
  const bounds = useMemo(() => {
    if (!liveFrames) return new Map<string, { start: number; end: number }>();
    const m = new Map<string, { start: number; end: number }>();
    for (const f of liveFrames.frames) { const e = m.get(f.segment_id); if (!e) m.set(f.segment_id, { start: f.lecture_seconds, end: f.lecture_seconds }); else { e.start = Math.min(e.start, f.lecture_seconds); e.end = Math.max(e.end, f.lecture_seconds); } }
    return m;
  }, [liveFrames]);
  const jumpIds = useMemo(() => sim ? [...sim.lecture_summary.strongest_segment_ids, ...sim.lecture_summary.risk_segment_ids].slice(0, MAX_JUMPS) : [], [sim]);

  /* ── playback ── */
  useEffect(() => {
    if (!playing || !liveFrames?.frames.length) return;
    const f = liveFrames.frames[fi]; const n = liveFrames.frames[fi + 1];
    const t = window.setTimeout(() => setFi((p) => (p + 1) % liveFrames.frames.length), pbMs(f?.relative_seconds ?? 0, n?.relative_seconds) / speed);
    return () => window.clearTimeout(t);
  }, [fi, playing, liveFrames, speed]);

  const jump = (idx: number) => {
    if (!liveFrames) return;
    const v = Math.max(0, Math.min(idx, liveFrames.frames.length - 1));
    setPlaying(false); setFi(v);
    const p = new URLSearchParams(sp); p.set("segment", liveFrames.frames[v].segment_id); setSp(p, { replace: true });
  };

  /* ── guards ── */
  if (loading) return <div className="sim-empty"><p>준비 중...</p></div>;
  if (err || !sim || !trans || !colors || !liveFrames || !tlFrames || !line || !frame || !tlFrame || !seg || !colorSeg)
    return <div className="sim-empty"><p>{err || "데이터가 준비되지 않았습니다"}</p></div>;

  /* ── compute ── */
  const interp = interpretLineHeuristics(frame);
  const a = tlFrame.attention_display ?? seg.proxies.attention_proxy;
  const l = tlFrame.load_display ?? seg.proxies.load_proxy;
  const n = tlFrame.novelty_display ?? seg.proxies.novelty_proxy;
  const combo = interpretMetricCombo(a, l, n, stats);
  const flow = isFlowZone(a, l, n);
  const profile = computeFunctionalProfile(seg.roi_insights?.top_active_rois, seg.roi_insights?.top_changed_rois);
  const efficiency = learningEfficiency(a, l);
  const wandering = mindWanderingRisk(a, l);
  const health = segmentHealthScore(seg);

  return (
    <div className="sim-page">
      {/* ─── Toolbar (no back link — we're inside a tab) ─── */}
      <div className="sim-toolbar">
        <span className="sim-toolbar-title">{sim.metadata.subject}</span>
        <div className="sim-toolbar-controls">
          <button className="sim-play" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
          <div className="sim-speeds">{SPEEDS.map((s) => <button key={s} onClick={() => setSpeed(s)} className={`sim-spd${speed === s ? " on" : ""}`}>{s}x</button>)}</div>
          <span className="sim-counter">{fi + 1}/{liveFrames.frames.length}</span>
        </div>
      </div>

      {/* ─── Main 2-column layout ─── */}
      <div className="sim-main">
        {/* Left: Brain 3D + controls */}
        <div className="sim-brain-panel">
          <div className="sim-brain">
            <BrainCanvas meshUrl={sim.assets.mesh_glb} colors={colorSeg.hemispheres} intensity={frame.heuristic_intensity} changeBoost={frame.heuristic_change_boost} />
          </div>
          <div className="sim-brain-controls">
            <div className="sim-ctrl-bar">
              <span className="sim-seg-pill">{seg.segment_id}</span>
              <span className="sim-ts">{line.timestamp}</span>
              <span className="sim-meta-date">{formatDate(sim.lecture_date)}</span>
            </div>
            <input className="sim-scrub" type="range" min={0} max={liveFrames.frames.length - 1} value={fi} onChange={(e) => jump(Number(e.target.value))} />
            <div className="sim-jumps">{jumpIds.map((id) => <button key={id} className={`sim-jmp${id === seg.segment_id ? " on" : ""}`} onClick={() => { const i = liveFrames.frames.findIndex((f) => f.segment_id === id); if (i >= 0) jump(i); }}>{id}</button>)}</div>
          </div>
        </div>

        {/* Right: Insight panel (scrollable) */}
        <div className="sim-insight-panel">
          {/* 현재 텍스트 + 신호 */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">현재 텍스트</p>
            <p className="sim-now-text">{line.text}</p>
            <p className="sim-now-signal"><strong>{interp.dominantSignal}</strong> — {interp.microSummary}</p>
          </div>

          {/* 패턴 진단 */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">패턴 진단</p>
            <div className="sim-card-badge-row">
              <span className="sim-badge-accent">{combo.pattern}</span>
              {flow && <span className="sim-badge-flow">Flow</span>}
            </div>
            <p className="sim-card-desc">{combo.diagnosis}</p>
            {combo.suggestion && <p className="sim-card-sub">{combo.suggestion}</p>}
          </div>

          {/* 뇌 기능 프로필 */}
          <div className="sim-insight-section">
            <div className="sim-card-badge-row">
              <p className="sim-card-lbl">뇌 기능 프로필</p>
              <Brain size={14} />
            </div>
            <span className="sim-badge-accent">{profile.profilePattern}</span>
            <p className="sim-card-desc">{profile.dominantInterpretation}</p>
            <div className="sim-bars">
              {profile.categories.map((c) => (
                <div key={c.key} className={`sim-bar-row${c.isTop ? " top" : ""}`}>
                  <span className="sim-bar-lbl">{c.label}</span>
                  <div className="sim-bar-track"><div className="sim-bar-fill" style={{ width: `${Math.max(3, c.value)}%` }} /></div>
                  <span className="sim-bar-val">{c.value}</span>
                </div>
              ))}
            </div>
            {seg.roi_insights?.top_active_rois?.[0] && (
              <p className="sim-card-sub sim-faint">{roiNeuroscienceHint(seg.roi_insights.top_active_rois[0].functional_hint)}</p>
            )}
          </div>

          {/* 학습 상태 */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">학습 상태</p>
            <div className="sim-status-grid">
              <div className="sim-status-item">
                <span className="sim-status-label">구간 건강도</span>
                <span className="sim-status-val" style={{ color: health.color }}>{health.score}</span>
                <span className="sim-status-badge" style={{ color: health.color }}>{health.label}</span>
              </div>
              <div className="sim-status-item">
                <span className="sim-status-label">학습 효율 지수</span>
                <span className="sim-status-val">{efficiency >= 0 ? "+" : ""}{efficiency.toFixed(2)}</span>
                <span className="sim-status-badge">{efficiency >= 0.5 ? "효율적" : efficiency >= 0 ? "균형" : "비효율"}</span>
              </div>
              <div className="sim-status-item">
                <span className="sim-status-label">이탈 위험</span>
                <span className={`sim-status-val sim-wander-${wandering}`}>{wandering === "high" ? "높음" : wandering === "moderate" ? "보통" : "낮음"}</span>
                <span className="sim-status-badge">{wandering === "low" ? "집중 유지" : wandering === "moderate" ? "주의 필요" : "개입 필요"}</span>
              </div>
            </div>
            {seg.roi_insights?.summary_text && (
              <p className="sim-card-sub">{seg.roi_insights.summary_text}</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Metrics Row ─── */}
      <div className="sim-metrics-row">
        <MetricGauge label="Attention" value={a} metric="attention" />
        <MetricGauge label="Load" value={l} metric="load" />
        <MetricGauge label="Novelty" value={n} metric="novelty" />
      </div>

      {/* ─── Timeline (full width) ─── */}
      <div className="sim-timeline-section">
        <p className="sim-sec-title">타임라인</p>
        <div className="sim-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tlData} margin={CHART_MARGIN} onClick={(st) => { const i = (st as { activePayload?: Array<{ payload?: { line_index?: number } }> } | undefined)?.activePayload?.[0]?.payload?.line_index; if (typeof i === "number") jump(i); }}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              {sim.lecture_summary.strongest_segment_ids.map((id) => { const b = bounds.get(id); return b ? <ReferenceArea key={`s-${id}`} x1={b.start} x2={b.end} fill="var(--chart-strong-fill)" strokeOpacity={0} /> : null; })}
              {sim.lecture_summary.risk_segment_ids.map((id) => { const b = bounds.get(id); return b ? <ReferenceArea key={`r-${id}`} x1={b.start} x2={b.end} fill="var(--chart-risk-fill)" strokeOpacity={0} /> : null; })}
              <ReferenceLine x={tlFrame.lecture_seconds} stroke="var(--primary)" strokeWidth={2} />
              <XAxis dataKey="lecture_seconds" type="number" domain={["dataMin", "dataMax"]} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} tickFormatter={fmtSec} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--chart-tick)" }} />
              <Tooltip formatter={(v, k) => [`${(typeof v === "number" ? v : Number(v ?? 0)).toFixed(1)}`, String(k)]} labelFormatter={(lb) => fmtSec(Number(lb))} />
              <Line type="basis" dataKey="attention_display" stroke="var(--primary)" strokeWidth={2} dot={false} name="Attention" connectNulls />
              <Line type="basis" dataKey="load_display" stroke="var(--grey-700)" strokeWidth={1.5} dot={false} name="Load" connectNulls />
              <Line type="basis" dataKey="novelty_display" stroke="var(--grey-400)" strokeWidth={1.5} dot={false} name="Novelty" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
