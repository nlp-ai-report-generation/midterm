import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PresentationPage.css";

/* ── data ── */

const HERO_METRICS = [
  { value: "15", label: "강의" },
  { value: "18", label: "평가 항목" },
  { value: "0.877", label: "ICC" },
  { value: "4", label: "실험" },
];

const PROBLEMS = [
  {
    idx: "01",
    title: "설문지에 갇힌 평가",
    body: "수강생 설문만으로는 '어떤 설명이 좋았고, 어디서 흐름이 끊겼는지' 짚어낼 수 없다.",
    solve: "원문 전체를 읽고 18개 항목으로 채점한다.",
    solveLink: "#eval",
  },
  {
    idx: "02",
    title: "시간이 빠진 피드백",
    body: "총점 하나로는 50분짜리 강의 어디를 고쳐야 할지 알 수 없다.",
    solve: "TRIBE v2가 5분 단위 뇌 반응 지도를 그린다.",
    solveLink: "#tribe",
  },
  {
    idx: "03",
    title: "근거 없는 점수",
    body: "'3.5점'이라는 숫자 뒤에 왜 그런지, 뭘 바꿔야 하는지가 없다.",
    solve: "항목마다 원문 인용과 행동 제안을 붙인다.",
    solveLink: "#results",
  },
];

const PIPELINE = [
  {
    step: "01",
    title: "원문 수집",
    desc: "3~4시간 강의 STT 원문 22,756줄, 타임스탬프까지 파싱.",
  },
  {
    step: "02",
    title: "시간 윈도우 청킹",
    desc: "60분 윈도우 · 30분 hop — 맥락이 끊기지 않는 최적 조합.",
  },
  {
    step: "03",
    title: "5개 카테고리 병렬 채점",
    desc: "LangGraph가 카테고리별 에이전트를 동시에 돌린다.",
  },
  {
    step: "04",
    title: "가중 평균 집계",
    desc: "HIGH 3 · MEDIUM 2 · LOW 1 가중치로 WAS 산출.",
  },
  {
    step: "05",
    title: "리포트 생성",
    desc: "잘한 점 · 고칠 점 · 구체적 행동 제안을 한 장에 정리.",
  },
];

const CATEGORIES = [
  {
    name: "언어 표현 품질",
    items: 3,
    details: "불필요한 반복 · 발화 완결성 · 일관성",
    weight: "HIGH ×1 · MED ×2",
  },
  {
    name: "강의 도입·구조",
    items: 5,
    details: "학습 목표 · 복습 연계 · 설명 순서 · 핵심 강조 · 마무리",
    weight: "HIGH ×2 · MED ×2 · LOW ×1",
  },
  {
    name: "개념 설명 명확성",
    items: 4,
    details: "정의 · 비유·예시 · 선행 개념 확인 · 발화 속도",
    weight: "HIGH ×2 · MED ×2",
  },
  {
    name: "예시·실습 연계",
    items: 2,
    details: "예시 적절성 · 실습 연계",
    weight: "HIGH ×2",
  },
  {
    name: "수강생 상호작용",
    items: 4,
    details: "오류 대응 · 이해 확인 · 참여 유도 · 질문 응답",
    weight: "HIGH ×3 · MED ×1",
  },
];

