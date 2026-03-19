import React from "react";
import {
  AbsoluteFill, Sequence, Series,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip,
} from "recharts";

type VideoScene = { id: string; durationSec: number; narration: string; caption: string };
type OutlineData = { meta: any; slides: any[]; videoScenes: VideoScene[] };

// ── Design Tokens (실제 프론트와 동일) ──
const C = {
  bg: "#FFFFFF", surface: "#F8FAFC", accent: "#FF6B00", accentLight: "#FFF4EB",
  black: "#0F172A", sub: "#475569", muted: "#94A3B8", line: "#E2E8F0",
  grey50: "#F8FAFC", grey100: "#F1F5F9", grey200: "#E2E8F0",
};
const FONT = "'Pretendard Variable','Pretendard',-apple-system,sans-serif";

// ── 실제 데이터 ──
const CAT_AVGS = [
  { cat: "언어 표현 품질", score: 3.4 }, { cat: "강의 도입 및 구조", score: 3.1 },
  { cat: "개념 설명 명확성", score: 3.3 }, { cat: "예시 및 실습 연계", score: 3.0 },
  { cat: "수강생 상호작용", score: 2.9 },
];
const TREND = [
  { d: "02/02", s: 3.0 }, { d: "02/03", s: 3.0 }, { d: "02/04", s: 3.3 },
  { d: "02/05", s: 3.2 }, { d: "02/06", s: 3.2 }, { d: "02/09", s: 3.5 },
  { d: "02/10", s: 3.5 }, { d: "02/11", s: 3.2 }, { d: "02/12", s: 3.3 },
  { d: "02/13", s: 3.3 }, { d: "02/23", s: 3.4 }, { d: "02/24", s: 3.4 },
  { d: "02/25", s: 2.8 }, { d: "02/26", s: 3.4 }, { d: "02/27", s: 3.3 },
];
const RADAR = CAT_AVGS.map(c => ({ subject: c.cat.replace(/^[0-9. ]+/, "").slice(0, 6), A: c.score, fullMark: 5 }));
const LECTURES = [
  { date: "02/02", subj: "객체지향 프로그래밍", inst: "김영아", score: 3.0 },
  { date: "02/03", subj: "Front-End Programming", inst: "김영아", score: 3.0 },
  { date: "02/04", subj: "Front-End Programming", inst: "김영아", score: 3.3 },
  { date: "02/05", subj: "Front-End Programming", inst: "김영아", score: 3.2 },
  { date: "02/06", subj: "Front-End Programming", inst: "김영아", score: 3.2 },
  { date: "02/09", subj: "Front-End Programming", inst: "김영아", score: 3.5 },
  { date: "02/10", subj: "Front-End Programming", inst: "김영아", score: 3.5 },
];
const FILLER = [
  { name: "자", value: 847 }, { name: "그래서", value: 623 },
  { name: "이제", value: 518 }, { name: "네", value: 412 }, { name: "기타", value: 890 },
];

