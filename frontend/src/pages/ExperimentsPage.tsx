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
import InsightCard from "@/components/shared/InsightCard";
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
        row[model] = scores.length > 0
          ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
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
    const most_lenient = ranked[ranked.length - 1];

    // Find categories with lowest and highest scores across all models
    const catScores = new Map<string, number[]>();
    for (const model of MODELS) {
      for (const ev of data[model].evaluations) {
        for (const [cat, score] of Object.entries(ev.category_averages)) {
          if (!catScores.has(cat)) catScores.set(cat, []);
          catScores.get(cat)!.push(score);
        }
      }
    }

    const catAvgs = Array.from(catScores.entries()).map(([cat, scores]) => ({
      cat,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));
    catAvgs.sort((a, b) => a.avg - b.avg);

    const lowCats = catAvgs.slice(0, 2).map((c) => `'${c.cat}'`).join("과 ");
    const highCats = catAvgs.slice(-2).map((c) => `'${c.cat}'`).join("과 ");

    return `${strictest.label}가 가장 엄격하게 평가했으며(평균 ${strictest.avg.toFixed(2)}), ${most_lenient.label}가 가장 관대합니다(평균 ${most_lenient.avg.toFixed(2)}). 세 모델 모두 ${lowCats}에서 낮은 점수를 주었으나, ${highCats}에서는 비교적 높은 점수를 주었습니다.`;
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
    <div className="page-content">
      {/* Title */}
      <div>
        <h1 className="text-title">모델 비교</h1>
        <p className="text-caption mt-1">
          같은 강의를 3개 AI 모델이 평가한 결과를 비교합니다
        </p>
      </div>

      {/* Section 1: 모델 평균 비교 */}
      <div className="card-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {MODELS.map((model) => (
          <InsightCard
            key={model}
            label={MODEL_LABELS[model]}
            value={data[model].avg.toFixed(2)}
            subtitle={`${data[model].evaluations.length}개 강의 평가`}
          />
        ))}
      </div>

      {/* Section 2: 강의별 점수 비교 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>강의별 점수 비교</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="text-label" style={{ textAlign: "left", padding: "8px 12px" }}>
                  날짜
                </th>
                <th className="text-label" style={{ textAlign: "left", padding: "8px 12px" }}>
                  과목
                </th>
                {MODELS.map((m) => (
                  <th
                    key={m}
                    className="text-label"
                    style={{ textAlign: "center", padding: "8px 12px" }}
                  >
                    {MODEL_LABELS[m]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedDates.map((date) => {
                const row = dateMap.get(date)!;
                const meta = lectureLookup.get(date);
                return (
                  <tr key={date}>
                    <td className="text-body" style={{ padding: "6px 12px", whiteSpace: "nowrap" }}>
                      {formatDateShort(date)}
                    </td>
                    <td className="text-body" style={{ padding: "6px 12px" }}>
                      {meta?.subjects?.join(", ") ?? "-"}
                    </td>
                    {MODELS.map((m) => (
                      <td key={m} style={{ textAlign: "center", padding: "6px 12px" }}>
                        {row[m] ? (
                          <ScoreBadge score={row[m]!.weighted_average} />
                        ) : (
                          <span className="text-caption">-</span>
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

      {/* Section 3: 카테고리별 모델 차이 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>카테고리별 모델 차이</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={categoryData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
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
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
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

      {/* Section 4: 채점 경향 분석 */}
      <div className="card card-padded">
        <h2 className="text-section" style={{ marginBottom: 16 }}>채점 경향 분석</h2>
        <AiSummary text={insightText} show={true} />
      </div>
    </div>
  );
}
