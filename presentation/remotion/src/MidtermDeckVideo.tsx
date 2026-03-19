import React from "react";
import {
  AbsoluteFill, Sequence, Series,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";

type VS = { id: string; durationSec: number; narration: string; caption: string };
type OD = { meta: any; slides: any[]; videoScenes: VS[] };

// ── Design Tokens (프론트와 100% 동일) ──
const T = {
  primary: "#FF6B00",
  primaryLight: "#FFF4EB",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  black: "#0F172A",
  grey50: "#F8FAFC",
  grey100: "#F1F5F9",
  grey200: "#E2E8F0",
  grey400: "#94A3B8",
  grey500: "#64748B",
  grey600: "#475569",
  shadow: "0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.02)",
};
const F = "'Pretendard Variable','Pretendard',-apple-system,sans-serif";
const FPS = 30;

// ── 실제 데이터 ──
const LECTURES = [
  { d: "02/02", s: "객체지향 프로그래밍", i: "김영아", sc: 3.0 },
  { d: "02/03", s: "Front-End Programming", i: "김영아", sc: 3.0 },
  { d: "02/04", s: "Front-End Programming", i: "김영아", sc: 3.3 },
  { d: "02/05", s: "Front-End Programming", i: "김영아", sc: 3.2 },
  { d: "02/06", s: "Front-End Programming", i: "김영아", sc: 3.2 },
  { d: "02/09", s: "Front-End Programming", i: "김영아", sc: 3.5 },
  { d: "02/10", s: "Front-End Programming", i: "김영아", sc: 3.5 },
];
const CAT_SCORES = [
  { name: "언어 표현 품질", score: 3.4 },
  { name: "강의 도입 및 구조", score: 3.1 },
  { name: "개념 설명 명확성", score: 3.3 },
  { name: "예시 및 실습 연계", score: 3.0 },
  { name: "수강생 상호작용", score: 2.9 },
];
const TREND = [3.0, 3.0, 3.3, 3.2, 3.2, 3.5, 3.5, 3.2, 3.3, 3.3, 3.4, 3.4, 2.8, 3.4, 3.3];

// ── Hooks ──
const useS = (delay: number, config = { damping: 20, stiffness: 80 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay * fps, fps, config });
};

// ── 자막 (나레이션 그대로) ──
const Cap: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = interpolate(f, [0, 0.3 * fps], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 28, left: 36, right: 36, display: "flex", justifyContent: "center", opacity: op }}>
      <div style={{
        maxWidth: 1400, background: "rgba(15,23,42,0.85)", color: "#fff",
        borderRadius: 12, padding: "11px 24px", fontSize: 18, fontWeight: 500,
        lineHeight: 1.65, textAlign: "center", fontFamily: F,
      }}>{text}</div>
    </div>
  );
};

// ── ScoreBadge (프론트와 동일) ──
const Badge: React.FC<{ score: number }> = ({ score }) => {
  const op = 0.15 + (score / 5) * 0.85;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 36, height: 36, borderRadius: 12, fontWeight: 700, fontSize: 14,
      background: `rgba(255,107,0,${op})`, color: score <= 3 ? T.black : "#fff",
      fontFamily: F,
    }}>{score.toFixed(1)}</span>
  );
};

// ── 수평 바 (SVG, useCurrentFrame 기반) ──
const HBar: React.FC<{ value: number; max: number; delay: number; label: string; w?: number; h?: number }> = ({ value, max, delay, label, w = 600, h = 28 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay * fps, fps, config: { damping: 22, stiffness: 50 } });
  const barW = (value / max) * w * s;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: F }}>
      <span style={{ width: 160, textAlign: "right", fontSize: 13, fontWeight: 600, color: T.black }}>{label}</span>
      <svg width={w} height={h}>
        <rect x={0} y={0} width={w} height={h} rx={6} fill={T.grey100} />
        <rect x={0} y={0} width={barW} height={h} rx={6} fill={T.primary} opacity={0.3 + (value / max) * 0.7} />
      </svg>
      <span style={{ fontSize: 14, fontWeight: 700, color: T.black, width: 40, fontVariantNumeric: "tabular-nums" }}>{(value * s).toFixed(1)}</span>
    </div>
  );
};

