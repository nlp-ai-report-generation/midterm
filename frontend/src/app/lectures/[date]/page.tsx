import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getEvaluation } from "@/lib/data";
import {
  formatDate,
  scoreColor,
  scoreLabel,
  weightLabel,
} from "@/lib/utils";
import type { EvaluationResult, CategoryResult, ItemScore } from "@/types/evaluation";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 bg-border-light rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      <span className="text-xs font-medium text-text-tertiary w-10 text-right">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function ItemScoreCard({ item }: { item: ItemScore }) {
  return (
    <div className="bg-background rounded-xl p-5 border border-border-light hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-text-tertiary font-mono bg-border-light px-1.5 py-0.5 rounded">{item.item_id}</span>
            <span className="text-sm font-semibold text-foreground">{item.item_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `color-mix(in srgb, ${scoreColor(item.score)} 12%, transparent)`,
                color: scoreColor(item.score),
              }}
            >
              가중치: {weightLabel(item.weight)}
            </span>
          </div>
        </div>
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl text-white font-bold text-lg shadow-sm"
          style={{ backgroundColor: scoreColor(item.score) }}
        >
          {item.score}
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-sm text-text-secondary mt-3 leading-relaxed">
        {item.reasoning}
      </p>

      {/* Evidence */}
      {item.evidence.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">근거</p>
          {item.evidence.map((e, i) => (
            <p
              key={i}
              className="text-sm text-text-secondary bg-primary-light/50 rounded-xl px-4 py-3 border-l-3 border-primary/40 italic leading-relaxed"
            >
              &ldquo;{e}&rdquo;
            </p>
          ))}
        </div>
      )}

      {/* Confidence */}
      <div className="mt-4">
        <p className="text-xs text-text-tertiary mb-1.5">신뢰도</p>
        <ConfidenceBar value={item.confidence} />
      </div>
    </div>
  );
}

function CategoryAccordion({ category }: { category: CategoryResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface rounded-2xl shadow-[var(--shadow-sm)] border border-border-light overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
            style={{ backgroundColor: scoreColor(category.weighted_average) }}
          >
            {category.weighted_average.toFixed(1)}
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {category.category_name}
            </p>
            <p className="text-sm text-text-tertiary mt-0.5">
              {category.items.length}개 항목 | {scoreLabel(category.weighted_average)}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-text-tertiary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-4">
              {category.items.map((item) => (
                <ItemScoreCard key={item.item_id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LectureDetailPage() {
  const params = useParams();
  const date = params.date ?? "";
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!date) return;
    getEvaluation(date)
      .then(setEvaluation)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light text-center py-16">
        <p className="text-text-secondary">평가 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { metadata, weighted_average, category_results, category_averages, strengths, improvements, recommendations } = evaluation;

  const radarData = Object.entries(category_averages).map(([name, value]) => ({
    category: name.length > 8 ? name.slice(0, 8) + "..." : name,
    fullName: name,
    score: value,
    fullMark: 5,
  }));

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        {...fadeUp}
        className="bg-surface rounded-2xl p-8 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-sm text-text-tertiary font-medium">{formatDate(evaluation.lecture_date)}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1.5">
              {metadata.subjects?.[0] ?? "강의"}
            </h1>
            <p className="text-sm text-text-secondary mt-1.5">
              {metadata.contents?.join(", ")}
            </p>
            <p className="text-sm text-text-tertiary mt-1.5">
              강사: {metadata.instructor || "미정"}
              {metadata.sub_instructors?.length > 0 && ` | 보조: ${metadata.sub_instructors.join(", ")}`}
            </p>
          </div>

          {/* Score Gauge - Larger */}
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-extrabold text-4xl shadow-lg"
              style={{ backgroundColor: scoreColor(weighted_average) }}
            >
              {weighted_average.toFixed(1)}
            </div>
            <span
              className="text-sm font-semibold mt-2.5"
              style={{ color: scoreColor(weighted_average) }}
            >
              {scoreLabel(weighted_average)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart - Taller */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <h2 className="text-lg font-bold text-foreground mb-5">카테고리별 점수</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-surface rounded-xl px-4 py-3 shadow-lg border border-border-light text-sm">
                      <p className="font-semibold text-foreground">{d.fullName}</p>
                      <p style={{ color: scoreColor(d.score) }} className="font-bold text-lg mt-0.5">
                        {d.score.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Radar
                name="점수"
                dataKey="score"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.15}
                strokeWidth={2.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Accordions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">카테고리별 상세 평가</h2>
        {category_results.map((cat, i) => (
          <motion.div
            key={cat.category_name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
          >
            <CategoryAccordion category={cat} />
          </motion.div>
        ))}
      </div>

      {/* Strengths / Improvements / Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <h3 className="text-base font-bold text-success mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success" />
            강점
          </h3>
          <ul className="space-y-2.5">
            {strengths?.map((s, i) => (
              <li key={i} className="text-sm text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-success mt-0.5 flex-shrink-0">&#8226;</span>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <h3 className="text-base font-bold text-warning mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            개선점
          </h3>
          <ul className="space-y-2.5">
            {improvements?.map((s, i) => (
              <li key={i} className="text-sm text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-warning mt-0.5 flex-shrink-0">&#8226;</span>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <h3 className="text-base font-bold text-info mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-info" />
            권장 사항
          </h3>
          <ul className="space-y-2.5">
            {recommendations?.map((s, i) => (
              <li key={i} className="text-sm text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-info mt-0.5 flex-shrink-0">&#8226;</span>
                {s}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Export Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-end"
      >
        <button
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
          onClick={() => alert("내보내기 기능은 리포트 페이지에서 이용하세요.")}
        >
          내보내기
        </button>
      </motion.div>
    </div>
  );
}
