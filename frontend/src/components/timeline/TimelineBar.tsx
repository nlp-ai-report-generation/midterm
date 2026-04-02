import { useMemo } from "react";

export interface Section {
  start: string; // "09:11:17"
  end: string;   // "09:15:00"
  label: string; // "Java I/O·NIO·NIO2 개요"
  type: string;  // "intro" | "concept" | "practice" | "review" | "break" | "wrapup"
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
  intro: "#86868b",
  review: "#86868b",
  break: "#f5f5f7",
  wrapup: "#86868b",
};

export default function TimelineBar({ sections, selectedIndex, onSelect }: TimelineBarProps) {
  const totalDuration = useMemo(() => {
    if (sections.length === 0) return 1;
    const first = timeToSeconds(sections[0].start);
    const last = timeToSeconds(sections[sections.length - 1].end);
    return last - first || 1;
  }, [sections]);

  const originSeconds = useMemo(
    () => (sections.length > 0 ? timeToSeconds(sections[0].start) : 0),
    [sections],
  );

  // Build hour markers for the time axis
  const timeMarkers = useMemo(() => {
    if (sections.length === 0) return [];
    const endSec = originSeconds + totalDuration;
    const markers: string[] = [];
    // start from next full hour after originSeconds, or originSeconds itself if it's exact
    let cursor = Math.ceil(originSeconds / 3600) * 3600;
    if (cursor > originSeconds) {
      // add the origin as "0:00"-style
      const oh = Math.floor(originSeconds / 3600);
      const om = Math.floor((originSeconds % 3600) / 60);
      markers.push(`${oh}:${String(om).padStart(2, "0")}`);
    }
    while (cursor <= endSec) {
      const h = Math.floor(cursor / 3600);
      const m = Math.floor((cursor % 3600) / 60);
      markers.push(`${h}:${String(m).padStart(2, "0")}`);
      cursor += 3600;
    }
    return markers;
  }, [originSeconds, totalDuration, sections.length]);

  // Minimum width in percentage to show label text
  const MIN_LABEL_WIDTH_PCT = 8;

  return (
    <div className="timeline-container">
      {/* Continuous strip */}
      <div className="timeline-strip">
        {sections.map((sec, idx) => {
          const startSec = timeToSeconds(sec.start) - originSeconds;
          const endSec = timeToSeconds(sec.end) - originSeconds;
          const widthPct = ((endSec - startSec) / totalDuration) * 100;
          const color = TYPE_COLORS[sec.type] ?? "#86868b";
          const isBreak = sec.type === "break";
          const textColor = isBreak ? "#86868b" : "rgba(255,255,255,0.85)";

          return (
            <div
              key={idx}
              className={`timeline-section ${selectedIndex === idx ? "timeline-section-selected" : ""}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: color,
                color: textColor,
              }}
              onClick={() => onSelect(idx)}
              title={`${sec.start}~${sec.end} ${sec.label}`}
            >
              {widthPct >= MIN_LABEL_WIDTH_PCT ? sec.label : ""}
            </div>
          );
        })}
      </div>

      {/* Time axis */}
      <div className="timeline-times">
        {timeMarkers.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
