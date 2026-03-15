import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import LectureCard from "@/components/cards/LectureCard";
import { getAllEvaluations } from "@/lib/data";
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

  const average =
    evaluations.length > 0
      ? (
          evaluations.reduce((sum, item) => sum + item.weighted_average, 0) /
          evaluations.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="page-section">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-hero surface-card-strong"
      >
        <div className="page-hero-grid">
          <div>
            <span className="chip border-transparent bg-primary-soft text-primary">
              전체 강의 평가 목록
            </span>
            <p className="section-eyebrow mt-5">Lecture Inventory</p>
            <h1 className="page-hero-title mt-3">강의별 결과를 카드 단위로 비교합니다</h1>
            <p className="page-hero-copy">
              전체 {evaluations.length}개 강의를 동일한 평가 기준으로 정렬했습니다.
              카드 한 장에서 날짜, 주제, 점수, 대표 강점과 개선 포인트를 바로 읽을 수 있게 밀도를 다시 맞췄습니다.
            </p>
            <div className="page-stat-grid">
              <div className="page-stat">
                <p className="page-stat-label">강의 수</p>
                <p className="page-stat-value">{evaluations.length}</p>
                <p className="page-stat-copy">현재 정적 데이터 기준</p>
              </div>
              <div className="page-stat">
                <p className="page-stat-label">평균 점수</p>
                <p className="page-stat-value">{average}</p>
                <p className="page-stat-copy">5점 만점 가중 평균</p>
              </div>
              <div className="page-stat">
                <p className="page-stat-label">상태</p>
                <p className="page-stat-value text-[22px]">실데이터</p>
                <p className="page-stat-copy">샘플 JSON 미사용</p>
              </div>
            </div>
          </div>

          <div className="panel-card p-6">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">다음 액션</h2>
                <p className="panel-copy">새 분석을 돌리거나 상세 리포트로 이동합니다.</p>
              </div>
            </div>
            <div className="grid gap-3">
              <button
                className="primary-button w-full"
                onClick={() =>
                  alert("새 평가 실행 기능은 설정 페이지에서 API 키를 먼저 등록해주세요.")
                }
              >
                새 평가 실행
              </button>
              <Link to="/reports" className="soft-button w-full">
                선택 리포트 만들기
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
        </div>
      ) : evaluations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-card py-16 text-center"
        >
          <p className="text-text-secondary">평가 데이터를 불러올 수 없습니다.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {evaluations.map((evaluation, i) => (
            <motion.div
              key={evaluation.lecture_date}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <LectureCard evaluation={evaluation} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
