import { Link } from "react-router-dom";
import { formatDate, scoreColor, scoreLabel } from "@/lib/utils";
import type { EvaluationResult } from "@/types/evaluation";

interface LectureCardProps {
  evaluation: EvaluationResult;
}

export default function LectureCard({ evaluation }: LectureCardProps) {
  const { lecture_date, metadata, weighted_average, strengths, improvements } =
    evaluation;

  return (
    <Link to={`/lectures/${lecture_date}`}>
      <div className="panel-card group p-6 transition-transform hover:-translate-y-1">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              {formatDate(lecture_date)} 평가
            </p>
            <p className="mt-2 line-clamp-2 text-[22px] font-bold leading-[1.2] tracking-[-0.04em] text-foreground group-hover:text-primary">
              {metadata.subjects?.[0] ?? "강의"}
            </p>
          </div>
          <div
            className="flex h-[74px] w-[74px] shrink-0 flex-col items-center justify-center rounded-[24px] text-white shadow-[0_18px_30px_rgba(25,31,40,0.12)]"
            style={{
              background: `linear-gradient(180deg, color-mix(in srgb, ${scoreColor(weighted_average)} 88%, white), ${scoreColor(weighted_average)})`,
            }}
          >
            <span className="text-[26px] font-bold leading-none tracking-[-0.05em]">
              {weighted_average.toFixed(1)}
            </span>
            <span className="mt-1 text-[11px] font-semibold opacity-90">score</span>
          </div>
        </div>

        <p className="mb-5 line-clamp-3 min-h-[72px] text-[14px] leading-6 text-text-secondary">
          {metadata.contents?.[0] ?? "분석 내용을 불러오는 중입니다."}
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
            style={{
              backgroundColor: `color-mix(in srgb, ${scoreColor(weighted_average)} 10%, white)`,
              color: scoreColor(weighted_average),
            }}
          >
            {scoreLabel(weighted_average)}
          </span>
          <span className="chip border-transparent bg-[var(--surface-subtle)]">
            강사 {metadata.instructor || "미정"}
          </span>
        </div>

        <div className="space-y-2.5 border-t border-divider pt-5">
          {strengths?.[0] && (
            <p className="flex items-start gap-2 text-[13px] leading-5 text-text-secondary">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              {strengths[0]}
            </p>
          )}
          {improvements?.[0] && (
            <p className="flex items-start gap-2 text-[13px] leading-5 text-text-secondary">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
              {improvements[0]}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
