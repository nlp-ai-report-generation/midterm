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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">강의 평가 목록</h1>
        <p className="text-text-secondary mt-1">
          전체 {evaluations.length}개 강의의 AI 기반 평가 결과를 확인하세요
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : evaluations.length === 0 ? (
        <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light text-center py-16">
          <p className="text-text-secondary">평가 데이터를 불러올 수 없습니다.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {evaluations.map((evaluation, i) => (
            <motion.div
              key={evaluation.lecture_date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <LectureCard evaluation={evaluation} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