// ── 에어리어 차트 (SVG) ──
const AreaSVG: React.FC<{ data: number[]; delay: number; w?: number; h?: number }> = ({ data, delay, w = 700, h = 200 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay * fps, fps, config: { damping: 30, stiffness: 40 } });
  const minV = 2.5, maxV = 4;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - minV) / (maxV - minV)) * h;
    return `${x},${y * s + h * (1 - s)}`;
  });
  const line = pts.join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polygon points={area} fill={T.primary} opacity={0.1 * s} />
      <polyline points={line} fill="none" stroke={T.primary} strokeWidth={2.5} strokeLinejoin="round" opacity={s} />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - minV) / (maxV - minV)) * h;
        return <circle key={i} cx={x} cy={y * s + h * (1 - s)} r={3} fill={T.surface} stroke={T.primary} strokeWidth={2} opacity={s} />;
      })}
    </svg>
  );
};

// ── 레이더 차트 (SVG) ──
const RadarSVG: React.FC<{ scores: number[]; labels: string[]; delay: number; r?: number }> = ({ scores, labels, delay, r = 120 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay * fps, fps, config: { damping: 20, stiffness: 50 } });
  const n = scores.length;
  const cx = r + 80, cy = r + 20;
  const getXY = (i: number, val: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + Math.cos(angle) * (val / 5) * r, y: cy + Math.sin(angle) * (val / 5) * r };
  };
  const gridLevels = [1, 2, 3, 4, 5];
  const pts = scores.map((sc, i) => { const { x, y } = getXY(i, sc * s); return `${x},${y}`; }).join(" ");
  return (
    <svg width={cx * 2 - 80} height={cy * 2}>
      {gridLevels.map(lv => (
        <polygon key={lv} points={Array.from({ length: n }, (_, i) => { const { x, y } = getXY(i, lv); return `${x},${y}`; }).join(" ")} fill="none" stroke={T.grey200} strokeWidth={1} />
      ))}
      {Array.from({ length: n }, (_, i) => { const { x, y } = getXY(i, 5); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={T.grey200} strokeWidth={1} />; })}
      <polygon points={pts} fill={T.primary} fillOpacity={0.15 * s} stroke={T.primary} strokeWidth={2} opacity={s} />
      {labels.map((l, i) => { const { x, y } = getXY(i, 5.8); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={600} fill={T.black} fontFamily={F} opacity={s}>{l}</text>; })}
    </svg>
  );
};

// ══════════════════════════════════════════════════
// AppFrame — 프론트 레이아웃 그대로
// ══════════════════════════════════════════════════
const SIDEBAR_W = 220;
const AppFrame: React.FC<{ children: React.ReactNode; caption: string; active: string; title: string; sub?: string }> = ({ children, caption, active, title, sub }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bodyOp = interpolate(f, [0, 0.4 * fps], [0, 1], { extrapolateRight: "clamp" });
  const navs = ["홈", "강의 목록", "데이터 분석", "점수 추이", "강의 비교", "모델 비교", "신뢰성 검증", "설정"];
  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily: F, color: T.black }}>
      {/* Sidebar */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: SIDEBAR_W, background: T.surface, borderRight: `1px solid ${T.grey200}`, padding: "24px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 20 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>LA</div>
          <div><div style={{ fontSize: 13, fontWeight: 800 }}>강의 분석</div><div style={{ fontSize: 10, color: T.grey400 }}>운영자 모드</div></div>
        </div>
        {navs.map(n => (
          <div key={n} style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 1, fontSize: 13, fontWeight: 600, color: n === active ? T.primary : T.grey600, background: n === active ? T.primaryLight : "transparent" }}>{n}</div>
        ))}
      </div>
      {/* Main */}
      <div style={{ position: "absolute", top: 0, left: SIDEBAR_W, right: 0, bottom: 0, padding: "28px 36px 80px", overflow: "hidden", opacity: bodyOp }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: T.grey400, marginTop: 3 }}>{sub}</div>}
        </div>
        {children}
      </div>
      <Cap text={caption} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════
// SCENES — 100% 동적
// ══════════════════════════════════════════════════

