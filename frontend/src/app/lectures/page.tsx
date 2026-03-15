import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllEvaluations } from "@/lib/data";
import { scoreColor, formatDateShort } from "@/lib/utils";
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#191F28]">강의 목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">{evaluations.length}개 강의</p>
        </div>
        <div className="flex rounded-xl border border-[#E5E8EB] bg-white overflow-hidden">
          {(
            [
              { key: "latest", label: "최신순" },
              { key: "highest", label: "높은 점수" },
              { key: "lowest", label: "낮은 점수" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setSortBy(item.key)}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                sortBy === item.key
                  ? "bg-[#FF6B00] text-white"
                  : "text-gray-500 hover:text-[#191F28]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E8EB] bg-white py-16 text-center">
          <p className="text-gray-500">강의 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((evaluation) => (
            <Link
              key={evaluation.lecture_date}
              to={`/lectures/${evaluation.lecture_date}`}
              className="rounded-2xl border border-[#E5E8EB] bg-white p-5 shadow-sm hover:border-[#FF6B00]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">
                    {formatDateShort(evaluation.lecture_date)}
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#191F28] truncate">
                    {evaluation.metadata.subjects?.[0] ?? "강의"}
                  </p>
                </div>
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white ml-3 shrink-0"
                  style={{ backgroundColor: scoreColor(evaluation.weighted_average) }}
                >
                  {evaluation.weighted_average.toFixed(1)}
                </span>
              </div>
              <div className="space-y-1.5">
                {evaluation.strengths?.[0] && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    <span className="text-green-600 font-medium">+</span>{" "}
                    {evaluation.strengths[0]}
                  </p>
                )}
                {evaluation.improvements?.[0] && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    <span className="text-amber-500 font-medium">-</span>{" "}
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
