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

// ─── Types ─────────────────────────────────────────

type VideoScene = {
  id: string;
  durationSec: number;
  narration: string;
  caption: string;
};

type OutlineData = {
  meta: any;
  slides: any[];
  videoScenes: VideoScene[];
};

// ─── Design Tokens ─────────────────────────────────

const C = {
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  accent: "#FF6B00",
  black: "#0F172A",
  sub: "#475569",
  muted: "#94A3B8",
  line: "#E2E8F0",
};

const FONT = "'Pretendard Variable', 'Pretendard', -apple-system, sans-serif";

// ─── Animation Primitives ──────────────────────────

const useSpr = (delay = 0, config = { damping: 20, stiffness: 80 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config });
};

const Fade: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const s = useSpr(delay);
  return (
    <div style={{
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)`,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ─── Caption (나레이션 그대로) ──────────────────────

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const s = useSpr(8);
  return (
    <div style={{
      position: "absolute", bottom: 40, left: 60, right: 60,
      display: "flex", justifyContent: "center", opacity: s,
    }}>
      <div style={{
        maxWidth: 1400, width: "100%",
        background: "rgba(15,23,42,0.88)", backdropFilter: "blur(12px)",
        color: "#fff", borderRadius: 14, padding: "16px 32px",
        fontSize: 22, fontWeight: 500, lineHeight: 1.6,
        textAlign: "center", letterSpacing: "-0.01em",
      }}>
        {text}
      </div>
    </div>
  );
};

// ─── Shared Shell ──────────────────────────────────

const Shell: React.FC<{ children: React.ReactNode; caption: string }> = ({ children, caption }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, color: C.black }}>
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", textAlign: "center",
      padding: "80px 120px 120px",
      gap: 0,
    }}>
      {children}
    </div>
    <Caption text={caption} />
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════
// SCENE 1: COVER
// ═══════════════════════════════════════════════════

const CoverScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Fade delay={6}>
      <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.2 }}>
        AI 강의 분석
      </div>
    </Fade>
    <Fade delay={14}>
      <div style={{ fontSize: 18, color: C.muted, marginTop: 20, letterSpacing: "0.2em", fontWeight: 500 }}>
        MIDTERM PRESENTATION
      </div>
    </Fade>
    <Fade delay={20}>
      <div style={{ fontSize: 16, color: C.sub, marginTop: 32, lineHeight: 1.7 }}>
        백엔드 부트캠프 21기 · 15개 강의 · 18개 평가 항목
      </div>
    </Fade>
  </Shell>
);

// ═══════════════════════════════════════════════════
// SCENE 2: PROBLEM
// ═══════════════════════════════════════════════════

const ProblemScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Fade delay={4}>
      <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.4, letterSpacing: "-0.03em" }}>
        설문은 남지만
      </div>
    </Fade>
    <Fade delay={12}>
      <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.4, letterSpacing: "-0.03em", color: C.accent }}>
        다음 액션은 남지 않아요
      </div>
    </Fade>
    <Fade delay={22}>
      <div style={{ fontSize: 22, color: C.sub, lineHeight: 1.7, marginTop: 40, maxWidth: 700 }}>
        강의 스크립트는 수천 줄.{"\n"}
        사람이 매번 다시 읽기엔 너무 오래 걸려요.
      </div>
    </Fade>
  </Shell>
);

// ═══════════════════════════════════════════════════
// SCENE 3: SERVICE INTRO — 실제 UI 구현
// ═══════════════════════════════════════════════════

const ServiceScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 4개 화면이 순차적으로 나타남
  const screens = [
    { title: "대시보드", desc: "전체 현황 · 카테고리 평균 · 추이", color: C.accent },
    { title: "강의 목록", desc: "15개 강의 · 정렬 · 필터", color: C.sub },
    { title: "강의 상세", desc: "5개 카테고리 · 근거 · 액션", color: C.sub },
    { title: "데이터 분석", desc: "발화량 · 습관 표현 · 상호작용", color: C.sub },
  ];

  return (
    <Shell caption={scene.caption}>
      <Fade delay={4}>
        <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.3, letterSpacing: "-0.03em", marginBottom: 48 }}>
          강의 녹음을 AI가 읽고{"\n"}18개 항목으로 채점해요
        </div>
      </Fade>

      <div style={{ display: "flex", gap: 24, width: "100%" }}>
        {screens.map((s, i) => {
          const sp = spring({ frame: frame - (16 + i * 8), fps, config: { damping: 18, stiffness: 70 } });
          return (
            <div key={s.title} style={{
              flex: 1, opacity: sp,
              transform: `translateY(${interpolate(sp, [0, 1], [30, 0])}px)`,
            }}>
              {/* Mock screen */}
              <div style={{
                height: 240, borderRadius: 16, overflow: "hidden",
                background: C.surface, border: `1px solid ${C.line}`,
                display: "flex", flexDirection: "column",
              }}>
                {/* Title bar */}
                <div style={{
                  padding: "12px 16px", borderBottom: `1px solid ${C.line}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EAB308" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                </div>
                {/* Content area with bars */}
                <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                  {[0.8, 0.6, 0.9, 0.5, 0.7].map((w, j) => (
                    <div key={j} style={{
                      height: 12, borderRadius: 6, overflow: "hidden",
                      background: C.line,
                    }}>
                      <div style={{
                        width: `${w * sp * 100}%`, height: "100%", borderRadius: 6,
                        background: j === 0 ? C.accent : `rgba(255,107,0,${0.15 + w * 0.4})`,
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700, color: C.black }}>{s.title}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// ═══════════════════════════════════════════════════
// SCENE 4: PIPELINE — 3Blue1Brown 스타일
// ═══════════════════════════════════════════════════

const PipelineScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodes = [
    { label: "STT\n트랜스크립트", sub: "22,756줄" },
    { label: "전처리\n+ 청킹", sub: "30분 윈도우" },
    { label: "5개 카테고리\n병렬 평가", sub: "fan-out" },
    { label: "가중 평균\n집계", sub: "H=3 M=2 L=1" },
    { label: "리포트\n생성", sub: "근거 + 액션" },
  ];

  // 데이터 흐름 라인 진행도
  const flowProgress = spring({ frame: frame - 20, fps, config: { damping: 40, stiffness: 30 } });

  return (
    <Shell caption={scene.caption}>
      <Fade delay={4}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
          파이프라인
        </div>
      </Fade>
      <Fade delay={10}>
        <div style={{ fontSize: 20, color: C.sub, lineHeight: 1.6, marginBottom: 48 }}>
          스크립트가 들어오면, 자르고, 평가하고, 합치고, 리포트를 만들어요
        </div>
      </Fade>

      {/* Pipeline flow */}
      <div style={{ position: "relative", width: "100%", maxWidth: 1200 }}>
        {/* Connection line */}
        <div style={{
          position: "absolute", top: 50, left: "8%", right: "8%", height: 3,
          background: C.line, borderRadius: 2,
        }}>
          <div style={{
            width: `${flowProgress * 100}%`, height: "100%", borderRadius: 2,
            background: C.accent, transition: "width 0.1s",
          }} />
        </div>

        {/* Nodes */}
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {nodes.map((node, i) => {
            const ns = spring({ frame: frame - (14 + i * 10), fps, config: { damping: 16, stiffness: 60 } });
            const isCenter = i === 2;
            return (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                opacity: ns, transform: `scale(${interpolate(ns, [0, 1], [0.85, 1])})`,
                width: 160,
              }}>
                {/* Circle node */}
                <div style={{
                  width: isCenter ? 100 : 80, height: isCenter ? 100 : 80,
                  borderRadius: "50%",
                  background: isCenter ? C.accent : C.bg,
                  border: `2px solid ${isCenter ? C.accent : C.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, lineHeight: 1.3, textAlign: "center",
                  color: isCenter ? "#fff" : C.black,
                  whiteSpace: "pre-line",
                  boxShadow: isCenter ? `0 8px 24px rgba(255,107,0,0.2)` : "none",
                }}>
                  {node.label}
                </div>
                <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{node.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Fan-out detail for evaluator */}
        <Fade delay={50} style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 12 }}>
          {["언어 품질", "강의 구조", "개념 명확성", "예시/실습", "상호작용"].map((cat, i) => {
            const cs = spring({ frame: frame - (52 + i * 4), fps, config: { damping: 18 } });
            return (
              <div key={cat} style={{
                padding: "10px 16px", borderRadius: 999, fontSize: 14, fontWeight: 600,
                background: `rgba(255,107,0,${0.06 + i * 0.04})`, color: C.accent,
                opacity: cs, transform: `translateY(${interpolate(cs, [0, 1], [12, 0])}px)`,
              }}>
                {cat}
              </div>
            );
          })}
        </Fade>
      </div>
    </Shell>
  );
};

// ═══════════════════════════════════════════════════
// SCENE 5: HARNESS — 평가 메커니즘 시각화
// ═══════════════════════════════════════════════════

const HarnessScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scores = [
    { score: 5, desc: "매번 풍부하게 사용", width: 100 },
    { score: 4, desc: "자주 활용, 이해에 도움", width: 80 },
    { score: 3, desc: "있으나 빈도 낮음", width: 60 },
    { score: 2, desc: "거의 없음", width: 40 },
    { score: 1, desc: "전혀 없음", width: 20 },
  ];

  return (
    <Shell caption={scene.caption}>
      <Fade delay={4}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
          평가 기준: 하네스
        </div>
      </Fade>
      <Fade delay={10}>
        <div style={{ fontSize: 20, color: C.sub, lineHeight: 1.6, marginBottom: 40 }}>
          마크다운 파일에 정의된 채점 기준. 비개발자도 수정할 수 있어요
        </div>
      </Fade>

      {/* Example: 비유 및 예시 활용 */}
      <Fade delay={16}>
        <div style={{
          padding: "24px 32px", borderRadius: 16, background: C.surface,
          border: `1px solid ${C.line}`, width: "100%", maxWidth: 900, textAlign: "left",
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: C.accent, marginBottom: 12 }}>
            3.2 비유 및 예시 활용
          </div>
          <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.6, marginBottom: 20 }}>
            어려운 개념에 적절한 비유나 실생활 예시를 활용하는가
          </div>

          {/* Score bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scores.map((s, i) => {
              const bs = spring({ frame: frame - (28 + i * 5), fps, config: { damping: 22, stiffness: 60 } });
              return (
                <div key={s.score} style={{ display: "flex", alignItems: "center", gap: 16, opacity: bs }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800,
                    background: `rgba(255,107,0,${s.score * 0.2})`,
                    color: s.score >= 4 ? "#fff" : C.black,
                  }}>
                    {s.score}
                  </div>
                  <div style={{
                    height: 24, borderRadius: 6, overflow: "hidden",
                    background: C.line, flex: 1,
                  }}>
                    <div style={{
                      width: `${s.width * bs}%`, height: "100%", borderRadius: 6,
                      background: `rgba(255,107,0,${0.15 + s.score * 0.17})`,
                    }} />
                  </div>
                  <div style={{ fontSize: 14, color: C.sub, width: 200, fontWeight: 500 }}>{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Fade>
    </Shell>
  );
};

// ═══════════════════════════════════════════════════
// SCENE 6: RELIABILITY — ICC 카운트업
// ═══════════════════════════════════════════════════

const ReliabilityScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iccSpr = spring({ frame: frame - 16, fps, config: { damping: 18, stiffness: 50 } });
  const iccVal = interpolate(iccSpr, [0, 1], [0, 0.877]);

  return (
    <Shell caption={scene.caption}>
      <Fade delay={4}>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em" }}>
          같은 강의를 세 번 평가해도
        </div>
      </Fade>

      {/* Big ICC */}
      <div style={{
        fontSize: 160, fontWeight: 900, letterSpacing: "-0.06em",
        color: C.accent, lineHeight: 1, marginTop: 20, marginBottom: 16,
        fontVariantNumeric: "tabular-nums",
        opacity: iccSpr,
      }}>
        {iccVal.toFixed(3)}
      </div>

      <Fade delay={24}>
        <div style={{ fontSize: 20, color: C.sub, lineHeight: 1.6 }}>
          ICC · 15개 강의 중 13개가 Good 이상
        </div>
      </Fade>

      {/* Sub metrics */}
      <div style={{ display: "flex", gap: 64, marginTop: 40 }}>
        {[
          { label: "Kappa", value: "0.883" },
          { label: "Alpha", value: "0.873" },
          { label: "SSI", value: "0.974" },
        ].map((m, i) => {
          const ms = spring({ frame: frame - (32 + i * 6), fps, config: { damping: 20 } });
          return (
            <div key={m.label} style={{ opacity: ms, textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em" }}>{m.value}</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{m.label}</div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// ═══════════════════════════════════════════════════
// SCENE 7: CHUNK COMPARISON
// ═══════════════════════════════════════════════════

const ChunkScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b30 = spring({ frame: frame - 14, fps, config: { damping: 22, stiffness: 50 } });
  const b15 = spring({ frame: frame - 20, fps, config: { damping: 22, stiffness: 50 } });

  return (
    <Shell caption={scene.caption}>
      <Fade delay={4}>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 48 }}>
          청크 크기가 점수를 바꿔요
        </div>
      </Fade>

      <div style={{ width: "100%", maxWidth: 800 }}>
        {/* 30min */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ width: 120, textAlign: "right", fontSize: 18, fontWeight: 700 }}>30분 청크</div>
          <div style={{ flex: 1, height: 56, background: C.surface, borderRadius: 14, overflow: "hidden" }}>
            <div style={{
              width: `${b30 * 64.9}%`, height: "100%", borderRadius: 14,
              background: C.accent,
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 20,
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{(3.245 * b30).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 15min */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 120, textAlign: "right", fontSize: 18, fontWeight: 700, color: C.sub }}>15분 청크</div>
          <div style={{ flex: 1, height: 56, background: C.surface, borderRadius: 14, overflow: "hidden" }}>
            <div style={{
              width: `${b15 * 60.7}%`, height: "100%", borderRadius: 14,
              background: C.line,
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 20,
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: C.sub }}>{(3.033 * b15).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 48, marginTop: 48 }}>
        {["p = 0.0006", "Cohen's d = 1.142", "+0.212 차이"].map((t, i) => (
          <Fade key={i} delay={34 + i * 6}>
            <div style={{ fontSize: 20, fontWeight: 700, color: i === 2 ? C.accent : C.black }}>{t}</div>
          </Fade>
        ))}
      </div>
    </Shell>
  );
};

// ═══════════════════════════════════════════════════
// SCENE 8: REPORT — 실제 예시
// ═══════════════════════════════════════════════════

const ReportScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Fade delay={4}>
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 48 }}>
        리포트는 행동 제안서예요
      </div>
    </Fade>

    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 800, width: "100%", textAlign: "left" }}>
      {[
        { tag: "OBSERVED", text: "강의 마무리 시 핵심 내용을\n요약하는 발언이 거의 없어요", delay: 12 },
        { tag: "INTERPRETED", text: "수강생은 오늘 무엇을 배웠는지\n정리할 기회를 놓칠 수 있어요", delay: 22 },
        { tag: "ACTION", text: "종료 1분 전 핵심 개념 3개를\n다시 말하는 루틴을 넣어보세요", delay: 32 },
      ].map((item) => (
        <Fade key={item.tag} delay={item.delay}>
          <div>
            <div style={{
              fontSize: 13, fontWeight: 800, letterSpacing: "0.12em",
              color: item.tag === "ACTION" ? C.accent : C.muted, marginBottom: 10,
            }}>
              {item.tag}
            </div>
            <div style={{
              fontSize: item.tag === "ACTION" ? 26 : 22, lineHeight: 1.5,
              fontWeight: item.tag === "ACTION" ? 700 : 500,
              color: item.tag === "ACTION" ? C.black : C.sub,
              whiteSpace: "pre-line",
            }}>
              {item.text}
            </div>
          </div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// ═══════════════════════════════════════════════════
// SCENE 9: FUTURE
// ═══════════════════════════════════════════════════

const FutureScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <Shell caption={scene.caption}>
    <Fade delay={4}>
      <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.4, letterSpacing: "-0.03em" }}>
        신뢰도 검증은 끝냈어요
      </div>
    </Fade>
    <Fade delay={12}>
      <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.4, letterSpacing: "-0.03em", color: C.accent }}>
        이제 완성하는 단계예요
      </div>
    </Fade>

    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 48, textAlign: "left" }}>
      {[
        "유튜브 강의를 벤치마크로 비교하는 기능",
        "평가 기준의 모호한 표현을 행동 지표로 정교화",
        "15개 강의 실데이터 전면 연결",
        "강사가 실제로 쓰고 싶은 도구로 완성",
      ].map((item, i) => (
        <Fade key={i} delay={20 + i * 6}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: C.sub, fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: C.accent, flexShrink: 0 }} />
            {item}
          </div>
        </Fade>
      ))}
    </div>
  </Shell>
);

// ═══════════════════════════════════════════════════
// SCENE ROUTER
// ═══════════════════════════════════════════════════

const SCENES: Record<string, React.FC<{ scene: VideoScene }>> = {
  "scene-01": CoverScene,
  "scene-02": ProblemScene,
  "scene-03": ServiceScene,
  "scene-04": PipelineScene,
  "scene-05": HarnessScene,
  "scene-06": ReliabilityScene,
  "scene-07": ChunkScene,
  "scene-08": ReportScene,
  "scene-09": FutureScene,
};

// ═══════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════

export const MidtermDeckVideo: React.FC<{ outline: OutlineData }> = ({ outline }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Series>
      {outline.videoScenes.map((scene) => {
        const Comp = SCENES[scene.id];
        if (!Comp) return null;
        const dur = Math.round(scene.durationSec * 30);
        return (
          <Series.Sequence key={scene.id} durationInFrames={dur}>
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
