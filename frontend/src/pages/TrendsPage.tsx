import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAllEvaluations } from "@/lib/data";
import {
  scoreColor,
  scoreBadgeTextColor,
  formatDateShort,
} from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";

const CATEGORY_NAMES = [
  "1. 언어 표현 품질",
  "2. 강의 도입 및 구조",
  "3. 개념 설명 명확성",
  "4. 예시 및 실습 연계",
  "5. 수강생 상호작용",
];

const CATEGORY_OPTIONS = ["전체 평균", ...CATEGORY_NAMES];

export default function TrendsPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체 평균");

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        setEvaluations(
          data.sort((a, b) => a.lecture_date.localeCompare(b.lecture_date))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    return evaluations.map((e) => ({
      date: e.lecture_date,
      subject: e.metadata?.subjects?.[0] ?? "강의",
      score:
        selectedCategory === "전체 평균"
          ? e.weighted_average
          : (e.category_averages[selectedCategory] ?? 0),
    }));
  }, [evaluations, selectedCategory]);

  // Compute trend arrows
  const trendRows = useMemo(() => {
    return chartData.map((row, i) => {
      let trend: "up" | "down" | "same" = "same";
      if (i > 0) {
        const prev = chartData[i - 1].score;
        if (row.score > prev + 0.05) trend = "up";
        else if (row.score < prev - 0.05) trend = "down";
      }
      return { ...row, trend };
    });
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="page-content"
      style={{ display: "flex", flexDirection: "column", gap: 36 }}
    >
      {/* Title */}
      <div>
        <h1 className="text-title">점수 추이</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          카테고리별 점수 변화를 시계열로 추적합니다
        </p>
      </div>

      {/* Category Selector */}
      <div className="card card-padded">
        <label className="text-label" style={{ marginBottom: 8, display: "block" }}>
          카테고리 선택
        </label>
        <div className="tab-bar">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              className={`tab-item ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "전체 평균"
                ? "전체 평균"
                : cat.replace(/^\d+\.\s*/, "")}
            </button>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>
          {selectedCategory === "전체 평균"
            ? "전체 가중 평균"
            : selectedCategory.replace(/^\d+\.\s*/, "")}
        </h2>
        <p className="text-caption" style={{ marginBottom: 24 }}>
          {evaluations.length}개 강의 기준
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 20, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
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
                border: "none",
                borderRadius: 12,
                fontSize: 13,
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)",
                padding: "12px 16px",
              }}
              labelFormatter={(l) => formatDateShort(l as string)}
              formatter={(value) => [Number(value).toFixed(2), "점수"]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: "var(--surface)",
                stroke: "var(--primary)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, fill: "var(--primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          상세 데이터
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  className="text-label"
                  style={{
                    textAlign: "left",
                    padding: "12px 8px",
                    position: "sticky",
                    top: 0,
                    background: "var(--surface)",
                  }}
                >
                  날짜
                </th>
                <th
                  className="text-label"
                  style={{
                    textAlign: "left",
                    padding: "12px 8px",
                    position: "sticky",
                    top: 0,
                    background: "var(--surface)",
                  }}
                >
                  과목
                </th>
                <th
                  className="text-label"
                  style={{
                    textAlign: "center",
                    padding: "12px 8px",
                    position: "sticky",
                    top: 0,
                    background: "var(--surface)",
                  }}
                >
                  점수
                </th>
                <th
                  className="text-label"
                  style={{
                    textAlign: "center",
                    padding: "12px 8px",
                    position: "sticky",
                    top: 0,
                    background: "var(--surface)",
                  }}
                >
                  추이
                </th>
              </tr>
            </thead>
            <tbody>
              {trendRows.map((row, idx) => (
                <tr
                  key={row.date}
                  style={{
                    background:
                      idx % 2 === 1 ? "var(--grey-50)" : "transparent",
                  }}
                >
                  <td
                    className="text-caption"
                    style={{
                      padding: "12px 8px",
                      whiteSpace: "nowrap",
                      fontFamily: "monospace",
                    }}
                  >
                    {formatDateShort(row.date)}
                  </td>
                  <td
                    className="text-body"
                    style={{
                      padding: "12px 8px",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.subject}
                  </td>
                  <td style={{ textAlign: "center", padding: "12px 8px" }}>
                    <span
                      className="score-badge score-badge-sm"
                      style={{
                        backgroundColor: scoreColor(row.score),
                        color: scoreBadgeTextColor(row.score),
                      }}
                    >
                      {row.score.toFixed(2)}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: "12px 8px",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {row.trend === "up" && (
                      <span style={{ color: "var(--score-4)" }}>&#8593;</span>
                    )}
                    {row.trend === "down" && (
                      <span style={{ color: "var(--score-2)" }}>&#8595;</span>
                    )}
                    {row.trend === "same" && (
                      <span style={{ color: "var(--text-muted)" }}>&#8212;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
