import { useMemo } from "react";
import type { SimulationSegment } from "@/types/simulation";
import { segmentHealthScore } from "@/lib/simulation";

interface TimelineBarProps {
  segments: SimulationSegment[];
  phases: Record<string, string>; // seg-01 → "intro" etc
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const PHASE_LABELS: Record<string, string> = {
  intro: "도입",
  concept: "개념",
  practice: "실습",
  review: "복습",
  wrap: "마무리",
};

/** Merge consecutive segments with the same phase into label spans */
function mergePhaseLabels(
  segments: SimulationSegment[],
  phases: Record<string, string>,
): Array<{ label: string; startIdx: number; span: number }> {
  const result: Array<{ label: string; startIdx: number; span: number }> = [];
  let prev = "";
  for (let i = 0; i < segments.length; i++) {
    const phase = phases[segments[i].segment_id] ?? "";
    if (phase === prev && result.length > 0) {
      result[result.length - 1].span += 1;
    } else {
      result.push({ label: PHASE_LABELS[phase] ?? phase, startIdx: i, span: 1 });
      prev = phase;
    }
  }
  return result;
}

export default function TimelineBar({ segments, phases, selectedIndex, onSelect }: TimelineBarProps) {
  const phaseLabels = useMemo(() => mergePhaseLabels(segments, phases), [segments, phases]);

  /** Compute max attention for height scaling */
  const maxAttention = useMemo(() => {
    let max = 1;
    for (const s of segments) {
      if (s.proxies.attention_proxy > max) max = s.proxies.attention_proxy;
    }
    return max;
  }, [segments]);

  return (
    <div className="timeline-bar">
      {/* Segment blocks */}
      <div className="timeline-bar-segments">
        {segments.map((seg, idx) => {
          const health = segmentHealthScore(seg);
          const intensity = seg.proxies.attention_proxy / maxAttention;
          const height = Math.round(20 + intensity * 30); // 20~50px
          return (
            <button
              key={seg.segment_id}
              className={`timeline-seg ${selectedIndex === idx ? "timeline-seg-selected" : ""}`}
              style={{
                backgroundColor: health.color,
                height,
                opacity: 0.5 + intensity * 0.5,
              }}
              onClick={() => onSelect(idx)}
              title={`${seg.start_time}~${seg.end_time}`}
            />
          );
        })}
      </div>

      {/* Phase labels row */}
      <div className="timeline-bar-phases">
        {phaseLabels.map((ph, i) => (
          <span
            key={i}
            className="timeline-phase-label"
            style={{ flex: ph.span }}
          >
            {ph.label}
          </span>
        ))}
      </div>
    </div>
  );
}
