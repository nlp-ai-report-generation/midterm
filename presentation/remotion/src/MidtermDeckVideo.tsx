import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type VideoScene = { id: string; durationSec: number; narration: string; caption: string };
type OutlineData = { meta: any; slides: any[]; videoScenes: VideoScene[] };

const C = { bg: "#FFFFFF", surface: "#F8FAFC", accent: "#FF6B00", black: "#0F172A", sub: "#475569", muted: "#94A3B8", line: "#E2E8F0" };
const FONT = "'Pretendard Variable','Pretendard',-apple-system,sans-serif";

const useSpr = (d = 0, cfg = { damping: 20, stiffness: 80 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - d, fps, config: cfg });
};

const Fade: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const s = useSpr(delay);
  return <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`, ...style }}>{children}</div>;
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const s = useSpr(6);
  return (
    <div style={{ position: "absolute", bottom: 36, left: 48, right: 48, display: "flex", justifyContent: "center", opacity: s }}>
      <div style={{ maxWidth: 1400, background: "rgba(15,23,42,0.88)", backdropFilter: "blur(12px)", color: "#fff", borderRadius: 14, padding: "14px 28px", fontSize: 21, fontWeight: 500, lineHeight: 1.6, textAlign: "center", whiteSpace: "pre-line" }}>
        {text}
      </div>
    </div>
  );
};

const Shell: React.FC<{ children: React.ReactNode; caption: string }> = ({ children, caption }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.black }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "60px 100px 100px", gap: 0 }}>
      {children}
    </div>
    <Caption text={caption} />
  </AbsoluteFill>
);

const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number; color?: string }> = ({ children, delay = 4, size = 44, color = C.black }) => (
  <Fade delay={delay}><div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.35, letterSpacing: "-0.03em", color, whiteSpace: "pre-line" }}>{children}</div></Fade>
);

const Sub: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 10 }) => (
  <Fade delay={delay}><div style={{ fontSize: 21, color: C.sub, lineHeight: 1.65, marginTop: 20, maxWidth: 800 }}>{children}</div></Fade>
);

// ── SCENES ──────────────────────────────────────────

const S01: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Fade delay={4}><div style={{ fontSize: 72, fontWeight: 900, letterSpacing: "-0.04em" }}>AI 강의 분석</div></Fade>
    <Fade delay={10}><div style={{ fontSize: 18, color: C.muted, marginTop: 20, letterSpacing: "0.2em" }}>MIDTERM PRESENTATION</div></Fade>
    <Fade delay={16}><div style={{ fontSize: 15, color: C.sub, marginTop: 28 }}>백엔드 부트캠프 21기 · 15개 강의 · 18개 항목 · 3개 모델</div></Fade>
  </Shell>
);

const S02: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={48}>설문은 남지만</Title>
    <Title delay={12} size={48} color={C.accent}>다음 액션은 남지 않습니다</Title>
  </Shell>
);

const S03: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={36}>스크립트는 수천 줄</Title>
    <Sub delay={12}>사람이 매번 다시 읽기엔 비용이 크고,{"\n"}점수만 있으면 이유가 없고, 서술만 있으면 기준이 흔들립니다.</Sub>
  </Shell>
);

const S04: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={40}>강의 녹음을 AI가 읽고{"\n"}18개 항목으로 채점합니다</Title>
    <Fade delay={14} style={{ display: "flex", gap: 24, marginTop: 40 }}>
      {[{ n: "5", l: "카테고리" }, { n: "18", l: "평가 항목" }, { n: "15", l: "강의" }, { n: "3", l: "AI 모델" }].map((m, i) => (
        <Fade key={m.l} delay={16 + i * 4}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.05em", color: i === 0 ? C.accent : C.black }}>{m.n}</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{m.l}</div>
          </div>
        </Fade>
      ))}
    </Fade>
  </Shell>
);

// 서비스 UI 데모
const S05: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const screens = ["대시보드", "강의 목록", "강의 상세", "데이터 분석"];
  const descs = ["전체 현황 · 카테고리 평균", "15개 강의 리스트뷰", "레이더 차트 · 근거 · 액션", "발화량 · 습관 표현 · 상호작용"];
  return (
    <Shell caption={scene.caption}>
      <Title delay={4} size={36}>대시보드에서 강의 상세까지</Title>
      <div style={{ display: "flex", gap: 20, marginTop: 40, width: "100%" }}>
        {screens.map((s, i) => {
          const sp = spring({ frame: f - (12 + i * 8), fps, config: { damping: 18, stiffness: 70 } });
          return (
            <div key={s} style={{ flex: 1, opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [24, 0])}px)` }}>
              <div style={{ height: 220, borderRadius: 14, background: C.surface, border: `1px solid ${C.line}`, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.line}`, display: "flex", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444" }} />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EAB308" }} />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
                </div>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 7, justifyContent: "center", height: "calc(100% - 34px)" }}>
                  {[0.85, 0.65, 0.92, 0.55, 0.72].map((w, j) => (
                    <div key={j} style={{ height: 10, borderRadius: 5, background: C.line, overflow: "hidden" }}>
                      <div style={{ width: `${w * sp * 100}%`, height: "100%", borderRadius: 5, background: j === 0 ? C.accent : `rgba(255,107,0,${0.12 + w * 0.35})` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700 }}>{s}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{descs[i]}</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// 파이프라인 개요
const S06: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const flow = spring({ frame: f - 16, fps, config: { damping: 40, stiffness: 30 } });
  const nodes = [
    { l: "STT\n스크립트", s: "22,756줄" },
    { l: "청킹", s: "30분 윈도우\n5분 오버랩" },
    { l: "병렬 평가", s: "5개 카테고리" },
    { l: "집계", s: "가중 평균" },
    { l: "리포트", s: "근거 + 액션" },
  ];
  return (
    <Shell caption={scene.caption}>
      <Title delay={4} size={36}>파이프라인</Title>
      <div style={{ position: "relative", width: "100%", maxWidth: 1100, marginTop: 40 }}>
        <div style={{ position: "absolute", top: 44, left: "10%", right: "10%", height: 3, background: C.line, borderRadius: 2 }}>
          <div style={{ width: `${flow * 100}%`, height: "100%", borderRadius: 2, background: C.accent }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {nodes.map((n, i) => {
            const ns = spring({ frame: f - (10 + i * 8), fps, config: { damping: 16, stiffness: 60 } });
            const isMid = i === 2;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 140, opacity: ns, transform: `scale(${interpolate(ns, [0, 1], [0.85, 1])})` }}>
                <div style={{
                  width: isMid ? 88 : 72, height: isMid ? 88 : 72, borderRadius: "50%",
                  background: isMid ? C.accent : C.bg, border: `2px solid ${isMid ? C.accent : C.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, lineHeight: 1.3, textAlign: "center",
                  color: isMid ? "#fff" : C.black, whiteSpace: "pre-line",
                  boxShadow: isMid ? "0 6px 20px rgba(255,107,0,0.2)" : "none",
                }}>{n.l}</div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.4 }}>{n.s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
};

