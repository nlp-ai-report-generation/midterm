"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  scoreTextClass,
  weightLabel,
} from "@/lib/utils";
import type { EvaluationResult, CategoryResult, ItemScore } from "@/types/evaluation";

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-xs text-text-tertiary w-10 text-right">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function ItemScoreCard({ item }: { item: ItemScore }) {
  return (
    <div className="bg-background rounded-xl p-4 border border-border-light">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-text-tertiary font-mono">{item.item_id}</span>
            <span className="text-sm font-medium text-foreground">{item.item_name}</span>
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
          className="flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-base"
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
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-text-tertiary">근거</p>
          {item.evidence.map((e, i) => (
            <p
              key={i}
              className="text-xs text-text-secondary bg-surface rounded-lg px-3 py-2 border-l-2 border-primary/30 italic"
            >
              &ldquo;{e}&rdquo;
            </p>
          ))}
        </div>
      )}

      {/* Confidence */}
      <div className="mt-3">
        <p className="text-xs text-text-tertiary mb-1">신뢰도</p>
        <ConfidenceBar value={item.confidence} />
      </div>
    </div>
  );
}

function CategoryAccordion({ category }: { category: CategoryResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface rounded-2xl shadow-[var(--shadow-sm)] border border-border-light overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: scoreColor(category.weighted_average) }}
          >
            {category.weighted_average.toFixed(1)}
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {category.category_name}
            </p>
            <p className="text-xs text-text-tertiary">
              {category.items.length}개 항목 | {scoreLabel(category.weighted_average)}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`}
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-3">
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
  const date = params.date as string;
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
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light text-center py-16">
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-tertiary">{formatDate(evaluation.lecture_date)}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              {metadata.subjects?.[0] ?? "강의"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {metadata.contents?.join(", ")}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              강사: {metadata.instructor || "미정"}
              {metadata.sub_instructors?.length > 0 && ` | 보조: ${metadata.sub_instructors.join(", ")}`}
            </p>
          </div>

          {/* Score Gauge */}
          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
              style={{ backgroundColor: scoreColor(weighted_average) }}
            >
              {weighted_average.toFixed(1)}
            </div>
            <span
              className="text-sm font-medium mt-2"
              style={{ color: scoreColor(weighted_average) }}
            >
              {scoreLabel(weighted_average)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <h2 className="text-lg font-bold text-foreground mb-4">카테고리별 점수</h2>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
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
                    <div className="bg-surface rounded-lg px-3 py-2 shadow-lg border border-border-light text-sm">
                      <p className="font-medium text-foreground">{d.fullName}</p>
                      <p style={{ color: scoreColor(d.score) }} className="font-bold">
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
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category Accordions */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">카테고리별 상세 평가</h2>
        {category_results.map((cat, i) => (
          <motion.div
            key={cat.category_name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <CategoryAccordion category={cat} />
          </motion.div>
        ))}
      </div>

      {/* Strengths / Improvements / Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <h3 className="text-base font-bold text-success mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            강점
          </h3>
          <ul className="space-y-2">
            {strengths?.map((s, i) => (
              <li key={i} className="text-sm text-text-secondary leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <h3 className="text-base font-bold text-warning mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            개선점
          </h3>
          <ul className="space-y-2">
            {improvements?.map((s, i) => (
              <li key={i} className="text-sm text-text-secondary leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <h3 className="text-base font-bold text-info mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-info" />
            권장 사항
          </h3>
          <ul className="space-y-2">
            {recommendations?.map((s, i) => (
              <li key={i} className="text-sm text-text-secondary leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Export Button (placeholder) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-end"
      >
        <button
          className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)]"
          onClick={() => alert("내보내기 기능은 리포트 페이지에서 이용하세요.")}
        >
          내보내기
        </button>
      </motion.div>
    </div>
  );
}
