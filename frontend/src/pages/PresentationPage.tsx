import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PresentationPage.css";

/* ── helpers ── */

function withBase(path: string) {
  const base = import.meta.env.BASE_URL;
  return `${base.endsWith("/") ? base : `${base}/`}${path.replace(/^\//, "")}`;
}

/* ── data ── */

const HERO_METRICS = [
  { value: "15", label: "강의 분석" },
  { value: "18", label: "평가 항목" },
  { value: "0.877", label: "ICC 신뢰도" },
  { value: "4", label: "검증 실험" },
];

const PAIN_SOLVE = [
  {
    pain: {
      icon: "icons/clipboard.png",
      title: "AI 평가 기준이 없어요",
      body: "AI가 강의를 평가한다고 해도, '무엇을 보고 몇 점을 주는지' 기준이 없으면 점수를 믿을 수 없어요.",
    },
    solve: {
      icon: "icons/check.png",
      title: "18개 항목 기준으로 원문을 채점해요",
      body: "강의 품질 기준 문서에 따라 5개 카테고리 18개 항목으로 채점하고, 항목마다 원문 인용과 행동 제안을 붙여요.",
      link: "#eval",
      linkText: "평가 체계 보기",
    },
  },
  {
    pain: {
      icon: "icons/faq.png",
      title: "AI 평가를 신뢰할 수 없어요",
      body: "같은 강의를 다시 평가하면 점수가 달라질 수도 있잖아요. 반복해도 같은 결과가 나오는지 확인이 필요해요.",
    },
    solve: {
      icon: "icons/page.png",
      title: "4개 실험으로 검증했어요",
      body: "반복 일관성, 청크 크기, 윈도우 길이, 호핑 비율까지 네 가지 실험으로 파이프라인을 검증했어요. ICC 0.877 달성했어요.",
      link: "#reliability",
      linkText: "신뢰도 검증 보기",
    },
  },
  {
    pain: {
      icon: "icons/clock.png",
      title: "수강생 반응을 알 수 없어요",
      body: "설문 총점만으로는 '어느 구간에서 학생이 집중하고 어디서 이탈하는지' 알 수가 없어요.",
    },
    solve: {
      icon: "icons/lightbulb.png",
      title: "뇌 반응을 시뮬레이션해요",
      body: "Meta AI의 TRIBE v2 모델로 수강자의 뇌 반응을 예측해서, 5분 단위로 집중·이탈 구간을 짚어요.",
      link: "#tribe",
      linkText: "TRIBE v2 보기",
    },
  },
];

const PIPELINE = [
  { step: "01", icon: "icons/database.png", title: "원문 수집", desc: "3~4시간 강의 STT 원문 22,756줄을 타임스탬프와 함께 파싱해요." },
  { step: "02", icon: "icons/diagram.png", title: "시간 윈도우 청킹", desc: "60분 윈도우, 30분 hop으로 맥락이 끊기지 않게 나눠요." },
  { step: "03", icon: "icons/lightning.png", title: "5개 카테고리 병렬 채점", desc: "LangGraph가 카테고리별 에이전트를 동시에 돌려요." },
  { step: "04", icon: "icons/chart.png", title: "가중 평균 집계", desc: "HIGH 3 · MEDIUM 2 · LOW 1 가중치로 WAS를 계산해요." },
  { step: "05", icon: "icons/page.png", title: "리포트 생성", desc: "잘한 점, 고칠 점, 구체적 행동 제안을 한 장에 정리해요." },
];

const CATEGORIES = [
  { name: "언어 표현 품질", items: 3, details: "불필요한 반복 · 발화 완결성 · 일관성", weight: "HIGH ×1 · MED ×2" },
  { name: "강의 도입·구조", items: 5, details: "학습 목표 · 복습 연계 · 설명 순서 · 핵심 강조 · 마무리", weight: "HIGH ×2 · MED ×2 · LOW ×1" },
  { name: "개념 설명 명확성", items: 4, details: "정의 · 비유·예시 · 선행 개념 확인 · 발화 속도", weight: "HIGH ×2 · MED ×2" },
  { name: "예시·실습 연계", items: 2, details: "예시 적절성 · 실습 연계", weight: "HIGH ×2" },
  { name: "수강생 상호작용", items: 4, details: "오류 대응 · 이해 확인 · 참여 유도 · 질문 응답", weight: "HIGH ×3 · MED ×1" },
];

