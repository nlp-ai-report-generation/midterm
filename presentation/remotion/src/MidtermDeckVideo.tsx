import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Types ─────────────────────────────────────────────

type BodyBlock = { label: string; items: string[] };
type HeroMetric = { label: string; value: string };

type SlideVisual = {
  type: string;
  kicker?: string;
  metrics?: Array<{ label: string; value: string; status?: string }>;
  cards?: Array<{ title: string; text: string }>;
  stats?: Array<{ label: string; value: string } | string>;
  sources?: string[];
  nodes?: string[];
  detail?: string[];
  reasons?: Array<{ title: string; text: string }>;
  focusItems?: string[];
  distribution?: Array<{ label: string; value: number }>;
  callout?: string;
  comparison?: Array<{ label: string; value: string }>;
  steps?: Array<{ title: string; caption: string }>;
  sample?: { fact: string; interpretation: string; action: string };
  score?: string;
  columns?: Array<{ title: string; items: string[] }>;
};

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  body: BodyBlock[];
  visual: SlideVisual;
  assets: string[];
  speakerNotes: string[];
};

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
  slides: Slide[];
  videoScenes: VideoScene[];
};

// ─── Colors (ADELIE-inspired, orange accent) ───────────

const C = {
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  accent: "#FF6B00",
  accentSoft: "rgba(255, 107, 0, 0.06)",
  accentMid: "rgba(255, 107, 0, 0.12)",
  text: "#0F172A",
  sub: "#475569",
  muted: "#94A3B8",
  line: "#E2E8F0",
  dark: "#1E293B",
};

// ─── Animated Helpers ──────────────────────────────────

const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 80 } });
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const CountUp: React.FC<{ value: string; delay?: number }> = ({ value, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 60 } });
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");
  if (isNaN(num)) return <span>{value}</span>;
  const displayNum = Math.round(interpolate(progress, [0, 1], [0, num]));
  return <span>{value.includes(".") ? (num * progress).toFixed(3) : displayNum}{suffix}</span>;
};

// ─── Caption Bar ───────────────────────────────────────

