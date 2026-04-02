import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PresentationPage.css";

/* ── data ── */

const HERO_METRICS = [
  { value: "15", label: "강의 분석" },
  { value: "18", label: "평가 항목" },
  { value: "0.877", label: "ICC 신뢰도" },
  { value: "4", label: "검증 실험" },
];

const PROBLEMS = [
  {
    idx: "01",
    title: "주관적 설문 의존",
    body: "강의 평가가 수강생 설문에만 의존하고 있어, 구체적 피드백이 부족해요.",
  },
  {
    idx: "02",
    title: "시간축 정보 부재",
    body: "강사가 '어느 구간에서 학생이 집중하고 이탈하는지' 알 수 없어요.",
  },
  {
    idx: "03",
    title: "처방 근거 없음",
    body: "점수만 있고 '왜 낮은지, 어떻게 고칠지'에 대한 근거가 없어요.",
  },
];

const PIPELINE = [
  {
    step: "01",
    title: "트랜스크립트 수집",
    desc: "3~4시간 강의 STT 원문 22,756줄을 타임스탬프와 함께 파싱해요.",
  },
  {
    step: "02",
    title: "시간 윈도우 청킹",
    desc: "60분 윈도우, 30분 hop으로 맥락을 유지하면서 청크를 나눠요.",
  },
  {
    step: "03",
    title: "5개 카테고리 병렬 평가",
    desc: "LangGraph로 5개 카테고리를 동시에 평가하고 근거를 남겨요.",
  },
  {
    step: "04",
    title: "가중 평균 집계",
    desc: "HIGH·MEDIUM·LOW 가중치로 18개 항목의 WAS를 계산해요.",
  },
  {
    step: "05",
    title: "리포트 생성",
    desc: "강점·개선점·권장사항을 자연어로 정리하고 내보내요.",
  },
];

const CATEGORIES = [
  {
    name: "언어 표현 품질",
    items: 3,
    details: "불필요한 반복, 발화 완결성, 언어 일관성",
    weight: "HIGH ×1 · MEDIUM ×2",
  },
  {
    name: "강의 도입 및 구조",
    items: 5,
    details: "학습 목표, 복습 연계, 설명 순서, 핵심 강조, 마무리 요약",
    weight: "HIGH ×2 · MEDIUM ×2 · LOW ×1",
  },
  {
    name: "개념 설명 명확성",
    items: 4,
    details: "개념 정의, 비유·예시, 선행 개념 확인, 발화 속도",
    weight: "HIGH ×2 · MEDIUM ×2",
  },
  {
    name: "예시 및 실습 연계",
    items: 2,
    details: "예시 적절성, 실습 연계",
    weight: "HIGH ×2",
  },
  {
    name: "수강생 상호작용",
    items: 4,
    details: "오류 대응, 이해 확인, 참여 유도, 질문 응답",
    weight: "HIGH ×3 · MEDIUM ×1",
  },
];