// 1. 커버
const S01: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = interpolate(f, [0, 0.3 * fps], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(f, [0, 0.3 * fps], [30, 0], { extrapolateRight: "clamp" });
  const subOp = interpolate(f, [0.5 * fps, 0.8 * fps], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em", color: T.black, opacity: titleOp, transform: `translateY(${titleY}px)` }}>AI 강의 분석</div>
        <div style={{ fontSize: 15, color: T.grey400, marginTop: 16, letterSpacing: "0.15em", opacity: subOp }}>중간발표 · 멋사 NLP 팀</div>
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 2. 문제
const S02: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = interpolate(f, [0.1 * fps, 0.5 * fps], [0, 1], { extrapolateRight: "clamp" });
  const l1Y = interpolate(f, [0.1 * fps, 0.5 * fps], [20, 0], { extrapolateRight: "clamp" });
  const l2 = interpolate(f, [0.6 * fps, 1.0 * fps], [0, 1], { extrapolateRight: "clamp" });
  const l2Y = interpolate(f, [0.6 * fps, 1.0 * fps], [20, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "0 100px" }}>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.4, opacity: l1, transform: `translateY(${l1Y}px)` }}>15개 강의, 18개 항목</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.4, color: T.primary, marginTop: 8, opacity: l2, transform: `translateY(${l2Y}px)` }}>사람이 매번 채우기엔{"\n"}시간이 부족합니다</div>
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 3. 솔루션
const S03: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = interpolate(f, [0.1 * fps, 0.5 * fps], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(f, [0.1 * fps, 0.5 * fps], [20, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.4, textAlign: "center", opacity: op, transform: `translateY(${y}px)` }}>
        AI가 읽고, 채점하고{"\n"}개선 방향까지 제안합니다
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 4. 아키텍처 모션그래픽
const S04: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blocks = [
    { label: "STT\n스크립트", x: 200, y: 200, delay: 0.2, w: 160, h: 60 },
    { label: "LangGraph\n파이프라인", x: 500, y: 200, delay: 0.5, w: 200, h: 70, accent: true },
    { label: "운영자 뷰", x: 820, y: 140, delay: 0.8, w: 140, h: 50 },
    { label: "강사 뷰", x: 820, y: 260, delay: 0.8, w: 140, h: 50 },
  ];
  const arrows = [
    { x1: 360, x2: 500, y: 230, delay: 0.4 },
    { x1: 700, x2: 820, y: 165, delay: 0.7 },
    { x1: 700, x2: 820, y: 285, delay: 0.7 },
  ];
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F }}>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>시스템 구조</div>
      </div>
      {/* 노드 */}
      {blocks.map((b, i) => {
        const sp = spring({ frame: f - b.delay * fps, fps, config: { damping: 18, stiffness: 70 } });
        return (
          <div key={i} style={{
            position: "absolute", left: b.x - b.w / 2, top: b.y - b.h / 2,
            width: b.w, height: b.h, borderRadius: 14,
            background: b.accent ? T.primary : T.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: b.accent ? "#fff" : T.black,
            whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.3,
            opacity: sp, transform: `scale(${interpolate(sp, [0, 1], [0.8, 1])})`,
            boxShadow: b.accent ? "0 4px 16px rgba(255,107,0,0.15)" : "none",
          }}>{b.label}</div>
        );
      })}
      {/* 화살표 */}
      {arrows.map((a, i) => {
        const sp = spring({ frame: f - a.delay * fps, fps, config: { damping: 22 } });
        return <div key={i} style={{ position: "absolute", left: a.x1, top: a.y - 1.5, width: (a.x2 - a.x1) * sp, height: 3, background: T.primary, borderRadius: 2 }} />;
      })}
      {/* 기술 스택 */}
      <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, textAlign: "center", fontSize: 12, color: T.grey400, opacity: interpolate(f, [1.2 * fps, 1.6 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>
        React 19 · LangGraph · FastAPI · Supabase · GitHub Actions
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 5. 운영자 대시보드
const S05: React.FC<{ s: VS }> = ({ s }) => (
  <AppFrame caption={s.caption} active="홈" title="강의 평가 현황" sub="전체 강의의 품질 현황을 한눈에 볼 수 있어요">
    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
      {[{ l: "분석 완료", v: "15" }, { l: "전체 평균", v: "3.24" }].map((k, i) => (
        <Sequence key={k.l} from={Math.round(0.2 * FPS + i * 0.15 * FPS)} layout="none">
          <div style={{ padding: "14px 18px", borderRadius: 14, background: T.surface, boxShadow: T.shadow, minWidth: 120 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.grey400, textTransform: "uppercase", letterSpacing: "0.02em" }}>{k.l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 4 }}>{k.v}</div>
          </div>
        </Sequence>
      ))}
    </div>
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: 1, padding: "14px 18px", borderRadius: 14, background: T.surface, boxShadow: T.shadow }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>카테고리별 평균</div>
        {CAT_SCORES.map((c, i) => <HBar key={c.name} label={c.name.replace(/^\d+\.\s*/, "")} value={c.score} max={5} delay={0.4 + i * 0.1} w={350} h={22} />)}
      </div>
      <div style={{ flex: 1, padding: "14px 18px", borderRadius: 14, background: T.surface, boxShadow: T.shadow }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>점수 추이</div>
        <AreaSVG data={TREND} delay={0.6} w={420} h={160} />
      </div>
    </div>
  </AppFrame>
);

// 6. 강의 목록
const S06: React.FC<{ s: VS }> = ({ s }) => (
  <AppFrame caption={s.caption} active="강의 목록" title="강의 목록" sub="15개 강의를 평가했어요">
    <div style={{ borderRadius: 14, background: T.surface, boxShadow: T.shadow, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 100px 50px", padding: "10px 20px", background: T.grey50, fontSize: 10, fontWeight: 600, color: T.grey400, letterSpacing: "0.02em", textTransform: "uppercase" }}>
        <span>날짜</span><span>과목</span><span>강사</span><span style={{ textAlign: "right" }}>점수</span>
      </div>
      {LECTURES.map((l, i) => (
        <Sequence key={l.d} from={Math.round((0.2 + i * 0.08) * FPS)} layout="none">
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 100px 50px", padding: "12px 20px", borderTop: `1px solid ${T.grey100}`, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.grey400, fontFamily: "monospace" }}>{l.d}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{l.s}</span>
            <span style={{ fontSize: 12, color: T.grey600 }}>{l.i}</span>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><Badge score={l.sc} /></div>
          </div>
        </Sequence>
      ))}
    </div>
  </AppFrame>
);

// 7. 강의 상세
const S07: React.FC<{ s: VS }> = ({ s }) => (
  <AppFrame caption={s.caption} active="강의 목록" title="Front-End Programming" sub="2월 4일 · 김영아 · GPT-4o mini">
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: 1, padding: "14px", borderRadius: 14, background: T.surface, boxShadow: T.shadow }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>카테고리별 점수</div>
        <div style={{ fontSize: 11, color: T.grey400, marginBottom: 10 }}>넓을수록 균형 잡힌 강의예요</div>
        <RadarSVG scores={CAT_SCORES.map(c => c.score)} labels={CAT_SCORES.map(c => c.name.replace(/^\d+\.\s*/, "").slice(0, 6))} delay={0.3} r={95} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { t: "잘한 점", d: "강의 목표를 명확히 전달하여 수강생이 방향성을 이해할 수 있었어요", accent: true, delay: 0.4 },
          { t: "개선할 점", d: "설명 순서가 혼재되어 있어 수강생이 따라가기 어려울 수 있어요", accent: false, delay: 0.6 },
          { t: "추천 액션", d: "설명의 흐름을 구조적으로 정리하고 중요한 내용을 강조하세요", accent: true, delay: 0.8 },
        ].map((fb, i) => (
          <Sequence key={fb.t} from={Math.round(fb.delay * FPS)} layout="none">
            <div style={{ padding: "14px 16px", borderRadius: 12, background: fb.accent ? T.primaryLight : T.grey50 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: fb.accent ? T.primary : T.grey400, letterSpacing: "0.06em", marginBottom: 5 }}>{fb.t}</div>
              <div style={{ fontSize: 13, color: fb.accent ? T.black : T.grey600, lineHeight: 1.6, fontWeight: fb.t === "추천 액션" ? 600 : 400 }}>{fb.d}</div>
            </div>
          </Sequence>
        ))}
      </div>
    </div>
  </AppFrame>
);

