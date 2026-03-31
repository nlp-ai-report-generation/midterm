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

  const labelA = evalA
    ? `${formatDateShort(evalA.lecture_date)} · ${evalA.metadata?.subjects?.[0] ?? "강의"}`
    : "강의 A";
  const labelB = evalB
    ? `${formatDateShort(evalB.lecture_date)} · ${evalB.metadata?.subjects?.[0] ?? "강의"}`
    : "강의 B";

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

      {/* Date Selectors — responsive single column on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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

      {/* Comparison */}
      {evalA && evalB && (
        <>
          {/* Overall Score — responsive */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <div
              className="card card-padded"
              style={{ textAlign: "center" }}
            >
              <p className="text-caption" style={{ marginBottom: 8 }}>
                {labelA}
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
                {labelB}
              </p>
              <ScoreBadge score={evalB.weighted_average} size="lg" />
              <p className="text-body" style={{ marginTop: 8 }}>
                {scoreLabel(evalB.weighted_average)}
              </p>
            </div>
          </div>

          {/* Category Comparison — simple table */}
          <div className="card card-padded">
            <h2 className="text-section" style={{ marginBottom: 20 }}>
              카테고리별 비교
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr>
                    <th
                      className="text-label"
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--grey-200)",
                      }}
                    >
                      카테고리
                    </th>
                    <th
                      className="text-label"
                      style={{
                        textAlign: "center",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--grey-200)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      A 점수
                    </th>
                    <th
                      className="text-label"
                      style={{
                        textAlign: "center",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--grey-200)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      B 점수
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORY_NAMES.map((cat) => {
                    const scoreA = evalA.category_averages[cat] ?? 0;
                    const scoreB = evalB.category_averages[cat] ?? 0;
                    const aHigher = scoreA > scoreB;
                    const bHigher = scoreB > scoreA;

                    return (
                      <tr key={cat}>
                        <td
                          style={{
                            padding: "12px",
                            color: "var(--text-primary)",
                            fontWeight: 500,
                            borderBottom: "1px solid var(--grey-100)",
                          }}
                        >
                          {cat.replace(/^\d+\.\s*/, "")}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            borderBottom: "1px solid var(--grey-100)",
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
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            borderBottom: "1px solid var(--grey-100)",
                          }}
                        >
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strengths — single list with [A]/[B] labels */}
          <div className="card card-padded">
            <h2 className="text-section" style={{ marginBottom: 16 }}>
              잘하고 있는 부분
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(evalA.strengths ?? []).map((s, i) => (
                <div key={`a-${i}`} className="inner-card" style={{ padding: "14px 20px" }}>
                  <p className="text-body">
                    <span
                      style={{
                        display: "inline-block",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "var(--primary)",
                        background: "var(--primary-light)",
                        borderRadius: "var(--radius-sm)",
                        padding: "2px 8px",
                        marginRight: 10,
                        verticalAlign: "middle",
                      }}
                    >
                      A
                    </span>
                    {s}
                  </p>
                </div>
              ))}
              {(evalB.strengths ?? []).map((s, i) => (
                <div key={`b-${i}`} className="inner-card" style={{ padding: "14px 20px" }}>
                  <p className="text-body">
                    <span
                      style={{
                        display: "inline-block",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "var(--text-primary)",
                        background: "var(--grey-200)",
                        borderRadius: "var(--radius-sm)",
                        padding: "2px 8px",
                        marginRight: 10,
                        verticalAlign: "middle",
                      }}
                    >
                      B
                    </span>
                    {s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements — single list with [A]/[B] labels */}
          <div className="card card-padded">
            <h2 className="text-section" style={{ marginBottom: 16 }}>
              더 나아질 수 있는 부분
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(evalA.improvements ?? []).map((s, i) => (
                <div key={`a-${i}`} className="inner-card" style={{ padding: "14px 20px" }}>
                  <p className="text-body">
                    <span
                      style={{
                        display: "inline-block",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "var(--primary)",
                        background: "var(--primary-light)",
                        borderRadius: "var(--radius-sm)",
                        padding: "2px 8px",
                        marginRight: 10,
                        verticalAlign: "middle",
                      }}
                    >
                      A
                    </span>
                    {s}
                  </p>
                </div>
              ))}
              {(evalB.improvements ?? []).map((s, i) => (
                <div key={`b-${i}`} className="inner-card" style={{ padding: "14px 20px" }}>
                  <p className="text-body">
                    <span
                      style={{
                        display: "inline-block",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "var(--text-primary)",
                        background: "var(--grey-200)",
                        borderRadius: "var(--radius-sm)",
                        padding: "2px 8px",
                        marginRight: 10,
                        verticalAlign: "middle",
                      }}
                    >
                      B
                    </span>
                    {s}
                  </p>
                </div>
              ))}
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
