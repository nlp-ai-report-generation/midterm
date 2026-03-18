import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAllEvaluationsByModel,
  getAllLectures,
  MODEL_LABELS,
  type ModelKey,
} from "@/lib/data";
import { formatDateShort } from "@/lib/utils";
import ScoreBadge from "@/components/shared/ScoreBadge";
import AiSummary from "@/components/shared/AiSummary";
import type { EvaluationResult, LectureMetadata } from "@/types/evaluation";

const MODELS: ModelKey[] = ["gpt4o-mini", "opus", "sonnet"];

// Recharts needs raw hex for fills — resolve CSS var at render time
const MODEL_COLORS_HEX: Record<ModelKey, string> = {
  "gpt4o-mini": "#2563EB", // fallback; overridden in useEffect
  opus: "#8B5CF6",
  sonnet: "#3182F6",
};

const MODEL_DESCRIPTIONS: Record<ModelKey, string> = {
  "gpt4o-mini":
    "빠르고 관대한 평가. 전체 흐름을 빨리 보고 싶을 때 추천해요",
  opus: "꼼꼼하고 엄격한 평가. 가장 정확한 점수가 필요할 때 선택해요",
  sonnet:
    "속도와 정확성의 균형. 일반적으로 추천하는 모델이에요",
};

interface ModelData {
  evaluations: EvaluationResult[];
  avg: number;
}

