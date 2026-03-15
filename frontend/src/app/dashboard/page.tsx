import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import KPICard from "@/components/cards/KPICard";
import ScoreTrend from "@/components/charts/ScoreTrend";
import CategoryHeatmap from "@/components/charts/CategoryHeatmap";
import LectureCard from "@/components/cards/LectureCard";
import { getAllEvaluations } from "@/lib/data";
import type { EvaluationResult } from "@/types/evaluation";

const CATEGORY_NAMES = [
  "1. 언어 표현 품질",
  "2. 강의 도입 및 구조",
  "3. 개념 설명 명확성",
  "4. 예시 및 실습 연계",
  "5. 수강생 상호작용",
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function stagger(i: number) {
  return { ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.08 } };
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
    <div className="page-section">
      <motion.div
        {...fadeUp}
        className="surface-card-strong relative overflow-hidden rounded-[32px] p-7 sm:p-8"
      >
        <div className="absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_top,rgba(49,130,246,0.18),transparent_62%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {totalLectures > 0 ? (
            <>
              <div className="space-y-5">
                <div className="chip w-fit border-transparent bg-primary-soft text-primary">
                  실제 분석 결과 반영
                </div>
                <div>
                  <p className="section-eyebrow">AI 강의 분석 리포트</p>
                  <h1 className="section-title mt-2">
                    {totalLectures}개 강의를 같은 기준으로 다시 읽었습니다.
                  </h1>
                  <p className="section-body mt-3 max-w-2xl">
                    샘플 문구가 아니라 실제 강의 스크립트와 품질 체크리스트를 기준으로 생성된 결과입니다.
                    대시보드는 강의별 점수 흐름, 취약 카테고리, 반복되는 개선 포인트를 한 화면에서 보여줍니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <span className="chip">평균 {avgScore.toFixed(2)}점</span>
                  <span className="chip">
                    최고 {bestLecture?.lecture_date} / {bestLecture?.weighted_average.toFixed(1)}
                  </span>
                  <span className="chip">
                    최저 {worstLecture?.lecture_date} / {worstLecture?.weighted_average.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="rounded-[28px] border border-[rgba(49,130,246,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.9))] p-6">
                <p className="text-[13px] font-semibold text-text-tertiary">현재 상태</p>
                <div className="mt-4 space-y-4">
                  {[
                    ["총 평가 강의", `${totalLectures}개`],
                    ["분석 기간", "2026.02.02 - 2026.02.27"],
                    ["주요 취약 구간", sortedImprovements[0]?.[0] ?? "집계 중"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <span className="text-[13px] text-text-tertiary">{label}</span>
                      <span className="max-w-[180px] text-right text-[15px] font-semibold text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="section-eyebrow">AI 강의 분석 리포트</p>
                <h1 className="section-title mt-2">강의 분석을 시작해보세요</h1>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
                {[
                  { step: "1", label: "API 키 입력", href: "/settings" },
                  { step: "2", label: "강의 선택 & 평가 실행", href: "/settings" },
                  { step: "3", label: "결과 확인", href: "/dashboard" },
                ].map((s) => (
                  <Link
                    key={s.step}
                    to={s.href}
                    className="surface-card rounded-[24px] px-5 py-4 text-text-secondary hover:-translate-y-0.5 hover:text-foreground"
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary">
                      {s.step}
                    </div>
                    <span className="text-[15px] font-semibold">{s.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <motion.div {...stagger(0)}>
          <KPICard
            title="총 강의 수"
            value={totalLectures}
            subtitle="2026.02.02 - 02.27"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="2" fill="currentColor" />
              </svg>
            }
          />
        </motion.div>
        <motion.div {...stagger(1)}>
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
        </motion.div>
        <motion.div {...stagger(2)}>
          <KPICard
            title="최고 점수"
            value={bestLecture ? bestLecture.weighted_average.toFixed(2) : "\u2014"}
            subtitle={bestLecture ? `${bestLecture.lecture_date}` : ""}
            accentColor="var(--success)"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="currentColor" />
              </svg>
            }
          />
        </motion.div>
        <motion.div {...stagger(3)}>
          <KPICard
            title="최저 점수"
            value={worstLecture ? worstLecture.weighted_average.toFixed(2) : "\u2014"}
            subtitle={worstLecture ? `${worstLecture.lecture_date}` : ""}
            accentColor="var(--warning)"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18l-3-6H1l5-4-2-6 6 4 6-4-2 6 5 4h-6z" fill="currentColor" />
              </svg>
            }
          />
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-eyebrow">Overview</p>
          <h2 className="mt-1 text-[22px] font-bold text-foreground">점수 흐름과 취약 카테고리</h2>
        </div>
        <span className="chip hidden sm:inline-flex">{totalLectures}개 강의 기준</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div {...stagger(4)}>
          <ScoreTrend data={trendData} />
        </motion.div>
        <motion.div {...stagger(5)}>
          <CategoryHeatmap data={heatmapData} categoryNames={CATEGORY_NAMES} />
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-eyebrow">Insights</p>
          <h2 className="mt-1 text-[22px] font-bold text-foreground">반복적으로 보이는 강점과 개선 포인트</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div {...stagger(6)} className="surface-card-strong rounded-[28px] p-7">
          <h3 className="mb-5 text-[20px] font-bold text-foreground">
            <span className="relative top-[-1px] mr-2.5 inline-block h-2.5 w-2.5 rounded-full bg-success" />
            주요 강점 (전체 강의)
          </h3>
          <ul className="space-y-3.5">
            {sortedStrengths.map(([text, count]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[12px] font-bold text-success">
                  {count}
                </span>
                <span className="text-[15px] leading-6 text-text-secondary">{text}</span>
              </li>
            ))}
            {sortedStrengths.length === 0 && (
              <li className="text-[15px] text-text-tertiary">데이터를 불러오는 중...</li>
            )}
          </ul>
        </motion.div>

        <motion.div {...stagger(7)} className="surface-card-strong rounded-[28px] p-7">
          <h3 className="mb-5 text-[20px] font-bold text-foreground">
            <span className="relative top-[-1px] mr-2.5 inline-block h-2.5 w-2.5 rounded-full bg-warning" />
            개선 필요 사항 (전체 강의)
          </h3>
          <ul className="space-y-3.5">
            {sortedImprovements.map(([text, count]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--warning)_12%,white)] text-[12px] font-bold text-warning">
                  {count}
                </span>
                <span className="text-[15px] leading-6 text-text-secondary">{text}</span>
              </li>
            ))}
            {sortedImprovements.length === 0 && (
              <li className="text-[15px] text-text-tertiary">데이터를 불러오는 중...</li>
            )}
          </ul>
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-eyebrow">Lectures</p>
          <h2 className="mt-1 text-[22px] font-bold text-foreground">전체 강의 결과</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {evaluations.map((e, i) => (
          <motion.div key={e.lecture_date} {...stagger(i)}>
            <LectureCard evaluation={e} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