const EXPERIMENTS = [
  {
    id: "exp-1",
    title: "평가 일관성",
    subtitle: "Test-Retest Reliability",
    metrics: [
      { label: "ICC", value: "0.877", pct: 88 },
      { label: "Kappa", value: "0.883", pct: 88 },
      { label: "Alpha", value: "0.873", pct: 87 },
      { label: "SSI", value: "0.974", pct: 97 },
    ],
    conclusion: "15개 강의 중 13개가 Good 이상 수렴",
  },
  {
    id: "exp-2",
    title: "청크 크기",
    subtitle: "30분 vs 15분",
    metrics: [
      { label: "30분", value: "3.245", pct: 65 },
      { label: "15분", value: "3.033", pct: 61 },
    ],
    conclusion: "p = 0.0006 — 비교 분석은 같은 크기로 맞춰야 한다",
  },
  {
    id: "exp-3",
    title: "윈도우 길이",
    subtitle: "30 · 60 · 120분",
    metrics: [
      { label: "가장 민감", value: "예시·실습", pct: 67 },
      { label: "가장 안정", value: "언어 품질", pct: 24 },
    ],
    conclusion: "60분이 세밀도와 맥락의 균형점",
  },
  {
    id: "exp-4",
    title: "Hop 크기",
    subtitle: "50 · 75 · 90%",
    metrics: [
      { label: "Hop 50%", value: "77.8%", pct: 78 },
      { label: "Hop 75%", value: "72.2%", pct: 72 },
    ],
    conclusion: "50% 중복이 맥락 연속성과 안정성 모두 최고",
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
    regionFull: "Dorsolateral Prefrontal Cortex — 배외측 전전두피질",
    plain: "머릿속에서 정보를 순서대로 정리하는 영역. '작업 기억'을 담당한다.",
    example: "API 호출 순서를 단계별로 정리하는 구간",
    confidence: 70,
  },
  {
    state: "딴생각",
    region: "후대상회 DMN",
    regionFull: "Default Mode Network — 기본 모드 네트워크 (Posterior Cingulate Cortex)",
    plain: "외부 자극 없이 뇌가 혼자 돌아가는 상태. 양쪽이 동시에 켜지면 '강의를 안 듣고 있다'는 신호.",
    example: "강의 마무리, 양쪽 대칭 활성화",
    confidence: 100,
  },
  {
    state: "언어 이해",
    region: "상측두회 Wernicke",
    regionFull: "Wernicke's Area — 베르니케 영역 (Superior Temporal Gyrus)",
    plain: "남이 하는 말을 소리에서 의미로 바꾸는 영역. 여기가 켜지면 '설명을 따라가고 있다'는 뜻.",
    example: "기술 용어 반복 설명 구간",
    confidence: 100,
  },
  {
    state: "시각 처리",
    region: "후두엽 시각피질",
    regionFull: "Primary Visual Cortex (V1) — 일차 시각피질",
    plain: "눈으로 들어온 정보를 처리하는 영역. 화면 전환이나 코드 시연 때 활성화된다.",
    example: "화면 전환·시각 자료 제시 구간",
    confidence: 60,
  },
];

const TRIBE_OVERVIEW = {
  what: "TRIBE v2 (Text-Representation-Integrated Brain Encoder v2)는 Meta AI가 만든 뇌 인코딩 모델이다. 텍스트를 입력하면, 사람이 그 텍스트를 들었을 때 뇌의 어느 부위가 얼마나 반응할지 예측한다.",
  how: "25명 피험자가 실제로 이야기를 들으면서 찍은 fMRI(기능적 자기공명영상) 451.6시간치를 학습 데이터로 썼다. 뇌 표면을 10,242개 꼭짓점(vertex)으로 쪼개고, 각 꼭짓점의 BOLD 신호(혈류 변화 = 뉴런 활동 지표)를 예측하도록 훈련했다.",
  roi: "ROI(Region of Interest)란 뇌 표면의 특정 기능 영역을 묶은 단위다. Destrieux Atlas 기준 148개 ROI 중 청각 ROI(강의니까 항상 최상위)를 제외하고, 나머지 ROI의 평균 반응값을 5분 단위로 집계한다. 특정 ROI가 전체 평균 대비 1σ 이상 튀면 '해당 영역 활성화'로 판정한다.",
  source: "d'Ascoli et al. (2026). A foundation model of vision, audition, and language for in-silico neuroscience. Meta AI Research.",
};

