import { useMemo, useState } from "react";
import type { EvaluationResult } from "@/types/evaluation";

export interface Section {
  start: string;
  end: string;
  label: string;
  type: string;
}

interface TimelineBarProps {
  sections: Section[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  evaluation?: EvaluationResult | null;
}

function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(":").map(Number);
  const base = h * 3600 + m * 60 + (s || 0);
  if (h < 6) return base + 12 * 3600;
  return base;
}

function fmtTime(t: string): string {
  return t.slice(0, 5);
}

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  concept:  { bg: "#f5f5f7", color: "#1d1d1f" },
  practice: { bg: "#FFF4EB", color: "#FF6B00" },
  intro:    { bg: "#f0f0f5", color: "#6e6e73" },
  review:   { bg: "#f0f0f5", color: "#6e6e73" },
  break:    { bg: "#fff",    color: "#d2d2d7" },
  wrapup:   { bg: "#f0f0f5", color: "#6e6e73" },
};

const CATEGORY_FILTERS = [
  { key: "all", label: "전체" },
  { key: "1", label: "언어" },
  { key: "2", label: "도입" },
  { key: "3", label: "개념" },
  { key: "4", label: "예시" },
  { key: "5", label: "상호작용" },
];

/** evaluation evidence에서 시간대별 점수 추출 */
function buildScoreTimeline(
  evaluation: EvaluationResult | null | undefined,
  sections: Section[],
  secData: Array<{ startSec: number; endSec: number }>,
  categoryFilter: string,
): number[] {
  if (!evaluation) return sections.map(() => 0);

  const scores = sections.map(() => ({ total: 0, count: 0 }));

  for (const cat of evaluation.category_results) {
    // 카테고리 필터
    if (categoryFilter !== "all") {
      const catNum = cat.category_name.match(/^(\d+)/)?.[1];
      if (catNum !== categoryFilter) continue;
    }

    for (const item of cat.items) {
      for (const ev of item.evidence) {
        const match = ev.match(/<(\d{2}:\d{2}:\d{2})>/);
        if (!match) continue;
        const evSec = timeToSeconds(match[1]);
        const idx = secData.findIndex((s) => evSec >= s.startSec && evSec < s.endSec);
        if (idx >= 0) {
          scores[idx].total += item.score;
          scores[idx].count += 1;
        }
      }
    }
  }

  return scores.map((s) => (s.count > 0 ? s.total / s.count : 0));
}

export default function TimelineBar({ sections, selectedIndex, onSelect, evaluation }: TimelineBarProps) {
  const [catFilter, setCatFilter] = useState("all");

  const { secData, totalDuration } = useMemo(() => {
    if (!sections.length) return { secData: [] as Array<{ startSec: number; endSec: number }>, totalDuration: 1 };
    const data = sections.map((s) => ({
      startSec: timeToSeconds(s.start),
      endSec: timeToSeconds(s.end),
    }));
    return { secData: data, totalDuration: (data[data.length - 1].endSec - data[0].startSec) || 1 };
  }, [sections]);

  const scoreTimeline = useMemo(
    () => buildScoreTimeline(evaluation, sections, secData, catFilter),
    [evaluation, sections, secData, catFilter],
  );

  const maxScore = 5;

  if (!sections.length) return null;

  return (
    <div className="tl-wrap">
      {/* 범례 + 카테고리 필터 */}
      <div className="tl-legend">
        <div className="tl-legend-colors">
          <span className="tl-legend-item"><span className="tl-legend-dot" style={{ background: "#f5f5f7", border: "1px solid #e8e8ed" }} /> 개념설명</span>
          <span className="tl-legend-item"><span className="tl-legend-dot" style={{ background: "#FFF4EB" }} /> 실습</span>
          <span className="tl-legend-item"><span className="tl-legend-dot" style={{ background: "#f0f0f5" }} /> 도입/복습/마무리</span>
        </div>
        <div className="tl-filters">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`tl-filter${catFilter === f.key ? " tl-filter-on" : ""}`}
              onClick={() => setCatFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 점수 추이 차트 (같은 시간축) */}
      <div className="tl-chart">
        <svg width="100%" height="48" preserveAspectRatio="none" viewBox={`0 0 ${totalDuration} 50`}>
          {/* 배경 기준선 */}
          <line x1={0} y1={40} x2={totalDuration} y2={40} stroke="#e8e8ed" strokeWidth={0.5} />
          <line x1={0} y1={20} x2={totalDuration} y2={20} stroke="#f5f5f7" strokeWidth={0.5} />
          {/* 점수 바 */}
          {sections.map((sec, i) => {
            if (sec.type === "break" || scoreTimeline[i] === 0) return null;
            const x = secData[i].startSec - secData[0].startSec;
            const w = secData[i].endSec - secData[i].startSec;
            const h = (scoreTimeline[i] / maxScore) * 44;
            const color = scoreTimeline[i] >= 4 ? "#34C759" : scoreTimeline[i] >= 3 ? "#FF9500" : "#FF3B30";
            return (
              <rect
                key={i}
                x={x}
                y={48 - h}
                width={w}
                height={h}
                rx={2}
                fill={selectedIndex === i ? "#FF6B00" : color}
                opacity={selectedIndex === i ? 1 : 0.5}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(i)}
              />
            );
          })}
        </svg>
        <div className="tl-chart-labels">
          <span>5.0</span>
          <span>3.0</span>
          <span>1.0</span>
        </div>
      </div>

      {/* 섹션 블록 — 쉬는시간만 텍스트, 나머지는 색깔만 */}
      <div className="tl-sections">
        {sections.map((sec, i) => {
          const duration = secData[i].endSec - secData[i].startSec;
          const widthPct = (duration / totalDuration) * 100;
          const style = TYPE_STYLES[sec.type] ?? TYPE_STYLES.concept;
          const selected = selectedIndex === i;
          const isBreak = sec.type === "break";

          return (
            <button
              key={i}
              className={`tl-sec${selected ? " tl-sec-on" : ""}`}
              style={{
                width: `${Math.max(widthPct, 1.5)}%`,
                background: selected ? "#FF6B00" : style.bg,
                color: selected ? "#fff" : style.color,
              }}
              onClick={() => onSelect(i)}
              title={`${fmtTime(sec.start)}~${fmtTime(sec.end)}\n${sec.label}`}
            >
              {isBreak && widthPct > 3 && <span className="tl-sec-label">쉬는시간</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