const EXPERIMENTS = [
  {
    id: "exp-1", icon: "icons/refresh.png", title: "평가 일관성", subtitle: "Test-Retest Reliability",
    metrics: [
      { label: "ICC", value: "0.877", pct: 88 },
      { label: "Kappa", value: "0.883", pct: 88 },
      { label: "Alpha", value: "0.873", pct: 87 },
      { label: "SSI", value: "0.974", pct: 97 },
    ],
    conclusion: "15개 강의 중 13개가 Good 이상으로 수렴했어요",
  },
  {
    id: "exp-2", icon: "icons/ruler.png", title: "청크 크기", subtitle: "30분 vs 15분",
    metrics: [
      { label: "30분", value: "3.245", pct: 65 },
      { label: "15분", value: "3.033", pct: 61 },
    ],
    conclusion: "p = 0.0006 — 비교할 때는 같은 크기로 맞춰야 해요",
  },
  {
    id: "exp-3", icon: "icons/window.png", title: "윈도우 길이", subtitle: "30 · 60 · 120분",
    metrics: [
      { label: "가장 민감", value: "예시·실습", pct: 67 },
      { label: "가장 안정", value: "언어 품질", pct: 24 },
    ],
    conclusion: "60분이 세밀도와 맥락의 균형점이에요",
  },
  {
    id: "exp-4", icon: "icons/shuffle.png", title: "Hop 크기", subtitle: "50 · 75 · 90%",
    metrics: [
      { label: "Hop 50%", value: "77.8%", pct: 78 },
      { label: "Hop 75%", value: "72.2%", pct: 72 },
    ],
    conclusion: "50% 중복이 맥락 연속성과 안정성 모두 가장 좋아요",
  },
];

const OPTIMAL_CONFIG = [
  { label: "모델", value: "GPT-4o-mini" },
  { label: "Temperature", value: "0.1" },
  { label: "Window", value: "60분" },
  { label: "Hop", value: "30분 (50%)" },
];

const BRAIN_STATES = [
  {
    state: "개념 정리",
    region: "전두엽 DLPFC",
    regionFull: "Dorsolateral Prefrontal Cortex",
    regionKr: "배외측 전전두피질",
    plain: "머릿속에서 정보를 순서대로 정리하는 영역이에요. '작업 기억'을 담당해요.",
    example: "API 호출 순서를 단계별로 정리하는 구간",
    confidence: 70,
    color: "#5AC8FA",
  },
  {
    state: "딴생각",
    region: "후대상회 DMN",
    regionFull: "Default Mode Network",
    regionKr: "기본 모드 네트워크 (후대상피질)",
    plain: "외부 자극 없이 뇌가 혼자 돌아가는 상태예요. 양쪽이 동시에 켜지면 '강의를 안 듣고 있다'는 신호예요.",
    example: "강의 마무리, 양쪽 대칭 활성화",
    confidence: 100,
    color: "#FF3B30",
  },
  {
    state: "언어 이해",
    region: "상측두회 Wernicke",
    regionFull: "Wernicke's Area",
    regionKr: "베르니케 영역 (상측두회)",
    plain: "남이 하는 말을 소리에서 의미로 바꾸는 영역이에요. 여기가 켜지면 '설명을 따라가고 있다'는 뜻이에요.",
    example: "기술 용어 반복 설명 구간",
    confidence: 100,
    color: "#34C759",
  },
  {
    state: "시각 처리",
    region: "후두엽 V1",
    regionFull: "Primary Visual Cortex",
    regionKr: "일차 시각피질",
    plain: "눈으로 들어온 정보를 처리하는 영역이에요. 화면 전환이나 코드 시연 때 활성화돼요.",
    example: "화면 전환·시각 자료 제시 구간",
    confidence: 60,
    color: "#AF52DE",
  },
];