const TRIBE_BENEFITS = [
  {
    info: "구간별 반응 강도",
    meaning: "어디서 집중하고 어디서 빠지는지",
    action: "약한 구간 설명 방식 교체",
  },
  {
    info: "뇌 기능 프로필",
    meaning: "수동 청취인지, 능동 사고인지",
    action: "수동 → 능동 유도 전략",
  },
  {
    info: "ROI 기반 처방",
    meaning: "이 구간에 뭘 바꿔야 하는지",
    action: "교수법 구체 적용",
  },
  {
    info: "3D 뇌 히트맵",
    meaning: "어떤 뇌 영역이 켜지는지",
    action: "강의 효과 시각 확인",
  },
];

const REPORT_SAMPLES = [
  {
    date: "2026-02-02",
    subject: "Java I/O",
    score: 3.8,
    strengths: "BufferedReader/Writer 단계별 설명, 질문 즉시 응답",
    improvements: "도입부 학습 목표 생략, 고급 개념 속도 과다",
    brainPeak: "01:26~01:31 — 기술 용어 반복 설명",
  },
  {
    date: "2026-02-09",
    subject: "Front-End (문자열 함수)",
    score: 3.5,
    strengths: "POST/SUBSTRING 예제 직관적 구성",
    improvements: "INFORMATION_SCHEMA 추상 개념 시각 보조 부족",
    brainPeak: "09:30~09:35 — 문자열 함수 예제",
  },
  {
    date: "2026-02-24",
    subject: "MySQL 파티션·트랜잭션",
    score: 3.6,
    strengths: "트랜잭션 롤백 실습 구성",
    improvements: "파티션 유형 설명 밀도 과다",
    brainPeak: "11:50~11:55 — 트랜잭션 롤백 실습",
  },
];

const TECH_STACK = [
  { label: "Frontend", value: "React 19 · TypeScript · Vite" },
  { label: "3D", value: "Three.js · React Three Fiber" },
  { label: "Chart", value: "Recharts" },
  { label: "Backend", value: "FastAPI · LangGraph" },
  { label: "Brain", value: "Meta TRIBE v2 (fMRI)" },
  { label: "Auth", value: "Supabase (Google · Notion)" },
];

const LIMITATIONS = [
  "텍스트만 본다 — 표정, 제스처, 판서는 아직 못 읽는다.",
  "TRIBE v2 시뮬레이션은 3/15 강의만 완료했다.",
  "한국어 강의에 대한 외부 검증 데이터가 아직 부족하다.",
  "STT 정확도에 의존하며, 코딩 부트캠프에 최적화되어 있다.",
];

const NEXT_STEPS = [
  "15개 강의 전체 시뮬레이션",
  "수강생 설문과 AI 점수 상관 분석",
  "실시간 스트리밍 뇌 반응 예측",
  "다국어 · 다기관 확장",
];

