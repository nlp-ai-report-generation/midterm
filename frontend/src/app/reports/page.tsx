"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { getAllEvaluations } from "@/lib/data";
import { formatDate, scoreColor } from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

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
    <div className="space-y-10">
      {/* Page Header */}
      <motion.div {...fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">리포트 생성</h1>
        <p className="text-text-secondary mt-1">
          강의를 선택하고 평가 리포트를 미리보기 및 내보내기하세요
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lecture Selector */}
        <motion.div
          {...fadeUp}
          className="lg:col-span-1 bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">강의 선택</h2>
            <button
              onClick={selectAll}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              {selected.size === evaluations.length ? "전체 해제" : "전체 선택"}
            </button>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {evaluations.map((evaluation) => {
              const isChecked = selected.has(evaluation.lecture_date);
              return (
                <label
                  key={evaluation.lecture_date}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all ${
                    isChecked
                      ? "bg-primary-light border border-primary/20"
                      : "bg-background border border-border-light hover:border-primary/10"
                  }`}
                >
                  {/* Custom Styled Checkbox */}
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLecture(evaluation.lecture_date)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-primary border-primary"
                          : "border-border bg-surface"
                      }`}
                    >
                      {isChecked && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {evaluation.metadata.subjects?.[0] ?? "강의"}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {formatDate(evaluation.lecture_date)}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: scoreColor(evaluation.weighted_average) }}
                  >
                    {evaluation.weighted_average.toFixed(1)}
                  </div>
                </label>
              );
            })}
          </div>

          <p className="text-xs text-text-tertiary mt-4 font-medium">
            {selected.size}개 강의 선택됨
          </p>
        </motion.div>

        {/* Preview & Export */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Export Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={downloadMarkdown}
              disabled={selected.size === 0}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Markdown 다운로드
            </button>
            <button
              onClick={downloadPDF}
              disabled={selected.size === 0}
              className="flex items-center gap-2 px-5 py-3 bg-foreground text-surface font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              PDF 다운로드
            </button>
          </div>

          {/* Preview Area */}
          <div className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light min-h-[400px]">
            <h2 className="text-lg font-bold text-foreground mb-5">미리보기</h2>

            {selected.size === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <p className="text-sm">좌측에서 강의를 선택하면 리포트 미리보기가 표시됩니다</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-text-secondary prose-strong:text-foreground prose-li:text-text-secondary prose-a:text-primary prose-hr:border-border-light prose-blockquote:border-primary/30 prose-blockquote:bg-primary-light/30 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:not-italic">
                <ReactMarkdown>{combinedMarkdown}</ReactMarkdown>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