const TRIBE_OVERVIEW = {
  what: {
    title: "TRIBE v2가 뭔가요?",
    body: "TRIBE v2(Text-Representation-Integrated Brain Encoder v2)는 Meta AI가 만든 뇌 인코딩 모델이에요. 텍스트를 입력하면, 사람이 그 텍스트를 들었을 때 뇌의 어느 부위가 얼마나 반응할지 예측해요.",
  },
  how: {
    title: "어떻게 학습했나요?",
    body: "25명 피험자가 실제로 이야기를 들으면서 찍은 fMRI(기능적 자기공명영상) 451.6시간치를 학습 데이터로 썼어요. 뇌 표면을 10,242개 꼭짓점(vertex)으로 쪼개고, 각 꼭짓점의 BOLD 신호(혈류 변화 = 뉴런 활동 지표)를 예측하도록 훈련했어요.",
  },
  roi: {
    title: "ROI 지표는 어떻게 산출하나요?",
    body: "ROI(Region of Interest)는 뇌 표면의 특정 기능 영역을 묶은 단위예요. Destrieux Atlas 기준 148개 ROI 중 청각 ROI(강의니까 항상 최상위)를 빼고, 나머지 ROI의 평균 반응값을 5분 단위로 집계해요. 특정 ROI가 전체 평균 대비 1σ 이상 튀면 '해당 영역 활성화'로 판정해요.",
  },
  source: "d'Ascoli et al. (2026). A foundation model of vision, audition, and language for in-silico neuroscience. Meta AI Research.",
};

const TRIBE_FLOW = [
  { icon: "icons/pen.png", label: "강의 텍스트 입력", desc: "STT 원문을 5분 단위로 나눠요" },
  { icon: "icons/robot.png", label: "TRIBE v2 추론", desc: "10,242개 뇌 정점의 반응을 예측해요" },
  { icon: "icons/pin.png", label: "ROI 매핑", desc: "148개 영역 중 유의미한 활성화를 잡아요" },
  { icon: "icons/chart.png", label: "상태 판정", desc: "뇌 영역 조합으로 학생 상태를 읽어요" },
  { icon: "icons/medicine.png", label: "처방 생성", desc: "구간별 교수법 개선안을 제안해요" },
];

const REPORT_SAMPLES = [
  {
    date: "2026-02-02", subject: "Java I/O", score: 3.8,
    strengths: "BufferedReader/Writer를 단계별로 잘 설명했어요. 질문에 즉시 응답했어요.",
    improvements: "도입부에서 학습 목표를 안내하지 않았어요. 고급 개념 설명이 너무 빨라요.",
    brainPeak: "01:26~01:31 — 기술 용어를 반복 설명한 구간이에요",
  },
  {
    date: "2026-02-09", subject: "Front-End (문자열 함수)", score: 3.5,
    strengths: "POST/SUBSTRING 예제를 직관적으로 잘 구성했어요.",
    improvements: "INFORMATION_SCHEMA 같은 추상 개념에 시각 보조가 부족해요.",
    brainPeak: "09:30~09:35 — 문자열 함수 예제 구간이에요",
  },
  {
    date: "2026-02-24", subject: "MySQL 파티션·트랜잭션", score: 3.6,
    strengths: "트랜잭션 롤백 실습을 잘 구성했어요.",
    improvements: "파티션 유형 설명이 너무 밀도가 높아요.",
    brainPeak: "11:50~11:55 — 트랜잭션 롤백 실습 구간이에요",
  },
];

const TECH_STACK = [
  { icon: "icons/code.png", label: "Frontend", value: "React 19 · TypeScript · Vite" },
  { icon: "icons/globe.png", label: "3D", value: "Three.js · React Three Fiber" },
  { icon: "icons/chart.png", label: "Chart", value: "Recharts" },
  { icon: "icons/gear.png", label: "Backend", value: "FastAPI · LangGraph" },
  { icon: "icons/lightbulb.png", label: "Brain", value: "Meta TRIBE v2 (fMRI)" },
  { icon: "icons/lock.png", label: "Auth", value: "Supabase (Google · Notion)" },
];

const LIMITATIONS = [
  "텍스트만 봐요 — 표정, 제스처, 판서는 아직 못 읽어요.",
  "TRIBE v2 시뮬레이션은 3/15 강의만 완료했어요.",
  "한국어 강의에 대한 외부 검증 데이터가 아직 부족해요.",
  "STT 정확도에 의존하고, 코딩 부트캠프에 최적화되어 있어요.",
];

const NEXT_STEPS = [
  "15개 강의 전체 시뮬레이션",
  "수강생 설문과 AI 점수 상관 분석",
  "실시간 스트리밍 뇌 반응 예측",
  "다국어 · 다기관 확장",
];

/* ── hooks ── */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "-6% 0px" }
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const deg = (score / 5) * 360;
  const inner = size - 18;
  return (
    <div className="score-ring" style={{ width: size, height: size, background: `conic-gradient(var(--accent) 0deg ${deg}deg, rgba(255,255,255,0.10) ${deg}deg 360deg)` }}>
      <span style={{ width: inner, height: inner }}>{score.toFixed(1)}</span>
    </div>
  );
}

