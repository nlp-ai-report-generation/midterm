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

// ─── Types ─────────────────────────────────────────────

type VideoScene = {
  id: string;
  slideId: string;
  durationSec: number;
  narration: string;
  caption: string;
  assetRefs: string[];
};

type OutlineData = {
  meta: { title: string; subtitle: string; version: string; authors: string[] };
  slides: any[];
  videoScenes: VideoScene[];
};

// ─── Colors ────────────────────────────────────────────

const C = {
  bg: "#FAFAFA",
  white: "#FFFFFF",
  black: "#0F172A",
  accent: "#FF6B00",
  sub: "#64748B",
  muted: "#94A3B8",
  line: "#E2E8F0",
};

const font = "'Pretendard Variable', 'Pretendard', -apple-system, sans-serif";

// ─── Animation Helpers ─────────────────────────────────

const useFade = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 80 } });
  return { opacity: s, y: interpolate(s, [0, 1], [40, 0]) };
};

const BigText: React.FC<{ children: string; delay?: number; size?: number; color?: string; align?: string }> = ({
  children, delay = 0, size = 64, color = C.black, align = "left",
}) => {
  const { opacity, y } = useFade(delay);
  return (
    <div style={{
      fontSize: size, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.04em",
      color, whiteSpace: "pre-line", textAlign: align as any,
      opacity, transform: `translateY(${y}px)`,
    }}>
      {children}
    </div>
  );
};

const SubText: React.FC<{ children: string; delay?: number; size?: number }> = ({
  children, delay = 8, size = 28,
}) => {
  const { opacity, y } = useFade(delay);
  return (
    <div style={{
      fontSize: size, fontWeight: 500, lineHeight: 1.6, color: C.sub,
      maxWidth: 900, opacity, transform: `translateY(${y}px)`,
    }}>
      {children}
    </div>
  );
};

const AccentLine: React.FC<{ delay?: number }> = ({ delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 60 } });
  return (
    <div style={{
      width: `${w * 80}px`, height: 4, borderRadius: 2,
      background: C.accent, marginTop: 16, marginBottom: 16,
    }} />
  );
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const { opacity } = useFade(12);
  return (
    <div style={{
      position: "absolute", bottom: 52, left: 0, right: 0,
      display: "flex", justifyContent: "center", opacity,
    }}>
      <div style={{
        background: "rgba(15,23,42,0.88)", backdropFilter: "blur(12px)",
        color: "white", borderRadius: 14, padding: "16px 36px",
        fontSize: 24, fontWeight: 500, lineHeight: 1.5, textAlign: "center",
        maxWidth: 1100, letterSpacing: "-0.01em",
      }}>
        {text}
      </div>
    </div>
  );
};

const PageNum: React.FC<{ n: number; total: number }> = ({ n, total }) => (
  <div style={{
    position: "absolute", top: 40, right: 72,
    fontSize: 14, fontWeight: 700, color: C.muted,
    fontVariantNumeric: "tabular-nums",
  }}>
    {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
  </div>
);

// ─── Scenes ────────────────────────────────────────────

// Scene 1: Cover — 큰 타이틀 중앙
const CoverScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: C.white, fontFamily: font }}>
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(ellipse at 30% 40%, rgba(255,107,0,0.06), transparent 60%)`,
    }} />
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", textAlign: "center", gap: 20,
    }}>
      <BigText delay={6} size={80} align="center">AI 강의 분석</BigText>
      <SubText delay={16} size={22}>Transforming lecture feedback from scores to evidence</SubText>
      <div style={{ marginTop: 32 }}>
        <SubText delay={24} size={16}>백엔드 부트캠프 21기 · 15개 강의 · 18개 평가 항목</SubText>
      </div>
    </div>
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

// Scene 2: Problem — 텍스트만, 크게
const ProblemScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: C.white, fontFamily: font, padding: "0 120px" }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 24 }}>
      <BigText delay={4} size={56}>설문은 남지만,</BigText>
      <BigText delay={10} size={56} color={C.accent}>다음 액션은 남지 않아요.</BigText>
      <AccentLine delay={16} />
      <SubText delay={20}>강의 스크립트는 길고 복잡해서 사람이 매번 다시 읽기엔 비용이 커요. 점수만 있으면 이유가 없고, 서술만 있으면 기준이 흔들려요.</SubText>
    </div>
    <PageNum n={1} total={8} />
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

// Scene 3: Pipeline — 애니메이션 다이어그램
const PipelineScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodes = ["STT\n트랜스크립트", "전처리\n+ 청킹", "5개 카테고리\n병렬 평가", "가중 평균\n집계", "리포트\n생성"];

  return (
    <AbsoluteFill style={{ background: C.white, fontFamily: font, padding: "0 100px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 48 }}>
        <BigText delay={4} size={48}>평가부터 리포트까지, 한 흐름</BigText>

        {/* Pipeline diagram */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: 16 }}>
          {nodes.map((node, i) => {
            const nodeSpring = spring({ frame: frame - (12 + i * 8), fps, config: { damping: 18, stiffness: 70 } });
            const arrowSpring = i < nodes.length - 1
              ? spring({ frame: frame - (16 + i * 8), fps, config: { damping: 20 } })
              : 0;
            return (
              <React.Fragment key={i}>
                <div style={{
                  width: 160, padding: "24px 16px", textAlign: "center",
                  fontSize: 16, fontWeight: 700, lineHeight: 1.4,
                  whiteSpace: "pre-line", borderRadius: 16,
                  background: i === 2 ? C.accent : C.bg,
                  color: i === 2 ? C.white : C.black,
                  opacity: nodeSpring,
                  transform: `translateY(${interpolate(nodeSpring, [0, 1], [20, 0])}px) scale(${interpolate(nodeSpring, [0, 1], [0.9, 1])})`,
                }}>
                  {node}
                </div>
                {i < nodes.length - 1 && (
                  <div style={{
                    width: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 800, color: C.accent,
                    opacity: arrowSpring as number,
                  }}>
                    →
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Detail text */}
        <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
          {["30분 윈도우 · 5분 오버랩", "하네스(MD) 기반 평가", "HIGH=3 · MED=2 · LOW=1"].map((t, i) => {
            const s = spring({ frame: frame - (50 + i * 6), fps, config: { damping: 20 } });
            return (
              <div key={i} style={{
                fontSize: 15, color: C.sub, fontWeight: 600,
                opacity: s, transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`,
              }}>
                {t}
              </div>
            );
          })}
        </div>
      </div>
      <PageNum n={2} total={8} />
      <Caption text={scene.caption} />
    </AbsoluteFill>
  );
};

