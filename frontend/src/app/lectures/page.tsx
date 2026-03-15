import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllEvaluations } from "@/lib/data";
import { formatDateShort } from "@/lib/utils";
import ScoreBadge from "@/components/shared/ScoreBadge";
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
          <p className="text-caption" style={{ marginTop: 2 }}>{evaluations.length}개 강의</p>
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
        <div className="card" style={{ padding: "64px 0", textAlign: "center" }}>
          <p style={{ color: "var(--text-tertiary)" }}>강의 데이터가 없습니다.</p>
        </div>
      ) : (
        <div
          className="card-grid"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {displayed.map((evaluation) => (
            <Link
              key={evaluation.lecture_date}
              to={`/lectures/${evaluation.lecture_date}`}
              className="card card-padded card-hover transition-shadow"
            >
              <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
                <div className="flex-1 min-w-0">
                  <p className="text-caption">{formatDateShort(evaluation.lecture_date)}</p>
                  <p
                    className="truncate"
                    style={{
                      marginTop: 4,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {evaluation.metadata.subjects?.[0] ?? "강의"}
                  </p>
                </div>
                <ScoreBadge
                  score={evaluation.weighted_average}
                  size="sm"
                  className="ml-3 shrink-0"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {evaluation.strengths?.[0] && (
                  <p className="text-xs line-clamp-1" style={{ color: "var(--text-tertiary)" }}>
                    <span className="font-medium" style={{ color: "var(--primary)" }}>+</span>{" "}
                    {evaluation.strengths[0]}
                  </p>
                )}
                {evaluation.improvements?.[0] && (
                  <p className="text-xs line-clamp-1" style={{ color: "var(--text-tertiary)" }}>
                    <span className="font-medium" style={{ color: "var(--score-3)" }}>-</span>{" "}
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