const CaptionBar: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame: frame - 10, fps, config: { damping: 20 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 48,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(12px)",
          color: "white",
          borderRadius: 16,
          padding: "18px 32px",
          fontSize: 26,
          lineHeight: 1.5,
          textAlign: "center",
          letterSpacing: "-0.01em",
          fontWeight: 500,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ─── Progress Bar ──────────────────────────────────────

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const width = spring({ frame, fps, config: { damping: 30 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: C.line,
      }}
    >
      <div
        style={{
          width: `${((current + width) / total) * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${C.accent}, #FFB380)`,
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
};

// ─── Metric Card ───────────────────────────────────────

const MetricCard: React.FC<{
  label: string;
  value: string;
  status?: string;
  delay: number;
  large?: boolean;
}> = ({ label, value, status, delay, large }) => (
  <FadeUp delay={delay}>
    <div
      style={{
        padding: large ? "32px 28px" : "24px 22px",
        borderRadius: 20,
        background: C.bg,
        border: `1px solid ${C.line}`,
      }}
    >
      <div
        style={{
          fontSize: large ? 52 : 40,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          color: C.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <CountUp value={value} delay={delay} />
      </div>
      <div style={{ marginTop: 8, fontSize: large ? 18 : 16, color: C.muted }}>{label}</div>
      {status && (
        <div
          style={{
            marginTop: 12,
            display: "inline-flex",
            padding: "6px 12px",
            borderRadius: 999,
            background: C.accentMid,
            color: C.accent,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {status}
        </div>
      )}
    </div>
  </FadeUp>
);

// ─── Scene Layout ──────────────────────────────────────

const SceneCard: React.FC<{
  slide: Slide;
  scene: VideoScene;
  sceneIndex: number;
  totalScenes: number;
}> = ({ slide, scene, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({ frame, fps, config: { damping: 16, stiffness: 60 } });
  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: C.surface,
        fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, sans-serif",
        color: C.text,
      }}
    >
      {/* Progress bar */}
      <ProgressBar current={sceneIndex} total={totalScenes} />

      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 0% 0%, ${C.accentSoft}, transparent 50%),
                       radial-gradient(ellipse at 100% 100%, rgba(15,23,42,0.03), transparent 50%)`,
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          right: 80,
          bottom: 100,
          borderRadius: 28,
          background: C.bg,
          border: `1px solid ${C.line}`,
          boxShadow: "0 24px 60px rgba(15,23,42,0.06)",
          padding: "48px 56px",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: 32,
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: `1px solid ${C.line}`,
              paddingBottom: 24,
            }}
          >
            <FadeUp delay={4}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: C.accent,
                  }}
                >
                  AI Lecture Analysis
                </div>
                <h1
                  style={{
                    marginTop: 10,
                    fontSize: 48,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: "-0.04em",
                    whiteSpace: "pre-line",
                  }}
                >
                  {slide.title}
                </h1>
                <p
                  style={{
                    marginTop: 14,
                    fontSize: 22,
                    lineHeight: 1.6,
                    color: C.sub,
                    maxWidth: 900,
                  }}
                >
                  {slide.subtitle}
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={8}>
              <div
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: C.accentSoft,
                  color: C.accent,
                  fontSize: 15,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {String(sceneIndex + 1).padStart(2, "0")} / {String(totalScenes).padStart(2, "0")}
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Body: Left evidence + Right visual */}
        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 32, minHeight: 0, overflow: "hidden" }}>
          {/* Left: Evidence blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {slide.body.map((block, bIdx) => (
              <FadeUp key={block.label} delay={12 + bIdx * 6}>
                <div
                  style={{
                    borderRadius: 18,
                    border: `1px solid ${C.line}`,
                    background: C.surface,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: C.accent,
                      marginBottom: 10,
                    }}
                  >
                    {block.label}
                  </div>
                  {block.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        marginTop: iIdx > 0 ? 8 : 0,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: C.accent,
                          marginTop: 10,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 18, lineHeight: 1.6, color: C.sub }}>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Right: Visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <VisualRenderer slide={slide} scene={scene} />
          </div>
        </div>
      </div>

      {/* Caption */}
      <CaptionBar text={scene.caption} />
    </AbsoluteFill>
  );
};

// ─── Visual Renderer ───────────────────────────────────

const VisualRenderer: React.FC<{ slide: Slide; scene: VideoScene }> = ({ slide, scene }) => {
  const v = slide.visual;

  if (v.type === "heroMetrics" && v.metrics) {
    return (
      <>
        <FadeUp delay={10}>
          <div
            style={{
              borderRadius: 24,
              background: `linear-gradient(135deg, ${C.accentSoft}, rgba(255,255,255,0.9))`,
              border: `1px solid ${C.accentMid}`,
              padding: 28,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase" }}>
              {v.kicker ?? "Midterm Review"}
            </div>
            <div style={{ fontSize: 36, lineHeight: 1.2, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 12 }}>
              강의 개선에 바로 연결되는{"\n"}운영형 리포트 경험
            </div>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.metrics.length}, 1fr)`, gap: 14 }}>
          {v.metrics.map((m, i) => (
            <MetricCard key={m.label} label={m.label} value={m.value} delay={16 + i * 5} large />
          ))}
        </div>
      </>
    );
  }

  if (v.type === "reliability" && v.metrics) {
    const maxVal = Math.max(...(v.distribution?.map((d) => d.value) ?? [1]), 1);
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.metrics.length}, 1fr)`, gap: 12 }}>
          {v.metrics.map((m, i) => (
            <MetricCard key={m.label} label={m.label} value={m.value} status={m.status} delay={14 + i * 4} />
          ))}
        </div>
        {v.distribution && (
          <FadeUp delay={30}>
            <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.bg, padding: 22 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>강의별 ICC 분포</div>
              {v.distribution.map((d) => (
                <div key={d.label} style={{ display: "grid", gridTemplateColumns: "200px 1fr 50px", gap: 12, alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 16, color: C.sub }}>{d.label}</span>
                  <div style={{ height: 14, borderRadius: 999, background: C.accentSoft, overflow: "hidden" }}>
                    <div style={{ width: `${(d.value / maxVal) * 100}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${C.accent}, #FFB380)` }} />
                  </div>
                  <span style={{ fontSize: 16, color: C.sub, textAlign: "right" }}>{d.value}개</span>
                </div>
              ))}
            </div>
          </FadeUp>
        )}
        {v.callout && (
          <FadeUp delay={38}>
            <div style={{ borderRadius: 20, padding: 22, background: `linear-gradient(135deg, ${C.accentSoft}, rgba(255,255,255,0.9))`, border: `1px solid ${C.accentMid}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent }}>핵심 메시지</div>
              <div style={{ marginTop: 10, fontSize: 28, lineHeight: 1.35, fontWeight: 700, letterSpacing: "-0.03em" }}>{v.callout}</div>
            </div>
          </FadeUp>
        )}
      </>
    );
  }

  if (v.type === "chunking" && v.comparison) {
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.comparison.length}, 1fr)`, gap: 12 }}>
          {v.comparison.map((c, i) => (
            <MetricCard key={c.label} label={c.label} value={c.value} delay={14 + i * 5} />
          ))}
        </div>
        {v.stats && (
          <FadeUp delay={28}>
            <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.bg, padding: 22 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>검정 결과</div>
              {(v.stats as string[]).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", marginTop: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: C.accent, marginTop: 10, flexShrink: 0 }} />
                  <span style={{ fontSize: 18, lineHeight: 1.55, color: C.sub }}>{s}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        )}
      </>
    );
  }

  if (v.type === "demoFlow" && v.steps) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.steps.length}, 1fr)`, gap: 12 }}>
        {v.steps.map((step, i) => (
          <FadeUp key={step.title} delay={14 + i * 6}>
            <div style={{ borderRadius: 18, border: `1px solid ${C.line}`, background: C.bg, padding: 12, height: "100%" }}>
              <div style={{ overflow: "hidden", borderRadius: 14, border: `1px solid ${C.line}` }}>
                {scene.assetRefs[i] ? (
                  <Img src={staticFile(`assets/${scene.assetRefs[i]}`)} style={{ width: "100%", height: 200, objectFit: "cover" }} />
                ) : (
                  <div style={{ height: 200, background: `linear-gradient(180deg, ${C.surface}, ${C.line})` }} />
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700 }}>{step.title}</div>
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.55, color: C.sub }}>{step.caption}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    );
  }

  if (v.type === "reportSample" && v.sample) {
    const sections: [string, string][] = [
      ["관찰된 사실", v.sample.fact],
      ["해석", v.sample.interpretation],
      ["개선 제안", v.sample.action],
    ];
    return (
      <>
        <FadeUp delay={14}>
          <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.bg, padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>리포트 구조</div>
            <div style={{ marginTop: 12, fontSize: 48, fontWeight: 800, letterSpacing: "-0.05em" }}>{v.score}</div>
            <div style={{ marginTop: 10, fontSize: 18, lineHeight: 1.6, color: C.sub }}>
              숫자보다 근거와 액션으로 읽히는 결과물
            </div>
          </div>
        </FadeUp>
        {sections.map(([label, text], i) => (
          <FadeUp key={label} delay={22 + i * 6}>
            <div style={{ borderRadius: 16, background: C.surface, border: `1px solid ${C.line}`, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent }}>{label}</div>
              <div style={{ marginTop: 8, fontSize: 17, lineHeight: 1.6, color: C.sub }}>{text}</div>
            </div>
          </FadeUp>
        ))}
      </>
    );
  }

  if (v.type === "nextSteps" && v.columns) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.columns.length}, 1fr)`, gap: 14 }}>
        {v.columns.map((col, colIdx) => (
          <FadeUp key={col.title} delay={14 + colIdx * 6}>
            <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.bg, padding: 22, height: "100%" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{col.title}</div>
              {col.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", marginTop: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: C.accent, marginTop: 10, flexShrink: 0 }} />
                  <span style={{ fontSize: 17, lineHeight: 1.55, color: C.sub }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        ))}
      </div>
    );
  }

  // Fallback for pipeline, triage, dataScope, whyHarness
  if (v.type === "pipeline" && v.nodes) {
    return (
      <>
        <FadeUp delay={14}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.nodes.length}, 1fr)`, gap: 10 }}>
            {v.nodes.map((node, i) => (
              <div key={i} style={{ borderRadius: 16, border: `1px solid ${C.line}`, padding: 16, textAlign: "center", fontSize: 16, fontWeight: 700, background: C.surface }}>
                {node}
              </div>
            ))}
          </div>
        </FadeUp>
        {v.detail && (
          <FadeUp delay={24}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.detail.length}, 1fr)`, gap: 10 }}>
              {v.detail.map((d, i) => (
                <div key={i} style={{ borderRadius: 16, border: `1px solid ${C.line}`, padding: 16, fontSize: 15, lineHeight: 1.55, color: C.sub, background: C.bg }}>
                  {d}
                </div>
              ))}
            </div>
          </FadeUp>
        )}
      </>
    );
  }

  if (v.type === "triage" && v.cards) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${v.cards.length}, 1fr)`, gap: 12 }}>
        {v.cards.map((card, i) => (
          <FadeUp key={card.title} delay={14 + i * 6}>
            <div style={{ borderRadius: 18, border: `1px solid ${C.line}`, background: C.surface, padding: 20, height: "100%" }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 16, lineHeight: 1.6, color: C.sub }}>{card.text}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    );
  }

  // Generic fallback
  return (
    <FadeUp delay={14}>
      <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.surface, padding: 24, fontSize: 18, color: C.sub }}>
        {JSON.stringify(v, null, 2)}
      </div>
    </FadeUp>
  );
};

// ─── Main Composition ──────────────────────────────────

const getSlideById = (outline: OutlineData, slideId: string) => {
  const slide = outline.slides.find((s) => s.id === slideId);
  if (!slide) throw new Error(`Missing slide: ${slideId}`);
  return slide;
};

export const MidtermDeckVideo: React.FC<{ outline: OutlineData }> = ({ outline }) => {
  return (
    <AbsoluteFill style={{ background: C.surface }}>
      <Series>
        {outline.videoScenes.map((scene, index) => {
          const slide = getSlideById(outline, scene.slideId);
          const durationInFrames = Math.round(scene.durationSec * 30);
          return (
            <Series.Sequence key={scene.id} durationInFrames={durationInFrames}>
              <SceneCard
                slide={slide}
                scene={scene}
                sceneIndex={index}
                totalScenes={outline.videoScenes.length}
              />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