// 파이프라인 상세 — 5개 카테고리 fan-out
const S07: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const cats = ["언어 표현 품질", "강의 도입 및 구조", "개념 설명 명확성", "예시 및 실습 연계", "수강생 상호작용"];
  const items = ["3항목", "5항목", "4항목", "2항목", "4항목"];
  return (
    <Shell caption={scene.caption}>
      <Title delay={4} size={36}>5개 카테고리 병렬 평가</Title>
      <Sub delay={10}>각 평가자가 동시에 채점하고, 가중 평균으로 집계합니다</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 36, width: "100%", maxWidth: 900 }}>
        {cats.map((cat, i) => {
          const cs = spring({ frame: f - (16 + i * 6), fps, config: { damping: 18, stiffness: 60 } });
          return (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 16, opacity: cs, transform: `translateX(${interpolate(cs, [0, 1], [-20, 0])}px)` }}>
              <div style={{ width: 240, textAlign: "right", fontSize: 16, fontWeight: 700, color: C.black }}>{cat}</div>
              <div style={{ flex: 1, height: 28, borderRadius: 8, background: C.surface, overflow: "hidden" }}>
                <div style={{ width: `${cs * (50 + i * 10)}%`, height: "100%", borderRadius: 8, background: `rgba(255,107,0,${0.2 + i * 0.15})` }} />
              </div>
              <div style={{ width: 50, fontSize: 13, color: C.muted, fontWeight: 600 }}>{items[i]}</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// 하네스 소개
const S08: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={40}>하네스</Title>
    <Sub delay={10}>평가 기준이 담긴 마크다운 문서입니다</Sub>
    <Fade delay={18} style={{ marginTop: 36, width: "100%", maxWidth: 800, textAlign: "left" }}>
      <div style={{ padding: "24px 28px", borderRadius: 14, background: C.surface, border: `1px solid ${C.line}`, fontFamily: "monospace", fontSize: 15, lineHeight: 1.7, color: C.sub }}>
        <span style={{ color: C.muted }}>---</span>{"\n"}
        <span style={{ color: C.accent }}>harness_id</span>: category_3_clarity{"\n"}
        <span style={{ color: C.accent }}>category</span>: "3. 개념 설명 명확성"{"\n"}
        <span style={{ color: C.accent }}>items</span>:{"\n"}
        {"  "}- item_id: "3.2"{"\n"}
        {"    "}name: "비유 및 예시 활용"{"\n"}
        {"    "}weight: HIGH{"\n"}
        {"    "}chunk_focus: all{"\n"}
        <span style={{ color: C.muted }}>---</span>
      </div>
    </Fade>
  </Shell>
);

// 하네스 예시 — 점수 기준
const S09: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const scores = [
    { s: 5, d: "추상적 개념마다 풍부한 비유와 예시", w: 100 },
    { s: 4, d: "자주 활용하며 이해에 도움", w: 80 },
    { s: 3, d: "있으나 빈도가 낮거나 부적절", w: 60 },
    { s: 2, d: "거의 없어 추상적 설명에 의존", w: 40 },
    { s: 1, d: "비유/예시 없이 용어만으로 설명", w: 20 },
  ];
  return (
    <Shell caption={scene.caption}>
      <Title delay={4} size={32}>3.2 비유 및 예시 활용</Title>
      <Sub delay={8}>어려운 개념에 적절한 비유나 실생활 예시를 활용하는가</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32, width: "100%", maxWidth: 800 }}>
        {scores.map((sc, i) => {
          const bs = spring({ frame: f - (14 + i * 5), fps, config: { damping: 22, stiffness: 60 } });
          return (
            <div key={sc.s} style={{ display: "flex", alignItems: "center", gap: 14, opacity: bs }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, background: `rgba(255,107,0,${sc.s * 0.2})`, color: sc.s >= 4 ? "#fff" : C.black }}>{sc.s}</div>
              <div style={{ flex: 1, height: 22, borderRadius: 6, background: C.line, overflow: "hidden" }}>
                <div style={{ width: `${sc.w * bs}%`, height: "100%", borderRadius: 6, background: `rgba(255,107,0,${0.12 + sc.s * 0.18})` }} />
              </div>
              <div style={{ width: 280, fontSize: 14, color: C.sub, textAlign: "left" }}>{sc.d}</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// 하네스 장점
const S10: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={36}>코드가 아니라 문서에 있습니다</Title>
    <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
      {[
        { t: "비개발자도 수정 가능", d: "마크다운 파일만 고치면\n평가 기준이 바뀝니다" },
        { t: "자동 확장", d: "category_6_new.md 파일을 추가하면\n평가 노드가 자동으로 생깁니다" },
        { t: "버전 관리", d: "Git으로 기준 변경 이력을\n추적할 수 있습니다" },
      ].map((item, i) => (
        <Fade key={item.t} delay={10 + i * 6} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.t}</div>
          <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.d}</div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// ICC
const S11: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const icc = spring({ frame: f - 12, fps, config: { damping: 18, stiffness: 50 } });
  return (
    <Shell caption={scene.caption}>
      <Fade delay={4}><div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>같은 강의를 세 번 채점해도</div></Fade>
      <div style={{ fontSize: 160, fontWeight: 900, letterSpacing: "-0.06em", color: C.accent, lineHeight: 1, marginTop: 16, fontVariantNumeric: "tabular-nums", opacity: icc }}>
        {interpolate(icc, [0, 1], [0, 0.877]).toFixed(3)}
      </div>
      <Fade delay={22}><div style={{ fontSize: 18, color: C.sub, marginTop: 12 }}>ICC · 15개 중 13개가 Good 이상</div></Fade>
    </Shell>
  );
};

// 부가 지표
const S12: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <Shell caption={scene.caption}>
      <div style={{ display: "flex", gap: 64 }}>
        {[{ l: "Kappa", v: "0.883" }, { l: "Alpha", v: "0.873" }, { l: "SSI", v: "0.974" }].map((m, i) => {
          const ms = spring({ frame: f - (6 + i * 6), fps, config: { damping: 20 } });
          return (
            <div key={m.l} style={{ opacity: ms, textAlign: "center" }}>
              <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em" }}>{m.v}</div>
              <div style={{ fontSize: 16, color: C.muted, marginTop: 8 }}>{m.l}</div>
            </div>
          );
        })}
      </div>
      <Fade delay={24}><div style={{ fontSize: 20, color: C.sub, marginTop: 36 }}>반복해도 거의 같은 점수가 나옵니다</div></Fade>
    </Shell>
  );
};

// 청크 비교
const S13: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const b30 = spring({ frame: f - 12, fps, config: { damping: 22, stiffness: 50 } });
  const b15 = spring({ frame: f - 18, fps, config: { damping: 22, stiffness: 50 } });
  return (
    <Shell caption={scene.caption}>
      <Title delay={4} size={36}>청크 크기가 점수를 바꿉니다</Title>
      <div style={{ width: "100%", maxWidth: 800, marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 14 }}>
          <div style={{ width: 100, textAlign: "right", fontSize: 16, fontWeight: 700 }}>30분</div>
          <div style={{ flex: 1, height: 52, background: C.surface, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ width: `${b30 * 64.9}%`, height: "100%", borderRadius: 12, background: C.accent, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 18 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{(3.245 * b30).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 100, textAlign: "right", fontSize: 16, fontWeight: 700, color: C.sub }}>15분</div>
          <div style={{ flex: 1, height: 52, background: C.surface, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ width: `${b15 * 60.7}%`, height: "100%", borderRadius: 12, background: C.line, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 18 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.sub }}>{(3.033 * b15).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// 청크 결론
const S14: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={40}>운영 기본값을{"\n"}30분 청크로 통일했습니다</Title>
    <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
      {["p = 0.0006", "Cohen's d = 1.142", "+0.212 차이"].map((t, i) => (
        <Fade key={i} delay={12 + i * 5}><div style={{ fontSize: 22, fontWeight: 700, color: i === 2 ? C.accent : C.black }}>{t}</div></Fade>
      ))}
    </div>
  </Shell>
);

// 리포트
const S15: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={40}>리포트는 행동 제안서입니다</Title>
    <Sub delay={10}>관찰 → 해석 → 제안 구조로 분리합니다</Sub>
  </Shell>
);

// 리포트 예시
const S16: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 800, width: "100%", textAlign: "left" }}>
      {[
        { tag: "OBSERVED", text: "강의 마무리 시 핵심 내용을\n요약하는 발언이 거의 없습니다", d: 6 },
        { tag: "INTERPRETED", text: "수강생은 오늘 무엇을 배웠는지\n정리할 기회를 놓칠 수 있습니다", d: 16 },
        { tag: "ACTION", text: "종료 1분 전 핵심 개념 3개를\n다시 말하는 루틴을 넣으세요", d: 26 },
      ].map((it) => (
        <Fade key={it.tag} delay={it.d}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: it.tag === "ACTION" ? C.accent : C.muted, marginBottom: 8 }}>{it.tag}</div>
          <div style={{ fontSize: it.tag === "ACTION" ? 24 : 20, lineHeight: 1.5, fontWeight: it.tag === "ACTION" ? 700 : 500, color: it.tag === "ACTION" ? C.black : C.sub, whiteSpace: "pre-line" }}>{it.text}</div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// 연동
const S17: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={36}>외부 서비스 연동</Title>
    <div style={{ display: "flex", gap: 48, marginTop: 40 }}>
      {[
        { t: "Google Drive", d: "트랜스크립트 파일을\n드라이브에서 가져옵니다" },
        { t: "Notion", d: "평가 결과를 노션에\n내보내고 링크로 확인합니다" },
      ].map((item, i) => (
        <Fade key={item.t} delay={10 + i * 8} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 14 }}>{item.t}</div>
          <div style={{ fontSize: 18, color: C.sub, lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.d}</div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// 미래
const S18: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Title delay={4} size={40}>신뢰도 검증은 끝냈습니다</Title>
    <Title delay={12} size={40} color={C.accent}>이제 완성하는 단계입니다</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 44, textAlign: "left" }}>
      {["유튜브 강의를 벤치마크로 비교", "평가 기준 모호 표현을 행동 지표로 정교화", "15개 강의 실데이터 전면 연결", "강사가 실제로 쓰고 싶은 도구로 완성"].map((t, i) => (
        <Fade key={i} delay={20 + i * 5}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, color: C.sub, fontWeight: 500 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: C.accent, flexShrink: 0 }} />
            {t}
          </div>
        </Fade>
      ))}
    </div>
  </Shell>
);

const SCENES: Record<string, React.FC<{ scene: VideoScene }>> = {
  "scene-01": S01, "scene-02": S02, "scene-03": S03, "scene-04": S04,
  "scene-05": S05, "scene-06": S06, "scene-07": S07, "scene-08": S08,
  "scene-09": S09, "scene-10": S10, "scene-11": S11, "scene-12": S12,
  "scene-13": S13, "scene-14": S14, "scene-15": S15, "scene-16": S16,
  "scene-17": S17, "scene-18": S18,
};

export const MidtermDeckVideo: React.FC<{ outline: OutlineData }> = ({ outline }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Series>
      {outline.videoScenes.map((scene) => {
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
