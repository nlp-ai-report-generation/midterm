import { useState, useEffect, useMemo } from "react";
import { getAllEvaluations } from "@/lib/data";
import {
  scoreColor,
  scoreBadgeTextColor,
  formatDateShort,
  scoreLabel,
} from "@/lib/utils";
import ScoreBadge from "@/components/shared/ScoreBadge";
import type { EvaluationResult } from "@/types/evaluation";

const CATEGORY_NAMES = [
  "1. 언어 표현 품질",
  "2. 강의 도입 및 구조",
  "3. 개념 설명 명확성",
  "4. 예시 및 실습 연계",
  "5. 수강생 상호작용",
];

export default function ComparePage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        const sorted = data.sort((a, b) =>
          a.lecture_date.localeCompare(b.lecture_date)
        );
        setEvaluations(sorted);
        if (sorted.length >= 2) {
          setDateA(sorted[0].lecture_date);
          setDateB(sorted[sorted.length - 1].lecture_date);
        } else if (sorted.length === 1) {
          setDateA(sorted[0].lecture_date);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const evalA = useMemo(
    () => evaluations.find((e) => e.lecture_date === dateA) ?? null,
    [evaluations, dateA]
  );
  const evalB = useMemo(
    () => evaluations.find((e) => e.lecture_date === dateB) ?? null,
    [evaluations, dateB]
  );

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
        <h1 className="text-title">강의 비교</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          두 강의의 평가 결과를 나란히 비교합니다
        </p>
      </div>

      {/* Date Selectors */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div className="card card-padded">
          <label className="text-label" style={{ marginBottom: 8, display: "block" }}>
            강의 A
          </label>
          <select
            value={dateA}
            onChange={(e) => setDateA(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-inner)",
              background: "var(--grey-50)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">선택</option>
            {evaluations.map((e) => (
              <option key={e.lecture_date} value={e.lecture_date}>
                {formatDateShort(e.lecture_date)} —{" "}
                {e.metadata?.subjects?.[0] ?? "강의"}
              </option>
            ))}
          </select>
        </div>
        <div className="card card-padded">
          <label className="text-label" style={{ marginBottom: 8, display: "block" }}>
            강의 B
          </label>
          <select
            value={dateB}
            onChange={(e) => setDateB(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-inner)",
              background: "var(--grey-50)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">선택</option>
            {evaluations.map((e) => (
              <option key={e.lecture_date} value={e.lecture_date}>
                {formatDateShort(e.lecture_date)} —{" "}
                {e.metadata?.subjects?.[0] ?? "강의"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-side comparison */}
      {evalA && evalB && (
        <>
          {/* Overall Score */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div
              className="card card-padded"
              style={{ textAlign: "center" }}
            >
              <p className="text-caption" style={{ marginBottom: 8 }}>
                {formatDateShort(evalA.lecture_date)} ·{" "}
                {evalA.metadata?.subjects?.[0] ?? "강의"}
              </p>
              <ScoreBadge score={evalA.weighted_average} size="lg" />
              <p className="text-body" style={{ marginTop: 8 }}>
                {scoreLabel(evalA.weighted_average)}
              </p>
            </div>
            <div
              className="card card-padded"
              style={{ textAlign: "center" }}
            >
              <p className="text-caption" style={{ marginBottom: 8 }}>
                {formatDateShort(evalB.lecture_date)} ·{" "}
                {evalB.metadata?.subjects?.[0] ?? "강의"}
              </p>
              <ScoreBadge score={evalB.weighted_average} size="lg" />
              <p className="text-body" style={{ marginTop: 8 }}>
                {scoreLabel(evalB.weighted_average)}
              </p>
            </div>
          </div>

          {/* Category Comparison */}
          <div className="card card-padded">
            <h2 className="text-section" style={{ marginBottom: 20 }}>
              카테고리별 비교
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {CATEGORY_NAMES.map((cat) => {
                const scoreA = evalA.category_averages[cat] ?? 0;
                const scoreB = evalB.category_averages[cat] ?? 0;
                const diff = scoreB - scoreA;
                const aHigher = scoreA > scoreB;
                const bHigher = scoreB > scoreA;

                return (
                  <div key={cat} className="inner-card">
                    <p
                      className="text-label"
                      style={{ marginBottom: 12 }}
                    >
                      {cat.replace(/^\d+\.\s*/, "")}
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {/* Score A */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          className="score-badge score-badge-sm"
                          style={{
                            backgroundColor: scoreColor(scoreA),
                            color: scoreBadgeTextColor(scoreA),
                            opacity: aHigher ? 1 : 0.6,
                            fontWeight: aHigher ? 800 : 600,
                          }}
                        >
                          {scoreA.toFixed(1)}
                        </span>
                        {aHigher && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--primary)",
                            }}
                          >
                            HIGH
                          </span>
                        )}
                      </div>

                      {/* Diff indicator */}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color:
                            diff > 0
                              ? "var(--score-4)"
                              : diff < 0
                                ? "var(--score-2)"
                                : "var(--text-muted)",
                          minWidth: 48,
                          textAlign: "center",
                        }}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)}
                      </span>

                      {/* Score B */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        {bHigher && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--primary)",
                            }}
                          >
                            HIGH
                          </span>
                        )}
                        <span
                          className="score-badge score-badge-sm"
                          style={{
                            backgroundColor: scoreColor(scoreB),
                            color: scoreBadgeTextColor(scoreB),
                            opacity: bHigher ? 1 : 0.6,
                            fontWeight: bHigher ? 800 : 600,
                          }}
                        >
                          {scoreB.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths / Improvements Diff */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {/* Strengths */}
            <div className="card card-padded">
              <h2 className="text-section" style={{ marginBottom: 16 }}>
                강점
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <p className="text-label" style={{ marginBottom: 8 }}>
                    강의 A
                  </p>
                  {(evalA.strengths ?? []).map((s, i) => (
                    <div
                      key={i}
                      className="inner-card"
                      style={{ marginBottom: 8 }}
                    >
                      <p className="text-body">{s}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-label" style={{ marginBottom: 8 }}>
                    강의 B
                  </p>
                  {(evalB.strengths ?? []).map((s, i) => (
                    <div
                      key={i}
                      className="inner-card"
                      style={{ marginBottom: 8 }}
                    >
                      <p className="text-body">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="card card-padded">
              <h2 className="text-section" style={{ marginBottom: 16 }}>
                개선점
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <p className="text-label" style={{ marginBottom: 8 }}>
                    강의 A
                  </p>
                  {(evalA.improvements ?? []).map((s, i) => (
                    <div
                      key={i}
                      className="inner-card"
                      style={{ marginBottom: 8 }}
                    >
                      <p className="text-body">{s}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-label" style={{ marginBottom: 8 }}>
                    강의 B
                  </p>
                  {(evalB.improvements ?? []).map((s, i) => (
                    <div
                      key={i}
                      className="inner-card"
                      style={{ marginBottom: 8 }}
                    >
                      <p className="text-body">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* No selection state */}
      {(!evalA || !evalB) && (
        <div className="card card-padded" style={{ textAlign: "center", padding: 48 }}>
          <p className="text-body" style={{ color: "var(--text-muted)" }}>
            두 강의를 선택하면 비교 결과가 표시됩니다
          </p>
        </div>
      )}
    </div>
  );
}
