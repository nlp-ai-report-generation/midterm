"use client";

import Link from "next/link";
import { formatDate, scoreColor, scoreLabel } from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";

interface LectureCardProps {
  evaluation: EvaluationResult;
}

export default function LectureCard({ evaluation }: LectureCardProps) {
  const { lecture_date, metadata, weighted_average, strengths, improvements } =
    evaluation;

  return (
    <Link href={`/lectures/${lecture_date}`}>
      <div className="bg-surface rounded-2xl p-5 shadow-[var(--shadow-sm)] border border-border-light hover:shadow-[var(--shadow-md)] hover:border-primary/20 transition-all duration-200 cursor-pointer group">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-text-tertiary">
              {formatDate(lecture_date)}
            </p>
            <p className="text-base font-bold text-foreground mt-0.5 group-hover:text-primary transition-colors">
              {metadata.subjects?.[0] ?? "강의"}
            </p>
          </div>
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl text-white font-bold text-lg"
            style={{ backgroundColor: scoreColor(weighted_average) }}
          >
            {weighted_average.toFixed(1)}
          </div>
        </div>

        {/* 과목 */}
        <p className="text-sm text-text-secondary mb-3 line-clamp-1">
          {metadata.contents?.[0] ?? ""}
        </p>

        {/* 점수 라벨 */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: `color-mix(in srgb, ${scoreColor(weighted_average)} 12%, transparent)`,
              color: scoreColor(weighted_average),
            }}
          >
            {scoreLabel(weighted_average)}
          </span>
          <span className="text-xs text-text-tertiary">
            강사: {metadata.instructor || "김영아"}
          </span>
        </div>

        {/* 강점/개선점 미리보기 */}
        <div className="space-y-1.5">
          {strengths?.[0] && (
            <p className="text-xs text-text-secondary line-clamp-1">
              <span className="text-success font-medium mr-1">+</span>
              {strengths[0]}
            </p>
          )}
          {improvements?.[0] && (
            <p className="text-xs text-text-secondary line-clamp-1">
              <span className="text-error font-medium mr-1">-</span>
              {improvements[0]}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