// 8. EDA
const S08: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const barData = TREND.map((v, i) => ({ lines: Math.round(800 + v * 300), i }));
  return (
    <AppFrame caption={s.caption} active="데이터 분석" title="강의 데이터 분석" sub="강의 녹음에서 자동으로 추출한 데이터예요">
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1.3, padding: "14px 18px", borderRadius: 14, background: T.surface, boxShadow: T.shadow }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>날짜별 발화량</div>
          <svg width={500} height={180}>
            {barData.map((d, i) => {
              const sp = spring({ frame: f - (0.3 + i * 0.05) * fps, fps, config: { damping: 20, stiffness: 50 } });
              const h = (d.lines / 2000) * 160 * sp;
              return <rect key={i} x={i * 33 + 2} y={160 - h} width={28} height={h} rx={4} fill={T.primary} opacity={0.3 + (d.lines / 2000) * 0.7} />;
            })}
          </svg>
        </div>
        <div style={{ flex: 0.7, padding: "14px 18px", borderRadius: 14, background: T.surface, boxShadow: T.shadow }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>습관 표현</div>
          {["자 (847회)", "그래서 (623회)", "이제 (518회)", "네 (412회)"].map((w, i) => (
            <Sequence key={w} from={Math.round((0.4 + i * 0.1) * FPS)} layout="none">
              <div style={{ fontSize: 13, color: T.grey600, padding: "6px 0", borderBottom: `1px solid ${T.grey100}` }}>{w}</div>
            </Sequence>
          ))}
        </div>
      </div>
    </AppFrame>
  );
};