// ── Helpers ──
const useSpr = (d = 0) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return spring({ frame: f - d, fps, config: { damping: 18, stiffness: 80 } }); };
const Fade: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const s = useSpr(delay); return <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`, ...style }}>{children}</div>;
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const s = useSpr(4);
  return (
    <div style={{ position: "absolute", bottom: 28, left: 36, right: 36, display: "flex", justifyContent: "center", opacity: s }}>
      <div style={{ maxWidth: 1500, background: "rgba(15,23,42,0.88)", backdropFilter: "blur(12px)", color: "#fff", borderRadius: 12, padding: "11px 24px", fontSize: 19, fontWeight: 500, lineHeight: 1.6, textAlign: "center", whiteSpace: "pre-line" }}>{text}</div>
    </div>
  );
};

const Shell: React.FC<{ children: React.ReactNode; caption: string }> = ({ children, caption }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.black }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "40px 80px 80px" }}>{children}</div>
    <Caption text={caption} />
  </AbsoluteFill>
);

const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number; color?: string }> = ({ children, delay = 2, size = 42, color = C.black }) => (
  <Fade delay={delay}><div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.35, letterSpacing: "-0.03em", color, whiteSpace: "pre-line" }}>{children}</div></Fade>
);

// ── ScoreBadge (실제 프론트 컴포넌트 동일) ──
const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const opacity = 0.15 + (score / 5) * 0.85;
  const textColor = score <= 3 ? C.black : "#fff";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 36, height: 36, borderRadius: 12, fontWeight: 700, fontSize: 14,
      background: `rgba(255,107,0,${opacity})`, color: textColor,
    }}>
      {score.toFixed(1)}
    </span>
  );
};

// ══════════════════════════════════════════════════
// AppFrame — 실제 프론트 앱 레이아웃
// ══════════════════════════════════════════════════

const SIDEBAR_W = 220;
const NAV_ITEMS = [
  { label: "홈", active: false }, { label: "강의 목록", active: false },
  { label: "데이터 분석", active: false }, { label: "점수 추이", active: false },
  { label: "강의 비교", active: false }, { label: "모델 비교", active: false },
  { label: "신뢰성 검증", active: false }, { label: "설정", active: false },
];

const AppFrame: React.FC<{
  children: React.ReactNode;
  caption: string;
  activeNav?: string;
  pageTitle: string;
  pageSubtitle?: string;
}> = ({ children, caption, activeNav, pageTitle, pageSubtitle }) => (
  <AbsoluteFill style={{ background: C.surface, fontFamily: FONT, color: C.black }}>
    {/* Sidebar */}
    <div style={{
      position: "absolute", top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
      background: C.bg, borderRight: `1px solid ${C.line}`,
      display: "flex", flexDirection: "column", padding: "28px 14px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", marginBottom: 24 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 800,
        }}>LA</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>강의 분석</div>
          <div style={{ fontSize: 10, color: C.muted }}>운영자 모드</div>
        </div>
      </div>
      {/* Nav */}
      {NAV_ITEMS.map(item => {
        const isActive = item.label === activeNav;
        return (
          <div key={item.label} style={{
            padding: "9px 12px", borderRadius: 8, marginBottom: 2,
            fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em",
            color: isActive ? C.accent : C.sub,
            background: isActive ? C.accentLight : "transparent",
          }}>
            {item.label}
          </div>
        );
      })}
    </div>

    {/* Main content */}
    <div style={{
      position: "absolute", top: 0, left: SIDEBAR_W, right: 0, bottom: 0,
      padding: "32px 40px 80px", overflow: "hidden",
    }}>
      {/* Page header */}
      <Fade delay={2}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>{pageTitle}</div>
          {pageSubtitle && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{pageSubtitle}</div>}
        </div>
      </Fade>
      {/* Page body */}
      <Fade delay={6}>{children}</Fade>
    </div>

    <Caption text={caption} />
  </AbsoluteFill>
);

// ══════════════════════════════════════════════════
// SCENES
// ══════════════════════════════════════════════════

const S01: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Fade delay={2}><div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em" }}>AI 강의 분석</div></Fade>
    <Fade delay={8}><div style={{ fontSize: 16, color: C.muted, marginTop: 16, letterSpacing: "0.15em" }}>중간발표 · 멋사 NLP 팀</div></Fade>
  </Shell>
);

const S02: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={42}>15개 강의, 18개 항목</Title>
    <Title delay={10} size={42} color={C.accent}>사람이 매번 채우기엔{"\n"}시간이 부족합니다</Title>
  </Shell>
);

const S03: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={38}>AI가 읽고, 채점하고{"\n"}개선 방향까지 제안합니다</Title>
  </Shell>
);

// 아키텍처 — 모션그래픽
const S04: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const blocks = [
    { label: "STT 스크립트\n15개 강의", x: -500, delay: 6 },
    { label: "LangGraph\n파이프라인", x: -120, delay: 14, accent: true },
    { label: "운영자 뷰", x: 280, y: -80, delay: 22 },
    { label: "강사 뷰", x: 280, y: 80, delay: 22 },
  ];
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>시스템 구조</Title>
      <div style={{ position: "relative", width: 1200, height: 300, marginTop: 32 }}>
        {blocks.map((b, i) => {
          const s = spring({ frame: f - b.delay, fps, config: { damping: 18, stiffness: 70 } });
          return (
            <div key={i} style={{
              position: "absolute", left: 600 + b.x - 90, top: 150 + (b.y || 0) - 35,
              width: 180, height: 70, borderRadius: 14,
              background: b.accent ? C.accent : C.accentLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: b.accent ? "#fff" : C.black,
              whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.3,
              opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
              boxShadow: b.accent ? "0 6px 20px rgba(255,107,0,0.15)" : "none",
            }}>{b.label}</div>
          );
        })}
        {/* 화살표들 */}
        {[{ x1: 510, x2: 570, y: 150, d: 12 }, { x1: 690, x2: 750, y: 120, d: 20 }, { x1: 690, x2: 750, y: 180, d: 20 }].map((a, i) => {
          const s = spring({ frame: f - a.d, fps, config: { damping: 20 } });
          return <div key={i} style={{ position: "absolute", left: a.x1, top: a.y - 1, width: (a.x2 - a.x1) * s, height: 3, background: C.accent, borderRadius: 2 }} />;
        })}
      </div>
      <Fade delay={28}><div style={{ fontSize: 13, color: C.muted }}>React 19 · LangGraph · FastAPI · Supabase · GitHub Actions</div></Fade>
    </Shell>
  );
};

// ── 운영자 대시보드 (실제 화면) ──
const S05: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AppFrame caption={scene.caption} activeNav="홈" pageTitle="강의 평가 현황" pageSubtitle="전체 강의의 품질 현황을 한눈에 볼 수 있어요">
    <div style={{ display: "flex", gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[{ l: "분석 완료", v: "15" }, { l: "전체 평균", v: "3.24" }].map(k => (
          <div key={k.l} style={{ padding: "18px 22px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)", minWidth: 140 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.02em", textTransform: "uppercase" }}>{k.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 6 }}>{k.v}</div>
          </div>
        ))}
      </div>
    </div>
    {/* Charts side by side */}
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ flex: 1, padding: "18px 22px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>카테고리별 평균</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={CAT_AVGS} layout="vertical" margin={{ left: 100 }}>
            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis type="category" dataKey="cat" tick={{ fontSize: 12, fill: C.black, fontWeight: 600 }} width={100} />
            <Bar dataKey="score" fill={C.accent} radius={[0, 6, 6, 0]} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, padding: "18px 22px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>점수 추이</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
            <XAxis dataKey="d" tick={{ fontSize: 10, fill: C.muted }} />
            <YAxis domain={[2, 4]} tick={{ fontSize: 10, fill: C.muted }} />
            <Area type="monotone" dataKey="s" stroke={C.accent} fill={C.accent} fillOpacity={0.12} strokeWidth={2} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </AppFrame>
);

// ── 강의 목록 (실제 화면) ──
const S06: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AppFrame caption={scene.caption} activeNav="강의 목록" pageTitle="강의 목록" pageSubtitle="15개 강의를 평가했어요">
    <div style={{ borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 120px 50px", padding: "12px 24px", background: C.grey50, fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.02em", textTransform: "uppercase" }}>
        <span>날짜</span><span>과목</span><span>강사</span><span style={{ textAlign: "right" }}>점수</span>
      </div>
      {LECTURES.map((l, i) => (
        <Fade key={l.date} delay={4 + i * 2}>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 120px 50px", padding: "14px 24px", borderTop: `1px solid ${C.grey100}`, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.muted, fontFamily: "monospace" }}>{l.date}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{l.subj}</span>
            <span style={{ fontSize: 13, color: C.sub }}>{l.inst}</span>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><ScoreBadge score={l.score} /></div>
          </div>
        </Fade>
      ))}
    </div>
  </AppFrame>
);

// ── 강의 상세 (실제 화면) ──
const S07: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AppFrame caption={scene.caption} activeNav="강의 목록" pageTitle="Front-End Programming" pageSubtitle="2월 4일 · 김영아 · GPT-4o mini">
    <div style={{ display: "flex", gap: 20 }}>
      {/* 레이더 */}
      <div style={{ flex: 1, padding: "18px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>카테고리별 점수</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>넓을수록 균형 잡힌 강의예요</div>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={RADAR}>
            <PolarGrid stroke={C.line} />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: C.black, fontWeight: 600 }} />
            <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
            <Radar dataKey="A" stroke={C.accent} fill={C.accent} fillOpacity={0.2} strokeWidth={2} animationDuration={1000} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* 피드백 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { title: "잘한 점", sub: "개념 정의가 명확하고 예시 연결이 자연스러워요", accent: true },
          { title: "개선할 점", sub: "이해 확인 질문 빈도를 높이면 좋겠어요", accent: false },
          { title: "추천 액션", sub: "핵심 설명 후 30초 멈추고 질문해보세요", accent: true },
        ].map((f, i) => (
          <Fade key={f.title} delay={8 + i * 5}>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: f.accent ? C.accentLight : C.grey50 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: f.accent ? C.accent : C.muted, letterSpacing: "0.08em", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: f.accent ? C.black : C.sub, lineHeight: 1.6, fontWeight: f.title === "추천 액션" ? 600 : 400 }}>{f.sub}</div>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  </AppFrame>
);

// ── 데이터 분석 (실제 화면) ──
const S08: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const barData = TREND.map(d => ({ date: d.d, lines: Math.round(800 + d.s * 300) }));
  return (
    <AppFrame caption={scene.caption} activeNav="데이터 분석" pageTitle="강의 데이터 분석" pageSubtitle="강의 녹음에서 자동으로 추출한 데이터예요">
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1.3, padding: "18px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>날짜별 발화량</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Bar dataKey="lines" fill={C.accent} radius={[4, 4, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 0.7, padding: "18px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>습관 표현 분포</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={FILLER} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} animationDuration={1000}>
                {FILLER.map((_, i) => <Cell key={i} fill={`rgba(255,107,0,${0.25 + i * 0.15})`} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppFrame>
  );
};

// ── 강사 대시보드 (실제 화면) ──
const S09: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AppFrame caption={scene.caption} activeNav="홈" pageTitle="김영아님의 강의" pageSubtitle="수업을 돌아보고 다음 강의를 준비해보세요">
    <div style={{ display: "flex", gap: 20 }}>
      {/* KPI */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[{ l: "총 강의", v: "15" }, { l: "내 평균", v: "3.24" }, { l: "가장 잘한 강의", v: "3.51" }, { l: "개선 기회", v: "2.82" }].map(k => (
          <div key={k.l} style={{ padding: "14px 18px", borderRadius: 12, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)", minWidth: 110 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: "0.02em", textTransform: "uppercase" }}>{k.l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 4 }}>{k.v}</div>
          </div>
        ))}
      </div>
    </div>
    {/* Trend + Feedback */}
    <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
      <div style={{ flex: 1, padding: "18px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>점수 추이</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={TREND}>
            <XAxis dataKey="d" tick={{ fontSize: 9, fill: C.muted }} />
            <YAxis domain={[2, 4]} tick={{ fontSize: 9, fill: C.muted }} />
            <Line type="monotone" dataKey="s" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 2 }} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ padding: "14px 18px", borderRadius: 12, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 6 }}>이런 점이 좋았어요</div>
          <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>개념 정의가 명확해요</div>
        </div>
        <div style={{ padding: "14px 18px", borderRadius: 12, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>이런 점을 바꿔보면 좋겠어요</div>
          <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>이해 확인 질문 빈도를 높여보세요</div>
        </div>
      </div>
    </div>
  </AppFrame>
);

// ── 강사 피드백 액션 ──
const S10: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={36}>다음 강의에서 바로 바꿀 수 있는 액션</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32, maxWidth: 800, textAlign: "left" }}>
      {[
        { tag: "ACTION 1", text: "마무리 1분 전에 핵심 개념 3개를 다시 말하세요" },
        { tag: "ACTION 2", text: "개념 설명 후 30초 멈추고 이해 확인 질문을 하세요" },
        { tag: "ACTION 3", text: "예시를 먼저 보여주고, 그 다음 이론을 설명하세요" },
      ].map((a, i) => (
        <Fade key={a.tag} delay={6 + i * 5}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: "0.08em", minWidth: 70 }}>{a.tag}</span>
            <span style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.5 }}>{a.text}</span>
          </div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// ── 점수 추이 (실제 화면) ──
const S11: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AppFrame caption={scene.caption} activeNav="점수 추이" pageTitle="점수 추이" pageSubtitle="카테고리별로 시간에 따라 어떻게 변하는지 추적해요">
    <div style={{ padding: "18px", borderRadius: 14, background: C.bg, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={TREND}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
          <XAxis dataKey="d" tick={{ fontSize: 11, fill: C.muted }} />
          <YAxis domain={[2, 4]} tick={{ fontSize: 11, fill: C.muted }} />
          <Area type="monotone" dataKey="s" stroke={C.accent} fill={C.accent} fillOpacity={0.15} strokeWidth={2.5} dot={{ fill: C.bg, stroke: C.accent, strokeWidth: 2, r: 3 }} animationDuration={1200} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </AppFrame>
);

// ── 파이프라인 모션그래픽 ──
const S12: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const nodes = ["STT\n스크립트", "전처리\n+ 청킹", "5개 카테고리\n병렬 평가", "가중 평균\n집계", "리포트\n생성"];
  const cats = ["언어 표현", "강의 구조", "개념 명확성", "예시/실습", "상호작용"];
  const flowLine = spring({ frame: f - 10, fps, config: { damping: 40, stiffness: 25 } });
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={28}>파이프라인</Title>
      {/* 노드 흐름 */}
      <div style={{ position: "relative", width: 1200, height: 120, marginTop: 24 }}>
        <div style={{ position: "absolute", top: 55, left: 60, right: 60, height: 3, background: C.line, borderRadius: 2 }}>
          <div style={{ width: `${flowLine * 100}%`, height: "100%", borderRadius: 2, background: C.accent }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", padding: "0 20px" }}>
          {nodes.map((n, i) => {
            const ns = spring({ frame: f - (8 + i * 8), fps, config: { damping: 16, stiffness: 60 } });
            const mid = i === 2;
            return (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: ns,
                transform: `scale(${interpolate(ns, [0, 1], [0.85, 1])})`,
              }}>
                <div style={{
                  width: mid ? 90 : 75, height: mid ? 90 : 75, borderRadius: "50%",
                  background: mid ? C.accent : C.bg, border: `2px solid ${mid ? C.accent : C.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: mid ? "#fff" : C.black, whiteSpace: "pre-line", textAlign: "center",
                  boxShadow: mid ? "0 4px 16px rgba(255,107,0,0.15)" : "none",
                }}>{n}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* 5개 카테고리 */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {cats.map((c, i) => {
          const cs = spring({ frame: f - (46 + i * 3), fps, config: { damping: 18 } });
          return (
            <div key={c} style={{
              padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: C.accentLight, color: C.accent, opacity: cs,
            }}>{c}</div>
          );
        })}
      </div>
      <Fade delay={58}><div style={{ fontSize: 14, color: C.muted, marginTop: 16 }}>30분 윈도우 · 5분 오버랩 · HIGH=3 MED=2 LOW=1</div></Fade>
    </Shell>
  );
};

