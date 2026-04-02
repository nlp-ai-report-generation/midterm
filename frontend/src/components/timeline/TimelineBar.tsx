import { useMemo } from "react";

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
}

function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

const TYPE_COLORS: Record<string, string> = {
  concept: "#1d1d1f",
  practice: "#0071e3",
  intro: "#6e6e73",
  review: "#6e6e73",
  break: "#e8e8ed",
  wrapup: "#6e6e73",
};

const TYPE_LABELS: Record<string, string> = {
  intro: "도입",
  concept: "개념",
  practice: "실습",
  review: "복습",
  break: "쉬는시간",
  wrapup: "마무리",
};

export default function TimelineBar({ sections, selectedIndex, onSelect }: TimelineBarProps) {
  const totalDuration = useMemo(() => {
    if (!sections.length) return 1;
    return timeToSeconds(sections[sections.length - 1].end) - timeToSeconds(sections[0].start) || 1;
  }, [sections]);

  const originSec = useMemo(() => (sections.length ? timeToSeconds(sections[0].start) : 0), [sections]);

  if (!sections.length) return null;

  return (
    <div className="tl-wrap">
      {/* 색상 띠 */}
      <div className="tl-strip">
        {sections.map((sec, i) => {
          const w = ((timeToSeconds(sec.end) - timeToSeconds(sec.start)) / totalDuration) * 100;
          const bg = TYPE_COLORS[sec.type] ?? "#6e6e73";
          const selected = selectedIndex === i;
          return (
            <div
              key={i}
              className={`tl-block${selected ? " tl-selected" : ""}`}
              style={{ width: `${w}%`, backgroundColor: bg }}
              onClick={() => onSelect(i)}
              title={`${sec.start.slice(0, 5)}~${sec.end.slice(0, 5)} ${sec.label}`}
            />
          );
        })}
      </div>

      {/* 라벨 행 — 항상 표시 */}
      <div className="tl-labels">
        {sections.map((sec, i) => {
          const w = ((timeToSeconds(sec.end) - timeToSeconds(sec.start)) / totalDuration) * 100;
          const selected = selectedIndex === i;
          const isBreak = sec.type === "break";
          return (
            <div
              key={i}
              className={`tl-label${selected ? " tl-label-selected" : ""}`}
              style={{ width: `${w}%` }}
              onClick={() => onSelect(i)}
            >
              <span className="tl-label-type">{TYPE_LABELS[sec.type] ?? sec.type}</span>
              {!isBreak && w > 5 && <span className="tl-label-text">{sec.label}</span>}
            </div>
          );
        })}
      </div>

      {/* 시간축 */}
      <div className="tl-times">
        {sections.filter((_, i) => i % Math.max(1, Math.floor(sections.length / 6)) === 0 || i === sections.length - 1).map((sec, i) => (
          <span key={i}>{sec.start.slice(0, 5)}</span>
        ))}
      </div>
    </div>
  );
}
