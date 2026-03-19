import { Link } from "react-router-dom";

const STATS = [
  { value: "15", desc: "개 강의를 분석했어요" },
  { value: "5", desc: "개 카테고리, 18개 항목으로 평가해요" },
  { value: "3", desc: "개 AI 모델로 교차 검증해요" },
];

const PIPELINE_STEPS = [
  {
    title: "트랜스크립트 전처리",
    desc: "강의 녹음 텍스트를 시간 단위로 나눠요",
  },
  {
    title: "5개 카테고리 병렬 평가",
    desc: "언어 품질, 강의 구조, 개념 명확성, 예시/실습, 상호작용",
  },
  {
    title: "점수 집계 및 보정",
    desc: "가중 평균을 계산하고 일관성을 확인해요",
  },
  {
    title: "리포트 생성",
    desc: "잘한 점, 개선할 점, 구체적 제안을 정리해요",
  },
];

const TECH_STACK = [
  { key: "프론트엔드", value: "React, Vite, TypeScript, Tailwind CSS" },
  { key: "백엔드", value: "Python, LangGraph, FastAPI" },
  { key: "LLM", value: "GPT-4o mini, Claude Opus, Claude Sonnet" },
  { key: "배포", value: "GitHub Pages" },
];

export default function AboutPage() {
  return (
    <div
      style={{
        background: "var(--surface)",
        minHeight: "100vh",
      }}
    >
      <div
        className="page-content"
        style={{
          padding: "60px 24px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        {/* Intro */}
        <div>
          <h1
            className="text-title"
            style={{ fontSize: 26, marginBottom: 12 }}
          >
            AI 강의 분석 리포트
          </h1>
          <p
            className="text-body"
            style={{ maxWidth: 460, lineHeight: 1.8 }}
          >
            강의 녹음을 분석해서 품질을 항목별로 평가하고,
            근거와 함께 개선 방향을 알려줘요.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.value} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span
                className="text-number"
                style={{ color: "var(--primary)" }}
              >
                {stat.value}
              </span>
              <span
                className="text-body"
                style={{ color: "var(--text-secondary)" }}
              >
                {stat.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div>
          <h2
            className="text-section"
            style={{ marginBottom: 24 }}
          >
            평가 과정
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {PIPELINE_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--primary)",
                    background: "var(--primary-light)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ paddingTop: 2 }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.title}
                  </p>
                  <p className="text-body">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2
            className="text-section"
            style={{ marginBottom: 20 }}
          >
            기술 스택
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {TECH_STACK.map((row) => (
              <div
                key={row.key}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 80,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-tertiary)",
                  }}
                >
                  {row.key}
                </span>
                <span className="text-body">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/dashboard"
              className="btn-primary"
              style={{
                fontSize: 15,
                padding: "14px 32px",
              }}
            >
              시작하기 →
            </Link>
            <Link
              to="/presentation"
              className="btn-secondary"
              style={{
                fontSize: 15,
                padding: "14px 32px",
              }}
            >
              중간발표 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