// 9. 강사 뷰
const S09: React.FC<{ s: VS }> = ({ s }) => (
  <AppFrame caption={s.caption} active="홈" title="김영아님의 강의" sub="수업을 돌아보고 다음 강의를 준비해보세요">
    <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
      {[{ l: "총 강의", v: "15" }, { l: "내 평균", v: "3.24" }, { l: "가장 잘한 강의", v: "3.51" }, { l: "개선 기회", v: "2.82" }].map((k, i) => (
        <Sequence key={k.l} from={Math.round((0.15 + i * 0.1) * FPS)} layout="none">
          <div style={{ padding: "12px 16px", borderRadius: 12, background: T.surface, boxShadow: T.shadow, minWidth: 100 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: T.grey400, textTransform: "uppercase" }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 3 }}>{k.v}</div>
          </div>
        </Sequence>
      ))}
    </div>
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: 1, padding: "14px 18px", borderRadius: 14, background: T.surface, boxShadow: T.shadow }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>점수 추이</div>
        <AreaSVG data={TREND} delay={0.4} w={380} h={140} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Sequence from={Math.round(0.5 * FPS)} layout="none">
          <div style={{ padding: "12px 16px", borderRadius: 12, background: T.surface, boxShadow: T.shadow }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.primary, marginBottom: 4 }}>이런 점이 좋았어요</div>
            <div style={{ fontSize: 12, color: T.grey600, lineHeight: 1.6 }}>개념 정의가 명확해요</div>
          </div>
        </Sequence>
        <Sequence from={Math.round(0.7 * FPS)} layout="none">
          <div style={{ padding: "12px 16px", borderRadius: 12, background: T.surface, boxShadow: T.shadow }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.grey400, marginBottom: 4 }}>이런 점을 바꿔보면 좋겠어요</div>
            <div style={{ fontSize: 12, color: T.grey600, lineHeight: 1.6 }}>이해 확인 질문 빈도를 높여보세요</div>
          </div>
        </Sequence>
      </div>
    </div>
  </AppFrame>
);

