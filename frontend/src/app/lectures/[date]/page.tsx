import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useRole } from "@/contexts/RoleContext";
import { getEvaluation } from "@/lib/data";
import { formatDate, scoreColor, scoreBadgeTextColor, scoreLabel, weightLabel } from "@/lib/utils";
import ScoreBadge from "@/components/shared/ScoreBadge";
import FeedbackCard from "@/components/shared/FeedbackCard";
import type { EvaluationResult, CategoryResult, ItemScore } from "@/types/evaluation";

export default function LectureDetailPage() {
  const params = useParams();
  const date = params.date ?? "";
  const { isOperator } = useRole();
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!date) return;
    getEvaluation(date)
      .then(setEvaluation)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="card" style={{ padding: "80px 0", textAlign: "center" }}>
          <p className="text-body">평가 데이터를 불러올 수 없습니다.</p>
          <Link
            to="/lectures"
            className="inline-block font-semibold"
            style={{ marginTop: 16, fontSize: 14, color: "var(--primary)" }}
          >
            &larr; 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const {
    metadata,
    weighted_average,
    category_results,
    category_averages,
    strengths,
    improvements,
    recommendations,
  } = evaluation;

  const radarData = Object.entries(category_averages).map(([name, value]) => ({
    category: name.replace(/^\d+\.\s*/, "").slice(0, 6),
    fullName: name,
    score: value,
    fullMark: 5,
  }));

  // Role-dependent feedback config
  const feedbackConfig = isOperator
    ? {
        strengthTitle: "강점",
        strengthSubtitle: "이 강의에서 높은 평가를 받은 영역입니다",
        improvementTitle: "개선 필요",
        improvementSubtitle: "추가적인 보완이 필요한 영역입니다",
        recommendationTitle: "권장 사항",
        recommendationSubtitle: "품질 향상을 위한 조치 사항입니다",
      }
    : {
        strengthTitle: "잘하고 있는 부분",
        strengthSubtitle: "이 강의에서 효과적이었던 점입니다",
        improvementTitle: "더 나아질 수 있는 부분",
        improvementSubtitle: "다음 수업에서 시도해볼 수 있는 변화입니다",
        recommendationTitle: "구체적 제안",
        recommendationSubtitle: "실행 가능한 다음 단계를 정리했습니다",
      };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div className="card card-padded">
        <Link
          to="/lectures"
          className="inline-flex items-center gap-1 text-caption hover:text-primary"
          style={{ marginBottom: 20 }}
        >
          &larr; 강의 목록
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-title">{metadata.subjects?.[0] ?? "강의"}</h1>
            <p className="text-body" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {metadata.contents?.[0] ?? ""}
            </p>
            <div
              className="flex items-center gap-2 text-caption"
              style={{ marginTop: 12 }}
            >
              <span>{formatDate(evaluation.lecture_date)}</span>
              {metadata.instructor && (
                <>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span>{metadata.instructor}</span>
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right", paddingLeft: 32 }}>
            <p className="text-caption" style={{ marginBottom: 4 }}>종합 점수</p>
            <p
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: scoreColor(weighted_average),
              }}
            >
              {weighted_average.toFixed(1)}
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              {scoreLabel(weighted_average)} · 5점 만점
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 24 }}>카테고리별 점수</h2>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "var(--grey-700)", fontSize: 13, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div
                      className="card"
                      style={{ padding: "12px 16px", boxShadow: "var(--shadow-hover)" }}
                    >
                      <p
                        className="font-semibold"
                        style={{ fontSize: 13, color: "var(--text-primary)" }}
                      >
                        {d.fullName}
                      </p>
                      <p
                        className="font-bold"
                        style={{ fontSize: 18, marginTop: 4, color: scoreColor(d.score) }}
                      >
                        {d.score.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Radar
                name="점수"
                dataKey="score"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Detail */}
      <div>
        <h2 className="text-section" style={{ marginBottom: 20 }}>카테고리별 상세 평가</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {category_results.map((cat) => (
            <CategorySection key={cat.category_name} category={cat} />
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <FeedbackCard
          title={feedbackConfig.strengthTitle}
          subtitle={feedbackConfig.strengthSubtitle}
          items={strengths}
          color="var(--primary)"
        />
        <FeedbackCard
          title={feedbackConfig.improvementTitle}
          subtitle={feedbackConfig.improvementSubtitle}
          items={improvements}
          color="var(--score-3)"
        />
        <FeedbackCard
          title={feedbackConfig.recommendationTitle}
          subtitle={feedbackConfig.recommendationSubtitle}
          items={recommendations}
          color="var(--grey-500)"
        />
      </div>
    </div>
  );
}

/* ─── Category Accordion ─── */

function CategorySection({ category }: { category: CategoryResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left transition-colors"
        style={{ padding: "20px 28px" }}
      >
        <div className="flex items-center gap-5">
          <ScoreBadge score={category.weighted_average} size="lg" className="shrink-0 font-extrabold" />
          <div>
            <p
              className="font-bold"
              style={{ fontSize: 15, color: "var(--text-primary)" }}
            >
              {category.category_name}
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              {category.items.length}개 항목 · {scoreLabel(category.weighted_average)}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: "8px 28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {category.items.map((item) => (
            <ItemScoreCard key={item.item_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Item Score Card ─── */

function ItemScoreCard({ item }: { item: ItemScore }) {
  return (
    <div className="inner-card">
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 font-mono"
            style={{ fontSize: 12, color: "var(--text-muted)" }}
          >
            {item.item_id}
          </span>
          <span
            className="truncate font-semibold"
            style={{ fontSize: 14, color: "var(--text-primary)" }}
          >
            {item.item_name}
          </span>
          <span
            className="shrink-0"
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              background: "var(--surface)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            {weightLabel(item.weight)}
          </span>
        </div>
        <ScoreBadge score={item.score} size="sm" className="shrink-0 ml-4" />
      </div>

      <p className="text-body" style={{ lineHeight: 1.7 }}>{item.reasoning}</p>

      {item.evidence.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <p className="text-label" style={{ marginBottom: 8 }}>근거</p>
          {item.evidence.map((e, i) => (
            <div key={i} className="evidence-card">
              <p className="text-body italic" style={{ lineHeight: 1.7 }}>
                &ldquo;{e}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