// Scene 4: Reliability — 숫자가 크게 올라오는 장면
const ReliabilityScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iccSpring = spring({ frame: frame - 14, fps, config: { damping: 16, stiffness: 50 } });
  const iccValue = interpolate(iccSpring, [0, 1], [0, 0.877]);

  return (
    <AbsoluteFill style={{ background: C.white, fontFamily: font, padding: "0 120px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 32 }}>
        <BigText delay={4} size={44}>같은 강의를 세 번 읽어도</BigText>

        {/* Big ICC number */}
        <div style={{
          fontSize: 140, fontWeight: 900, letterSpacing: "-0.06em",
          color: C.accent, lineHeight: 1, fontVariantNumeric: "tabular-nums",
          opacity: iccSpring, transform: `translateY(${interpolate(iccSpring, [0, 1], [30, 0])}px)`,
        }}>
          {iccValue.toFixed(3)}
        </div>

        <SubText delay={22} size={20}>ICC (급내상관계수) — 15개 강의 중 13개가 Good 이상</SubText>

        {/* Small metrics row */}
        <div style={{ display: "flex", gap: 48, marginTop: 8 }}>
          {[
            { label: "Kappa", value: "0.883" },
            { label: "Alpha", value: "0.873" },
            { label: "SSI", value: "0.974" },
          ].map((m, i) => {
            const s = spring({ frame: frame - (30 + i * 6), fps, config: { damping: 20 } });
            return (
              <div key={m.label} style={{ opacity: s }}>
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", color: C.black }}>{m.value}</div>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <PageNum n={3} total={8} />
      <Caption text={scene.caption} />
    </AbsoluteFill>
  );
};

// Scene 5: Chunk size — 비교 애니메이션
const ChunkScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar30 = spring({ frame: frame - 14, fps, config: { damping: 20, stiffness: 60 } });
  const bar15 = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 60 } });

  return (
    <AbsoluteFill style={{ background: C.white, fontFamily: font, padding: "0 120px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 40 }}>
        <BigText delay={4} size={48}>청크 크기가 점수를 바꿔요</BigText>

        {/* Visual comparison */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800 }}>
          {/* 30min bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ width: 100, fontSize: 16, fontWeight: 700, color: C.black, textAlign: "right" }}>30분 청크</span>
            <div style={{ flex: 1, height: 48, background: C.bg, borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                width: `${bar30 * 64.9}%`, height: "100%", borderRadius: 12,
                background: C.accent, display: "flex", alignItems: "center",
                justifyContent: "flex-end", paddingRight: 16,
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.white }}>{(3.245 * bar30).toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* 15min bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ width: 100, fontSize: 16, fontWeight: 700, color: C.sub, textAlign: "right" }}>15분 청크</span>
            <div style={{ flex: 1, height: 48, background: C.bg, borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                width: `${bar15 * 60.7}%`, height: "100%", borderRadius: 12,
                background: C.line, display: "flex", alignItems: "center",
                justifyContent: "flex-end", paddingRight: 16,
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.sub }}>{(3.033 * bar15).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48 }}>
          {["p = 0.0006", "Cohen's d = 1.142", "+0.212 차이"].map((t, i) => {
            const s = spring({ frame: frame - (34 + i * 6), fps, config: { damping: 20 } });
            return (
              <div key={i} style={{
                fontSize: 18, fontWeight: 700, color: i === 2 ? C.accent : C.black,
                opacity: s,
              }}>
                {t}
              </div>
            );
          })}
        </div>
      </div>
      <PageNum n={4} total={8} />
      <Caption text={scene.caption} />
    </AbsoluteFill>
  );
};

// Scene 6: Demo flow — 화면 목업 순차 등장
const DemoScene: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = ["Dashboard", "Experiments", "EDA", "Lecture Detail"];
  const descs = ["전체 현황", "모델 비교", "데이터 분석", "근거와 액션"];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: font, padding: "0 80px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 40 }}>
        <BigText delay={4} size={44}>실제 사용 흐름</BigText>

        <div style={{ display: "flex", gap: 20 }}>
          {steps.map((step, i) => {
            const s = spring({ frame: frame - (14 + i * 10), fps, config: { damping: 16, stiffness: 60 } });
            return (
              <React.Fragment key={step}>
                <div style={{
                  flex: 1, opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                }}>
                  <div style={{
                    height: 280, background: C.white, borderRadius: 16,
                    border: `1px solid ${C.line}`, overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(15,23,42,0.06)",
                  }}>
                    {scene.assetRefs[i] ? (
                      <img src={staticFile(`assets/${scene.assetRefs[i]}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "100%", background: `linear-gradient(180deg, ${C.white}, ${C.bg})` }} />
                    )}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 18, fontWeight: 700, color: C.black }}>{step}</div>
                  <div style={{ fontSize: 14, color: C.sub, marginTop: 4 }}>{descs[i]}</div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    display: "flex", alignItems: "center", fontSize: 20,
                    color: C.accent, fontWeight: 800, paddingTop: 120,
                    opacity: spring({ frame: frame - (20 + i * 10), fps, config: { damping: 20 } }),
                  }}>
                    →
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <PageNum n={5} total={8} />
      <Caption text={scene.caption} />
    </AbsoluteFill>
  );
};

// Scene 7: Report — 행동 제안서 스타일
const ReportScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: C.white, fontFamily: font, padding: "0 120px" }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 32 }}>
      <BigText delay={4} size={48}>리포트는 행동 제안서예요</BigText>
      <AccentLine delay={10} />

      <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 900 }}>
        {[
          { label: "OBSERVED", text: "강의 마무리 시 핵심 내용을 요약하는 발언이 거의 없어요", delay: 14 },
          { label: "INTERPRETED", text: "수강생은 오늘 무엇을 배웠는지 정리할 기회를 놓칠 수 있어요", delay: 22 },
          { label: "ACTION", text: "종료 1분 전 핵심 개념 3개를 다시 말하는 루틴을 넣어보세요", delay: 30 },
        ].map((item) => {
          const { opacity, y } = useFade(item.delay);
          return (
            <div key={item.label} style={{ opacity, transform: `translateY(${y}px)` }}>
              <div style={{
                fontSize: 12, fontWeight: 800, letterSpacing: "0.14em",
                color: item.label === "ACTION" ? C.accent : C.muted,
                marginBottom: 8,
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: item.label === "ACTION" ? 26 : 22, lineHeight: 1.5,
                color: item.label === "ACTION" ? C.black : C.sub,
                fontWeight: item.label === "ACTION" ? 700 : 500,
              }}>
                {item.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <PageNum n={6} total={8} />
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

// Scene 8: Next — 미래 비전
const NextScene: React.FC<{ scene: VideoScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: C.white, fontFamily: font, padding: "0 120px" }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 32 }}>
      <BigText delay={4} size={52}>신뢰도 검증은 끝냈어요.</BigText>
      <BigText delay={12} size={52} color={C.accent}>이제 완성하는 단계예요.</BigText>
      <AccentLine delay={18} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
        {[
          "15개 강의 실데이터 프론트 전면 연결",
          "유튜브 벤치마크 비교 기능",
          "A/B 실험 확대 + 조작적 정의 정교화",
          "운영 UX 마감",
        ].map((item, i) => {
          const { opacity, y } = useFade(24 + i * 6);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              fontSize: 22, color: C.sub, fontWeight: 500,
              opacity, transform: `translateY(${y}px)`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: C.accent, flexShrink: 0 }} />
              {item}
            </div>
          );
        })}
      </div>
    </div>
    <PageNum n={7} total={8} />
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

// ─── Scene Router ──────────────────────────────────────

const SCENE_MAP: Record<string, React.FC<{ scene: VideoScene }>> = {
  "scene-01": CoverScene,
  "scene-02": ProblemScene,
  "scene-03": PipelineScene,
  "scene-04": ReliabilityScene,
  "scene-05": ChunkScene,
  "scene-06": DemoScene,
  "scene-07": ReportScene,
  "scene-08": NextScene,
};

// ─── Main Composition ──────────────────────────────────

export const MidtermDeckVideo: React.FC<{ outline: OutlineData }> = ({ outline }) => {
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Series>
        {outline.videoScenes.map((scene) => {
          const Comp = SCENE_MAP[scene.id];
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
};