export default function ExperimentsPage() {
  const [data, setData] = useState<Record<ModelKey, ModelData> | null>(null);
  const [lectures, setLectures] = useState<LectureMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryHex, setPrimaryHex] = useState("#2563EB");

  useEffect(() => {
    // Resolve --primary CSS variable for Recharts
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    if (resolved) setPrimaryHex(resolved);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [gpt, opus, sonnet, lecs] = await Promise.all([
          getAllEvaluationsByModel("gpt4o-mini"),
          getAllEvaluationsByModel("opus"),
          getAllEvaluationsByModel("sonnet"),
          getAllLectures(),
        ]);

        const avg = (evals: EvaluationResult[]) =>
          evals.length > 0
            ? evals.reduce((s, e) => s + e.weighted_average, 0) / evals.length
            : 0;

        setData({
          "gpt4o-mini": { evaluations: gpt, avg: avg(gpt) },
          opus: { evaluations: opus, avg: avg(opus) },
          sonnet: { evaluations: sonnet, avg: avg(sonnet) },
        });
        setLectures(lecs);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Build a lookup: date → { model → evaluation }
  const dateMap = useMemo(() => {
    if (!data) return new Map<string, Record<ModelKey, EvaluationResult | null>>();
    const map = new Map<string, Record<ModelKey, EvaluationResult | null>>();
    for (const model of MODELS) {
      for (const ev of data[model].evaluations) {
        if (!map.has(ev.lecture_date)) {
          map.set(ev.lecture_date, { "gpt4o-mini": null, opus: null, sonnet: null });
        }
        map.get(ev.lecture_date)![model] = ev;
      }
    }
    return map;
  }, [data]);

  // Sorted dates
  const sortedDates = useMemo(() => {
    return Array.from(dateMap.keys()).sort();
  }, [dateMap]);

  // Lecture metadata lookup
  const lectureLookup = useMemo(() => {
    const map = new Map<string, LectureMetadata>();
    for (const l of lectures) map.set(l.date, l);
    return map;
  }, [lectures]);

  // Category averages per model
  const categoryData = useMemo(() => {
    if (!data) return [];
    const allCategories = new Set<string>();
    for (const model of MODELS) {
      for (const ev of data[model].evaluations) {
        for (const cat of Object.keys(ev.category_averages)) {
          allCategories.add(cat);
        }
      }
    }

    return Array.from(allCategories).map((cat) => {
      const row: Record<string, string | number> = { category: cat };
      for (const model of MODELS) {
        const scores = data[model].evaluations
          .map((e) => e.category_averages[cat])
          .filter((v) => v != null);
        row[model] =
          scores.length > 0
            ? parseFloat(
                (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
              )
            : 0;
      }
      return row;
    });
  }, [data]);

  // AI insight text (dynamically computed)
  const insightText = useMemo(() => {
    if (!data) return "";

    const ranked = MODELS.map((m) => ({
      model: m,
      label: MODEL_LABELS[m],
      avg: data[m].avg,
    })).sort((a, b) => a.avg - b.avg);

    const strictest = ranked[0];
    const mostLenient = ranked[ranked.length - 1];

    // Compute per-category per-model averages
    const catModelAvg = new Map<string, Record<ModelKey, number[]>>();
    for (const model of MODELS) {
      for (const ev of data[model].evaluations) {
        for (const [cat, score] of Object.entries(ev.category_averages)) {
          if (!catModelAvg.has(cat)) {
            catModelAvg.set(cat, {
              "gpt4o-mini": [],
              opus: [],
              sonnet: [],
            });
          }
          catModelAvg.get(cat)![model].push(score);
        }
      }
    }

    // Find categories where all models agree are weak (all below average)
    const catAverages = Array.from(catModelAvg.entries()).map(
      ([cat, modelScores]) => {
        const allScores = MODELS.flatMap((m) => modelScores[m]);
        const avg =
          allScores.length > 0
            ? allScores.reduce((a, b) => a + b, 0) / allScores.length
            : 0;

        // Compute per-model avg for disagreement
        const perModelAvg = MODELS.map((m) => {
          const s = modelScores[m];
          return s.length > 0 ? s.reduce((a, b) => a + b, 0) / s.length : 0;
        });
        const maxDiff =
          perModelAvg.length > 0
            ? Math.max(...perModelAvg) - Math.min(...perModelAvg)
            : 0;

        return { cat, avg, maxDiff };
      }
    );

    catAverages.sort((a, b) => a.avg - b.avg);
    const weakestCat = catAverages[0]?.cat ?? "";

    // Find category with most disagreement
    const sortedByDiff = [...catAverages].sort((a, b) => b.maxDiff - a.maxDiff);
    const mostDisagreed = sortedByDiff[0];

    return `${mostLenient.label}가 평균 ${mostLenient.avg.toFixed(2)}로 가장 관대하게 평가했고, ${strictest.label}가 ${strictest.avg.toFixed(2)}로 가장 엄격합니다. 세 모델 모두 '${weakestCat}'에서 낮은 점수를 주었습니다. '${mostDisagreed?.cat ?? ""}'에서는 모델 간 점수 차이가 가장 큽니다 (최대 ${mostDisagreed?.maxDiff.toFixed(1) ?? "0.0"}점 차이).`;
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-content">
        <p className="text-body">데이터를 불러올 수 없습니다.</p>
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
        <h1 className="text-title">모델 비교</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          같은 강의를 3개 AI 모델이 평가한 결과를 비교합니다
        </p>
      </div>

      {/* Section 1: Model overview cards */}
      <div
        className="card-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {MODELS.map((model) => (
          <div key={model} className="card card-padded">
            <div
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    model === "gpt4o-mini"
                      ? "var(--primary)"
                      : MODEL_COLORS_HEX[model],
                  flexShrink: 0,
                }}
              />
              <span className="text-label">{MODEL_LABELS[model]}</span>
            </div>
            <p className="text-number" style={{ marginTop: 12 }}>
              {data[model].avg.toFixed(2)}
            </p>
            <p className="text-caption" style={{ marginTop: 8 }}>
              {data[model].evaluations.length}개 강의 평가
            </p>
          </div>
        ))}
      </div>

      {/* Section 2: Score comparison table */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          강의별 점수 비교
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
                    zIndex: 1,
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
                    zIndex: 1,
                  }}
                >
                  과목
                </th>
                {MODELS.map((m) => (
                  <th
                    key={m}
                    className="text-label"
                    style={{
                      textAlign: "center",
                      padding: "12px 8px",
                      position: "sticky",
                      top: 0,
                      background: "var(--surface)",
                      zIndex: 1,
                    }}
                  >
                    {MODEL_LABELS[m]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedDates.map((date, idx) => {
                const row = dateMap.get(date)!;
                const meta = lectureLookup.get(date);
                return (
                  <tr
                    key={date}
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
                      {formatDateShort(date)}
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
                      {meta?.subjects?.join(", ") ?? "—"}
                    </td>
                    {MODELS.map((m) => (
                      <td
                        key={m}
                        style={{
                          textAlign: "center",
                          padding: "12px 8px",
                        }}
                      >
                        {row[m] ? (
                          <ScoreBadge score={row[m]!.weighted_average} />
                        ) : (
                          <span
                            className="text-caption"
                            style={{ color: "var(--text-muted)" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Category bar chart */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          카테고리별 모델 차이
        </h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={categoryData}
            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              tickFormatter={(v: string) =>
                v.length > 6 ? v.slice(0, 6) + "…" : v
              }
            />
            <YAxis
              domain={[0, 5]}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "none",
                borderRadius: 12,
                fontSize: 13,
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)",
                padding: "12px 16px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="gpt4o-mini"
              name={MODEL_LABELS["gpt4o-mini"]}
              fill={primaryHex}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="opus"
              name={MODEL_LABELS["opus"]}
              fill={MODEL_COLORS_HEX.opus}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="sonnet"
              name={MODEL_LABELS["sonnet"]}
              fill={MODEL_COLORS_HEX.sonnet}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section 4: AI scoring tendency analysis */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          채점 경향 분석
        </h2>
        <AiSummary text={insightText} show={true} />
      </div>

      {/* Section 5: Model characteristics */}
      <div>
        <h2 className="text-section" style={{ marginBottom: 16 }}>
          모델별 특징
        </h2>
        <div
          className="card-grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {MODELS.map((model) => (
            <div key={model} className="card card-padded">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor:
                      model === "gpt4o-mini"
                        ? "var(--primary)"
                        : MODEL_COLORS_HEX[model],
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-label"
                  style={{ fontSize: 13, color: "var(--text-primary)" }}
                >
                  {MODEL_LABELS[model]}
                </span>
              </div>
              <p className="text-body">{MODEL_DESCRIPTIONS[model]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: 신뢰도 지표 안내 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 4 }}>
          평가 신뢰도 지표
        </h2>
        <p className="text-caption" style={{ marginBottom: 24 }}>
          여러 모델의 평가가 얼마나 일관되는지 측정하는 통계 지표입니다
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            {
              name: "Cohen's κ (카파)",
              threshold: "≥ 0.61",
              level: "양호",
              desc: "두 번 평가했을 때 결과가 얼마나 같은지를 측정합니다. 0.61 이상이면 평가자 간 판단이 상당히 일치합니다.",
            },
            {
              name: "Krippendorff's α (알파)",
              threshold: "≥ 0.667",
              level: "신뢰 가능",
              desc: "여러 평가자가 동의하는 정도를 측정합니다. 0.667 이상이면 잠정적으로 신뢰할 수 있는 수준입니다.",
            },
            {
              name: "ICC (급내상관계수)",
              threshold: "≥ 0.75",
              level: "안정적",
              desc: "점수의 재현 가능성을 측정합니다. 0.75 이상이면 동일 강의를 다시 평가해도 비슷한 점수가 나옵니다.",
            },
          ].map((metric) => (
            <div key={metric.name} className="inner-card">
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  {metric.name}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                    {metric.threshold}
                  </span>
                  <span className="text-caption">{metric.level}</span>
                </span>
              </div>
              <p className="text-body">{metric.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