function SectionBanner({ text, link, linkText }: { text: string; link: string; linkText: string }) {
  return (
    <div className="pres-banner reveal">
      <span className="pres-banner__text">{text}</span>
      <a href={link} className="pres-banner__link">{linkText} ↗</a>
    </div>
  );
}

/* ── page ── */

export default function PresentationPage() {
  const pageRef = useReveal();

  return (
    <div className="pres" ref={pageRef}>
      <nav className="pres-nav">
        <Link to="/" className="pres-wordmark">AI Lecture Report</Link>
        <div className="pres-nav__links">
          <a href="#problem">문제</a>
          <a href="#pipeline">파이프라인</a>
          <a href="#reliability">신뢰도</a>
          <a href="#tribe">TRIBE</a>
          <a href="#results">결과</a>
        </div>
        <div className="pres-nav__actions">
          <Link to="/" className="pres-btn-pill">서비스 보기</Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pres-hero">
        <div className="pres-container">
          <p className="pres-kicker reveal">LIKELION · NLP 자연어처리 심화 부트캠프 3기 인턴십</p>
          <h1 className="reveal" style={{ animationDelay: "100ms" }}>
            강의를 읽고,<br />근거를 남겨요.
          </h1>
          <p className="pres-hero__sub reveal" style={{ animationDelay: "180ms" }}>
            AI가 강의 원문 전체를 읽고 18개 항목으로 채점해요.<br />
            TRIBE v2 뇌 시뮬레이션으로 '어느 구간을 고칠지'까지 짚어요.
          </p>
          <div className="pres-hero__actions reveal" style={{ animationDelay: "260ms" }}>
            <a href="#problem" className="pres-btn-primary">어떤 문제를 풀었나요 →</a>
            <a href="https://www.notion.so/syjin1999/AI-33626a79dcd3812abf6ceac2397e2fb3" target="_blank" rel="noreferrer" className="pres-btn-ghost">보고서 전문 ↗</a>
          </div>
          <div className="pres-hero__metrics reveal" style={{ animationDelay: "340ms" }}>
            {HERO_METRICS.map((m) => (
              <div key={m.label} className="pres-stat">
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM → SOLUTION ═══ */}
      <section id="problem" className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">PROBLEM — SOLUTION</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            세 가지 문제를 이렇게 풀었어요.
          </h2>
          <div className="pres-ps-list">
            {PAIN_SOLVE.map((ps, i) => (
              <div key={i} className="pres-ps reveal" style={{ animationDelay: `${140 + i * 120}ms` }}>
                <div className="pres-ps__pain">
                  <img src={withBase(ps.pain.icon)} alt="" className="pres-ps__icon" />
                  <div>
                    <span className="pres-ps__label pres-ps__label--pain">문제</span>
                    <h3>{ps.pain.title}</h3>
                    <p>{ps.pain.body}</p>
                  </div>
                </div>
                <div className="pres-ps__arrow" aria-hidden="true">→</div>
                <div className="pres-ps__solve">
                  <img src={withBase(ps.solve.icon)} alt="" className="pres-ps__icon" />
                  <div>
                    <span className="pres-ps__label pres-ps__label--solve">해결</span>
                    <h3>{ps.solve.title}</h3>
                    <p>{ps.solve.body}</p>
                    <a href={ps.solve.link} className="pres-ps__link">{ps.solve.linkText} →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PIPELINE ═══ */}
      <section id="pipeline" className="pres-section pres-section--dark">
        <div className="pres-container">
          <SectionBanner text="AI 평가 기준이 없어요 → 이렇게 만들었어요" link="#problem" linkText="문제 정의" />
          <p className="pres-kicker reveal">PIPELINE</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            원문에서 리포트까지, 다섯 단계로 만들어요.
          </h2>
          <div className="pres-pipeline">
            {PIPELINE.map((s, i) => (
              <div key={s.step} className="pres-pipeline__step reveal" style={{ animationDelay: `${120 + i * 90}ms` }}>
                <div className="pres-pipeline__num">
                  <img src={withBase(s.icon)} alt="" className="pres-pipeline__icon" />
                </div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pres-pipeline__connector reveal" style={{ animationDelay: "580ms" }}>
            <span>입력 — STT 원문 22,756줄</span>
            <div className="pres-connector-line" />
            <span>출력 — 리포트 + Notion 내보내기</span>
          </div>
        </div>
      </section>

      {/* ═══ EVALUATION ═══ */}
      <section id="eval" className="pres-section pres-section--light">
        <div className="pres-container">
          <SectionBanner text="AI 평가 기준이 없어요 → 이 기준으로 채점해요" link="#problem" linkText="문제 정의" />
          <p className="pres-kicker pres-kicker--dark reveal">EVALUATION</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            5개 카테고리, 18개 항목으로 평가해요.
          </h2>
          <p className="pres-sub reveal" style={{ animationDelay: "140ms" }}>
            WAS = Σ(점수 × 가중치) / Σ가중치 — HIGH 3.0 · MEDIUM 2.0 · LOW 1.0
          </p>
          <div className="pres-categories">
            {CATEGORIES.map((c, i) => (
              <details key={c.name} className="pres-cat reveal" style={{ animationDelay: `${180 + i * 80}ms` }}>
                <summary className="pres-cat__summary">
                  <span className="pres-cat__num">{c.items}</span>
                  <h3>{c.name}</h3>
                  <span className="pres-cat__weight">{c.weight}</span>
                </summary>
                <p className="pres-cat__details">{c.details}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RELIABILITY ═══ */}
      <section id="reliability" className="pres-section pres-section--dark">
        <div className="pres-container">
          <SectionBanner text="AI 평가를 신뢰할 수 없어요 → 실험으로 검증했어요" link="#problem" linkText="문제 정의" />
          <p className="pres-kicker reveal">RELIABILITY</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            네 번 실험하고 네 번 검증했어요.
          </h2>
          <div className="pres-exp-grid">
            {EXPERIMENTS.map((exp, i) => (
              <article key={exp.id} className="pres-exp reveal" style={{ animationDelay: `${140 + i * 110}ms` }}>
                <div className="pres-exp__head">
                  <img src={withBase(exp.icon)} alt="" className="pres-exp__icon" />
                  <div>
                    <h3>{exp.title}</h3>
                    <span>{exp.subtitle}</span>
                  </div>
                </div>
                <div className="pres-exp__bars">
                  {exp.metrics.map((m) => (
                    <div key={m.label} className="pres-bar">
                      <div className="pres-bar__meta">
                        <span>{m.label}</span>
                        <strong>{m.value}</strong>
                      </div>
                      <div className="pres-bar__track"><span style={{ width: `${m.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
                <p className="pres-exp__conclusion">{exp.conclusion}</p>
              </article>
            ))}
          </div>
          <div className="pres-optimal reveal" style={{ animationDelay: "300ms" }}>
            <h3>최적 파이프라인 설정이에요</h3>
            <div className="pres-optimal__grid">
              {OPTIMAL_CONFIG.map((c) => (
                <div key={c.label} className="pres-optimal__item">
                  <span>{c.label}</span>
                  <strong>{c.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRIBE v2 ═══ */}
      <section id="tribe" className="pres-section pres-section--light">
        <div className="pres-container">
          <SectionBanner text="수강생 반응을 알 수 없어요 → 뇌 반응으로 예측해요" link="#problem" linkText="문제 정의" />
          <p className="pres-kicker pres-kicker--dark reveal">TRIBE v2</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            점수에 시간축을 입혀요.
          </h2>

          <div className="pres-tribe-explainer">
            {[TRIBE_OVERVIEW.what, TRIBE_OVERVIEW.how, TRIBE_OVERVIEW.roi].map((block, i) => (
              <div key={i} className="pres-tribe-block reveal" style={{ animationDelay: `${140 + i * 60}ms` }}>
                <h3>{block.title}</h3>
                <p>{block.body}</p>
              </div>
            ))}
            <div className="pres-tribe-source reveal" style={{ animationDelay: "340ms" }}>
              <span>출처</span>
              <p>{TRIBE_OVERVIEW.source}</p>
            </div>
          </div>

          <div className="pres-tribe-flow reveal" style={{ animationDelay: "400ms" }}>
            <h3>이렇게 처리해요</h3>
            <div className="pres-flow-steps">
              {TRIBE_FLOW.map((step, i) => (
                <div key={i} className="pres-flow-step">
                  <img src={withBase(step.icon)} alt="" className="pres-flow-step__icon" />
                  <strong>{step.label}</strong>
                  <p>{step.desc}</p>
                  {i < TRIBE_FLOW.length - 1 && <span className="pres-flow-step__arrow">→</span>}
                </div>
              ))}
            </div>
          </div>

          <h3 className="pres-section-subtitle reveal" style={{ animationDelay: "460ms" }}>뇌 영역별로 학생 상태를 읽어요</h3>
          <div className="pres-brain-grid">
            {BRAIN_STATES.map((b, i) => (
              <div key={i} className="pres-brain-card reveal" style={{ animationDelay: `${500 + i * 80}ms` }}>
                <div className="pres-brain-card__header" style={{ borderColor: b.color }}>
                  <h4>{b.state}</h4>
                  <span className="pres-brain-card__conf" style={{ color: b.color }}>{b.confidence}% 매칭</span>
                </div>
                <div className="pres-brain-card__region">
                  <span className="pres-brain-card__tag" style={{ background: `${b.color}18`, color: b.color }}>{b.region}</span>
                </div>
                <p className="pres-brain-card__full">{b.regionFull} — {b.regionKr}</p>
                <p className="pres-brain-card__plain">{b.plain}</p>
                <div className="pres-brain-card__example">
                  {b.example}
                </div>
                <div className="pres-brain-card__gauge">
                  <div className="pres-brain-card__gauge-fill" style={{ width: `${b.confidence}%`, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESULTS ═══ */}
      <section id="results" className="pres-section pres-section--dark">
        <div className="pres-container">
          <SectionBanner text="AI 평가 기준이 없어요 → 이런 리포트가 나와요" link="#problem" linkText="문제 정의" />
          <p className="pres-kicker reveal">RESULTS</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            리포트 세 건, 이렇게 나와요.
          </h2>
          <div className="pres-reports">
            {REPORT_SAMPLES.map((r, i) => (
              <article key={r.date} className="pres-report reveal" style={{ animationDelay: `${140 + i * 130}ms` }}>
                <div className="pres-report__top">
                  <div>
                    <p className="pres-report__date">{r.date}</p>
                    <h3>{r.subject}</h3>
                  </div>
                  <ScoreRing score={r.score} />
                </div>
                <div className="pres-report__body">
                  <div className="pres-report__col">
                    <span className="pres-report__tag pres-report__tag--good">강점</span>
                    <p>{r.strengths}</p>
                  </div>
                  <div className="pres-report__col">
                    <span className="pres-report__tag pres-report__tag--improve">개선</span>
                    <p>{r.improvements}</p>
                  </div>
                  <div className="pres-report__col">
                    <span className="pres-report__tag pres-report__tag--brain">뇌 반응 피크</span>
                    <p>{r.brainPeak}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH ═══ */}
      <section className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">STACK</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>이런 기술로 만들었어요</h2>
          <div className="pres-tech reveal" style={{ animationDelay: "160ms" }}>
            {TECH_STACK.map((t) => (
              <div key={t.label} className="pres-tech__row">
                <img src={withBase(t.icon)} alt="" className="pres-tech__icon" />
                <span>{t.label}</span>
                <strong>{t.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LIMITATIONS + NEXT ═══ */}
      <section className="pres-section pres-section--dark">
        <div className="pres-container">
          <div className="pres-closing-grid">
            <div className="reveal">
              <p className="pres-kicker">BOUNDARY</p>
              <h2>아직 못하는 것들이에요</h2>
              <ul className="pres-list">
                {LIMITATIONS.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
            <div className="reveal" style={{ animationDelay: "140ms" }}>
              <p className="pres-kicker">NEXT</p>
              <h2>다음에 할 것들이에요</h2>
              <ol className="pres-list pres-list--ordered">
                {NEXT_STEPS.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="pres-cta">
        <div className="pres-container">
          <p className="pres-kicker reveal">THANK YOU</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>AI 강의 분석 리포트</h2>
          <p className="pres-cta__sub reveal" style={{ animationDelay: "140ms" }}>
            멋쟁이사자처럼 · NLP 자연어처리 심화 부트캠프 3기 인턴십
          </p>
          <div className="pres-cta__actions reveal" style={{ animationDelay: "220ms" }}>
            <Link to="/" className="pres-btn-primary">서비스 바로가기 →</Link>
            <a href="https://www.notion.so/syjin1999/AI-33626a79dcd3812abf6ceac2397e2fb3" target="_blank" rel="noreferrer" className="pres-btn-ghost">Notion 보고서 ↗</a>
          </div>
        </div>
      </section>
    </div>
  );
}
