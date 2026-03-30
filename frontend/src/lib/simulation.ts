import type {
  RoiMetricSummary,
  SimulationResult,
  SimulationSegment,
  TranscriptBrowserData,
} from "@/types/simulation";

export function metricTone(value: number) {
  if (value >= 70) return "var(--primary)";
  if (value >= 45) return "var(--grey-700)";
  return "var(--grey-500)";
}

export function segmentTone(segment: SimulationSegment) {
  if (segment.labels.includes("부하 높음")) return "#EF4444";
  if (segment.labels.includes("집중 상승")) return "var(--primary)";
  if (segment.labels.includes("집중 하락")) return "#F59E0B";
  return "var(--grey-500)";
}

export function findSegmentIndex(result: SimulationResult, id: string | null): number {
  if (!id) return 0;
  const idx = result.segments.findIndex((segment) => segment.segment_id === id);
  return idx >= 0 ? idx : 0;
}

export function hintLabel(hint: RoiMetricSummary["functional_hint"]) {
  switch (hint) {
    case "auditory_or_language_related":
      return "설명 추적 반응";
    case "frontal_control_or_action_related":
      return "통제와 전환 반응";
    case "visual_processing_related":
      return "시각 처리 반응";
    case "sensorimotor_or_attention_related":
      return "주의 전환 반응";
    case "association_or_default_mode_related":
      return "연결 패턴 반응";
    default:
      return "표면 반응 변화";
  }
}

export function roiDisplayLabel(roi: Pick<RoiMetricSummary, "functional_hint" | "roi_display_name">) {
  switch (roi.functional_hint) {
    case "auditory_or_language_related":
      return "청각 처리";
    case "frontal_control_or_action_related":
      return "전환 조절";
    case "visual_processing_related":
      return "시각 처리";
    case "sensorimotor_or_attention_related":
      return "집중 조절";
    case "association_or_default_mode_related":
      return "맥락 연결";
    default:
      return "표면 변화";
  }
}

export function roiHintDescription(hint: RoiMetricSummary["functional_hint"]) {
  switch (hint) {
    case "auditory_or_language_related":
      return "설명을 듣고 따라가는 패턴과 가까워요.";
    case "frontal_control_or_action_related":
      return "설명 축이 바뀌거나 정리되는 구간에서 함께 커질 수 있어요.";
    case "visual_processing_related":
      return "예시나 화면 정보가 바뀌는 흐름과 함께 읽혀요.";
    case "sensorimotor_or_attention_related":
      return "주의를 다시 모으는 흐름과 함께 읽혀요.";
    case "association_or_default_mode_related":
      return "앞뒤 맥락을 연결하는 흐름과 함께 읽혀요.";
    default:
      return "지금 구간의 변화 패턴과 함께 읽혀요.";
  }
}

export function modalityLabel(sourceModality: SimulationResult["source_modality"]) {
  return sourceModality === "audio_only_fallback" ? "오디오 fallback" : "텍스트 TTS";
}

export type FlattenedTranscriptLine = TranscriptBrowserData["segments"][number]["lines"][number] & {
  segment_id: string;
  segment_index: number;
  line_index: number;
  start_time: string;
  end_time: string;
  labels: string[];
  interpretation: string;
};

export function flattenTranscript(
  transcript: TranscriptBrowserData,
  simulation: SimulationResult,
): FlattenedTranscriptLine[] {
  return transcript.segments.flatMap((segment, segmentIndex) => {
    const simulationSegment = simulation.segments[segmentIndex];
    return segment.lines.map((line, lineIndex) => ({
      ...line,
      segment_id: segment.segment_id,
      segment_index: segmentIndex,
      line_index: lineIndex,
      start_time: segment.start_time,
      end_time: segment.end_time,
      labels: simulationSegment?.labels ?? [],
      interpretation: simulationSegment?.roi_insights.summary_text ?? simulationSegment?.interpretation ?? "",
    }));
  });
}

export function buildSegmentTags(simulation: SimulationResult, index: number) {
  const segment = simulation.segments[index];
  if (!segment) return [];

  const tags = [...segment.labels];
  const firstHint = segment.roi_insights.top_active_rois[0]?.functional_hint;
  if (firstHint) {
    tags.push(hintLabel(firstHint));
  }

  return Array.from(new Set(tags)).slice(0, 3);
}
