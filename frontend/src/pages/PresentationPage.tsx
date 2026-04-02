import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function withBasePath(baseUrl: string, path: string) {
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalized}${path.replace(/^\//, "")}`;
}

const HERO_METRICS = [
  { value: "15", label: "강의를 끝까지 읽고 평가해요" },
  { value: "18", label: "체크리스트 항목을 남겨요" },
  { value: "0.877", label: "평균 ICC로 신뢰도를 봤어요" },
  { value: "4", label: "실험으로 설정을 검증했어요" },
];

const FLOW_SECTIONS = [
  {
    step: "01",
    title: "문제를 다시 정의했어요",
    desc: "점수만 주는 평가가 아니라, 강사가 다음 수업에서 바로 바꿀 수 있는 근거형 피드백으로 풀었어요.",
  },
  {
    step: "02",
    title: "원문과 기준을 같이 읽어요",
    desc: "15개 강의 스크립트와 품질 기준을 같이 묶어 감상평이 아니라 기준 기반 평가가 되게 했어요.",
  },
  {
    step: "03",
    title: "평가 파이프라인을 시간축으로 묶었어요",
    desc: "강의를 30분 윈도우로 자르고, 5개 카테고리가 병렬로 읽고, 가중 평균과 리포트까지 한 흐름으로 이어가요.",
  },
  {
    step: "04",
    title: "실험으로 흔들림을 확인했어요",
    desc: "같은 강의를 세 번 읽었을 때 얼마나 비슷한지, 청크 크기와 윈도우가 점수를 얼마나 바꾸는지 직접 검증했어요.",
  },
  {
    step: "05",
    title: "수강자 반응도 시간축으로 보여줘요",
    desc: "TRIBE v2로 구간별 뇌 반응을 예측해, 어느 설명에서 따라오고 어느 장면에서 이탈하는지 시각화했어요.",
  },
  {
    step: "06",
    title: "리포트는 행동 단위로 마무리해요",
    desc: "관찰된 사실, 해석, 다음 액션을 분리해서 강사가 바로 적용할 수 있는 언어로 정리했어요.",
  },
];

const PIPELINE_NODES = [
  "강의 STT 원문",
  "시간 윈도우 청킹",
  "5개 카테고리 병렬 평가",
  "18개 항목 집계",
  "리포트 생성",
];

const RELIABILITY_METRICS = [
  { label: "ICC", value: "0.877", note: "Good" },
  { label: "Kappa", value: "0.883", note: "Almost Perfect" },
  { label: "Alpha", value: "0.873", note: "Reliable" },
  { label: "SSI", value: "0.974", note: "Very Stable" },
];

const DISTRIBUTION = [
  { label: "Excellent", count: 8, width: 88 },
  { label: "Good", count: 5, width: 60 },
  { label: "Moderate", count: 2, width: 28 },
  { label: "Poor", count: 0, width: 8 },
];

const EXPERIMENTS = [
  {
    title: "반복 평가 신뢰도",
    value: "13 / 15",
    detail: "15개 강의 중 13개가 Good 이상이었어요.",
  },
  {
    title: "청크 크기 민감도",
    value: "+0.212",
    detail: "30분 청크가 15분 청크보다 평균 점수가 높았어요.",
  },
  {
    title: "효과 크기",
    value: "1.142",
    detail: "청크 차이가 작지 않다는 점을 실험으로 확인했어요.",
  },
  {
    title: "권장 운영 설정",
    value: "60 / 30",
    detail: "60분 윈도우와 30분 hop 조합이 균형이 좋았어요.",
  },
];

const SAMPLE_REPORTS = [
  {
    title: "2026-02-02 Java I/O",
    desc: "버퍼드 리더/라이터 설명과 파일 방문자 패턴 구간을 비교해서 설명 속도와 실습 전환을 같이 짚었어요.",
  },
  {
    title: "2026-02-09 Front-End",
    desc: "문자열 함수 실습은 반응이 좋았고, INFORMATION_SCHEMA 설명 구간은 시각 보조가 더 필요하다는 흐름으로 정리했어요.",
  },
  {
    title: "2026-02-24 MySQL",
    desc: "트랜잭션 롤백 실습은 강점으로, 파티션 유형 설명은 압축이 심한 구간으로 읽어 마무리 요약 부족까지 연결했어요.",
  },
];

const SCREENS = [
  {
    title: "Dashboard",
    desc: "심사자는 먼저 전체 강의 흐름과 주요 지표를 봐요.",
    file: "presentation/assets/ui-dashboard.png",
  },
  {
    title: "Lecture Detail",
    desc: "날짜별 강의에서 점수, 근거, 시뮬레이션 흐름을 같이 읽어요.",
    file: "presentation/assets/ui-lecture-detail.png",
  },
  {
    title: "EDA",
    desc: "분포와 카테고리 차이를 한눈에 비교해요.",
    file: "presentation/assets/ui-eda.png",
  },
  {
    title: "Experiments",
    desc: "신뢰도와 변수 민감도 결과를 별도 화면에서 확인해요.",
    file: "presentation/assets/ui-experiments.png",
  },
];

const REPORT_POINTS = [
  "강점, 개선점, 다음 액션을 따로 보여줘요.",
  "근거 타임스탬프를 남겨서 다시 확인할 수 있어요.",
  "시뮬레이션은 구간별 반응과 설명 리듬을 같이 보여줘요.",
];

const LIMITS = [
  "텍스트 기반 평가라 제스처와 표정 같은 비언어 신호는 아직 반영하지 못해요.",
  "TRIBE v2 시뮬레이션은 현재 3개 강의를 중심으로 실데이터 검증을 진행했어요.",
  "한국어 강의 전반에 대한 외부 검증은 앞으로 더 쌓아야 해요.",
];

export default function PresentationPage() {
  const baseUrl = import.meta.env.BASE_URL;
  const deckSrc = withBasePath(baseUrl, "presentation/index.html");
  const notionSrc = "https://www.notion.so/syjin1999/AI-33626a79dcd3812abf6ceac2397e2fb3";

  return (
    <div className="presentation-shell">
      <div className="presentation-topbar">
        <Link to="/" className="presentation-wordmark">
          AI Lecture Report
        </Link>
        <div className="presentation-topbar-actions">
          <a href={notionSrc} target="_blank" rel="noreferrer" className="presentation-inline-link">
            보고서 샘플
            <ArrowUpRight size={14} />
          </a>
          <a href={deckSrc} target="_blank" rel="noreferrer" className="btn-primary">
            공개 발표 덱 열기
          </a>
        </div>
      </div>

      <section className="presentation-hero">
        <div className="presentation-hero-copy presentation-fade-up">
          <p className="presentation-kicker">PROJECT INTRODUCTION</p>
          <h1>
            강의 피드백을
            <br />
            점수에서 근거로
            <br />
            바꿔요
          </h1>
          <p className="presentation-hero-body">
            AI가 강의 원문을 처음부터 끝까지 읽고 18개 항목으로 평가해요.
            여기에 TRIBE v2 시뮬레이션을 더해, 어느 구간이 따라가기 쉬웠고
            어디서 설명 리듬이 무너졌는지 시간축으로 보여줘요.
          </p>
          <div className="presentation-hero-actions">
            <a href={deckSrc} target="_blank" rel="noreferrer" className="btn-primary">
              공개 발표 덱 보기
            </a>
            <a href={notionSrc} target="_blank" rel="noreferrer" className="btn-secondary">
              Notion 보고서 보기
            </a>
            <Link to="/" className="presentation-inline-link">
              서비스 보기
            </Link>
          </div>
        </div>

        <div className="presentation-hero-panel presentation-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="presentation-hero-panel-head">
            <span>이번 발표에서 보여주는 것</span>
            <strong>신뢰도 + UX + 실데이터</strong>
          </div>
          <div className="presentation-metric-grid">
            {HERO_METRICS.map((metric, index) => (
              <article
                key={metric.label}
                className="presentation-metric-card"
                style={{ animationDelay: `${index * 80 + 180}ms` }}
              >
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
          <div className="presentation-hero-aside">
            <p>22,756줄 원문과 15개 강의 구간을 다시 정리했어요.</p>
            <p>평가 데이터는 non-break 섹션 coverage 0건을 없애고 다시 맞췄어요.</p>
          </div>
        </div>
      </section>

      <section className="presentation-section presentation-section-light">
        <div className="presentation-section-heading">
          <p className="presentation-kicker">FLOW</p>
          <h2>발표는 이 흐름으로 읽으면 돼요</h2>
          <p>
            README와 최종 보고서 내용을 발표에 맞게 줄이고, 심사자가 바로 이해할
            수 있는 장면 중심으로 다시 배치했어요.
          </p>
        </div>

        <div className="presentation-flow-grid">
          {FLOW_SECTIONS.map((section, index) => (
            <article
              key={section.step}
              className="presentation-flow-card presentation-fade-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span>{section.step}</span>
              <h3>{section.title}</h3>
              <p>{section.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="presentation-section presentation-section-dark">
        <div className="presentation-section-heading presentation-section-heading-dark">
          <p className="presentation-kicker">SYSTEM</p>
          <h2>평가와 리포트를 한 장면으로 묶었어요</h2>
          <p>
            토큰이 아니라 시간 기준으로 청킹하고, 카테고리별 하네스를 분리해서
            바뀐 기준도 추적할 수 있게 했어요.
          </p>
        </div>

        <div className="presentation-pipeline">
          {PIPELINE_NODES.map((node, index) => (
            <div key={node} className="presentation-pipeline-node">
              <span>{`0${index + 1}`}</span>
              <strong>{node}</strong>
            </div>
          ))}
        </div>

        <div className="presentation-dual-grid">
          <article className="presentation-info-card">
            <p className="presentation-card-label">FACT</p>
            <h3>하네스는 코드가 아니라 문서에 있어요</h3>
            <p>
              평가 기준, 5점 앵커, chunk focus, 출력 JSON 형식을 MD로 관리해서
              기준 변경 이유를 남기고 빠르게 보정할 수 있어요.
            </p>
          </article>
          <article className="presentation-info-card">
            <p className="presentation-card-label">INTERPRETATION</p>
            <h3>리포트의 핵심은 채점이 아니라 다음 액션이에요</h3>
            <p>
              점수만 주지 않고 관찰된 사실, 해석, 개선 제안을 따로 써서 강의
              설계로 바로 이어지게 만들었어요.
            </p>
          </article>
        </div>
      </section>

      <section className="presentation-section presentation-section-light">
        <div className="presentation-section-heading">
          <p className="presentation-kicker">VALIDATION</p>
          <h2>이 점수를 믿어도 되는지 먼저 확인했어요</h2>
          <p>
            반복 평가 신뢰도와 청크 민감도를 같이 보여줘야, 발표가 기능 소개에
            머물지 않고 측정 도구의 설득력까지 전달돼요.
          </p>
        </div>

        <div className="presentation-validation-grid">
          <div className="presentation-metric-stack">
            {RELIABILITY_METRICS.map((metric, index) => (
              <article
                key={metric.label}
                className="presentation-validation-card presentation-fade-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.note}</p>
              </article>
            ))}
          </div>

          <div className="presentation-chart-card">
            <div className="presentation-chart-head">
              <div>
                <p className="presentation-card-label">ICC DISTRIBUTION</p>
                <h3>15개 강의 중 13개가 Good 이상이었어요</h3>
              </div>
              <span className="presentation-pill">평균 ICC 0.877</span>
            </div>
            <div className="presentation-bar-list">
              {DISTRIBUTION.map((item) => (
                <div key={item.label} className="presentation-bar-row">
                  <div className="presentation-bar-meta">
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                  <div className="presentation-bar-track">
                    <div className="presentation-bar-fill" style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="presentation-experiment-grid">
          {EXPERIMENTS.map((item, index) => (
            <article
              key={item.title}
              className="presentation-experiment-card"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="presentation-section presentation-section-light">
        <div className="presentation-section-heading">
          <p className="presentation-kicker">REPORT SAMPLES</p>
          <h2>실제 강의는 이런 식으로 요약해요</h2>
          <p>
            최종 보고서에서 대표 장면만 골라서, 어떤 설명이 잘 먹혔고 어디서
            리듬이 무너졌는지 발표용 문장으로 다시 압축했어요.
          </p>
        </div>

        <div className="presentation-flow-grid">
          {SAMPLE_REPORTS.map((item, index) => (
            <article
              key={item.title}
              className="presentation-flow-card presentation-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span>sample</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="presentation-section presentation-section-dark">
        <div className="presentation-section-heading presentation-section-heading-dark">
          <p className="presentation-kicker">SIMULATION</p>
          <h2>TRIBE v2는 어느 구간에서 따라오고 이탈하는지 보여줘요</h2>
          <p>
            정적 점수만으로는 놓치는 시간축 변화를 3D 뇌 반응과 설명 리듬으로
            같이 보여줘서, 문제 구간을 더 구체적으로 읽게 했어요.
          </p>
        </div>

        <div className="presentation-highlight-panel">
          <div>
            <p className="presentation-card-label">WHY IT MATTERS</p>
            <h3>평가가 전체 요약이라면, 시뮬레이션은 구간 처방이에요</h3>
          </div>
          <ul>
            {REPORT_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="presentation-screen-grid">
          {SCREENS.map((screen, index) => (
            <article
              key={screen.title}
              className="presentation-screen-card presentation-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="presentation-screen-frame">
                <img src={withBasePath(baseUrl, screen.file)} alt={screen.title} />
              </div>
              <div className="presentation-screen-copy">
                <span>{screen.title}</span>
                <p>{screen.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="presentation-section presentation-section-light">
        <div className="presentation-closing">
          <div className="presentation-closing-copy">
            <p className="presentation-kicker">NEXT</p>
            <h2>이번 발표는 기능보다 운영 완성도를 설득하는 장면이에요</h2>
            <p>
              지금은 전체 sections와 evaluations를 원문 기준으로 다시 맞췄고,
              발표용 소개 페이지와 공개 덱 흐름까지 같은 톤으로 정리했어요.
              다음 단계는 실데이터 연결 범위를 넓히고, 발표 리허설 기준으로
              시뮬레이션 화면을 더 다듬는 일이에요.
            </p>
            <ul className="presentation-limit-list">
              {LIMITS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="presentation-closing-actions">
            <a href={deckSrc} target="_blank" rel="noreferrer" className="btn-primary">
              새 탭에서 발표 자료 열기
            </a>
            <a href={notionSrc} target="_blank" rel="noreferrer" className="btn-secondary">
              Notion 열기
            </a>
            <Link to="/" className="presentation-inline-link">
              첫 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
