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
      {/* Header — 모바일에서는 세로 배치 */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="text-title">강의 목록</h1>
          <p className="text-caption" style={{ marginTop: 2 }}>
            {evaluations.length}개 강의를 평가했어요
          </p>
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
              className={`tab-item ${sortBy === item.key ? "active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      {displayed.length === 0 ? (
        <div className="card card-padded" style={{ textAlign: "center", padding: "64px 32px" }}>
          <p className="text-body">아직 평가된 강의가 없어요</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Desktop Table Header — 모바일에서 숨김 */}
          <div className="lecture-list-header">
            <span className="text-label">날짜</span>
            <span className="text-label">과목</span>
            <span className="text-label lecture-list-instructor">강사</span>
            <span className="text-label" style={{ textAlign: "right" }}>점수</span>
          </div>

          {/* Rows */}
          {displayed.map((evaluation) => (
            <Link
              key={evaluation.lecture_date}
              to={`/lectures/${evaluation.lecture_date}`}
              className="lecture-list-row"
            >
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 14,
                  color: "var(--text-tertiary)",
                  fontWeight: 500,
                }}
              >
                {formatDateShort(evaluation.lecture_date)}
              </span>

              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: 12,
                }}
              >
                {evaluation.metadata.subjects?.[0] ?? "강의"}
              </span>

              <span
                className="text-body lecture-list-instructor"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {evaluation.metadata.instructor ?? "-"}
              </span>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <ScoreBadge score={evaluation.weighted_average} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
