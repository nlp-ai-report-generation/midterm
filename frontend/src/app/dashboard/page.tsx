import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={`${import.meta.env.BASE_URL}emoji/books.png`} alt="" width={36} height={36} style={{ objectFit: "contain" }} />
        <div>
          <h1 className="text-title">강의 평가 현황</h1>
          <p className="text-caption" style={{ marginTop: 4 }}>
            전체 강의의 품질 현황을 한눈에 볼 수 있어요
          </p>
        </div>
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
        <h2 className="text-section" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <img src={`${import.meta.env.BASE_URL}emoji/sparkles.png`} alt="" width={22} height={22} style={{ objectFit: "contain" }} />
          카테고리별 평균
        </h2>
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
      <ScoreTrendChart data={trendData} count={evaluations.length} evaluations={evaluations} />

      {/* 강의 목록 바로가기 */}
      <Link
        to="/lectures"
        className="card card-padded card-hover"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textDecoration: "none",
        }}
      >
        <div>
          <h2 className="text-section">강의 목록 보기</h2>
          <p className="text-caption" style={{ marginTop: 4 }}>
            {totalLectures}개 강의의 상세 평가를 확인할 수 있어요
          </p>
        </div>
        <span style={{ fontSize: 20, color: "var(--text-muted)" }}>&rarr;</span>
      </Link>
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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={`${import.meta.env.BASE_URL}emoji/books.png`} alt="" width={36} height={36} style={{ objectFit: "contain" }} />
        <div>
          <h1 className="text-title">{displayTitle}</h1>
          <p className="text-caption" style={{ marginTop: 4 }}>
            수업을 돌아보고 다음 강의를 준비해보세요
          </p>
        </div>
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

      {/* 캘린더 뷰 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>강의 캘린더</h2>
        <p className="text-caption" style={{ marginBottom: 20 }}>
          강의가 있었던 날에 점수가 표시돼요
        </p>
        <LectureCalendar evaluations={filtered} />
      </div>

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

      {/* 강의 목록 바로가기 */}
      <Link
        to="/lectures"
        className="card card-padded card-hover"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textDecoration: "none",
        }}
      >
        <div>
          <h2 className="text-section">내 강의 목록 보기</h2>
          <p className="text-caption" style={{ marginTop: 4 }}>
            {totalLectures}개 강의의 상세 평가를 확인할 수 있어요
          </p>
        </div>
        <span style={{ fontSize: 20, color: "var(--text-muted)" }}>&rarr;</span>
      </Link>
    </div>
  );
}

/* ─── Shared Components ─── */

function ScoreTrendChart({ data, count, evaluations }: { data: { date: string; score: number }[]; count: number; evaluations?: EvaluationResult[] }) {
  const [trendTab, setTrendTab] = useState("전체");
  const categoryNames = evaluations?.[0]?.category_results?.map((c) => c.category_name) ?? [];
  const tabs = ["전체", ...categoryNames];

  const chartData = trendTab === "전체" ? data : (evaluations ?? []).map((e) => {
    const cat = e.category_results?.find((c) => c.category_name === trendTab);
    return { date: e.lecture_date, score: cat?.weighted_average ?? 0 };
  });

  return (
    <div className="card card-padded">
      <h2 className="text-section" style={{ marginBottom: 4 }}>점수 추이</h2>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTrendTab(t)} className={`tab-item${trendTab === t ? " active" : ""}`} style={{ padding: "2px 8px", fontSize: 11 }}>
            {t}
          </button>
        ))}
      </div>
      <p className="text-caption" style={{ marginBottom: 12 }}>{count}개 강의 · {trendTab}</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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

function LectureCalendar({ evaluations }: { evaluations: EvaluationResult[] }) {
  const navigate = useNavigate();
  const scoreMap = new Map<number, EvaluationResult>();
  for (const e of evaluations) {
    const day = parseInt(e.lecture_date.split("-")[2], 10);
    scoreMap.set(day, e);
  }

  const daysInMonth = 28;
  const startDayOfWeek = 0; // 2026-02-01 = 일요일
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === 2026 && today.getMonth() === 1;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  return (
    <div style={{ overflow: "hidden" }}>
      {/* Month title — 왼쪽 정렬, Apple 스타일 굵은 제목 */}
      <div style={{ marginBottom: 16 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          2026년 2월
        </span>
      </div>

      {/* Weekday row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: "1px solid var(--grey-200)",
          paddingBottom: 8,
          marginBottom: 0,
        }}
      >
        {weekdays.map((wd, i) => (
          <div
            key={wd}
            style={{
              textAlign: "right",
              paddingRight: 8,
              fontSize: 11,
              fontWeight: 500,
              color: i === 0 ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wIdx) => (
        <div
          key={wIdx}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: wIdx < weeks.length - 1 ? "1px solid var(--grey-100)" : "none",
          }}
        >
          {week.map((day, dIdx) => {
            const ev = day ? scoreMap.get(day) : null;
            const isToday = day === todayDate;
            const isSunday = dIdx === 0;

            return (
              <div
                key={dIdx}
                onClick={() => {
                  if (ev) navigate(`/lectures/${ev.lecture_date}`);
                }}
                style={{
                  minHeight: 80,
                  padding: "6px 8px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 6,
                  cursor: ev ? "pointer" : "default",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (ev) e.currentTarget.style.background = "var(--grey-50)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {day != null && (
                  <>
                    {/* Date — 오른쪽 상단, 오늘이면 오렌지 원 */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        fontSize: 13,
                        fontWeight: isToday ? 700 : 400,
                        color: isToday
                          ? "#FFFFFF"
                          : isSunday
                          ? "var(--primary)"
                          : "var(--text-secondary)",
                        background: isToday ? "var(--primary)" : "transparent",
                        lineHeight: 1,
                      }}
                    >
                      {day}
                    </span>

                    {/* Event bar — Apple Calendar 이벤트 바 스타일 */}
                    {ev && (
                      <div
                        style={{
                          width: "100%",
                          padding: "3px 6px",
                          borderRadius: 4,
                          background: "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#FFFFFF",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {ev.metadata.subjects?.[0]?.slice(0, 8) ?? "강의"}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.85)",
                            flexShrink: 0,
                          }}
                        >
                          {ev.weighted_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
