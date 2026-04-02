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

/** 12시간제 타임스탬프를 순서 보정된 초로 변환.
 *  강의는 09:xx에 시작해서 오후(01:xx~05:xx)까지 이어짐.
 *  12시 이전 → 그대로, 06:00 미만 → +12시간 보정 */
function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(":").map(Number);
  const base = h * 3600 + m * 60 + (s || 0);
  // 06:00 미만이면 오후 (01:00 = 13:00, 05:50 = 17:50)
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

const TYPE_LABELS: Record<string, string> = {
  intro: "도입",
  concept: "개념설명",
  practice: "실습",
  review: "복습",
  break: "쉬는시간",
  wrapup: "마무리",
};

export default function TimelineBar({ sections, selectedIndex, onSelect }: TimelineBarProps) {
  // 각 섹션의 초 변환 + 전체 duration 계산
  const { secData, totalDuration } = useMemo(() => {
    if (!sections.length) return { secData: [], totalDuration: 1 };
    const data = sections.map((s) => ({
      startSec: timeToSeconds(s.start),
      endSec: timeToSeconds(s.end),
    }));
    const total = data[data.length - 1].endSec - data[0].startSec;
    return { secData: data, totalDuration: total || 1 };
  }, [sections]);

  if (!sections.length) return null;

  const originSec = secData[0].startSec;

  return (
    <div className="tl-wrap">
      {/* 섹션 리스트 — 가로 스크롤 가능 */}
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
                width: `${Math.max(widthPct, 2)}%`,
                background: selected ? (isBreak ? "#f5f5f7" : "#FF6B00") : style.bg,
                color: selected ? (isBreak ? "#86868b" : "#fff") : style.color,
              }}
              onClick={() => onSelect(i)}
              title={`${fmtTime(sec.start)}~${fmtTime(sec.end)} ${sec.label}`}
            >
              {widthPct > 4 && (
                <span className="tl-sec-label">
                  {isBreak ? "쉬는시간" : sec.label}
                </span>
              )}
              {widthPct > 7 && (
                <span className="tl-sec-meta">
                  {fmtTime(sec.start)} · {TYPE_LABELS[sec.type] ?? sec.type}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
