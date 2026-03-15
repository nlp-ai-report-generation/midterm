"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getAllEvaluations } from "@/lib/data";
import { formatDate, scoreColor } from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";

export default function ReportsPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        setEvaluations(data.sort((a, b) => a.lecture_date.localeCompare(b.lecture_date)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleLecture = useCallback((date: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === evaluations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(evaluations.map((e) => e.lecture_date)));
    }
  }, [evaluations, selected.size]);

  const selectedEvaluations = evaluations.filter((e) => selected.has(e.lecture_date));

  const combinedMarkdown = selectedEvaluations
    .map((e) => {
      const header = `# ${formatDate(e.lecture_date)} - ${e.metadata.subjects?.[0] ?? "강의"}\n\n`;
      return header + (e.report_markdown || "리포트 없음");
    })
    .join("\n\n---\n\n");

  const downloadMarkdown = useCallback(() => {
    if (!combinedMarkdown) return;
    const blob = new Blob([combinedMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [combinedMarkdown]);

  const downloadPDF = useCallback(() => {
    // PDF placeholder: downloads as .md since full PDF generation isn't implemented
    if (!combinedMarkdown) return;
    const blob = new Blob([combinedMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [combinedMarkdown]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">리포트 생성</h1>
        <p className="text-text-secondary mt-1">
          강의를 선택하고 평가 리포트를 미리보기 및 내보내기하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lecture Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">강의 선택</h2>
            <button
              onClick={selectAll}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {selected.size === evaluations.length ? "전체 해제" : "전체 선택"}
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {evaluations.map((evaluation) => (
              <label
                key={evaluation.lecture_date}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selected.has(evaluation.lecture_date)
                    ? "bg-primary-light border border-primary/20"
                    : "bg-background border border-border-light hover:border-primary/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(evaluation.lecture_date)}
                  onChange={() => toggleLecture(evaluation.lecture_date)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {evaluation.metadata.subjects?.[0] ?? "강의"}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatDate(evaluation.lecture_date)}
                  </p>
                </div>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: scoreColor(evaluation.weighted_average) }}
                >
                  {evaluation.weighted_average.toFixed(1)}
                </div>
              </label>
            ))}
          </div>

          <p className="text-xs text-text-tertiary mt-3">
            {selected.size}개 강의 선택됨
          </p>
        </motion.div>

        {/* Preview & Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Export Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={downloadMarkdown}
              disabled={selected.size === 0}
              className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Markdown 다운로드
            </button>
            <button
              onClick={downloadPDF}
              disabled={selected.size === 0}
              className="px-4 py-2.5 bg-foreground text-surface font-medium rounded-xl hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              PDF 다운로드
            </button>
          </div>

          {/* Preview Area */}
          <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light min-h-[400px]">
            <h2 className="text-lg font-bold text-foreground mb-4">미리보기</h2>

            {selected.size === 0 ? (
              <div className="flex items-center justify-center py-20 text-text-tertiary text-sm">
                좌측에서 강의를 선택하면 리포트 미리보기가 표시됩니다
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-text-secondary prose-strong:text-foreground prose-li:text-text-secondary prose-a:text-primary">
                <ReactMarkdown>{combinedMarkdown}</ReactMarkdown>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
