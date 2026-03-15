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
      <div className="bg-surface rounded-2xl p-6 shadow-[var(--shadow-sm)] border border-border-light hover:shadow-[var(--shadow-lg)] hover:border-primary/20 hover:scale-[1.01] transition-all duration-200 cursor-pointer group">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-text-tertiary">
              {formatDate(lecture_date)}
            </p>
            <p className="text-lg font-bold text-foreground mt-1 group-hover:text-primary transition-colors">
              {metadata.subjects?.[0] ?? "강의"}
            </p>
          </div>
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: scoreColor(weighted_average) }}
          >
            {weighted_average.toFixed(1)}
          </div>
        </div>

        {/* 과목 */}
        <p className="text-sm text-text-secondary mb-3.5 line-clamp-1">
          {metadata.contents?.[0] ?? ""}
        </p>

        {/* 점수 라벨 */}
        <div className="flex items-center gap-2.5 mb-4">
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
        <div className="space-y-2">
          {strengths?.[0] && (
            <p className="text-xs text-text-secondary line-clamp-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              {strengths[0]}
            </p>
          )}
          {improvements?.[0] && (
            <p className="text-xs text-text-secondary line-clamp-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
              {improvements[0]}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