// 10. 액션
const S10: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const actions = [
    "마무리 1분 전에 핵심 개념 3개를 다시 말하세요",
    "개념 설명 후 30초 멈추고 이해 확인 질문을 하세요",
    "설명의 흐름을 개념 → 예시 → 실습 순서로 정리하세요",
  ];
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 800, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 36, opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>다음 강의에서 바로 바꿀 수 있는 액션</div>
        {actions.map((a, i) => {
          const sp = spring({ frame: f - (0.3 + i * 0.25) * fps, fps, config: { damping: 20 } });
          return (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", textAlign: "left", marginBottom: 18, opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [16, 0])}px)` }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: T.primary, letterSpacing: "0.06em", minWidth: 70, marginTop: 4 }}>ACTION {i + 1}</span>
              <span style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.5 }}>{a}</span>
            </div>
          );
        })}
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 11. 추이
const S11: React.FC<{ s: VS }> = ({ s }) => (
  <AppFrame caption={s.caption} active="점수 추이" title="점수 추이" sub="카테고리별로 시간에 따라 어떻게 변하는지 추적해요">
    <div style={{ padding: "14px 18px", borderRadius: 14, background: T.surface, boxShadow: T.shadow }}>
      <AreaSVG data={TREND} delay={0.2} w={700} h={280} />
    </div>
  </AppFrame>
);

