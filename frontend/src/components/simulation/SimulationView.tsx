import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pause, Play } from "lucide-react";
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
  computeBrainProfile8,
  flattenTranscript,
  hemisphereBalance,
  interpretLineHeuristics,
  interpretTopRois,
  loadRecovery,
  segmentHealthScore,
  segmentSimilarity,
  tribeResponseChange,
  tribeResponseIntensity,
} from "@/lib/simulation";
import type { BrainFunction, BrainProfile8 } from "@/lib/simulation";
import type {
  LiveBrainFramePayload,
  LiveTimelineFramePayload,
  SegmentColorPayload,
  SimulationResult,
  TranscriptBrowserData,
} from "@/types/simulation";

/* ─── Constants ─── */
const SPEEDS = [0.5, 1, 2, 3, 4] as const;
const MAX_JUMPS = 4;
const CHART_MARGIN = { top: 10, right: 8, left: -20, bottom: 0 };

function pbMs(cur: number, nxt: number | undefined): number {
  if (typeof nxt !== "number") return 900;
  return Math.min(1600, Math.max(650, Math.max(1, nxt - cur) * 130));
}
function fmtSec(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/* ─── Inline Prescription ─── */
function getPrescription(profile: BrainProfile8): { text: string; urgency: "info" | "caution" | "warning" } {
  const top = profile.dominantFunction;
  if (top === "dmn") return { text: "학생 주의가 내용에서 벗어나고 있을 수 있어요. 핵심을 단순화하거나 개인적 질문으로 재진입을 유도하세요.", urgency: "warning" };
  if (top === "conflict") return { text: "인지적 갈등이 감지됐어요. '방금 복잡했죠?' 인정 후 단계별로 설명하세요.", urgency: "caution" };
  if (top === "auditory" && (profile.categories.find((c) => c.key === ("executive" as BrainFunction))?.value ?? 0) < 20) return { text: "듣고는 있지만 깊이 처리하지 않아요. 예시를 추가하거나 메타인지 질문을 넣어보세요.", urgency: "caution" };
  if (top === "executive") return { text: "학생들이 적극적으로 개념을 정리하고 있어요. 이 흐름을 유지하세요.", urgency: "info" };
  if (top === "memory") return { text: "기억에 부호화하는 중이에요. 핵심 요약을 한 번 더 짚어주면 효과적이에요.", urgency: "info" };
  return { text: "현재 구간은 일반적인 학습 상태예요.", urgency: "info" };
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

  /* ── compute (ROI 직접 해석 기반) ── */
  const interp = interpretLineHeuristics(frame);
  const a = tlFrame.attention_display ?? seg.proxies.attention_proxy;
  const l = tlFrame.load_display ?? seg.proxies.load_proxy;
  const n = tlFrame.novelty_display ?? seg.proxies.novelty_proxy;
  const brainProfile = computeBrainProfile8(seg);
  const topRois = interpretTopRois(seg);
  const intensity = tribeResponseIntensity(seg);
  const change = tribeResponseChange(seg);
  const hemisphere = hemisphereBalance(seg);
  const rx = getPrescription(brainProfile);
  const health = segmentHealthScore(seg);
  const similarity = segmentSimilarity(sim.segments, line?.segment_index ?? 0);
  const recovery = loadRecovery(tlData, fi);

  return (
    <div className="sim-page">
      {/* ─── Toolbar ─── */}
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
          {/* 1. 현재 텍스트 */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">현재 텍스트</p>
            <p className="sim-now-text">{line.text}</p>
            <p className="sim-now-signal"><strong>{interp.dominantSignal}</strong> — {interp.microSummary}</p>
          </div>

          {/* 2. 활성 뇌 영역 (A등급 직접 해석) */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">활성 뇌 영역</p>
            {topRois.map((roi, i) => (
              <div key={i} className="sim-roi-direct">
                <div className="sim-roi-direct-header">
                  <span className="sim-roi-direct-label">{roi.label}</span>
                  <span className="sim-roi-direct-hemi">{roi.hemisphere === "left" ? "좌" : "우"}</span>
                  <span className="sim-roi-direct-val">{(roi.response * 100).toFixed(1)}</span>
                </div>
                <p className="sim-roi-direct-interp">{roi.interpretation}</p>
              </div>
            ))}
          </div>

          {/* 3. 뇌 기능 프로필 8카테고리 */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">뇌 기능 프로필</p>
            <p className="sim-card-desc">{brainProfile.interpretation}</p>
            <div className="sim-bars">
              {brainProfile.categories.map((c) => (
                <div key={c.key} className={`sim-bar-row${c.isTop ? " top" : ""}`}>
                  <span className="sim-bar-lbl">{c.label}</span>
                  <div className="sim-bar-track"><div className="sim-bar-fill" style={{ width: `${Math.max(3, c.value)}%` }} /></div>
                  <span className="sim-bar-val">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 강사 처방 */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">강사 처방</p>
            <div className={`sim-prescription sim-prescription-${rx.urgency}`}>
              <p>{rx.text}</p>
            </div>
          </div>

          {/* 5. 구간 상태 */}
          <div className="sim-insight-section">
            <p className="sim-card-lbl">구간 상태</p>
            <div className="sim-status-grid">
              <div className="sim-status-item">
                <span className="sim-status-label">건강도</span>
                <span className="sim-status-val" style={{ color: health.color }}>{health.score}</span>
                <span className="sim-status-badge" style={{ color: health.color }}>{health.label}</span>
              </div>
              <div className="sim-status-item">
                <span className="sim-status-label">반구 균형</span>
                <div className="sim-hemisphere-bar"><div className="sim-hemisphere-left" style={{ width: `${hemisphere.left}%` }} /></div>
                <span className="sim-status-badge">{hemisphere.label}</span>
              </div>
              <div className="sim-status-item">
                <span className="sim-status-label">전환</span>
                <span className="sim-status-val">{similarity < 0.85 ? "급전환" : similarity < 0.95 ? "전환" : "연속"}</span>
              </div>
              <div className="sim-status-item">
                <span className="sim-status-label">부하 회복</span>
                <span className="sim-status-val">{recovery.label}</span>
              </div>
            </div>
          </div>

          {/* 6. 텍스트 분석 참고 (접기 가능) */}
          <details className="sim-insight-section sim-text-ref">
            <summary className="sim-card-lbl">텍스트 분석 참고</summary>
            <div className="sim-text-ref-content">
              <span>Att {a.toFixed(0)} · Load {l.toFixed(0)} · Nov {n.toFixed(0)}</span>
            </div>
          </details>
        </div>
      </div>

      {/* ─── Metrics Row (ROI 기반) ─── */}
      <div className="sim-metrics-row">
        <div className="metric-gauge">
          <div className="metric-gauge-header"><span className="text-label">반응 강도</span></div>
          <div className="metric-gauge-label-row"><span className="metric-gauge-value">{intensity.toFixed(1)}</span></div>
          <div className="metric-gauge-bar"><div className="metric-gauge-fill" style={{ width: `${Math.min(100, intensity * 10)}%`, background: "var(--primary)" }} /></div>
        </div>
        <div className="metric-gauge">
          <div className="metric-gauge-header"><span className="text-label">반응 변화</span></div>
          <div className="metric-gauge-label-row"><span className="metric-gauge-value">{change.toFixed(1)}</span></div>
          <div className="metric-gauge-bar"><div className="metric-gauge-fill" style={{ width: `${Math.min(100, change * 10)}%`, background: "var(--grey-700)" }} /></div>
        </div>
        <div className="metric-gauge">
          <div className="metric-gauge-header"><span className="text-label">반구 균형</span></div>
          <div className="metric-gauge-label-row"><span className="metric-gauge-value">좌 {hemisphere.left}% · 우 {hemisphere.right}%</span></div>
          <div className="sim-hemisphere-bar"><div className="sim-hemisphere-left" style={{ width: `${hemisphere.left}%` }} /></div>
        </div>
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
