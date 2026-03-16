import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const STATS = [
  { label: "강의 수", value: "15" },
  { label: "평가 항목", value: "18" },
  { label: "AI 모델", value: "3" },
  { label: "평가 결과", value: "45" },
];

const PIPELINE_NODES = [
  { id: "preprocessor", label: "Preprocessor", sub: "STT 파싱 + 청킹", active: false },
];

const EVALUATORS = [
  { id: "lang", label: "언어 품질" },
  { id: "struct", label: "강의 구조" },
  { id: "concept", label: "개념 명확성" },
  { id: "example", label: "예시/실습" },
  { id: "interact", label: "상호작용" },
];

const POST_NODES = [
  { id: "aggregator", label: "Aggregator", sub: "가중 평균 계산", active: true },
  { id: "calibrator", label: "Calibrator", sub: "교차 보정", active: false },
  { id: "report", label: "Report Generator", sub: "마크다운 리포트", active: false },
];

const TECH_STACK = [
  { category: "프론트엔드", items: "React 19, Vite, TypeScript, Tailwind CSS v4, Recharts" },
  { category: "백엔드", items: "Python 3.11, LangGraph, FastAPI" },
  { category: "LLM", items: "GPT-4o mini, Claude Opus, Claude Sonnet" },
  { category: "배포", items: "GitHub Pages, GitHub Actions" },
  { category: "데이터", items: "정적 JSON (DB 불필요)" },
];

function ArrowDown() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
      <div
        style={{
          width: 2,
          height: 24,
          background: "var(--grey-300)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "6px solid var(--grey-300)",
          }}
        />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="page-content" style={{ padding: "40px 24px 80px" }}>
      {/* Hero */}
      <div className="card card-padded" style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "var(--primary)",
            color: "var(--surface)",
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          L
        </div>
        <h1 className="text-title" style={{ fontSize: 26, marginBottom: 12 }}>
          AI 강의 분석 리포트
        </h1>
        <p className="text-body" style={{ maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
          STT 트랜스크립트를 AI가 분석하여 5개 카테고리 × 18개 항목으로 강의 품질을 평가하고,
          교육 운영자와 강사에게 근거 기반 피드백을 제공합니다.
        </p>
      </div>

      {/* Stats */}
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        {STATS.map((stat) => (
          <div key={stat.label} className="card card-padded" style={{ textAlign: "center" }}>
            <div className="text-number" style={{ color: "var(--primary)", marginBottom: 6 }}>
              {stat.value}
            </div>
            <div className="text-caption">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Architecture */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 24 }}>평가 파이프라인</h2>

        {/* Preprocessor */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="inner-card"
            style={{
              textAlign: "center",
              minWidth: 200,
              padding: "16px 24px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              {PIPELINE_NODES[0].label}
            </div>
            <div className="text-caption" style={{ fontSize: 12, marginTop: 4 }}>
              {PIPELINE_NODES[0].sub}
            </div>
          </div>
        </div>

        <ArrowDown />

        {/* 5 Parallel Evaluators */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 10,
          }}
        >
          {EVALUATORS.map((ev) => (
            <div
              key={ev.id}
              className="inner-card"
              style={{
                textAlign: "center",
                padding: "14px 12px",
                background: "var(--primary-light)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                {ev.label}
              </div>
            </div>
          ))}
        </div>
        <div className="text-caption" style={{ textAlign: "center", marginTop: 6 }}>
          5개 카테고리 병렬 평가
        </div>

        <ArrowDown />

        {/* Post-processing nodes */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          {POST_NODES.map((node, i) => (
            <div key={node.id}>
              <div
                className="inner-card"
                style={{
                  textAlign: "center",
                  minWidth: 200,
                  padding: "16px 24px",
                  background: node.active ? "var(--primary)" : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: node.active ? "var(--surface)" : "var(--text-primary)",
                  }}
                >
                  {node.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: node.active ? "rgba(255,255,255,0.75)" : "var(--text-muted)",
                  }}
                >
                  {node.sub}
                </div>
              </div>
              {i < POST_NODES.length - 1 && <ArrowDown />}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 20 }}>기술 스택</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TECH_STACK.map((row) => (
            <div key={row.category} className="inner-card" style={{ padding: "16px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                {row.category}
              </div>
              <div className="text-body">{row.items}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Link to="/dashboard" className="btn-primary" style={{ gap: 8, fontSize: 15, padding: "14px 32px" }}>
          시작하기
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