// 12. 파이프라인
const S12: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodes = ["STT\n스크립트", "전처리\n+ 청킹", "5개 카테고리\n병렬 평가", "가중 평균\n집계", "리포트\n생성"];
  const cats = ["언어 표현", "강의 구조", "개념 명확성", "예시/실습", "상호작용"];
  const flowW = spring({ frame: f - 0.3 * fps, fps, config: { damping: 40, stiffness: 25 } });
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", width: "100%", maxWidth: 1200, padding: "0 60px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 32, opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>파이프라인</div>
        {/* 플로우 라인 */}
        <div style={{ position: "relative", height: 100, marginBottom: 16 }}>
          <div style={{ position: "absolute", top: 44, left: "8%", right: "8%", height: 3, background: T.grey200, borderRadius: 2 }}>
            <div style={{ width: `${flowW * 100}%`, height: "100%", borderRadius: 2, background: T.primary }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
            {nodes.map((n, i) => {
              const sp = spring({ frame: f - (0.3 + i * 0.25) * fps, fps, config: { damping: 16, stiffness: 60 } });
              const mid = i === 2;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: sp, transform: `scale(${interpolate(sp, [0, 1], [0.85, 1])})` }}>
                  <div style={{
                    width: mid ? 88 : 72, height: mid ? 88 : 72, borderRadius: "50%",
                    background: mid ? T.primary : T.surface, border: `2px solid ${mid ? T.primary : T.grey200}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: mid ? "#fff" : T.black, whiteSpace: "pre-line", textAlign: "center",
                    boxShadow: mid ? "0 4px 16px rgba(255,107,0,0.15)" : "none",
                  }}>{n}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* 카테고리 태그 */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {cats.map((c, i) => {
            const sp = spring({ frame: f - (1.5 + i * 0.08) * fps, fps, config: { damping: 18 } });
            return <div key={c} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: T.primaryLight, color: T.primary, opacity: sp }}>{c}</div>;
          })}
        </div>
        <div style={{ fontSize: 13, color: T.grey400, marginTop: 16, opacity: interpolate(f, [2.0 * fps, 2.4 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>30분 윈도우 · 5분 오버랩 · HIGH=3 MED=2 LOW=1</div>
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 13. 하네스
const S13: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phase1End = 1.5 * fps;
  const yamlOp = interpolate(f, [0, phase1End, phase1End + 0.3 * fps], [1, 1, 0], { extrapolateRight: "clamp" });
  const phase2Op = interpolate(f, [phase1End, phase1End + 0.3 * fps], [0, 1], { extrapolateRight: "clamp" });
  const scores = [{ s: 5, d: "매번 풍부하게 사용", w: 100 }, { s: 4, d: "자주 활용", w: 80 }, { s: 3, d: "빈도 낮음", w: 60 }, { s: 2, d: "거의 없음", w: 40 }, { s: 1, d: "전혀 없음", w: 20 }];
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", width: "100%", maxWidth: 800, padding: "0 60px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20, opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>하네스: 채점 기준 문서</div>
        {/* Phase 1: YAML */}
        <div style={{ opacity: yamlOp, textAlign: "left" }}>
          <div style={{ fontSize: 11, color: T.grey400, marginBottom: 6 }}>src/harnesses/category_3_clarity.md</div>
          <div style={{ padding: "16px 20px", borderRadius: 12, background: T.grey50, border: `1px solid ${T.grey200}`, fontFamily: "monospace", fontSize: 13, lineHeight: 1.8, color: T.grey600 }}>
            <span style={{ color: T.primary }}>harness_id</span>: category_3_clarity{"\n"}
            <span style={{ color: T.primary }}>category</span>: "3. 개념 설명 명확성"{"\n"}
            <span style={{ color: T.primary }}>items</span>:{"\n"}
            {"  "}- <span style={{ color: T.primary }}>name</span>: "<span style={{ color: T.black, fontWeight: 700 }}>비유 및 예시 활용</span>"{"\n"}
            {"    "}<span style={{ color: T.primary }}>weight</span>: HIGH · <span style={{ color: T.primary }}>chunk_focus</span>: all
          </div>
        </div>
        {/* Phase 2: 점수 바 */}
        <div style={{ opacity: phase2Op, textAlign: "left", marginTop: 12 }}>
          <div style={{ fontSize: 15, color: T.grey600, marginBottom: 14 }}>3.2 비유 및 예시 활용 — 어려운 개념에 적절한 비유를 사용하는가</div>
          {scores.map((sc, i) => {
            const bs = spring({ frame: f - (phase1End + (0.1 + i * 0.08) * fps), fps, config: { damping: 20, stiffness: 60 } });
            return (
              <div key={sc.s} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, opacity: bs }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, background: `rgba(255,107,0,${sc.s * 0.2})`, color: sc.s >= 4 ? "#fff" : T.black }}>{sc.s}</div>
                <svg width={400} height={18}><rect width={400} height={18} rx={5} fill={T.grey100} /><rect width={400 * (sc.w / 100) * bs} height={18} rx={5} fill={T.primary} opacity={0.1 + sc.s * 0.18} /></svg>
                <span style={{ fontSize: 12, color: T.grey600, width: 200 }}>{sc.d}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 14. ICC
const S14: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icc = spring({ frame: f - 0.4 * fps, fps, config: { damping: 18, stiffness: 45 } });
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>같은 강의를 세 번 채점해도</div>
        <div style={{ fontSize: 140, fontWeight: 900, letterSpacing: "-0.06em", color: T.primary, lineHeight: 1, marginTop: 12, fontVariantNumeric: "tabular-nums", opacity: icc }}>
          {interpolate(icc, [0, 1], [0, 0.877]).toFixed(3)}
        </div>
        <div style={{ fontSize: 17, color: T.grey600, marginTop: 8, opacity: interpolate(f, [0.8 * fps, 1.1 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>ICC — 15개 중 13개가 Good 이상</div>
        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 28 }}>
          {[{ l: "Kappa", v: "0.883" }, { l: "Alpha", v: "0.873" }, { l: "SSI", v: "0.974" }].map((m, i) => {
            const sp = spring({ frame: f - (1.0 + i * 0.15) * fps, fps, config: { damping: 20 } });
            return <div key={m.l} style={{ textAlign: "center", opacity: sp }}><div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em" }}>{m.v}</div><div style={{ fontSize: 12, color: T.grey400, marginTop: 3 }}>{m.l}</div></div>;
          })}
        </div>
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 15. 청크
const S15: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b30 = spring({ frame: f - 0.3 * fps, fps, config: { damping: 22, stiffness: 50 } });
  const b15 = spring({ frame: f - 0.5 * fps, fps, config: { damping: 22, stiffness: 50 } });
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", width: "100%", maxWidth: 900, padding: "0 80px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 28, opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>청크 크기 비교</div>
        {[{ label: "30분", val: 3.245, sp: b30, color: T.primary, textColor: "#fff" }, { label: "15분", val: 3.033, sp: b15, color: T.grey200, textColor: T.grey600 }].map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
            <span style={{ width: 60, textAlign: "right", fontSize: 15, fontWeight: 700, color: b.label === "15분" ? T.grey600 : T.black }}>{b.label}</span>
            <svg width={600} height={44}><rect width={600} height={44} rx={10} fill={T.grey50} /><rect width={600 * (b.val / 5) * b.sp} height={44} rx={10} fill={b.color} /></svg>
            <span style={{ fontSize: 18, fontWeight: 800, color: T.black, width: 50, fontVariantNumeric: "tabular-nums" }}>{(b.val * b.sp).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 36, justifyContent: "center", marginTop: 24 }}>
          {["p = 0.0006", "Cohen's d = 1.142"].map((t, i) => (
            <div key={t} style={{ fontSize: 17, fontWeight: 700, opacity: interpolate(f, [(0.8 + i * 0.15) * fps, (1.0 + i * 0.15) * fps], [0, 1], { extrapolateRight: "clamp" }) }}>{t}</div>
          ))}
        </div>
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 16. 리포트
const S16: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { tag: "OBSERVED", text: "설명 순서가 혼재되어 있어\n수강생이 따라가기 어려울 수 있습니다", delay: 0.2 },
    { tag: "INTERPRETED", text: "개념과 예시가 섞이면서\n핵심 정보가 잘 부각되지 않았습니다", delay: 0.6 },
    { tag: "ACTION", text: "설명의 흐름을 구조적으로 정리하고\n중요한 내용을 강조하는 표현을 추가하세요", delay: 1.0 },
  ];
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 800, width: "100%", padding: "0 60px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 28, opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>리포트: 행동 제안서</div>
        {items.map(it => {
          const sp = spring({ frame: f - it.delay * fps, fps, config: { damping: 20 } });
          return (
            <div key={it.tag} style={{ marginBottom: 20, textAlign: "left", opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [16, 0])}px)` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: it.tag === "ACTION" ? T.primary : T.grey400, marginBottom: 6 }}>{it.tag}</div>
              <div style={{ fontSize: it.tag === "ACTION" ? 20 : 17, lineHeight: 1.55, fontWeight: it.tag === "ACTION" ? 700 : 500, color: it.tag === "ACTION" ? T.black : T.grey600, whiteSpace: "pre-line" }}>{it.text}</div>
            </div>
          );
        })}
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// 17. 향후 + 엔딩
const S17: React.FC<{ s: VS }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: T.surface, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 800 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", opacity: interpolate(f, [0, 0.2 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>향후 계획</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28, textAlign: "left" }}>
          {["구글 드라이브 · 노션 연동으로 편하게 분석", "유튜브 강의와 비교 분석", "평가 기준 정교화로 프로세스 시간 단축"].map((t, i) => {
            const sp = spring({ frame: f - (0.3 + i * 0.15) * fps, fps, config: { damping: 20 } });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 19, color: T.grey600, fontWeight: 500, opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [12, 0])}px)` }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: T.primary, flexShrink: 0 }} />{t}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 15, color: T.grey400, marginTop: 36, opacity: interpolate(f, [1.2 * fps, 1.6 * fps], [0, 1], { extrapolateRight: "clamp" }) }}>감사합니다</div>
      </div>
      <Cap text={s.caption} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════
const SCENES: Record<string, React.FC<{ s: VS }>> = {
  "scene-01": S01, "scene-02": S02, "scene-03": S03, "scene-04": S04,
  "scene-05": S05, "scene-06": S06, "scene-07": S07, "scene-08": S08,
  "scene-09": S09, "scene-10": S10, "scene-11": S11, "scene-12": S12,
  "scene-13": S13, "scene-14": S14, "scene-15": S15, "scene-16": S16,
  "scene-17": S17,
};

export const MidtermDeckVideo: React.FC<{ outline: OD }> = ({ outline }) => (
  <AbsoluteFill style={{ background: T.surface }}>
    <Series>
      {outline.videoScenes.map(scene => {
        const Comp = SCENES[scene.id];
        if (!Comp) return null;
        return (
          <Series.Sequence key={scene.id} durationInFrames={Math.round(scene.durationSec * FPS)}>
            <Comp s={scene} />
            <Sequence layout="none">
              <Audio src={staticFile(`audio/${scene.id}.mp3`)} />
            </Sequence>
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
