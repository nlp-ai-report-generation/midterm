import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Series,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

type VideoScene = { id: string; durationSec: number; narration: string; caption: string };
type OutlineData = { meta: any; slides: any[]; videoScenes: VideoScene[] };

const C = { bg: "#FFFFFF", surface: "#F8FAFC", accent: "#FF6B00", black: "#0F172A", sub: "#475569", muted: "#94A3B8", line: "#E2E8F0" };
const FONT = "'Pretendard Variable','Pretendard',-apple-system,sans-serif";

// ── 실제 데이터 ──
const CATEGORY_AVGS = [
  { cat: "언어 표현", score: 3.4 },
  { cat: "강의 구조", score: 3.1 },
  { cat: "개념 명확성", score: 3.3 },
  { cat: "예시/실습", score: 3.0 },
  { cat: "상호작용", score: 2.9 },
];
const TREND_DATA = [
  { d: "02/02", s: 3.0 }, { d: "02/03", s: 3.0 }, { d: "02/04", s: 3.3 },
  { d: "02/05", s: 3.2 }, { d: "02/06", s: 3.2 }, { d: "02/09", s: 3.5 },
  { d: "02/10", s: 3.5 }, { d: "02/11", s: 3.2 }, { d: "02/12", s: 3.3 },
  { d: "02/13", s: 3.3 }, { d: "02/23", s: 3.4 }, { d: "02/24", s: 3.4 },
  { d: "02/25", s: 2.8 }, { d: "02/26", s: 3.4 }, { d: "02/27", s: 3.3 },
];
const RADAR_DATA = CATEGORY_AVGS.map(c => ({ subject: c.cat, A: c.score, fullMark: 5 }));
const FILLER_DATA = [
  { name: "자", value: 847 }, { name: "그래서", value: 623 },
  { name: "이제", value: 518 }, { name: "네", value: 412 }, { name: "기타", value: 890 },
];
const LECTURE_LIST = [
  { date: "02/02", subj: "객체지향 프로그래밍", score: 3.0 },
  { date: "02/03", subj: "Front-End Programming", score: 3.0 },
  { date: "02/04", subj: "Front-End Programming", score: 3.3 },
  { date: "02/05", subj: "Front-End Programming", score: 3.2 },
  { date: "02/06", subj: "Front-End Programming", score: 3.2 },
  { date: "02/09", subj: "Front-End Programming", score: 3.5 },
  { date: "02/10", subj: "Front-End Programming", score: 3.5 },
];

// ── Animation helpers ──
const useSpr = (d = 0) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return spring({ frame: f - d, fps, config: { damping: 18, stiffness: 80 } }); };

