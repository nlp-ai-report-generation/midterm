import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllEvaluations } from "@/lib/data";
import { scoreColor, scoreBadgeTextColor, formatDateShort } from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";

type SortKey = "latest" | "highest" | "lowest";

export default function LecturesPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("latest");

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        setEvaluations(data.sort((a, b) => a.lecture_date.localeCompare(b.lecture_date)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayed = [...evaluations].sort((a, b) => {
    if (sortBy === "highest") return b.weighted_average - a.weighted_average;
    if (sortBy === "lowest") return a.weighted_average - b.weighted_average;
    return b.lecture_date.localeCompare(a.lecture_date);
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title">강의 목록</h1>
          <p className="text-caption mt-0.5">{evaluations.length}개 강의</p>
        </div>
        <div className="tab-bar" role="tablist">
          {(
            [
              { key: "latest", label: "최신순" },
              { key: "highest", label: "높은 점수" },
              { key: "lowest", label: "낮은 점수" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={sortBy === item.key}
              onClick={() => setSortBy(item.key)}
              className="tab-item"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-text-tertiary">강의 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {displayed.map((evaluation) => (
            <Link
              key={evaluation.lecture_date}
              to={`/lectures/${evaluation.lecture_date}`}
              className="card card-padded card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-caption">
                    {formatDateShort(evaluation.lecture_date)}
                  </p>
                  <p className="mt-1 text-base font-semibold text-foreground truncate">
                    {evaluation.metadata.subjects?.[0] ?? "강의"}
                  </p>
                </div>
                <span
                  className="score-badge score-badge-md rounded-full ml-3 shrink-0"
                  style={{
                    backgroundColor: scoreColor(evaluation.weighted_average),
                    color: scoreBadgeTextColor(evaluation.weighted_average),
                  }}
                >
                  {evaluation.weighted_average.toFixed(1)}
                </span>
              </div>
              <div className="space-y-1.5">
                {evaluation.strengths?.[0] && (
                  <p className="text-xs text-text-tertiary line-clamp-1">
                    <span className="text-success font-medium">+</span>{" "}
                    {evaluation.strengths[0]}
                  </p>
                )}
                {evaluation.improvements?.[0] && (
                  <p className="text-xs text-text-tertiary line-clamp-1">
                    <span className="text-warning font-medium">-</span>{" "}
                    {evaluation.improvements[0]}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