/* ── helpers ── */

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
    <div
      className="score-ring"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--accent) 0deg ${deg}deg, rgba(255,255,255,0.10) ${deg}deg 360deg)`,
      }}
    >
      <span style={{ width: inner, height: inner }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/* ── page ── */

export default function PresentationPage() {
  const pageRef = useReveal();

  return (
    <div className="pres" ref={pageRef}>
      {/* ─ nav ─ */}
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

      {/* ═══ 1. HERO ═══ */}
      <section className="pres-hero">
        <div className="pres-container">
          <p className="pres-kicker reveal">LIKELION AI SCHOOL · KDT BACKEND JAVA 21</p>
          <h1 className="reveal" style={{ animationDelay: "100ms" }}>
            강의를 읽고,<br />
            근거를 남긴다.
          </h1>
          <p className="pres-hero__sub reveal" style={{ animationDelay: "180ms" }}>
            AI가 강의 원문 전체를 읽고 18개 항목으로 채점한다.<br />
            TRIBE v2 뇌 시뮬레이션으로 '어느 구간을 고칠지'까지 짚는다.
          </p>
          <div className="pres-hero__actions reveal" style={{ animationDelay: "260ms" }}>
            <a href="#problem" className="pres-btn-primary">어떤 문제를 풀었나 →</a>
            <a
              href="https://www.notion.so/syjin1999/AI-33626a79dcd3812abf6ceac2397e2fb3"
              target="_blank"
              rel="noreferrer"
              className="pres-btn-ghost"
            >
              보고서 전문 ↗
            </a>
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

      {/* ═══ 2. PROBLEM → SOLUTION ═══ */}
      <section id="problem" className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">PROBLEM — SOLUTION</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            기존 강의 평가의 세 가지 빈칸.
          </h2>
          <div className="pres-grid-3">
            {PROBLEMS.map((p, i) => (
              <article key={p.idx} className="pres-card reveal" style={{ animationDelay: `${120 + i * 100}ms` }}>
                <span className="pres-card__idx">{p.idx}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <a href={p.solveLink} className="pres-card__solve">
                  → {p.solve}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. PIPELINE ═══ */}
      <section id="pipeline" className="pres-section pres-section--dark">
        <div className="pres-container">
          <p className="pres-kicker reveal">PIPELINE</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            원문에서 리포트까지, 다섯 단계.
          </h2>

          <div className="pres-pipeline">
            {PIPELINE.map((s, i) => (
              <div key={s.step} className="pres-pipeline__step reveal" style={{ animationDelay: `${120 + i * 90}ms` }}>
                <div className="pres-pipeline__num">{s.step}</div>
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

      {/* ═══ 4. EVALUATION FRAMEWORK ═══ */}
      <section id="eval" className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">EVALUATION</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            5개 카테고리, 18개 항목.
          </h2>
          <p className="pres-sub reveal" style={{ animationDelay: "140ms" }}>
            WAS = Σ(점수 × 가중치) / Σ가중치 — HIGH 3.0 · MEDIUM 2.0 · LOW 1.0
          </p>

          <div className="pres-categories">
            {CATEGORIES.map((c, i) => (
              <div key={c.name} className="pres-cat reveal" style={{ animationDelay: `${180 + i * 80}ms` }}>
                <div className="pres-cat__head">
                  <span className="pres-cat__num">{c.items}</span>
                  <h3>{c.name}</h3>
                </div>
                <p className="pres-cat__details">{c.details}</p>
                <p className="pres-cat__weight">{c.weight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. RELIABILITY ═══ */}
      <section id="reliability" className="pres-section pres-section--dark">
        <div className="pres-container">
          <p className="pres-kicker reveal">RELIABILITY</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            네 번 실험하고, 네 번 검증했다.
          </h2>

          <div className="pres-exp-grid">
            {EXPERIMENTS.map((exp, i) => (
              <article key={exp.id} className="pres-exp reveal" style={{ animationDelay: `${140 + i * 110}ms` }}>
                <div className="pres-exp__head">
                  <h3>{exp.title}</h3>
                  <span>{exp.subtitle}</span>
                </div>
                <div className="pres-exp__bars">
                  {exp.metrics.map((m) => (
                    <div key={m.label} className="pres-bar">
                      <div className="pres-bar__meta">
                        <span>{m.label}</span>
                        <strong>{m.value}</strong>
                      </div>
                      <div className="pres-bar__track">
                        <span style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="pres-exp__conclusion">{exp.conclusion}</p>
              </article>
            ))}
          </div>

          <div className="pres-optimal reveal" style={{ animationDelay: "300ms" }}>
            <h3>최적 설정</h3>
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

      {/* ═══ 6. TRIBE v2 — WHAT ═══ */}
      <section id="tribe" className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">TRIBE v2</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            점수에 시간을 입힌다.
          </h2>

          {/* ─ 모델 개요 ─ */}
          <div className="pres-tribe-explainer">
            <div className="pres-tribe-block reveal" style={{ animationDelay: "140ms" }}>
              <h3>TRIBE v2가 뭔가</h3>
              <p>{TRIBE_OVERVIEW.what}</p>
            </div>
            <div className="pres-tribe-block reveal" style={{ animationDelay: "200ms" }}>
              <h3>어떻게 학습했나</h3>
              <p>{TRIBE_OVERVIEW.how}</p>
            </div>
            <div className="pres-tribe-block reveal" style={{ animationDelay: "260ms" }}>
              <h3>ROI 지표는 어떻게 산출하나</h3>
              <p>{TRIBE_OVERVIEW.roi}</p>
            </div>
            <div className="pres-tribe-source reveal" style={{ animationDelay: "320ms" }}>
              <span>출처</span>
              <p>{TRIBE_OVERVIEW.source}</p>
            </div>
          </div>

          {/* ─ 활용 + 해석 ─ */}
          <div className="pres-tribe-grid">
            <div className="pres-tribe-benefits reveal" style={{ animationDelay: "380ms" }}>
              <h3>강사에게 주는 정보</h3>
              {TRIBE_BENEFITS.map((b, i) => (
                <div key={i} className="pres-benefit">
                  <div className="pres-benefit__info">{b.info}</div>
                  <div className="pres-benefit__meaning">{b.meaning}</div>
                  <div className="pres-benefit__action">{b.action}</div>
                </div>
              ))}
            </div>

            <div className="pres-tribe-states reveal" style={{ animationDelay: "440ms" }}>
              <h3>뇌 활동 → 학생 상태</h3>
              {BRAIN_STATES.map((b, i) => (
                <div key={i} className="pres-brain-state">
                  <div className="pres-brain-state__head">
                    <span className="pres-brain-state__label">{b.state}</span>
                    <span className="pres-brain-state__conf">{b.confidence}%</span>
                  </div>
                  <p className="pres-brain-state__region-full">{b.regionFull}</p>
                  <p className="pres-brain-state__plain">{b.plain}</p>
                  <p className="pres-brain-state__example">{b.example}</p>
                  <div className="pres-bar__track" style={{ marginTop: 10 }}>
                    <span style={{ width: `${b.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. RESULTS ═══ */}
      <section id="results" className="pres-section pres-section--dark">
        <div className="pres-container">
          <p className="pres-kicker reveal">RESULTS</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            리포트 세 건, 이렇게 나온다.
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

      {/* ═══ 8. TECH ═══ */}
      <section className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">STACK</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>기술 구성</h2>
          <div className="pres-tech reveal" style={{ animationDelay: "160ms" }}>
            {TECH_STACK.map((t) => (
              <div key={t.label} className="pres-tech__row">
                <span>{t.label}</span>
                <strong>{t.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. LIMITATIONS + NEXT ═══ */}
      <section className="pres-section pres-section--dark">
        <div className="pres-container">
          <div className="pres-closing-grid">
            <div className="reveal">
              <p className="pres-kicker">BOUNDARY</p>
              <h2>아직 못하는 것</h2>
              <ul className="pres-list">
                {LIMITATIONS.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
            <div className="reveal" style={{ animationDelay: "140ms" }}>
              <p className="pres-kicker">NEXT</p>
              <h2>다음에 할 것</h2>
              <ol className="pres-list pres-list--ordered">
                {NEXT_STEPS.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 10. CTA ═══ */}
      <section className="pres-cta">
        <div className="pres-container">
          <p className="pres-kicker reveal">THANK YOU</p>
          <h2 className="reveal" style={{ animationDelay: "80ms" }}>
            AI 강의 분석 리포트
          </h2>
          <p className="pres-cta__sub reveal" style={{ animationDelay: "140ms" }}>
            멋쟁이사자처럼 AI 스쿨 · KDT 백엔드 자바 21기
          </p>
          <div className="pres-cta__actions reveal" style={{ animationDelay: "220ms" }}>
            <Link to="/" className="pres-btn-primary">서비스 바로가기 →</Link>
            <a
              href="https://www.notion.so/syjin1999/AI-33626a79dcd3812abf6ceac2397e2fb3"
              target="_blank"
              rel="noreferrer"
              className="pres-btn-ghost"
            >
              Notion 보고서 ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
