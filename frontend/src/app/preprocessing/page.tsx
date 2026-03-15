"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAllLectures } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { LectureMetadata } from "@/types/evaluation";

const pipelineNodes = [
  { id: "preprocessor", label: "Preprocessor", desc: "30분 청킹 + 5분 오버랩", x: 80, y: 200 },
  { id: "cat1", label: "Cat 1", desc: "교수법 및 전달력", x: 320, y: 40 },
  { id: "cat2", label: "Cat 2", desc: "학습 환경 및 상호작용", x: 320, y: 120 },
  { id: "cat3", label: "Cat 3", desc: "콘텐츠 품질 및 구조", x: 320, y: 200 },
  { id: "cat4", label: "Cat 4", desc: "전문성 및 최신성", x: 320, y: 280 },
  { id: "cat5", label: "Cat 5", desc: "학습자 지원 및 피드백", x: 320, y: 360 },
  { id: "aggregator", label: "Aggregator", desc: "가중 평균 집계", x: 560, y: 200 },
  { id: "calibrator", label: "Calibrator", desc: "점수 보정 및 일관성", x: 720, y: 200 },
  { id: "reporter", label: "Report Generator", desc: "마크다운 리포트 생성", x: 900, y: 200 },
];

const connections: [string, string][] = [
  ["preprocessor", "cat1"],
  ["preprocessor", "cat2"],
  ["preprocessor", "cat3"],
  ["preprocessor", "cat4"],
  ["preprocessor", "cat5"],
  ["cat1", "aggregator"],
  ["cat2", "aggregator"],
  ["cat3", "aggregator"],
  ["cat4", "aggregator"],
  ["cat5", "aggregator"],
  ["aggregator", "calibrator"],
  ["calibrator", "reporter"],
];

function getNodePos(id: string) {
  return pipelineNodes.find((n) => n.id === id)!;
}

export default function PreprocessingPage() {
  const [lectures, setLectures] = useState<LectureMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLectures()
      .then(setLectures)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">전처리 파이프라인</h1>
        <p className="text-text-secondary mt-1">
          LangGraph 기반 에이전틱 강의 평가 파이프라인 시각화
        </p>
      </div>

      {/* Pipeline Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light overflow-x-auto"
      >
        <h2 className="text-lg font-bold text-foreground mb-4">파이프라인 구조</h2>
        <div className="min-w-[1020px]">
          <svg width="1020" height="420" viewBox="0 0 1020 420">
            {/* Connections */}
            {connections.map(([fromId, toId]) => {
              const from = getNodePos(fromId);
              const to = getNodePos(toId);
              const fromX = from.x + 100;
              const fromY = from.y + 25;
              const toX = to.x;
              const toY = to.y + 25;
              const midX = (fromX + toX) / 2;
              return (
                <path
                  key={`${fromId}-${toId}`}
                  d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            {/* Arrowhead marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="var(--text-tertiary)" />
              </marker>
            </defs>

            {/* Parallel fan-out label */}
            <text x="320" y="16" fontSize="11" fill="var(--text-tertiary)" fontWeight="600">
              병렬 평가 (Fan-out)
            </text>
            <rect x="310" y="26" width="130" height="364" rx="12" fill="var(--primary)" opacity="0.04" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Nodes */}
            {pipelineNodes.map((node, i) => {
              const isCategory = node.id.startsWith("cat");
              return (
                <g key={node.id}>
                  <motion.rect
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    x={node.x}
                    y={node.y}
                    width={isCategory ? 130 : 120}
                    height={50}
                    rx="12"
                    fill={isCategory ? "var(--primary-light)" : "var(--surface)"}
                    stroke={isCategory ? "var(--primary)" : "var(--border)"}
                    strokeWidth={isCategory ? 1.5 : 1}
                  />
                  <text
                    x={node.x + (isCategory ? 65 : 60)}
                    y={node.y + 22}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill={isCategory ? "var(--primary)" : "var(--foreground)"}
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + (isCategory ? 65 : 60)}
                    y={node.y + 38}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--text-tertiary)"
                  >
                    {node.desc}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <p className="text-sm text-text-tertiary mb-1">청킹 전략</p>
          <p className="text-2xl font-bold text-foreground">30분 윈도우</p>
          <p className="text-sm text-text-secondary mt-1">5분 오버랩으로 문맥 유지</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <p className="text-sm text-text-tertiary mb-1">평가 카테고리</p>
          <p className="text-2xl font-bold text-primary">5개 병렬</p>
          <p className="text-sm text-text-secondary mt-1">18개 체크리스트 항목 평가</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <p className="text-sm text-text-tertiary mb-1">처리 강의 수</p>
          <p className="text-2xl font-bold text-foreground">
            {loading ? "..." : `${lectures.length}개`}
          </p>
          <p className="text-sm text-text-secondary mt-1">전체 커리큘럼 평가 완료</p>
        </motion.div>
      </div>

      {/* Lecture Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <h2 className="text-lg font-bold text-foreground mb-4">강의별 전처리 상세</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {lectures
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((lecture) => (
                <Link
                  key={lecture.date}
                  href={`/preprocessing/${lecture.date}`}
                  className="block bg-background rounded-xl p-3 text-center border border-border-light hover:border-primary/30 hover:shadow-[var(--shadow-md)] transition-all duration-200"
                >
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(lecture.date)}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">
                    {lecture.subjects?.[0] ?? "강의"}
                  </p>
                </Link>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