const EXPERIMENTS = [
  {
    id: "exp-1",
    title: "평가 일관성 검정",
    subtitle: "Test-Retest Reliability",
    metrics: [
      { label: "ICC", value: "0.877", pct: 88 },
      { label: "Kappa", value: "0.883", pct: 88 },
      { label: "Alpha", value: "0.873", pct: 87 },
      { label: "SSI", value: "0.974", pct: 97 },
    ],
    conclusion: "15개 강의 중 87%(13개)가 Good 이상으로 수렴",
  },
  {
    id: "exp-2",
    title: "청크 크기 민감도",
    subtitle: "30분 vs 15분",
    metrics: [
      { label: "30분 평균", value: "3.245", pct: 65 },
      { label: "15분 평균", value: "3.033", pct: 61 },
    ],
    conclusion: "t(14) = 4.421, p = 0.0006 — 비교 분석은 동일 청크 크기로 통일 필요",
  },
  {
    id: "exp-3",
    title: "윈도우 길이 민감도",
    subtitle: "30분 vs 60분 vs 120분",
    metrics: [
      { label: "가장 민감", value: "예시·실습", pct: 67 },
      { label: "가장 안정", value: "언어 품질", pct: 24 },
    ],
    conclusion: "60분 윈도우가 세밀도와 맥락의 최적 균형",
  },
  {
    id: "exp-4",
    title: "Hop 크기 민감도",
    subtitle: "50% vs 75% vs 90%",
    metrics: [
      { label: "Hop 50%", value: "77.8%", pct: 78 },
      { label: "Hop 75%", value: "72.2%", pct: 72 },
    ],
    conclusion: "Hop 50%가 맥락 연속성 유지하며 가장 안정적",
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
    state: "개념 정리 중",
    region: "전두엽 (DLPFC)",
    example: "API 메소드 호출 순서 단계별 정리",
    confidence: 70,
  },
  {
    state: "딴생각 가능성",
    region: "후대상회 (DMN)",
    example: "강의 마무리 시 양쪽 대칭 활성화",
    confidence: 100,
  },
  {
    state: "설명 이해 중",
    region: "상측두회 (Wernicke)",
    example: "기술 용어 반복 설명 구간",
    confidence: 100,
  },
  {
    state: "화면 보는 중",
    region: "후두엽 (시각피질)",
    example: "화면 전환, 시각 자료 제시 구간",
    confidence: 60,
  },
];

const TRIBE_BENEFITS = [
  {
    info: "구간별 뇌 반응 강도",
    meaning: "어느 구간에서 반응이 크고 작은지",
    action: "반응 낮은 구간 설명 방식 변경",
  },
  {
    info: "뇌 기능 프로필 (8카테고리)",
    meaning: "학생이 지금 뭘 하고 있는지",
    action: "수동 청취 → 능동 학습 유도",
  },
  {
    info: "ROI 기반 자동 처방",
    meaning: "이 구간을 어떻게 고칠지",
    action: "구체적 교수법 적용",
  },
  {
    info: "3D 뇌 히트맵",
    meaning: "어느 뇌 영역이 활성화되는지",
    action: "시각적으로 강의 효과 확인",
  },
];

const REPORT_SAMPLES = [
  {
    date: "2026-02-02",
    subject: "객체지향 프로그래밍 (Java I/O)",
    score: 3.8,
    strengths: "버퍼드 리더/라이터 단계별 설명, 수강생 질문 즉각 응답",
    improvements: "도입부 학습 목표 안내 부족, 고급 개념 속도 조절 필요",
    brainPeak: "01:26~01:31 — 기술 용어 반복 설명",
  },
  {
    date: "2026-02-09",
    subject: "Front-End Programming",
    score: 3.5,
    strengths: "문자열 함수 POST/SUBSTRING 예제가 강점",
    improvements: "INFORMATION_SCHEMA 구간 추상 개념 시각 보조 필요",
    brainPeak: "09:30~09:35 — 문자열 함수 예제",
  },
  {
    date: "2026-02-24",
    subject: "Back-End Programming (MySQL)",
    score: 3.6,
    strengths: "MySQL 패치 및 트랜잭션 롤백 실습이 강점",
    improvements: "파티션 유형 설명 압축 커서 마무리 보강 필요",
    brainPeak: "11:50~11:55 — 트랜잭션 롤백 실습",
  },
];

const TECH_STACK = [
  { label: "Frontend", value: "React 19 · TypeScript · Vite" },
  { label: "3D", value: "Three.js · React Three Fiber" },
  { label: "Chart", value: "Recharts" },
  { label: "Backend", value: "FastAPI · LangGraph" },
  { label: "Brain", value: "Meta TRIBE v2 (fMRI)" },
  { label: "Auth", value: "Supabase (Google/Notion)" },
];

