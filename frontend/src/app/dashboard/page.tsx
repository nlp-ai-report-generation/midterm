import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAllEvaluations } from "@/lib/data";
import { scoreColor, scoreBadgeTextColor, formatDateShort } from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";

const CATEGORY_NAMES = [
  "1. 언어 표현 품질",
  "2. 강의 도입 및 구조",
  "3. 개념 설명 명확성",
  "4. 예시 및 실습 연계",
  "5. 수강생 상호작용",
];

function formatCompactDate(date?: string) {
  return date ? date.slice(5).replace("-", ".") : "-";
}

export default function DashboardPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        setEvaluations(data.sort((a, b) => a.lecture_date.localeCompare(b.lecture_date)));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalLectures = evaluations.length;
  const avgScore =
    totalLectures > 0
      ? evaluations.reduce((sum, e) => sum + e.weighted_average, 0) / totalLectures
      : 0;
  const bestLecture = evaluations.reduce(
    (best, e) => (e.weighted_average > (best?.weighted_average ?? 0) ? e : best),
    evaluations[0]
  );
  const worstLecture = evaluations.reduce(
    (worst, e) => (e.weighted_average < (worst?.weighted_average ?? 5) ? e : worst),
    evaluations[0]
  );

  const analysisRange =
    totalLectures > 0
      ? `2026.${formatCompactDate(evaluations[0]?.lecture_date)} ~ ${formatCompactDate(evaluations[totalLectures - 1]?.lecture_date)}`
      : "-";

  const trendData = evaluations.map((e) => ({
    date: e.lecture_date,
    score: e.weighted_average,
  }));

  // Build heatmap: rows = categories, cols = dates
  const heatmapRows = CATEGORY_NAMES.map((catName) => {
    const scores = evaluations.map((e) => ({
      date: e.lecture_date,
      score: e.category_averages[catName] ?? 0,
    }));
    return { name: catName, scores };
  });

  const recentLectures = [...evaluations].reverse().slice(0, 6);

  return (
    <div className="page-content">
      {/* KPI Cards */}
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {[
          {
            label: "총 강의",
            value: totalLectures,
            subtitle: analysisRange,
          },
          {
            label: "평균 점수",
            value: avgScore.toFixed(2),
            subtitle: "5점 만점",
            accent: true,
          },
          {
            label: "최고",
            value: bestLecture ? bestLecture.weighted_average.toFixed(2) : "-",
            subtitle: bestLecture ? formatCompactDate(bestLecture.lecture_date) : "-",
          },
          {
            label: "최저",
            value: worstLecture ? worstLecture.weighted_average.toFixed(2) : "-",
            subtitle: worstLecture ? formatCompactDate(worstLecture.lecture_date) : "-",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="card card-padded"
          >
            <p className="text-label">
              {card.label}
            </p>
            <p
              className="text-number mt-3"
              style={{ color: card.accent ? "var(--primary)" : "var(--text-primary)" }}
            >
              {card.value}
            </p>
            <p className="text-caption mt-2">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Score Trend */}
      <div className="card card-padded">
        <h2 className="text-section mb-1">점수 추이</h2>
        <p className="text-caption mb-6">{totalLectures}개 강의 가중 평균</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[1, 5]}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-inner)",
                fontSize: 13,
              }}
              labelFormatter={(l) => formatDateShort(l as string)}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#scoreGrad)"
              dot={{ r: 3, fill: "var(--surface)", stroke: "var(--primary)", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "var(--primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Heatmap */}
      <div className="card card-padded">
        <h2 className="text-section mb-1">카테고리 히트맵</h2>
        <p className="text-caption mb-6">카테고리 × 강의 날짜별 점수</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="카테고리별 점수 히트맵">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 font-medium text-text-tertiary whitespace-nowrap">
                  카테고리
                </th>
                {evaluations.map((e) => (
                  <th
                    key={e.lecture_date}
                    className="px-1 py-2 font-medium text-text-muted text-center"
                  >
                    {formatDateShort(e.lecture_date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapRows.map((row) => (
                <tr key={row.name}>
                  <td className="py-1.5 pr-4 text-text-secondary whitespace-nowrap">
                    {row.name.replace(/^\d+\.\s*/, "")}
                  </td>
                  {row.scores.map((cell) => (
                    <td key={cell.date} className="px-1 py-1.5 text-center">
                      <span
                        className="inline-flex h-7 w-9 items-center justify-center rounded-lg text-[11px] font-bold"
                        style={{
                          backgroundColor: scoreColor(cell.score),
                          color: scoreBadgeTextColor(cell.score),
                        }}
                      >
                        {cell.score.toFixed(1)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Lectures */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-section">최근 평가 결과</h2>
          <Link
            to="/lectures"
            className="text-sm font-medium text-text-tertiary hover:text-primary"
          >
            전체 보기
          </Link>
        </div>
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {recentLectures.map((item) => (
            <Link
              key={item.lecture_date}
              to={`/lectures/${item.lecture_date}`}
              className="card card-padded card-hover transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-caption">
                    {formatDateShort(item.lecture_date)}
                  </p>
                  <p className="mt-1.5 text-[14px] font-semibold text-foreground">
                    {item.metadata.subjects?.[0] ?? "강의"}
                  </p>
                </div>
                <span
                  className="score-badge score-badge-sm"
                  style={{
                    backgroundColor: scoreColor(item.weighted_average),
                    color: scoreBadgeTextColor(item.weighted_average),
                  }}
                >
                  {item.weighted_average.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
