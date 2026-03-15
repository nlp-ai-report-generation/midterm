import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllLectures } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { LectureMetadata } from "@/types/evaluation";

const pipelineNodes = [
  { id: "preprocessor", label: "Preprocessor", desc: "30분 청킹 + 5분 오버랩", x: 60, y: 220, icon: "M4 4h16v16H4z M8 8h8M8 12h6" },
  { id: "cat1", label: "Cat 1", desc: "교수법 및 전달력", x: 320, y: 30, icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" },
  { id: "cat2", label: "Cat 2", desc: "학습 환경 및 상호작용", x: 320, y: 120, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
  { id: "cat3", label: "Cat 3", desc: "콘텐츠 품질 및 구조", x: 320, y: 210, icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { id: "cat4", label: "Cat 4", desc: "전문성 및 최신성", x: 320, y: 300, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { id: "cat5", label: "Cat 5", desc: "학습자 지원 및 피드백", x: 320, y: 390, icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { id: "aggregator", label: "Aggregator", desc: "가중 평균 집계", x: 580, y: 210, icon: "M4 6h16M4 12h16M4 18h16" },
  { id: "calibrator", label: "Calibrator", desc: "점수 보정 및 일관성", x: 760, y: 210, icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" },
  { id: "reporter", label: "Report Gen", desc: "마크다운 리포트 생성", x: 940, y: 210, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" },
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

const NODE_W = 150;
const NODE_H = 64;

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
    <div className="space-y-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">전처리 파이프라인</h1>
        <p className="text-text-secondary mt-1">
          LangGraph 기반 에이전틱 강의 평가 파이프라인 시각화
        </p>
      </motion.div>

      {/* Pipeline Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light overflow-x-auto"
      >
        <h2 className="text-lg font-bold text-foreground mb-5">파이프라인 구조</h2>
        <div className="min-w-[1120px]">
          <svg width="1120" height="490" viewBox="0 0 1120 490">
            <defs>
              {/* Gradient for connections */}
              <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="node-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="cat-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-light)" />
                <stop offset="100%" stopColor="white" />
              </linearGradient>
              {/* Arrowhead marker */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 10 4, 0 8" fill="var(--primary)" opacity="0.5" />
              </marker>
            </defs>

            {/* Fan-out region */}
            <text x="340" y="18" fontSize="11" fill="var(--text-tertiary)" fontWeight="600" textAnchor="middle">
              병렬 평가 (Fan-out)
            </text>
            <rect x="305" y="22" width="170" height="440" rx="16" fill="url(#node-grad)" stroke="var(--primary)" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />

            {/* Connections with animated dash */}
            {connections.map(([fromId, toId]) => {
              const from = getNodePos(fromId);
              const to = getNodePos(toId);
              const isCategory = fromId.startsWith("cat") || toId.startsWith("cat");
              const fromX = from.x + NODE_W;
              const fromY = from.y + NODE_H / 2;
              const toX = to.x;
              const toY = to.y + NODE_H / 2;
              const midX = (fromX + toX) / 2;
              return (
                <g key={`${fromId}-${toId}`}>
                  {/* Shadow line */}
                  <path
                    d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeOpacity="0.12"
                  />
                  {/* Main line */}
                  <path
                    d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                    fill="none"
                    stroke="url(#conn-grad)"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    strokeDasharray={isCategory ? "6 4" : "none"}
                  >
                    {isCategory && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="20"
                        to="0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </path>
                </g>
              );
            })}

            {/* Nodes */}
            {pipelineNodes.map((node, i) => {
              const isCategory = node.id.startsWith("cat");
              const w = NODE_W;
              const h = NODE_H;
              return (
                <g key={node.id}>
                  {/* Drop shadow */}
                  <rect
                    x={node.x + 2}
                    y={node.y + 3}
                    width={w}
                    height={h}
                    rx="16"
                    fill="black"
                    opacity="0.04"
                  />
                  <motion.rect
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    x={node.x}
                    y={node.y}
                    width={w}
                    height={h}
                    rx="16"
                    fill={isCategory ? "url(#cat-grad)" : "var(--surface)"}
                    stroke={isCategory ? "var(--primary)" : "var(--border)"}
                    strokeWidth={isCategory ? 1.5 : 1}
                  />
                  {/* Icon circle */}
                  <circle
                    cx={node.x + 28}
                    cy={node.y + h / 2}
                    r="14"
                    fill={isCategory ? "var(--primary)" : "var(--border-light)"}
                    opacity={isCategory ? 0.12 : 0.8}
                  />
                  <svg
                    x={node.x + 19}
                    y={node.y + h / 2 - 9}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isCategory ? "var(--primary)" : "var(--text-tertiary)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={node.icon} />
                  </svg>
                  {/* Label */}
                  <text
                    x={node.x + 52 + (w - 52) / 2}
                    y={node.y + 26}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill={isCategory ? "var(--primary)" : "var(--foreground)"}
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + 52 + (w - 52) / 2}
                    y={node.y + 44}
                    textAnchor="middle"
                    fontSize="9.5"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <p className="text-sm text-text-tertiary mb-1.5">청킹 전략</p>
          <p className="text-2xl font-bold text-foreground">30분 윈도우</p>
          <p className="text-sm text-text-secondary mt-1.5">5분 오버랩으로 문맥 유지</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <p className="text-sm text-text-tertiary mb-1.5">평가 카테고리</p>
          <p className="text-2xl font-bold text-primary">5개 병렬</p>
          <p className="text-sm text-text-secondary mt-1.5">18개 체크리스트 항목 평가</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
        >
          <p className="text-sm text-text-tertiary mb-1.5">처리 강의 수</p>
          <p className="text-2xl font-bold text-foreground">
            {loading ? "..." : `${lectures.length}개`}
          </p>
          <p className="text-sm text-text-secondary mt-1.5">전체 커리큘럼 평가 완료</p>
        </motion.div>
      </div>

      {/* Lecture Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface rounded-2xl p-7 shadow-[var(--shadow-sm)] border border-border-light"
      >
        <h2 className="text-lg font-bold text-foreground mb-5">강의별 전처리 상세</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {lectures
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((lecture, i) => (
                <motion.div
                  key={lecture.date}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                >
                  <Link
                    to={`/preprocessing/${lecture.date}`}
                    className="block bg-background rounded-xl p-4 text-center border border-border-light hover:border-primary/30 hover:shadow-[var(--shadow-md)] transition-all duration-200 group"
                  >
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {formatDate(lecture.date)}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1 line-clamp-1">
                      {lecture.subjects?.[0] ?? "강의"}
                    </p>
                  </Link>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