const LIMITATIONS = [
  "텍스트 기반이라 비언어적 요소(표정, 제스처)는 아직 반영하지 못해요.",
  "TRIBE v2는 현재 3/15 강의만 시뮬레이션 완료했어요.",
  "한국어 강의에 대한 외부 검증 데이터가 더 필요해요.",
  "STT 정확도에 의존하고, 코딩 부트캠프에 특화되어 있어요.",
];

const NEXT_STEPS = [
  "전체 15개 강의 시뮬레이션 완료",
  "실제 수강생 설문과 상관성 분석",
  "실시간 강의 중 뇌 반응 예측 (streaming)",
  "다국어·다기관 확장",
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
      { threshold: 0.15, rootMargin: "-4% 0px" }
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const pct = (score / 5) * 100;
  const deg = (pct / 100) * 360;
  const inner = size - 16;
  return (
    <div
      className="score-ring"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--accent) 0deg ${deg}deg, rgba(255,255,255,0.12) ${deg}deg 360deg)`,
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
          <p className="pres-kicker reveal">AI LECTURE QUALITY ANALYSIS</p>
          <h1 className="reveal" style={{ animationDelay: "80ms" }}>
            강의 피드백을<br />
            점수에서 근거로 바꿔요.
          </h1>
          <p className="pres-hero__sub reveal" style={{ animationDelay: "140ms" }}>
            강의 원문을 끝까지 읽어 항목별 점수와 근거를 남기고,
            Meta TRIBE v2 뇌 인코딩 모델로 수강자 반응을 시뮬레이션하여
            강사에게 교수법 개선 인사이트를 제공해요.
          </p>
          <div className="pres-hero__actions reveal" style={{ animationDelay: "200ms" }}>
            <a href="#pipeline" className="pres-btn-primary">핵심 흐름 보기 →</a>
            <a
              href="https://www.notion.so/syjin1999/AI-33626a79dcd3812abf6ceac2397e2fb3"
              target="_blank"
              rel="noreferrer"
              className="pres-btn-ghost"
            >
              보고서 전문 ↗
            </a>
          </div>

          <div className="pres-hero__metrics reveal" style={{ animationDelay: "260ms" }}>
            {HERO_METRICS.map((m) => (
              <div key={m.label} className="pres-stat">
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 2. PROBLEM ═══ */}
      <section id="problem" className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">PROBLEM DEFINITION</p>
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>
            왜 만들었나요?
          </h2>
          <div className="pres-grid-3">
            {PROBLEMS.map((p, i) => (
              <article key={p.idx} className="pres-card reveal" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="pres-card__idx">{p.idx}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. PIPELINE ═══ */}
      <section id="pipeline" className="pres-section pres-section--dark">
        <div className="pres-container">
          <p className="pres-kicker reveal">EVALUATION PIPELINE</p>
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>
            5단계로 평가하고 리포트를 만들어요.
          </h2>

          <div className="pres-pipeline">
            {PIPELINE.map((s, i) => (
              <div key={s.step} className="pres-pipeline__step reveal" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="pres-pipeline__num">{s.step}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pres-pipeline__connector reveal" style={{ animationDelay: "400ms" }}>
            <div className="pres-connector-line" />
            <span>입력: STT 원문 22,756줄</span>
            <span>→</span>
            <span>출력: 마크다운 리포트 + Notion 내보내기</span>
          </div>
        </div>
      </section>

      {/* ═══ 4. EVALUATION SYSTEM ═══ */}
      <section className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">EVALUATION FRAMEWORK</p>
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>
            5개 카테고리, 18개 항목으로 평가해요.
          </h2>
          <p className="pres-sub reveal" style={{ animationDelay: "100ms" }}>
            WAS = Σ(점수 × 가중치) / Σ가중치 &nbsp;|&nbsp; HIGH = 3.0 · MEDIUM = 2.0 · LOW = 1.0
          </p>

          <div className="pres-categories">
            {CATEGORIES.map((c, i) => (
              <div key={c.name} className="pres-cat reveal" style={{ animationDelay: `${i * 70}ms` }}>
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
          <p className="pres-kicker reveal">RELIABILITY VERIFICATION</p>
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>
            4개 실험으로 파이프라인을 검증했어요.
          </h2>

          <div className="pres-exp-grid">
            {EXPERIMENTS.map((exp, i) => (
              <article key={exp.id} className="pres-exp reveal" style={{ animationDelay: `${i * 100}ms` }}>
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

          <div className="pres-optimal reveal" style={{ animationDelay: "200ms" }}>
            <h3>최적 파이프라인 설정</h3>
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

      {/* ═══ 6. TRIBE v2 ═══ */}
      <section id="tribe" className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">TRIBE v2 BRAIN SIMULATION</p>
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>
            뇌 반응으로 시간축 피드백을 더해요.
          </h2>
          <p className="pres-sub reveal" style={{ animationDelay: "100ms" }}>
            Meta AI의 TRIBE v2 모델 — 25명 피험자 451.6시간 실제 fMRI 데이터로 훈련,
            10,242개 뇌 정점별 cortical response를 예측해요.
          </p>

          <div className="pres-tribe-grid">
            <div className="pres-tribe-benefits reveal" style={{ animationDelay: "140ms" }}>
              <h3>TRIBE v2가 제공하는 정보</h3>
              {TRIBE_BENEFITS.map((b, i) => (
                <div key={i} className="pres-benefit">
                  <div className="pres-benefit__info">{b.info}</div>
                  <div className="pres-benefit__meaning">{b.meaning}</div>
                  <div className="pres-benefit__action">{b.action}</div>
                </div>
              ))}
            </div>

            <div className="pres-tribe-states reveal" style={{ animationDelay: "200ms" }}>
              <h3>뇌 활동 해석 기준</h3>
              {BRAIN_STATES.map((b, i) => (
                <div key={i} className="pres-brain-state">
                  <div className="pres-brain-state__head">
                    <span className="pres-brain-state__label">{b.state}</span>
                    <span className="pres-brain-state__conf">{b.confidence}%</span>
                  </div>
                  <p className="pres-brain-state__region">{b.region}</p>
                  <p className="pres-brain-state__example">{b.example}</p>
                  <div className="pres-bar__track" style={{ marginTop: 8 }}>
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
          <p className="pres-kicker reveal">ANALYSIS RESULTS</p>
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>
            완성된 분석 리포트 샘플 3건
          </h2>

          <div className="pres-reports">
            {REPORT_SAMPLES.map((r, i) => (
              <article key={r.date} className="pres-report reveal" style={{ animationDelay: `${i * 120}ms` }}>
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

      {/* ═══ 8. TECH STACK ═══ */}
      <section className="pres-section pres-section--light">
        <div className="pres-container">
          <p className="pres-kicker pres-kicker--dark reveal">TECHNOLOGY</p>
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>기술 스택</h2>
          <div className="pres-tech reveal" style={{ animationDelay: "120ms" }}>
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
              <p className="pres-kicker">LIMITATIONS</p>
              <h2 style={{ marginBottom: 20 }}>지금의 한계</h2>
              <ul className="pres-list">
                {LIMITATIONS.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
            <div className="reveal" style={{ animationDelay: "120ms" }}>
              <p className="pres-kicker">NEXT STEPS</p>
              <h2 style={{ marginBottom: 20 }}>다음 목표</h2>
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
          <h2 className="reveal" style={{ animationDelay: "60ms" }}>
            AI 강의 분석 리포트 생성기
          </h2>
          <p className="pres-cta__sub reveal" style={{ animationDelay: "100ms" }}>
            멋쟁이사자처럼 AI 스쿨 KDT 백엔드 자바 21기
          </p>
          <div className="pres-cta__actions reveal" style={{ animationDelay: "160ms" }}>
            <Link to="/" className="pres-btn-primary">서비스로 이동 →</Link>
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
