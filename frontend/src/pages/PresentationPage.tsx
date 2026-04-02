import { useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  ChartColumnIncreasing,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./PresentationPage.css";

function withBasePath(baseUrl: string, path: string) {
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalized}${path.replace(/^\//, "")}`;
}

const HERO_METRICS = [
  { value: "15", label: "강의 전체 분석" },
  { value: "18", label: "평가 항목" },
  { value: "0.877", label: "평균 ICC" },
  { value: "4", label: "핵심 실험" },
];

const PILLARS = [
  {
    icon: Layers,
    title: "원문 기반 평가",
    desc: "강의 원문과 품질 기준을 같이 읽고 점수와 근거를 함께 남겨요.",
  },
  {
    icon: ChartColumnIncreasing,
    title: "신뢰도 검증",
    desc: "반복 평가 일관성과 청킹 민감도를 실험으로 먼저 확인해요.",
  },
  {
    icon: BrainCircuit,
    title: "시간축 시뮬레이션",
    desc: "TRIBE v2로 구간별 반응 흐름을 보여줘서 처방 포인트를 잡아요.",
  },
];

const PIPELINE = [
  "강의 원문 수집",
  "시간 윈도우 청킹",
  "5개 카테고리 병렬 평가",
  "18개 항목 집계",
  "행동 제안 리포트",
];

const RELIABILITY = [
  { label: "ICC", value: "0.877", pct: 88 },
  { label: "Kappa", value: "0.883", pct: 88 },
  { label: "Alpha", value: "0.873", pct: 87 },
  { label: "SSI", value: "0.974", pct: 97 },
];

const TIMELINE_STRIP = [62, 68, 74, 78, 86, 80, 73, 71, 79, 83, 76, 66];

const SIMULATION_POINTS = [
  {
    title: "반응 피크 구간",
    value: "01:26 ~ 01:31",
    desc: "기술 용어를 단계별로 반복 설명한 장면에서 반응이 가장 높게 올라갔어요.",
  },
  {
    title: "주의 필요 구간",
    value: "03:26 ~ 03:31",
    desc: "고급 개념을 짧게 몰아서 설명한 장면에서 반응이 내려갔어요.",
  },
  {
    title: "실습 전환 효과",
    value: "실행 직후 반등",
    desc: "설명에서 실습으로 넘어가는 순간 반응이 다시 올라오는 흐름이 보여요.",
  },
];

const REPORT_SAMPLES = [
  "Java I/O 강의는 실습 구간 반응이 높고, 고급 개념에서 속도 조절이 필요했어요.",
  "Front-End 강의는 문자열 함수 예제가 강점이었고, 추상 개념은 시각 보조가 더 필요했어요.",
  "MySQL 강의는 롤백 실습이 강점이었고, 파티션 설명은 압축이 커서 마무리 보강이 필요했어요.",
];

const UI_SHOTS = [
  { title: "운영 허브", file: "presentation/assets/ui-dashboard.png" },
  { title: "강의 상세", file: "presentation/assets/ui-lecture-detail.png" },
  { title: "검증 화면", file: "presentation/assets/ui-validation.png" },
  { title: "연동 화면", file: "presentation/assets/ui-integrations.png" },
];

const BOUNDARIES = [
  "텍스트 기반이라 비언어 신호는 아직 반영하지 못해요.",
  "TRIBE v2는 현재 3개 강의를 중심으로 검증했어요.",
  "한국어 강의 전반의 외부 검증은 더 필요해요.",
];

export default function PresentationPage() {
  const baseUrl = import.meta.env.BASE_URL;
  const notionSrc =
    "https://www.notion.so/syjin1999/AI-33626a79dcd3812abf6ceac2397e2fb3";

  useEffect(() => {
    const scenes = document.querySelectorAll<HTMLElement>(".pres2-scene");
    if (!scenes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.24, rootMargin: "-8% 0px" }
    );

    for (const scene of scenes) observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pres2-page">
      <header className="pres2-topbar">
        <Link to="/" className="pres2-brand">
          <Sparkles size={14} />
          AI Lecture Report
        </Link>
        <nav className="pres2-scene-nav" aria-label="장면 이동">
          <a href="#scene-pillars">핵심</a>
          <a href="#scene-pipeline">흐름</a>
          <a href="#scene-simulation">시뮬레이션</a>
          <a href="#scene-report">결과</a>
        </nav>
        <div className="pres2-topbar-actions">
          <a
            href={notionSrc}
            target="_blank"
            rel="noreferrer"
            className="pres2-inline-link"
          >
            보고서 샘플
            <ArrowUpRight size={14} />
          </a>
          <Link to="/" className="btn-primary">
            서비스 보기
          </Link>
        </div>
      </header>

      <section id="scene-hero" className="pres2-hero pres2-scene">
        <div className="pres2-wrap pres2-hero-grid">
          <div className="pres2-copy">
            <p className="pres2-eyebrow pres2-reveal">PROJECT INTRODUCTION</p>
            <h1 className="pres2-reveal" style={{ animationDelay: "80ms" }}>
              강의 피드백을
              <br />
              점수에서 근거로
              <br />
              바꿔요
            </h1>
            <p className="pres2-reveal" style={{ animationDelay: "140ms" }}>
              강의 원문을 끝까지 읽어 항목별 점수와 근거를 남기고, 시간축 시뮬레이션으로
              어느 구간을 고치면 되는지 한 화면에서 바로 보여줘요.
            </p>
            <div className="pres2-actions pres2-reveal" style={{ animationDelay: "200ms" }}>
              <a href="#scene-pipeline" className="btn-primary">
                핵심 흐름 보기
                <ArrowRight size={15} />
              </a>
              <a href={notionSrc} target="_blank" rel="noreferrer" className="btn-secondary">
                Notion 열기
              </a>
            </div>
          </div>

          <aside className="pres2-panel pres2-reveal" style={{ animationDelay: "120ms" }}>
            <div className="pres2-metric-grid">
              {HERO_METRICS.map((metric, index) => (
                <article
                  key={metric.label}
                  className="pres2-metric"
                  style={{ animationDelay: `${170 + index * 70}ms` }}
                >
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </article>
              ))}
            </div>
            <p className="pres2-panel-note">
              22,756줄 원문과 15개 강의를 다시 맞춰서, 구간 흐름과 평가 근거가
              끊기지 않게 정리했어요.
            </p>
          </aside>
        </div>
      </section>

      <section id="scene-pillars" className="pres2-section pres2-section-light pres2-scene">
        <div className="pres2-wrap">
          <div className="pres2-section-head pres2-reveal">
            <p className="pres2-eyebrow pres2-eyebrow-light">CORE PILLARS</p>
            <h2>발표 핵심을 네 장면으로 압축했어요</h2>
          </div>
          <div className="pres2-card-grid">
            {PILLARS.map((item, index) => (
              <article
                key={item.title}
                className="pres2-card pres2-reveal"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <item.icon size={18} className="pres2-card-icon" />
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="scene-pipeline" className="pres2-section pres2-section-dark pres2-scene">
        <div className="pres2-wrap">
          <div className="pres2-section-head pres2-reveal">
            <p className="pres2-eyebrow">PIPELINE + RELIABILITY</p>
            <h2>평가 흐름과 신뢰도를 같이 보여줘요</h2>
          </div>

          <div className="pres2-pipeline">
            {PIPELINE.map((step, index) => (
              <div
                key={step}
                className="pres2-pipeline-item pres2-reveal"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          <div className="pres2-reliability-grid">
            <div className="pres2-bars">
              {RELIABILITY.map((metric, index) => (
                <article
                  key={metric.label}
                  className="pres2-bar-row pres2-reveal"
                  style={{ animationDelay: `${120 + index * 70}ms` }}
                >
                  <div className="pres2-bar-meta">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                  <div className="pres2-bar-track">
                    <span style={{ width: `${metric.pct}%` }} />
                  </div>
                </article>
              ))}
            </div>

            <aside className="pres2-info-graphic pres2-reveal" style={{ animationDelay: "220ms" }}>
              <div className="pres2-ring" aria-hidden="true">
                <span>87%</span>
              </div>
              <p>15개 중 13개 강의가 Good 이상으로 수렴했어요.</p>
            </aside>
          </div>
        </div>
      </section>

      <section id="scene-simulation" className="pres2-section pres2-section-light pres2-scene">
        <div className="pres2-wrap">
          <div className="pres2-section-head pres2-reveal">
            <p className="pres2-eyebrow pres2-eyebrow-light">SIMULATION</p>
            <h2>장면 전환마다 반응 리듬을 같이 읽어요</h2>
          </div>

          <div className="pres2-strip pres2-reveal" style={{ animationDelay: "80ms" }}>
            {TIMELINE_STRIP.map((value, index) => (
              <span key={`${value}-${index}`} style={{ height: `${value}%` }} />
            ))}
          </div>

          <div className="pres2-sim-grid">
            {SIMULATION_POINTS.map((item, index) => (
              <article
                key={item.title}
                className="pres2-sim-card pres2-reveal"
                style={{ animationDelay: `${130 + index * 90}ms` }}
              >
                <p className="pres2-sim-card__value">{item.value}</p>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="scene-report" className="pres2-section pres2-section-light pres2-scene">
        <div className="pres2-wrap">
          <div className="pres2-section-head pres2-reveal">
            <p className="pres2-eyebrow pres2-eyebrow-light">REPORT + UI</p>
            <h2>결과를 실제 화면으로 바로 보여줘요</h2>
          </div>

          <div className="pres2-sample-list">
            {REPORT_SAMPLES.map((line, index) => (
              <div
                key={line}
                className="pres2-sample-item pres2-reveal"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <FileText size={15} />
                <p>{line}</p>
              </div>
            ))}
          </div>

          <div className="pres2-shot-grid">
            {UI_SHOTS.map((shot, index) => (
              <figure
                key={shot.title}
                className="pres2-shot pres2-reveal"
                style={{ animationDelay: `${130 + index * 70}ms` }}
              >
                <img src={withBasePath(baseUrl, shot.file)} alt={shot.title} />
                <figcaption>{shot.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="scene-close" className="pres2-cta pres2-scene">
        <div className="pres2-wrap pres2-cta-inner">
          <div className="pres2-reveal">
            <p className="pres2-eyebrow">BOUNDARY</p>
            <h2>지금 가능한 범위와 다음 단계도 같이 공개해요</h2>
            <ul className="pres2-boundary-list">
              {BOUNDARIES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="pres2-actions pres2-reveal" style={{ animationDelay: "100ms" }}>
            <Link to="/" className="btn-primary">
              서비스로 이동
              <ArrowRight size={15} />
            </Link>
            <a href={notionSrc} target="_blank" rel="noreferrer" className="btn-secondary">
              Notion 열기
            </a>
            <a href="#scene-hero" className="pres2-inline-link">
              위로 이동
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
