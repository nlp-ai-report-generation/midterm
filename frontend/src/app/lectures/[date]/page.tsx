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
import { getEvaluation } from "@/lib/data";
import { formatDate, scoreColor, scoreBadgeTextColor, scoreLabel, weightLabel } from "@/lib/utils";
import type { EvaluationResult, CategoryResult, ItemScore } from "@/types/evaluation";

export default function LectureDetailPage() {
  const params = useParams();
  const date = params.date ?? "";
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
      <div className="mx-auto max-w-[1080px]">
        <div className="card py-20 text-center">
          <p className="text-body">평가 데이터를 불러올 수 없습니다.</p>
          <Link to="/lectures" className="mt-4 inline-block text-[14px] text-primary font-semibold">
            ← 목록으로 돌아가기
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

  return (
    <div className="mx-auto max-w-[1080px] space-y-8">
      {/* 헤더 — 강의 정보 + 종합 점수 */}
      <div className="card card-padded">
        <Link
          to="/lectures"
          className="inline-flex items-center gap-1 text-caption hover:text-primary mb-5"
        >
          ← 강의 목록
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-title">
              {metadata.subjects?.[0] ?? "강의"}
            </h1>
            <p className="mt-2 text-body leading-relaxed">
              {metadata.contents?.[0] ?? ""}
            </p>
            <div className="mt-3 flex items-center gap-2 text-caption">
              <span>{formatDate(evaluation.lecture_date)}</span>
              {metadata.instructor && (
                <>
                  <span>·</span>
                  <span>{metadata.instructor}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right pl-8">
            <p className="text-caption mb-1">종합 점수</p>
            <p
              className="text-[40px] font-extrabold leading-none tracking-tight"
              style={{ color: scoreColor(weighted_average) }}
            >
              {weighted_average.toFixed(1)}
            </p>
            <p className="text-caption mt-1">{scoreLabel(weighted_average)} · 5점 만점</p>
          </div>
        </div>
      </div>

      {/* 레이더 차트 */}
      <div className="card card-padded">
        <h2 className="text-section mb-6">카테고리별 점수</h2>
        <div className="h-[340px]">
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
                    <div className="card" style={{ padding: "12px 16px", boxShadow: "var(--shadow-hover)" }}>
                      <p className="font-semibold text-foreground text-[13px]">{d.fullName}</p>
                      <p className="text-[18px] font-bold mt-1" style={{ color: scoreColor(d.score) }}>
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

      {/* 카테고리별 상세 평가 */}
      <div>
        <h2 className="text-section mb-5">카테고리별 상세 평가</h2>
        <div className="space-y-4">
          {category_results.map((cat) => (
            <CategorySection key={cat.category_name} category={cat} />
          ))}
        </div>
      </div>

      {/* 종합 피드백 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <FeedbackCard
          title="잘하고 있는 부분"
          subtitle="이 강의에서 효과적이었던 점입니다"
          items={strengths}
          color="var(--primary)"
        />
        <FeedbackCard
          title="더 나아질 수 있는 부분"
          subtitle="다음 수업에서 시도해볼 수 있는 변화입니다"
          items={improvements}
          color="rgba(255, 107, 0, 0.5)"
        />
        <FeedbackCard
          title="구체적 제안"
          subtitle="실행 가능한 다음 단계를 정리했습니다"
          items={recommendations}
          color="#3182F6"
        />
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: CategoryResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* 카테고리 헤더 — 시각적으로 강하게 */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-background transition-colors"
      >
        <div className="flex items-center gap-5">
          {/* 큰 점수 배지 */}
          <div
            className="score-badge score-badge-lg shrink-0 font-extrabold"
            style={{
              backgroundColor: scoreColor(category.weighted_average),
              color: scoreBadgeTextColor(category.weighted_average),
            }}
          >
            {category.weighted_average.toFixed(1)}
          </div>
          <div>
            <p className="text-[15px] font-bold text-foreground">
              {category.category_name}
            </p>
            <p className="text-caption mt-1">
              {category.items.length}개 항목 · {scoreLabel(category.weighted_average)}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 항목 목록 */}
      {open && (
        <div className="px-7 pb-6 pt-2 space-y-3">
          {category.items.map((item) => (
            <ItemScoreCard key={item.item_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemScoreCard({ item }: { item: ItemScore }) {
  return (
    <div className="inner-card">
      {/* 항목 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[12px] text-text-muted font-mono shrink-0">{item.item_id}</span>
          <span className="text-[14px] font-semibold text-foreground truncate">{item.item_name}</span>
          <span className="text-[12px] text-text-muted bg-surface rounded-md px-2 py-0.5 shrink-0">
            {weightLabel(item.weight)}
          </span>
        </div>
        <div
          className="score-badge score-badge-sm shrink-0 ml-4"
          style={{
            backgroundColor: scoreColor(item.score),
            color: scoreBadgeTextColor(item.score),
          }}
        >
          {item.score}
        </div>
      </div>

      {/* 추론 */}
      <p className="text-body leading-[1.7]">{item.reasoning}</p>

      {/* 근거 */}
      {item.evidence.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-label mb-2">
            근거
          </p>
          {item.evidence.map((e, i) => (
            <div
              key={i}
              className="evidence-card"
            >
              <p className="text-body leading-[1.7] italic">
                "{e}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({
  title,
  subtitle,
  items,
  color,
}: {
  title: string;
  subtitle: string;
  items?: string[];
  color: string;
}) {
  return (
    <div className="card card-padded">
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
      </div>
      <p className="text-caption mb-5">{subtitle}</p>
      {items && items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((s, i) => (
            <li key={i} className="text-body leading-[1.8]">
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-caption">아직 분석 결과가 없습니다</p>
      )}
    </div>
  );
}
