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
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
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

  const analysisRange =
    totalLectures > 0
      ? `${formatCompactDate(evaluations[0]?.lecture_date)} - ${formatCompactDate(evaluations[totalLectures - 1]?.lecture_date)}`
      : "-";
  const recentLectures = [...evaluations].reverse().slice(0, 6);

  return (
    <div className="page-section">
      <motion.section {...fadeUp} className="page-hero surface-card-strong">
        <div className="page-hero-grid">
          {totalLectures > 0 ? (
            <>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="chip border-transparent bg-primary-soft text-primary">
                    실제 분석 결과
                  </span>
                  <span className="chip">{analysisRange}</span>
                </div>
                <p className="section-eyebrow mt-5">AI Lecture Review</p>
                <h1 className="page-hero-title mt-3">
                  점수보다 먼저 흐름을 읽는 강의 운영 대시보드
                </h1>
                <p className="page-hero-copy">
                  실제 강의 스크립트와 품질 체크리스트를 기준으로 생성된 결과만 모았습니다.
                  평균 점수보다 더 중요한 건 어디에서 흔들리고, 무엇이 반복적으로 개선 포인트로 잡히는지입니다.
                </p>

                <div className="page-stat-grid">
                  <div className="page-stat">
                    <p className="page-stat-label">전체 강의</p>
                    <p className="page-stat-value">{totalLectures}</p>
                    <p className="page-stat-copy">동일 체크리스트 기준으로 집계</p>
                  </div>
                  <div className="page-stat">
                    <p className="page-stat-label">평균 점수</p>
                    <p className="page-stat-value">{avgScore.toFixed(2)}</p>
                    <p className="page-stat-copy">5점 만점 가중 평균</p>
                  </div>
                  <div className="page-stat">
                    <p className="page-stat-label">핵심 취약점</p>
                    <p className="page-stat-value text-[22px]">
                      {sortedImprovements[0]?.[1] ?? 0}회
                    </p>
                    <p className="page-stat-copy">{sortedImprovements[0]?.[0] ?? "집계 중"}</p>
                  </div>
                </div>
              </div>

              <div className="panel-card p-6">
                <div className="panel-heading">
                  <div>
                    <h2 className="panel-title">운영 요약</h2>
                    <p className="panel-copy">지금 화면에서 먼저 봐야 할 값만 추렸습니다.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[22px] bg-[var(--surface-subtle)] px-5 py-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      최고 점수
                    </p>
                    <p className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-foreground">
                      {bestLecture?.weighted_average.toFixed(1) ?? "-"}
                    </p>
                    <p className="mt-1 text-[13px] text-text-secondary">
                      {bestLecture?.lecture_date ?? "데이터 없음"}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-[var(--surface-subtle)] px-5 py-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      최저 점수
                    </p>
                    <p className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-foreground">
                      {worstLecture?.weighted_average.toFixed(1) ?? "-"}
                    </p>
                    <p className="mt-1 text-[13px] text-text-secondary">
                      {worstLecture?.lecture_date ?? "데이터 없음"}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-[rgba(49,130,246,0.1)] bg-[linear-gradient(180deg,rgba(239,246,255,0.86),#ffffff)] px-5 py-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">
                      반복 강점
                    </p>
                    <p className="mt-2 text-[18px] font-bold tracking-[-0.04em] text-foreground">
                      {sortedStrengths[0]?.[0] ?? "집계 중"}
                    </p>
                    <p className="mt-1 text-[13px] text-text-secondary">
                      전체 강의에서 {sortedStrengths[0]?.[1] ?? 0}회 관찰
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="section-eyebrow">AI Lecture Review</p>
                <h1 className="page-hero-title mt-3">강의 분석을 시작할 준비만 남았습니다.</h1>
                <p className="page-hero-copy">
                  API 키를 연결하고 실제 강의 평가를 실행하면, 샘플이 아니라 분석 결과 중심의 대시보드가 채워집니다.
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  { step: "1", label: "API 키 연결", href: "/settings" },
                  { step: "2", label: "평가 실행", href: "/settings" },
                  { step: "3", label: "결과 확인", href: "/dashboard" },
                ].map((s) => (
                  <Link
                    key={s.step}
                    to={s.href}
                    className="panel-card p-5 text-text-secondary hover:-translate-y-0.5 hover:text-foreground"
                  >
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary">
                      {s.step}
                    </div>
                    <span className="text-[16px] font-semibold">{s.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <motion.div {...stagger(0)}>
          <KPICard
            title="총 강의 수"
            value={totalLectures}
            subtitle={analysisRange}
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
            subtitle={bestLecture ? bestLecture.lecture_date : ""}
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
            subtitle={worstLecture ? worstLecture.lecture_date : ""}
            accentColor="var(--warning)"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18l-3-6H1l5-4-2-6 6 4 6-4-2 6 5 4h-6z" fill="currentColor" />
              </svg>
            }
          />
        </motion.div>
      </div>

      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Overview</p>
          <h2 className="section-heading-title">점수 흐름과 취약 카테고리</h2>
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

      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Insights</p>
          <h2 className="section-heading-title">반복적으로 보이는 강점과 개선 포인트</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div {...stagger(6)} className="panel-card">
          <div className="panel-heading">
            <div>
              <h3 className="panel-title">주요 강점</h3>
              <p className="panel-copy">강의 전반에서 반복적으로 포착된 장점입니다.</p>
            </div>
          </div>
          <ul className="list-stack">
            {sortedStrengths.map(([text, count]) => (
              <li key={text} className="list-row">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[12px] font-bold text-success">
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

        <motion.div {...stagger(7)} className="panel-card">
          <div className="panel-heading">
            <div>
              <h3 className="panel-title">개선 필요 사항</h3>
              <p className="panel-copy">자주 반복된 약점부터 우선순위를 잡을 수 있습니다.</p>
            </div>
          </div>
          <ul className="list-stack">
            {sortedImprovements.map(([text, count]) => (
              <li key={text} className="list-row">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--warning)_12%,white)] text-[12px] font-bold text-warning">
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

      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Lectures</p>
          <h2 className="section-heading-title">최근 평가 결과</h2>
        </div>
        <Link to="/lectures" className="soft-button hidden sm:inline-flex">
          전체 강의 보기
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {recentLectures.map((e, i) => (
          <motion.div key={e.lecture_date} {...stagger(i)}>
            <LectureCard evaluation={e} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
