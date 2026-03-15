"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllEvaluations } from "@/lib/data";
import LectureCard from "@/components/cards/LectureCard";
import type { EvaluationResult } from "@/types/evaluation";

export default function LecturesPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        const sorted = data.sort((a, b) =>
          a.lecture_date.localeCompare(b.lecture_date)
        );
        setEvaluations(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      {/* Intro Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">강의 평가 목록</h1>
            <p className="text-text-secondary mt-1.5">
              전체 {evaluations.length}개 강의의 AI 기반 평가 결과를 확인하세요.
              각 카드를 클릭하면 상세 분석 리포트를 볼 수 있습니다.
            </p>
          </div>
          <button
            className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
            onClick={() => alert("새 평가 실행 기능은 설정 페이지에서 API 키를 먼저 등록해주세요.")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            새 평가 실행
          </button>
        </div>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : evaluations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light text-center py-16"
        >
          <p className="text-text-secondary">평가 데이터를 불러올 수 없습니다.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {evaluations.map((evaluation, i) => (
            <motion.div
              key={evaluation.lecture_date}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <LectureCard evaluation={evaluation} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
