"use client";

import { useEffect, useState } from "react";
import KPICard from "@/components/cards/KPICard";
import ScoreTrend from "@/components/charts/ScoreTrend";
import CategoryHeatmap from "@/components/charts/CategoryHeatmap";
import LectureCard from "@/components/cards/LectureCard";
import { getAllEvaluations } from "@/lib/data";
import type { EvaluationResult } from "@/types/evaluation";

const CATEGORY_NAMES = [
  "언어 표현 품질",
  "강의 도입 및 구조",
  "개념 설명 명확성",
  "예시 및 실습 연계",
  "수강생 상호작용",
];

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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
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

  const trendData = evaluations.map((e) => ({
    date: e.lecture_date,
    score: e.weighted_average,
  }));

  const heatmapData = evaluations.map((e) => ({
    date: e.lecture_date,
    categories: e.category_averages,
  }));

  const topStrengths = evaluations
    .flatMap((e) => e.strengths)
    .reduce((acc, s) => {
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const sortedStrengths = Object.entries(topStrengths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topImprovements = evaluations
    .flatMap((e) => e.improvements)
    .reduce((acc, s) => {
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const sortedImprovements = Object.entries(topImprovements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="총 강의 수"
          value={totalLectures}
          subtitle="2026.02.02 ~ 02.27"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="2" width="14" height="16" rx="2" fill="currentColor" />
            </svg>
          }
        />
        <KPICard
          title="평균 점수"
          value={avgScore.toFixed(2)}
          subtitle="5점 만점 기준"
          accentColor="var(--primary)"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3L10 14.5 5.1 17l.9-5.3-4-3.9L7.5 7z" fill="currentColor" />
            </svg>
          }
        />
        <KPICard
          title="최고 점수"
          value={bestLecture ? bestLecture.weighted_average.toFixed(2) : "—"}
          subtitle={bestLecture ? `${bestLecture.lecture_date}` : ""}
          accentColor="var(--success)"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="currentColor" />
            </svg>
          }
        />
        <KPICard
          title="최저 점수"
          value={worstLecture ? worstLecture.weighted_average.toFixed(2) : "—"}
          subtitle={worstLecture ? `${worstLecture.lecture_date}` : ""}
          accentColor="var(--error)"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18l-3-6H1l5-4-2-6 6 4 6-4-2 6 5 4h-6z" fill="currentColor" />
            </svg>
          }
        />
      </div>

      {/* 트렌드 + 히트맵 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ScoreTrend data={trendData} />
        <CategoryHeatmap data={heatmapData} categoryNames={CATEGORY_NAMES} />
      </div>

      {/* 강점 / 개선점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
          <h3 className="text-base font-bold text-foreground mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-success mr-2" />
            주요 강점 (전체 강의)
          </h3>
          <ul className="space-y-3">
            {sortedStrengths.map(([text, count]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-success/10 text-success text-xs font-bold flex items-center justify-center mt-0.5">
                  {count}
                </span>
                <span className="text-sm text-text-secondary">{text}</span>
              </li>
            ))}
            {sortedStrengths.length === 0 && (
              <li className="text-sm text-text-tertiary">데이터를 불러오는 중...</li>
            )}
          </ul>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light">
          <h3 className="text-base font-bold text-foreground mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-error mr-2" />
            개선 필요 사항 (전체 강의)
          </h3>
          <ul className="space-y-3">
            {sortedImprovements.map(([text, count]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-error/10 text-error text-xs font-bold flex items-center justify-center mt-0.5">
                  {count}
                </span>
                <span className="text-sm text-text-secondary">{text}</span>
              </li>
            ))}
            {sortedImprovements.length === 0 && (
              <li className="text-sm text-text-tertiary">데이터를 불러오는 중...</li>
            )}
          </ul>
        </div>
      </div>

      {/* 강의 카드 그리드 */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">전체 강의</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((e) => (
            <LectureCard key={e.lecture_date} evaluation={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