// ── 하네스 모션그래픽 ──
const S13: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  // Phase 1: YAML 등장 (0~40f), Phase 2: 확대+점수 바 (40~끝)
  const phase2 = spring({ frame: f - 40, fps, config: { damping: 20 } });
  const yamlOp = interpolate(f, [0, 40, 50], [1, 1, 0], { extrapolateRight: "clamp" });
  const scores = [{ s: 5, d: "매번 풍부하게 사용", w: 100 }, { s: 4, d: "자주 활용", w: 80 }, { s: 3, d: "빈도 낮음", w: 60 }, { s: 2, d: "거의 없음", w: 40 }, { s: 1, d: "전혀 없음", w: 20 }];
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={28}>하네스: 채점 기준 문서</Title>
      {/* Phase 1: YAML */}
      <div style={{ opacity: yamlOp, marginTop: 20, width: "100%", maxWidth: 700, textAlign: "left" }}>
        <Fade delay={6}><div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>src/harnesses/category_3_clarity.md</div></Fade>
        <Fade delay={10}>
          <div style={{ padding: "20px 24px", borderRadius: 12, background: C.surface, border: `1px solid ${C.line}`, fontFamily: "monospace", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
            <span style={{ color: C.accent }}>harness_id</span>: category_3_clarity{"\n"}
            <span style={{ color: C.accent }}>category</span>: "3. 개념 설명 명확성"{"\n"}
            <span style={{ color: C.accent }}>items</span>:{"\n"}
            {"  "}- <span style={{ color: C.accent }}>name</span>: "<span style={{ color: C.black, fontWeight: 700 }}>비유 및 예시 활용</span>"{"\n"}
            {"    "}<span style={{ color: C.accent }}>weight</span>: HIGH{"\n"}
            {"    "}<span style={{ color: C.accent }}>chunk_focus</span>: all
          </div>
        </Fade>
      </div>
      {/* Phase 2: 점수 기준 */}
      <div style={{ opacity: phase2, marginTop: 20, width: "100%", maxWidth: 800 }}>
        <Fade delay={44}><div style={{ fontSize: 16, color: C.sub, marginBottom: 16, textAlign: "left" }}>3.2 비유 및 예시 활용 — 어려운 개념에 적절한 비유를 사용하는가</div></Fade>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scores.map((sc, i) => {
            const bs = spring({ frame: f - (48 + i * 4), fps, config: { damping: 20, stiffness: 60 } });
            return (
              <div key={sc.s} style={{ display: "flex", alignItems: "center", gap: 12, opacity: bs }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, background: `rgba(255,107,0,${sc.s * 0.2})`, color: sc.s >= 4 ? "#fff" : C.black }}>{sc.s}</div>
                <div style={{ flex: 1, height: 20, borderRadius: 5, background: C.line, overflow: "hidden" }}>
                  <div style={{ width: `${sc.w * bs}%`, height: "100%", borderRadius: 5, background: `rgba(255,107,0,${0.1 + sc.s * 0.18})` }} />
                </div>
                <div style={{ width: 200, fontSize: 13, color: C.sub, textAlign: "left" }}>{sc.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
};

// ── ICC 모션그래픽 ──
const S14: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const icc = spring({ frame: f - 10, fps, config: { damping: 18, stiffness: 45 } });
  return (
    <Shell caption={scene.caption}>
      <Fade delay={2}><div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>같은 강의를 세 번 채점해도</div></Fade>
      <div style={{ fontSize: 140, fontWeight: 900, letterSpacing: "-0.06em", color: C.accent, lineHeight: 1, marginTop: 12, fontVariantNumeric: "tabular-nums", opacity: icc }}>
        {interpolate(icc, [0, 1], [0, 0.877]).toFixed(3)}
      </div>
      <Fade delay={20}><div style={{ fontSize: 18, color: C.sub, marginTop: 8 }}>ICC — 15개 중 13개가 Good 이상</div></Fade>
      <div style={{ display: "flex", gap: 48, marginTop: 28 }}>
        {[{ l: "Kappa", v: "0.883" }, { l: "Alpha", v: "0.873" }, { l: "SSI", v: "0.974" }].map((m, i) => {
          const ms = spring({ frame: f - (28 + i * 5), fps, config: { damping: 20 } });
          return (
            <div key={m.l} style={{ opacity: ms, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em" }}>{m.v}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{m.l}</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// ── 청크 비교 ──
const S15: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const b30 = spring({ frame: f - 6, fps, config: { damping: 22, stiffness: 50 } });
  const b15 = spring({ frame: f - 12, fps, config: { damping: 22, stiffness: 50 } });
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>청크 크기 비교</Title>
      <div style={{ width: "100%", maxWidth: 900, marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ width: 80, textAlign: "right", fontSize: 16, fontWeight: 700 }}>30분</div>
          <div style={{ flex: 1, height: 48, background: C.surface, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ width: `${b30 * 64.9}%`, height: "100%", borderRadius: 12, background: C.accent, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{(3.245 * b30).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 80, textAlign: "right", fontSize: 16, fontWeight: 700, color: C.sub }}>15분</div>
          <div style={{ flex: 1, height: 48, background: C.surface, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ width: `${b15 * 60.7}%`, height: "100%", borderRadius: 12, background: C.line, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.sub }}>{(3.033 * b15).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 36, marginTop: 28 }}>
        {["p = 0.0006", "Cohen's d = 1.142"].map((t, i) => (
          <Fade key={i} delay={18 + i * 4}><div style={{ fontSize: 18, fontWeight: 700 }}>{t}</div></Fade>
        ))}
      </div>
    </Shell>
  );
};

// ── 리포트 ──
const S16: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={34}>리포트: 행동 제안서</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 28, maxWidth: 800, textAlign: "left" }}>
      {[
        { tag: "OBSERVED", text: "설명 순서가 혼재되어 있어\n수강생이 내용을 따라가기 어렵습니다", d: 6 },
        { tag: "INTERPRETED", text: "개념과 예시가 섞이면서\n핵심 정보가 잘 부각되지 않았습니다", d: 14 },
        { tag: "ACTION", text: "설명의 흐름을 구조적으로 정리하고\n중요한 내용을 강조하는 표현을 추가하세요", d: 22 },
      ].map(it => (
        <Fade key={it.tag} delay={it.d}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: it.tag === "ACTION" ? C.accent : C.muted, marginBottom: 6 }}>{it.tag}</div>
          <div style={{ fontSize: it.tag === "ACTION" ? 22 : 18, lineHeight: 1.5, fontWeight: it.tag === "ACTION" ? 700 : 500, color: it.tag === "ACTION" ? C.black : C.sub }}>{it.text}</div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// ── 향후 + 엔딩 ──
const S17: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={36}>향후 계획</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28, textAlign: "left" }}>
      {["구글 드라이브 · 노션 연동으로 편하게 분석", "유튜브 강의와 비교 분석", "평가 기준 정교화로 프로세스 시간 단축"].map((t, i) => (
        <Fade key={i} delay={8 + i * 4}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, color: C.sub, fontWeight: 500 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: C.accent, flexShrink: 0 }} />{t}
          </div>
        </Fade>
      ))}
    </div>
    <Fade delay={26}><div style={{ fontSize: 16, color: C.muted, marginTop: 36 }}>감사합니다</div></Fade>
  </Shell>
);

// ══════════════════════════════════════════════════
const SCENES: Record<string, React.FC<{ scene: VideoScene }>> = {
  "scene-01": S01, "scene-02": S02, "scene-03": S03, "scene-04": S04,
  "scene-05": S05, "scene-06": S06, "scene-07": S07, "scene-08": S08,
  "scene-09": S09, "scene-10": S10, "scene-11": S11, "scene-12": S12,
  "scene-13": S13, "scene-14": S14, "scene-15": S15, "scene-16": S16,
  "scene-17": S17,
};

export const MidtermDeckVideo: React.FC<{ outline: OutlineData }> = ({ outline }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Series>
      {outline.videoScenes.map(scene => {
        const Comp = SCENES[scene.id];
        if (!Comp) return null;
        return (
          <Series.Sequence key={scene.id} durationInFrames={Math.round(scene.durationSec * 30)}>
            <Comp scene={scene} />
            <Sequence premountFor={30}><Audio src={staticFile(`audio/${scene.id}.mp3`)} /></Sequence>
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