const Fade: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const s = useSpr(delay);
  return <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`, ...style }}>{children}</div>;
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const s = useSpr(4);
  return (
    <div style={{ position: "absolute", bottom: 32, left: 40, right: 40, display: "flex", justifyContent: "center", opacity: s }}>
      <div style={{ maxWidth: 1500, background: "rgba(15,23,42,0.88)", backdropFilter: "blur(12px)", color: "#fff", borderRadius: 12, padding: "12px 28px", fontSize: 20, fontWeight: 500, lineHeight: 1.6, textAlign: "center", whiteSpace: "pre-line" }}>{text}</div>
    </div>
  );
};

const Shell: React.FC<{ children: React.ReactNode; caption: string; bg?: string }> = ({ children, caption, bg = C.bg }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: FONT, color: C.black }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "48px 80px 90px" }}>{children}</div>
    <Caption text={caption} />
  </AbsoluteFill>
);

const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number; color?: string }> = ({ children, delay = 2, size = 44, color = C.black }) => (
  <Fade delay={delay}><div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.35, letterSpacing: "-0.03em", color, whiteSpace: "pre-line" }}>{children}</div></Fade>
);

// ═══ SCENES ═══

// 1. Cover
const S01: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Fade delay={2}><div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em" }}>AI 강의 분석</div></Fade>
    <Fade delay={8}><div style={{ fontSize: 16, color: C.muted, marginTop: 16, letterSpacing: "0.2em" }}>중간발표 · 멋사 NLP 팀</div></Fade>
  </Shell>
);

// 2. Problem
const S02: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={42}>15개 강의, 18개 항목</Title>
    <Title delay={8} size={42} color={C.accent}>사람이 매번 채우기엔{"\n"}시간이 부족합니다</Title>
  </Shell>
);

// 3. Solution
const S03: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={38}>AI가 읽고, 채점하고{"\n"}개선 방향까지 제안합니다</Title>
  </Shell>
);

// 4. Architecture — Manim 영상
const S04: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
    <Video src={staticFile("assets/architecture.mp4")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

// 5. Operator Dashboard — 실제 차트
const S05: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const s = useSpr(6);
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>운영자 대시보드</Title>
      <div style={{ display: "flex", gap: 24, marginTop: 24, width: "100%", maxWidth: 1400, opacity: s }}>
        {/* 카테고리 수평 바 */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.sub, marginBottom: 12 }}>카테고리별 평균</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORY_AVGS} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: C.muted }} />
              <YAxis type="category" dataKey="cat" tick={{ fontSize: 13, fill: C.black, fontWeight: 600 }} width={80} />
              <Bar dataKey="score" fill={C.accent} radius={[0, 6, 6, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 추이 에어리어 */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.sub, marginBottom: 12 }}>점수 추이</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis domain={[2, 4]} tick={{ fontSize: 11, fill: C.muted }} />
              <Area type="monotone" dataKey="s" stroke={C.accent} fill={C.accent} fillOpacity={0.12} strokeWidth={2} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

// 6. Lecture List
const S06: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const s = useSpr(4);
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>강의 목록</Title>
      <div style={{ width: "100%", maxWidth: 900, marginTop: 24, opacity: s, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px", padding: "12px 24px", background: C.surface, fontSize: 12, fontWeight: 700, color: C.muted }}>
          <span>날짜</span><span>과목</span><span style={{ textAlign: "right" }}>점수</span>
        </div>
        {LECTURE_LIST.map((l, i) => (
          <Fade key={l.date} delay={8 + i * 3}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px", padding: "14px 24px", borderTop: `1px solid ${C.line}`, fontSize: 14, alignItems: "center" }}>
              <span style={{ color: C.muted, fontFamily: "monospace" }}>{l.date}</span>
              <span style={{ fontWeight: 600 }}>{l.subj}</span>
              <span style={{ textAlign: "right", fontWeight: 800, color: C.accent }}>{l.score.toFixed(1)}</span>
            </div>
          </Fade>
        ))}
      </div>
    </Shell>
  );
};

// 7. Lecture Detail — 레이더 + 피드백
const S07: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const s = useSpr(6);
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>강의 상세</Title>
      <div style={{ display: "flex", gap: 32, marginTop: 24, width: "100%", maxWidth: 1200, opacity: s }}>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke={C.line} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: C.black, fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar dataKey="A" stroke={C.accent} fill={C.accent} fillOpacity={0.2} strokeWidth={2} animationDuration={1200} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
          <Fade delay={10}>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: C.surface }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: "0.1em", marginBottom: 6 }}>잘한 점</div>
              <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.6 }}>개념 정의가 명확하고 예시 연결이 자연스럽습니다</div>
            </div>
          </Fade>
          <Fade delay={16}>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: C.surface }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>개선할 점</div>
              <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.6 }}>이해 확인 질문 빈도를 높이면 좋겠습니다</div>
            </div>
          </Fade>
          <Fade delay={22}>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: `rgba(255,107,0,0.06)` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: "0.1em", marginBottom: 6 }}>추천 액션</div>
              <div style={{ fontSize: 15, color: C.black, lineHeight: 1.6, fontWeight: 600 }}>핵심 설명 후 30초 멈추고 질문하세요</div>
            </div>
          </Fade>
        </div>
      </div>
    </Shell>
  );
};

// 8. EDA — 발화량 + 파이
const S08: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const s = useSpr(6);
  const barData = TREND_DATA.map(d => ({ date: d.d, lines: Math.round(800 + d.s * 300) }));
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>데이터 분석</Title>
      <div style={{ display: "flex", gap: 32, marginTop: 24, width: "100%", maxWidth: 1200, opacity: s }}>
        <div style={{ flex: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.sub, marginBottom: 8 }}>날짜별 발화량</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Bar dataKey="lines" fill={C.accent} radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 0.8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.sub, marginBottom: 8 }}>습관 표현 분포</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={FILLER_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} animationDuration={1200}>
                {FILLER_DATA.map((_, i) => <Cell key={i} fill={`rgba(255,107,0,${0.3 + i * 0.15})`} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

// 9. Instructor dashboard — 캘린더 + 피드백
const S09: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={32}>강사 뷰</Title>
    <div style={{ display: "flex", gap: 32, marginTop: 24, width: "100%", maxWidth: 1200 }}>
      <Fade delay={6} style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.05em", color: C.accent }}>3.24</div>
        <div style={{ fontSize: 16, color: C.muted, marginTop: 4 }}>내 평균 점수 (5점 만점)</div>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>강점</div>
          <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.6 }}>개념 정의가 명확합니다</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>개선 기회</div>
          <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.6 }}>이해 확인 질문 빈도</div>
        </div>
      </Fade>
      <Fade delay={12} style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>점수 추이</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={TREND_DATA}>
            <XAxis dataKey="d" tick={{ fontSize: 10, fill: C.muted }} />
            <YAxis domain={[2, 4]} tick={{ fontSize: 10, fill: C.muted }} />
            <Line type="monotone" dataKey="s" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 3 }} animationDuration={1200} />
          </LineChart>
        </ResponsiveContainer>
      </Fade>
    </div>
  </Shell>
);

// 10. Instructor feedback
const S10: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={36}>다음 강의에서 바로 바꿀 수 있는 액션</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32, maxWidth: 800, textAlign: "left" }}>
      {[
        { tag: "ACTION 1", text: "마무리 1분 전에 핵심 개념 3개를 다시 말하세요" },
        { tag: "ACTION 2", text: "개념 설명 후 30초 멈추고 이해 확인 질문을 하세요" },
        { tag: "ACTION 3", text: "예시를 먼저 보여주고, 그 다음 이론을 설명하세요" },
      ].map((a, i) => (
        <Fade key={a.tag} delay={8 + i * 6}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: "0.1em", minWidth: 80 }}>{a.tag}</span>
            <span style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.5 }}>{a.text}</span>
          </div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// 11. Score trend
const S11: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={32}>점수 추이</Title>
    <Fade delay={6} style={{ width: "100%", maxWidth: 1100, marginTop: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={TREND_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
          <XAxis dataKey="d" tick={{ fontSize: 12, fill: C.muted }} />
          <YAxis domain={[2, 4]} tick={{ fontSize: 12, fill: C.muted }} />
          <Area type="monotone" dataKey="s" stroke={C.accent} fill={C.accent} fillOpacity={0.15} strokeWidth={2.5} dot={{ fill: C.bg, stroke: C.accent, strokeWidth: 2, r: 4 }} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </Fade>
  </Shell>
);

// 12. Pipeline — Manim
const S12: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
    <Video src={staticFile("assets/pipeline_flow.mp4")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

// 13. Harness
const S13: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const scores = [
    { s: 5, d: "풍부한 비유와 예시", w: 100 },
    { s: 4, d: "자주 활용", w: 80 },
    { s: 3, d: "빈도 낮음", w: 60 },
    { s: 2, d: "거의 없음", w: 40 },
    { s: 1, d: "전혀 없음", w: 20 },
  ];
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>하네스: 채점 기준</Title>
      <Fade delay={6} style={{ fontSize: 18, color: C.sub, marginTop: 8 }}>3.2 비유 및 예시 활용 (가중치: 높음)</Fade>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24, width: "100%", maxWidth: 800 }}>
        {scores.map((sc, i) => {
          const bs = spring({ frame: f - (10 + i * 4), fps, config: { damping: 20, stiffness: 60 } });
          return (
            <div key={sc.s} style={{ display: "flex", alignItems: "center", gap: 14, opacity: bs }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, background: `rgba(255,107,0,${sc.s * 0.2})`, color: sc.s >= 4 ? "#fff" : C.black }}>{sc.s}</div>
              <div style={{ flex: 1, height: 24, borderRadius: 6, background: C.line, overflow: "hidden" }}>
                <div style={{ width: `${sc.w * bs}%`, height: "100%", borderRadius: 6, background: `rgba(255,107,0,${0.1 + sc.s * 0.18})` }} />
              </div>
              <div style={{ width: 160, fontSize: 14, color: C.sub, textAlign: "left" }}>{sc.d}</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// 14. ICC — Manim + 카운트업
const S14: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
    <Video src={staticFile("assets/icc_principle.mp4")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

// 15. Chunk comparison — 실제 프론트 차트 스타일
const S15: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const b30 = spring({ frame: f - 8, fps, config: { damping: 22, stiffness: 50 } });
  const b15 = spring({ frame: f - 14, fps, config: { damping: 22, stiffness: 50 } });
  return (
    <Shell caption={scene.caption}>
      <Title delay={2} size={32}>청크 크기 비교</Title>
      <div style={{ width: "100%", maxWidth: 900, marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 14 }}>
          <div style={{ width: 100, textAlign: "right", fontSize: 18, fontWeight: 700 }}>30분</div>
          <div style={{ flex: 1, height: 56, background: C.surface, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ width: `${b30 * 64.9}%`, height: "100%", borderRadius: 14, background: C.accent, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 20 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{(3.245 * b30).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 100, textAlign: "right", fontSize: 18, fontWeight: 700, color: C.sub }}>15분</div>
          <div style={{ flex: 1, height: 56, background: C.surface, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ width: `${b15 * 60.7}%`, height: "100%", borderRadius: 14, background: C.line, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 20 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: C.sub }}>{(3.033 * b15).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 32 }}>
        {["p = 0.0006", "Cohen's d = 1.142"].map((t, i) => (
          <Fade key={i} delay={20 + i * 5}><div style={{ fontSize: 20, fontWeight: 700, color: C.black }}>{t}</div></Fade>
        ))}
      </div>
    </Shell>
  );
};

// 16. Report
const S16: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={36}>리포트: 행동 제안서</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 32, maxWidth: 800, textAlign: "left" }}>
      {[
        { tag: "OBSERVED", text: "마무리 시 요약 발언이 없습니다", d: 6 },
        { tag: "INTERPRETED", text: "수강생이 정리할 기회를 놓칩니다", d: 14 },
        { tag: "ACTION", text: "종료 1분 전 핵심 개념 3개를 다시 말하세요", d: 22 },
      ].map(it => (
        <Fade key={it.tag} delay={it.d}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: it.tag === "ACTION" ? C.accent : C.muted, marginBottom: 6 }}>{it.tag}</div>
          <div style={{ fontSize: it.tag === "ACTION" ? 24 : 20, lineHeight: 1.5, fontWeight: it.tag === "ACTION" ? 700 : 500, color: it.tag === "ACTION" ? C.black : C.sub }}>{it.text}</div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// 17. Future + Ending
const S17: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={2} size={38}>향후 계획</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32, textAlign: "left" }}>
      {[
        "구글 드라이브 · 노션 연동으로 편하게 분석",
        "유튜브 강의와 비교 분석",
        "평가 기준 정교화로 프로세스 시간 단축",
      ].map((t, i) => (
        <Fade key={i} delay={8 + i * 5}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: C.sub, fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: C.accent, flexShrink: 0 }} />
            {t}
          </div>
        </Fade>
      ))}
    </div>
    <Fade delay={28}><div style={{ fontSize: 16, color: C.muted, marginTop: 40 }}>감사합니다</div></Fade>
  </Shell>
);

// ═══ ROUTER ═══
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
            <Sequence premountFor={30}>
              <Audio src={staticFile(`audio/${scene.id}.mp3`)} />
            </Sequence>
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
