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
import { useRole } from "@/contexts/RoleContext";
import { getAllEvaluations } from "@/lib/data";
import { scoreColor, scoreBadgeTextColor, formatDateShort } from "@/lib/utils";
import InsightCard from "@/components/shared/InsightCard";
import ScoreBadge from "@/components/shared/ScoreBadge";
import FeedbackCard from "@/components/shared/FeedbackCard";
import type { EvaluationResult } from "@/types/evaluation";

const CATEGORY_NAMES = [
  "1. 언어 표현 품질",
  "2. 강의 도입 및 구조",
  "3. 개념 설명 명확성",
  "4. 예시 및 실습 연계",
  "5. 수강생 상호작용",
];

export default function DashboardPage() {
  const { isOperator } = useRole();
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

  if (isOperator) return <OperatorDashboard evaluations={evaluations} />;
  return <InstructorDashboard evaluations={evaluations} />;
}

/* ─── Operator Dashboard ─── */

function OperatorDashboard({ evaluations }: { evaluations: EvaluationResult[] }) {
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
      ? `${evaluations[0]?.lecture_date.slice(5).replace("-", ".")} ~ ${evaluations[totalLectures - 1]?.lecture_date.slice(5).replace("-", ".")}`
      : "-";

  const trendData = evaluations.map((e) => ({
    date: e.lecture_date,
    score: e.weighted_average,
  }));

  const heatmapRows = CATEGORY_NAMES.map((catName) => {
    const scores = evaluations.map((e) => ({
      date: e.lecture_date,
      score: e.category_averages[catName] ?? 0,
    }));
    return { name: catName, scores };
  });

  const sortedByScore = [...evaluations].sort((a, b) => a.weighted_average - b.weighted_average);
  const attentionLectures = sortedByScore.slice(0, 3);
  const otherLectures = sortedByScore.slice(3);

  return (
    <div className="page-content">
      {/* Page Header */}
      <div>
        <h1 className="text-title">강의 평가 현황</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          전체 강의의 품질 현황을 한눈에 볼 수 있어요
        </p>
      </div>

      {/* 핵심 지표 */}
      <div
        className="card-grid"
        style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}
      >
        <InsightCard label="분석 완료" value={totalLectures} subtitle={`${analysisRange} 기간의 강의를 분석했어요`} />
        <InsightCard label="전체 평균" value={avgScore.toFixed(2)} subtitle="5점 만점 기준이에요" accent />
      </div>

      {/* 카테고리별 평균 점수 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>카테고리별 평균</h2>
        <p className="text-caption" style={{ marginBottom: 24 }}>
          5개 영역별 전체 강의 평균이에요. 바가 긴 영역이 잘하고 있는 부분이에요
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {heatmapRows
            .map((row) => {
              const avg = row.scores.length > 0
                ? row.scores.reduce((s, c) => s + c.score, 0) / row.scores.length
                : 0;
              return { name: row.name.replace(/^\d+\.\s*/, ""), avg };
            })
            .sort((a, b) => b.avg - a.avg)
            .map((cat) => (
              <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    width: 120,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    flexShrink: 0,
                  }}
                >
                  {cat.name}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 28,
                    background: "var(--grey-100)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(cat.avg / 5) * 100}%`,
                      height: "100%",
                      background: "var(--primary)",
                      borderRadius: 8,
                      opacity: 0.3 + (cat.avg / 5) * 0.7,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 40,
                    textAlign: "right",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {cat.avg.toFixed(1)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* 최고 / 최저 + 점수 추이 */}
      <div
        className="card-grid"
        style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}
      >
        <InsightCard
          label="가장 높은 점수"
          value={bestLecture ? bestLecture.weighted_average.toFixed(2) : "-"}
          subtitle={bestLecture ? `${formatDateShort(bestLecture.lecture_date)} 강의가 가장 잘 나왔어요` : "-"}
        />
        <InsightCard
          label="개선 기회"
          value={worstLecture ? worstLecture.weighted_average.toFixed(2) : "-"}
          subtitle={worstLecture ? `${formatDateShort(worstLecture.lecture_date)} 강의를 더 살펴보면 좋아요` : "-"}
        />
      </div>

      {/* Score Trend */}
      <ScoreTrendChart data={trendData} count={evaluations.length} />

      {/* Attention-needed Lectures */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 className="text-section">더 살펴볼 강의</h2>
          <Link
            to="/lectures"
            className="text-sm font-medium hover:text-primary"
            style={{ color: "var(--text-tertiary)" }}
          >
            전체 보기
          </Link>
        </div>
        <div
          className="card-grid"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {attentionLectures.map((item) => (
            <LectureCard key={item.lecture_date} evaluation={item} />
          ))}
        </div>
      </div>

      {/* Other Lectures */}
      {otherLectures.length > 0 && (
        <div>
          <h2 className="text-section" style={{ marginBottom: 20 }}>기타 강의</h2>
          <div
            className="card-grid"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {otherLectures.map((item) => (
              <LectureCard key={item.lecture_date} evaluation={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Instructor Dashboard ─── */

function InstructorDashboard({ evaluations }: { evaluations: EvaluationResult[] }) {
  const { instructorName } = useRole();

  // Filter evaluations by instructor name
  const filtered = instructorName
    ? evaluations.filter(
        (e) =>
          e.metadata?.instructor === instructorName ||
          e.metadata?.sub_instructors?.includes(instructorName)
      )
    : evaluations;

  const totalLectures = filtered.length;
  const avgScore =
    totalLectures > 0
      ? filtered.reduce((sum, e) => sum + e.weighted_average, 0) / totalLectures
      : 0;
  const bestLecture = filtered.reduce(
    (best, e) => (e.weighted_average > (best?.weighted_average ?? 0) ? e : best),
    filtered[0]
  );
  const worstLecture = filtered.reduce(
    (worst, e) => (e.weighted_average < (worst?.weighted_average ?? 5) ? e : worst),
    filtered[0]
  );

  const trendData = filtered.map((e) => ({
    date: e.lecture_date,
    score: e.weighted_average,
  }));

  // Aggregate top strengths and improvements across all lectures
  const strengthCounts = new Map<string, number>();
  const improvementCounts = new Map<string, number>();
  for (const e of filtered) {
    for (const s of e.strengths ?? []) {
      strengthCounts.set(s, (strengthCounts.get(s) ?? 0) + 1);
    }
    for (const imp of e.improvements ?? []) {
      improvementCounts.set(imp, (improvementCounts.get(imp) ?? 0) + 1);
    }
  }
  const topStrengths = [...strengthCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);
  const topImprovements = [...improvementCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  // Recent lectures (latest 6)
  const recentLectures = [...filtered]
    .sort((a, b) => b.lecture_date.localeCompare(a.lecture_date))
    .slice(0, 6);

  const displayTitle = instructorName ? `${instructorName}님의 강의` : "내 강의 돌아보기";

  return (
    <div className="page-content">
      {/* Page Header */}
      <div>
        <h1 className="text-title">{displayTitle}</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          수업을 돌아보고 다음 강의를 준비해보세요
        </p>
      </div>

      {/* KPI Cards */}
      <div
        className="card-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <InsightCard label="총 강의" value={totalLectures} subtitle="내가 진행한 강의예요" />
        <InsightCard label="내 평균" value={avgScore.toFixed(2)} subtitle="5점 만점 기준이에요" accent />
        <InsightCard
          label="가장 잘한 강의"
          value={bestLecture ? bestLecture.weighted_average.toFixed(2) : "-"}
          subtitle={bestLecture ? (bestLecture.metadata.subjects?.[0] ?? formatDateShort(bestLecture.lecture_date)) : "-"}
        />
        <InsightCard
          label="개선 기회"
          value={worstLecture ? worstLecture.weighted_average.toFixed(2) : "-"}
          subtitle={worstLecture ? (worstLecture.metadata.subjects?.[0] ?? formatDateShort(worstLecture.lecture_date)) : "-"}
        />
      </div>

      {/* Score Trend */}
      <ScoreTrendChart data={trendData} count={filtered.length} />

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FeedbackCard
          title="이런 점이 좋았어요"
          subtitle="여러 강의에서 반복적으로 나타난 강점이에요"
          items={topStrengths}
          color="var(--primary)"
        />
        <FeedbackCard
          title="이런 점을 바꿔보면 좋겠어요"
          subtitle="조금만 바꿔도 큰 차이를 만들 수 있어요"
          items={topImprovements}
          color="var(--score-3)"
        />
      </div>

      {/* Recent Lectures */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 className="text-section">최근 강의</h2>
          <Link
            to="/lectures"
            className="text-sm font-medium hover:text-primary"
            style={{ color: "var(--text-tertiary)" }}
          >
            전체 보기
          </Link>
        </div>
        <div
          className="card-grid"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {recentLectures.map((item) => (
            <LectureCard key={item.lecture_date} evaluation={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */

function ScoreTrendChart({ data, count }: { data: { date: string; score: number }[]; count: number }) {
  return (
    <div className="card card-padded">
      <h2 className="text-section" style={{ marginBottom: 4 }}>점수 추이</h2>
      <p className="text-caption" style={{ marginBottom: 24 }}>{count}개 강의 가중 평균</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
  );
}

function LectureCard({ evaluation }: { evaluation: EvaluationResult }) {
  return (
    <Link
      to={`/lectures/${evaluation.lecture_date}`}
      className="card card-padded card-hover transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-caption">{formatDateShort(evaluation.lecture_date)}</p>
          <p
            className="truncate"
            style={{
              marginTop: 6,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {evaluation.metadata.subjects?.[0] ?? "강의"}
          </p>
        </div>
        <ScoreBadge score={evaluation.weighted_average} size="sm" className="ml-3 shrink-0" />
      </div>
    </Link>
  );
}
