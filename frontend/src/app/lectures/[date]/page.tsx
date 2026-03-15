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
import { formatDate, scoreColor, scoreLabel, weightLabel } from "@/lib/utils";
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="rounded-2xl border border-[#E5E8EB] bg-white py-16 text-center">
          <p className="text-gray-500">평가 데이터를 불러올 수 없습니다.</p>
          <Link to="/lectures" className="mt-3 inline-block text-sm text-[#FF6B00] font-medium">
            목록으로 돌아가기
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
    category: name.length > 8 ? name.slice(3, 11) + "..." : name,
    fullName: name,
    score: value,
    fullMark: 5,
  }));

  return (
    <div className="space-y-8 p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/lectures"
            className="text-xs text-gray-400 hover:text-[#FF6B00] mb-2 inline-block"
          >
            &larr; 목록으로
          </Link>
          <h1 className="text-lg font-bold text-[#191F28]">
            {metadata.subjects?.[0] ?? "강의"}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(evaluation.lecture_date)}</span>
            {metadata.instructor && (
              <>
                <span className="text-gray-300">|</span>
                <span>{metadata.instructor}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-4xl font-bold"
            style={{ color: scoreColor(weighted_average) }}
          >
            {weighted_average.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{scoreLabel(weighted_average)}</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="rounded-2xl border border-[#E5E8EB] bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#191F28] mb-4">카테고리별 점수</h2>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#E5E8EB" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "#6B7684", fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: "#8B95A1", fontSize: 10 }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-[#E5E8EB] bg-white px-4 py-3 shadow-lg text-sm">
                      <p className="font-semibold text-[#191F28]">{d.fullName}</p>
                      <p
                        className="text-lg font-bold mt-0.5"
                        style={{ color: scoreColor(d.score) }}
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
                stroke="#FF6B00"
                fill="#FF6B00"
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#191F28]">카테고리별 상세 평가</h2>
        {category_results.map((cat) => (
          <CategorySection key={cat.category_name} category={cat} />
        ))}
      </div>

      {/* Strengths / Improvements / Recommendations */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="강점" items={strengths} color="#34C759" />
        <SummaryCard title="개선점" items={improvements} color="#FF9500" />
        <SummaryCard title="권장 사항" items={recommendations} color="#007AFF" />
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: CategoryResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#E5E8EB] bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F7F8FA] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: scoreColor(category.weighted_average) }}
          >
            {category.weighted_average.toFixed(1)}
          </span>
          <div>
            <p className="text-sm font-bold text-[#191F28]">{category.category_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {category.items.length}개 항목 | {scoreLabel(category.weighted_average)}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[#E5E8EB] p-5 space-y-4">
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
    <div className="rounded-xl border border-[#E5E8EB] bg-[#F7F8FA] p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{item.item_id}</span>
          <span className="text-sm font-semibold text-[#191F28]">{item.item_name}</span>
          <span className="text-xs text-gray-400">
            가중치: {weightLabel(item.weight)}
          </span>
        </div>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: scoreColor(item.score) }}
        >
          {item.score}
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{item.reasoning}</p>

      {item.evidence.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            근거
          </p>
          {item.evidence.map((e, i) => (
            <blockquote
              key={i}
              className="text-sm text-gray-600 bg-white rounded-lg px-4 py-3 border-l-3 border-[#FF6B00]/40 italic leading-relaxed"
            >
              &ldquo;{e}&rdquo;
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  items,
  color,
}: {
  title: string;
  items?: string[];
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E8EB] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color }}>
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {title}
      </h3>
      <ul className="space-y-2">
        {items?.map((s, i) => (
          <li
            key={i}
            className="text-sm text-gray-600 leading-relaxed flex items-start gap-2"
          >
            <span className="mt-1 shrink-0" style={{ color }}>
              &#8226;
            </span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
