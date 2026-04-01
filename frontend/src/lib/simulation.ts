import type {
  LiveBrainFrame,
  RoiMetricSummary,
  SimulationResult,
  SimulationSegment,
  TranscriptBrowserData,
} from "@/types/simulation";

export function metricTone(value: number, metric?: "attention" | "load" | "novelty") {
  if (metric === "load") {
    if (value >= 85) return "var(--primary-hover)";
    if (value >= 70) return "var(--primary)";
    if (value >= 45) return "var(--grey-800)";
    if (value >= 25) return "var(--grey-600)";
    return "var(--grey-500)";
  }
  if (value >= 85) return "var(--primary)";
  if (value >= 70) return "var(--primary-hover)";
  if (value >= 50) return "var(--grey-700)";
  if (value >= 25) return "var(--grey-500)";
  return "var(--grey-400)";
}

export function segmentTone(segment: SimulationSegment) {
  if (segment.labels.includes("부하 높음")) return "var(--primary-hover)";
  if (segment.labels.includes("집중 상승")) return "var(--primary)";
  if (segment.labels.includes("집중 하락")) return "var(--grey-600)";
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
      interpretation: simulationSegment?.roi_insights?.summary_text ?? simulationSegment?.interpretation ?? "",
    }));
  });
}

/** ROI를 functional_hint별로 그룹화하여 고유 항목만 반환 (가장 강한 것 우선) */
export function deduplicateRois(rois: RoiMetricSummary[] | undefined, valueKey: "mean_abs_response" | "delta_abs_response" = "mean_abs_response"): RoiMetricSummary[] {
  if (!rois) return [];
  const seen = new Map<string, RoiMetricSummary>();
  for (const roi of rois) {
    const existing = seen.get(roi.functional_hint);
    if (!existing || (roi[valueKey] ?? 0) > (existing[valueKey] ?? 0)) {
      seen.set(roi.functional_hint, roi);
    }
  }
  return Array.from(seen.values());
}

export function buildSegmentTags(simulation: SimulationResult, index: number) {
  const segment = simulation.segments[index];
  if (!segment) return [];

  const tags = [...segment.labels];
  const firstHint = segment.roi_insights?.top_active_rois[0]?.functional_hint;
  if (firstHint) {
    tags.push(hintLabel(firstHint));
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

/* ─── Neuroscience-based metric interpretation ─── */

export type MetricType = "attention" | "load" | "novelty";

export interface MetricLevel {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

/**
 * 뇌과학 기반 구간 레이블
 *
 * Attention: EEG Engagement Index (Beta/(Alpha+Theta)) 관점
 * Load: Cognitive Load Theory (Sweller) + Inverted-U 모델
 * Novelty: Predictive Coding (Friston) + Prediction Error 관점
 */
export function metricLevel(value: number, metric: MetricType): MetricLevel {
  if (metric === "attention") {
    if (value >= 85) return { label: "최고 집중", description: "설명을 밀착 추적하는 중이에요", color: "var(--primary)", bgColor: "rgba(255,107,0,0.12)" };
    if (value >= 70) return { label: "밀착 참여", description: "설명에 능동적으로 반응하고 있어요", color: "var(--primary-hover)", bgColor: "rgba(229,95,0,0.10)" };
    if (value >= 50) return { label: "능동 추적", description: "흐름을 따라가고 있는 적절한 수준", color: "var(--grey-700)", bgColor: "rgba(51,65,85,0.08)" };
    if (value >= 25) return { label: "수동 수신", description: "듣고 있으나 깊은 처리가 약해요", color: "var(--grey-500)", bgColor: "rgba(100,116,139,0.08)" };
    return { label: "이탈 위험", description: "집중이 풀리고 있을 가능성이 높아요", color: "var(--grey-500)", bgColor: "rgba(100,116,139,0.10)" };
  }

  if (metric === "load") {
    if (value >= 85) return { label: "과부하", description: "정보가 너무 많아 처리 한계에 가까워요", color: "var(--primary-hover)", bgColor: "rgba(229,95,0,0.12)" };
    if (value >= 70) return { label: "높은 밀도", description: "정보 밀도가 높아 부하가 커지는 중", color: "var(--primary)", bgColor: "rgba(255,107,0,0.10)" };
    if (value >= 45) return { label: "최적 도전", description: "적절한 어려움 — 학습에 가장 좋은 구간", color: "var(--grey-800)", bgColor: "rgba(17,17,17,0.05)" };
    if (value >= 25) return { label: "여유", description: "쉬운 내용 — 부하가 낮은 구간", color: "var(--grey-600)", bgColor: "rgba(71,85,105,0.08)" };
    return { label: "너무 쉬움", description: "자극이 부족해 깊은 학습이 어려워요", color: "var(--grey-500)", bgColor: "rgba(100,116,139,0.08)" };
  }

  // novelty
  if (value >= 85) return { label: "맥락 끊김", description: "변화가 너무 커서 혼란이 올 수 있어요", color: "var(--primary-hover)", bgColor: "rgba(229,95,0,0.12)" };
  if (value >= 70) return { label: "급변", description: "큰 변화 — 잘 연결해주면 학습에 도움돼요", color: "var(--primary)", bgColor: "rgba(255,107,0,0.10)" };
  if (value >= 45) return { label: "전환 중", description: "새로운 내용 도입 — 생산적 자극 구간", color: "var(--primary)", bgColor: "rgba(255,107,0,0.10)" };
  if (value >= 20) return { label: "점진 변화", description: "안정적으로 흐름이 이어지는 중", color: "var(--grey-700)", bgColor: "rgba(51,65,85,0.08)" };
  return { label: "안정", description: "기존 흐름 유지 — 변화 없음", color: "var(--grey-500)", bgColor: "rgba(100,116,139,0.08)" };
}

/* ─── Learning Efficiency (Paas Instructional Efficiency) ─── */

export function learningEfficiency(attention: number, load: number): number {
  const attZ = (attention - 50) / 25;
  const loadZ = (load - 50) / 25;
  return (attZ - loadZ) / Math.SQRT2;
}

/* ─── Flow Zone (Csikszentmihalyi + Katahira 2018) ─── */

export function isFlowZone(attention: number, load: number, novelty: number): boolean {
  return attention >= 60 && load >= 35 && load <= 72 && novelty >= 25 && novelty <= 65;
}

/* ─── Mind-wandering Risk (Braboszcz & Delorme 2011) ─── */

export function mindWanderingRisk(attention: number, load: number): "low" | "moderate" | "high" {
  if (attention < 25 && load < 20) return "high";
  if (attention < 35 && load < 35) return "moderate";
  return "low";
}

/* ─── Lecture-relative percentile normalization ─── */

export interface LectureStats {
  attention: { p25: number; p50: number; p75: number };
  load: { p25: number; p50: number; p75: number };
  novelty: { p25: number; p50: number; p75: number };
}

/** 강의 전체 프레임에서 사분위수 계산 */
export function computeLectureStats(frames: Array<{ attention_display: number; load_display: number; novelty_display: number }>): LectureStats {
  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * p);
    return sorted[Math.min(idx, sorted.length - 1)];
  };
  const attn = frames.map((f) => f.attention_display);
  const load = frames.map((f) => f.load_display);
  const nov = frames.map((f) => f.novelty_display);
  return {
    attention: { p25: percentile(attn, 0.25), p50: percentile(attn, 0.5), p75: percentile(attn, 0.75) },
    load: { p25: percentile(load, 0.25), p50: percentile(load, 0.5), p75: percentile(load, 0.75) },
    novelty: { p25: percentile(nov, 0.25), p50: percentile(nov, 0.5), p75: percentile(nov, 0.75) },
  };
}

/** 절대값을 강의 내 상대 위치(0~100 백분위수 기준)로 변환 */
function toRelative(value: number, stat: { p25: number; p50: number; p75: number }): number {
  const iqr = Math.max(1, stat.p75 - stat.p25);
  return Math.max(0, Math.min(100, ((value - stat.p25) / iqr) * 50 + 25));
}

/* ─── Pattern Combo Interpretation ─── */

export interface MetricComboInterpretation {
  pattern: string;
  diagnosis: string;
  suggestion: string;
  severity: "success" | "info" | "caution" | "warning";
}

/**
 * 강의별 상대 백분위수 기반 콤보 해석.
 * stats가 없으면 절대값 기반 fallback.
 */
export function interpretMetricCombo(
  attention: number,
  load: number,
  novelty: number,
  stats?: LectureStats,
): MetricComboInterpretation {
  // 상대 위치 계산 (stats가 있으면 강의 내 백분위수, 없으면 원본 값 사용)
  const rA = stats ? toRelative(attention, stats.attention) : attention;
  const rL = stats ? toRelative(load, stats.load) : load;
  const rN = stats ? toRelative(novelty, stats.novelty) : novelty;

  // 몰입 구간: 참여도 상위, 부하 중간, 변화 적절
  if (rA >= 60 && rL >= 30 && rL <= 75 && rN >= 20 && rN <= 70) {
    return {
      pattern: "몰입 구간",
      diagnosis: "참여도 높고 부하가 적절한 최적 학습 구간이에요.",
      suggestion: "이 패턴을 유지하세요. 지금의 설명 속도와 깊이가 잘 맞고 있어요.",
      severity: "success",
    };
  }
  // 과부하 위험: 부하 최상위
  if (rL >= 80 && rA >= 40) {
    return {
      pattern: "과부하 위험",
      diagnosis: "반응은 있지만 정보 밀도가 이 강의 기준으로 최고 수준이에요.",
      suggestion: "속도를 줄이거나 중간 요약을 넣어보세요.",
      severity: "warning",
    };
  }
  // 이탈 위험: 참여도 최하위 + 부하도 낮음
  if (rA < 20 && rL < 30) {
    return {
      pattern: "이탈 위험",
      diagnosis: "집중과 부하가 모두 이 강의에서 가장 낮은 수준이에요.",
      suggestion: "질문이나 실습을 넣어 참여를 유도해보세요.",
      severity: "warning",
    };
  }
  // 혼란 전환: 변화 최상위 + 참여 하위
  if (rN >= 75 && rA < 45) {
    return {
      pattern: "혼란 전환",
      diagnosis: "설명 축이 크게 바뀌었는데 수강자가 놓치고 있어요.",
      suggestion: "'지금부터는...' 같은 명시적 전환 안내를 넣어보세요.",
      severity: "caution",
    };
  }
  // 밀착 추적: 참여 상위 + 부하 상위 + 변화 낮음
  if (rA >= 65 && rL >= 55 && rN < 40) {
    return {
      pattern: "밀착 추적",
      diagnosis: "밀도는 높지만 수강자가 잘 따라가고 있어요.",
      suggestion: "흐름을 유지하되 2-3분 안에 중간 정리를 한 번 넣어주면 더 좋아요.",
      severity: "info",
    };
  }
  // 예시 부족: 부하 상위 + 참여 하위
  if (rL >= 70 && rA < 35) {
    return {
      pattern: "예시 부족",
      diagnosis: "정보 밀도는 높은데 따라가지 못하고 있어요.",
      suggestion: "구체적 예시나 단계적 풀이를 추가해보세요.",
      severity: "caution",
    };
  }
  // 지루함 위험: 변화 최하위 + 참여 하위
  if (rN < 20 && rA < 35) {
    return {
      pattern: "지루함 위험",
      diagnosis: "변화가 적고 수강자 관심이 떨어지는 구간이에요.",
      suggestion: "반례를 제시하거나 토론 질문으로 참여를 유도해보세요.",
      severity: "caution",
    };
  }
  // 상승 구간: 참여 상위
  if (rA >= 70) {
    return {
      pattern: "집중 상승",
      diagnosis: "수강자의 참여가 이 강의에서 높은 수준이에요.",
      suggestion: "",
      severity: "info",
    };
  }
  // 변화 감지: 변화 상위
  if (rN >= 65) {
    return {
      pattern: "전환 감지",
      diagnosis: "설명 흐름이 바뀌고 있어요. 새로운 내용 도입 구간이에요.",
      suggestion: "전환 후 핵심을 한 번 짚어주면 효과적이에요.",
      severity: "info",
    };
  }
  return {
    pattern: "일반 흐름",
    diagnosis: "이 강의 기준으로 평균적인 흐름이 이어지는 구간이에요.",
    suggestion: "",
    severity: "info",
  };
}

/* ─── Segment Health Score (Inverted-U model) ─── */

export interface SegmentHealth {
  score: number;
  color: string;
  label: string;
}

export function segmentHealthScore(segment: SimulationSegment): SegmentHealth {
  const { attention_proxy: a, load_proxy: l, novelty_proxy: n } = segment.proxies;
  let risk = 0;
  // Load: Inverted-U — optimal 45-70
  if (l >= 85) risk += 35;
  else if (l >= 70) risk += 20;
  else if (l < 25) risk += 15;
  // Attention low
  if (a < 25) risk += 30;
  else if (a < 40) risk += 15;
  // Novelty extreme
  if (n >= 85) risk += 20;
  else if (n >= 70) risk += 10;

  const health = Math.max(0, 100 - risk);
  if (health >= 65) return { score: health, color: "var(--color-flow)", label: "양호" };
  if (health >= 35) return { score: health, color: "var(--color-caution)", label: "주의" };
  return { score: health, color: "var(--color-error)", label: "위험" };
}

/* ─── ROI Response Level (비전문가 친화) ─── */

export function roiResponseLevel(absResponse: number | undefined): { label: string; bar: number } {
  const v = absResponse ?? 0;
  if (v >= 0.10) return { label: "강함", bar: 90 };
  if (v >= 0.07) return { label: "뚜렷함", bar: 70 };
  if (v >= 0.04) return { label: "보통", bar: 50 };
  if (v >= 0.02) return { label: "약함", bar: 30 };
  return { label: "미미함", bar: 10 };
}

/* ─── ROI Neuroscience Hint (교육 신경과학 기반) ─── */

export function roiNeuroscienceHint(hint: RoiMetricSummary["functional_hint"]): string {
  switch (hint) {
    case "auditory_or_language_related":
      return "측두엽 Wernicke 영역 유사 — 강의 언어를 듣고 의미를 처리하는 패턴이에요. 높으면 설명을 적극적으로 해석하는 중이에요.";
    case "frontal_control_or_action_related":
      return "전전두엽 DLPFC 유사 — 작업기억과 실행 기능이 활성화되는 패턴이에요. 복잡한 설명을 정리하거나 개념을 통합하는 중이에요.";
    case "visual_processing_related":
      return "후두엽 시각 처리 영역 — 슬라이드, 도표, 예시 화면 등 시각 정보를 처리하는 패턴이에요.";
    case "sensorimotor_or_attention_related":
      return "두정엽 주의 네트워크 (Posner 모델) — 주의 방향을 전환하거나 공간적/수리적 사고가 활성화되는 패턴이에요.";
    case "association_or_default_mode_related":
      return "기본 모드 네트워크(DMN) — 앞뒤 맥락을 연결하거나 자기 참조적 사고를 하는 패턴이에요. 과도하면 mind-wandering 가능성도 있어요.";
    default:
      return "전두-두정 영역의 전반적 각성 변화 — 지금 구간의 전반적 신경 활성 수준이 바뀌고 있어요.";
  }
}

/* ─── Line Heuristic Interpretation ─── */

export interface LineInterpretation {
  dominantSignal: string;
  microSummary: string;
  intensity: "low" | "mid" | "high";
}

export function interpretLineHeuristics(frame: LiveBrainFrame): LineInterpretation {
  const { heuristic_intensity: hi, heuristic_change_boost: hc, heuristic_timeline_emphasis: he } = frame;

  if (hc >= 0.72) return {
    dominantSignal: "전환",
    microSummary: "설명 축이 빠르게 바뀌는 줄이에요. 수강자의 주의 재정렬이 필요한 지점이에요.",
    intensity: "high",
  };
  if (hi >= 0.76) return {
    dominantSignal: "밀도",
    microSummary: "설명 밀도와 추적 반응이 함께 올라가는 줄이에요. 핵심 정보가 집중된 구간이에요.",
    intensity: "high",
  };
  if (he >= 0.72) return {
    dominantSignal: "핵심",
    microSummary: "이 줄이 현재 구간의 중심 포인트로 읽혀요. 강조 표시할 만한 위치에요.",
    intensity: "mid",
  };
  if (hi < 0.3 && hc < 0.3) return {
    dominantSignal: "이완",
    microSummary: "밀도와 변화가 모두 낮은 줄이에요. 이어가는 흐름 또는 쉬어가는 지점이에요.",
    intensity: "low",
  };
  return {
    dominantSignal: "연결",
    microSummary: "현재 흐름을 이어주는 연결부로 읽혀요.",
    intensity: "low",
  };
}

/* ─── Derived Metrics from Transcript Text ─── */

const ENGAGEMENT_PATTERNS = {
  question: /[?？]|인가요|할까요|되나요|보이죠|아시겠죠|맞죠|볼게요|보실래요|그렇죠|죠\s*$/,
  example: /예를\s*들|예를\s*들면|이런\s*경우|실제로|사례|가령/,
  encouragement: /잘\s*따라|좋습니다|맞아요|잘\s*했|잘했|괜찮|훌륭|대단/,
  elaboration: /즉[,\s]|다시\s*말하|정리하면|요약하면|한마디로|결론/,
  interactive: /해보세요|해봅시다|같이|한번|토론|질문|의견/,
  transition: /이제|그다음|다음|반대로|여기서|그러면|이번에는|한편|먼저|마지막으로/,
};

export interface SegmentDerivedMetrics {
  pacing: number;
  pacingLabel: string;
  engagementCue: number;
  engagementLabel: string;
  engagementBreakdown: Record<string, number>;
}

/** transcript segment에서 Pacing(리듬 변이)과 Engagement Cue(참여 유도 밀도) 계산 */
export function computeSegmentDerivedMetrics(
  lines: Array<{ text: string }>,
): SegmentDerivedMetrics {
  // Pacing: 문장 길이의 변이 계수 (CV)
  const lengths = lines.map((l) => l.text.length);
  const mean = lengths.reduce((s, v) => s + v, 0) / Math.max(1, lengths.length);
  const variance = lengths.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, lengths.length);
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const pacing = Math.min(100, cv * 120); // 0.83 CV → 100

  let pacingLabel: string;
  if (pacing >= 60) pacingLabel = "역동적";
  else if (pacing >= 35) pacingLabel = "적절한 리듬";
  else if (pacing >= 15) pacingLabel = "균일";
  else pacingLabel = "단조로움";

  // Engagement Cue: 각 패턴별 매칭 라인 수
  const breakdown: Record<string, number> = {};
  let totalCues = 0;
  for (const [key, pattern] of Object.entries(ENGAGEMENT_PATTERNS)) {
    const count = lines.filter((l) => pattern.test(l.text)).length;
    breakdown[key] = count;
    totalCues += count;
  }
  const engagementCue = Math.min(100, (totalCues / Math.max(1, lines.length)) * 100);

  let engagementLabel: string;
  if (engagementCue >= 50) engagementLabel = "적극 유도";
  else if (engagementCue >= 30) engagementLabel = "적절한 유도";
  else if (engagementCue >= 15) engagementLabel = "약한 유도";
  else engagementLabel = "유도 부족";

  return { pacing, pacingLabel, engagementCue, engagementLabel, engagementBreakdown: breakdown };
}

/* ─── ROI Functional Profile (뇌 영역별 기능 프로필) ─── */

/**
 * 6개 기능 카테고리별 활성도를 집계하여 "뇌 기능 프로필"을 만든다.
 * 단순 magnitude가 아니라 **어떤 영역에서** 반응이 강한지로 해석한다.
 *
 * 신경과학 근거:
 * - auditory/language (측두엽): Wernicke 영역 — 언어 이해, 의미 처리
 * - frontal/control (전전두엽): DLPFC — 작업기억, 실행 기능, 메타인지
 * - visual (후두엽): 시각 정보 처리
 * - sensorimotor/attention (두정엽): Posner 주의 네트워크 — 주의 전환
 * - association/DMN (기본 모드): 맥락 연결 or mind-wandering
 */

const FUNCTIONAL_CATEGORIES = [
  "auditory_or_language_related",
  "frontal_control_or_action_related",
  "visual_processing_related",
  "sensorimotor_or_attention_related",
  "association_or_default_mode_related",
] as const;

type FunctionalCategory = typeof FUNCTIONAL_CATEGORIES[number];

const CATEGORY_LABELS: Record<FunctionalCategory, string> = {
  auditory_or_language_related: "언어 처리",
  frontal_control_or_action_related: "실행 통제",
  visual_processing_related: "시각 처리",
  sensorimotor_or_attention_related: "주의 전환",
  association_or_default_mode_related: "맥락 연결",
};

const CATEGORY_DESCRIPTIONS: Record<FunctionalCategory, string> = {
  auditory_or_language_related: "강의 언어를 듣고 의미를 해석하는 영역 (측두엽 Wernicke)",
  frontal_control_or_action_related: "정보를 정리하고 개념을 통합하는 영역 (전전두엽 DLPFC)",
  visual_processing_related: "슬라이드나 시각 자료를 처리하는 영역 (후두엽)",
  sensorimotor_or_attention_related: "주의 방향을 전환하는 영역 (두정엽)",
  association_or_default_mode_related: "앞뒤 맥락을 연결하거나 내적 사고를 하는 영역 (DMN)",
};

export interface FunctionalProfile {
  /** 카테고리별 상대 활성도 (0~100, 강의 내 정규화) */
  categories: Array<{
    key: FunctionalCategory;
    label: string;
    description: string;
    value: number;
    isTop: boolean;
  }>;
  /** 가장 강한 카테고리의 해석 */
  dominantInterpretation: string;
  /** 프로필 패턴 해석 */
  profilePattern: string;
}

/** ROI 목록에서 기능 카테고리별 평균 활성도를 계산한다 */
export function computeFunctionalProfile(
  activeRois: RoiMetricSummary[] | undefined,
  changedRois: RoiMetricSummary[] | undefined,
): FunctionalProfile {
  const allRois = [...(activeRois ?? []), ...(changedRois ?? [])];

  // 카테고리별 mean_abs_response 집계
  const categoryValues = new Map<FunctionalCategory, number[]>();
  for (const cat of FUNCTIONAL_CATEGORIES) {
    categoryValues.set(cat, []);
  }
  for (const roi of allRois) {
    const cat = roi.functional_hint as FunctionalCategory;
    if (categoryValues.has(cat)) {
      const val = roi.mean_abs_response ?? roi.delta_abs_response ?? 0;
      categoryValues.get(cat)!.push(val);
    }
  }

  // 카테고리별 평균 + 정규화
  const rawScores = FUNCTIONAL_CATEGORIES.map((cat) => {
    const vals = categoryValues.get(cat) ?? [];
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  const maxScore = Math.max(...rawScores, 0.001);

  const categories = FUNCTIONAL_CATEGORIES.map((cat, i) => ({
    key: cat,
    label: CATEGORY_LABELS[cat],
    description: CATEGORY_DESCRIPTIONS[cat],
    value: Math.round((rawScores[i] / maxScore) * 100),
    isTop: false,
  }));

  // 상위 2개 표시
  const sorted = [...categories].sort((a, b) => b.value - a.value);
  for (const top of sorted.slice(0, 2)) {
    const found = categories.find((c) => c.key === top.key);
    if (found) found.isTop = true;
  }

  // 프로필 패턴 해석
  const top1 = sorted[0];
  const top2 = sorted[1];
  const bottom = sorted[sorted.length - 1];

  let dominantInterpretation: string;
  let profilePattern: string;

  if (top1.key === "auditory_or_language_related" && top2.key === "frontal_control_or_action_related") {
    dominantInterpretation = "설명을 듣고 적극적으로 정리하는 패턴이에요. 능동적 이해가 일어나고 있어요.";
    profilePattern = "능동적 이해";
  } else if (top1.key === "auditory_or_language_related" && (top2.key === "association_or_default_mode_related" || top2.value < 30)) {
    dominantInterpretation = "설명을 듣고는 있지만 깊은 처리 없이 수동적으로 받아들이는 패턴이에요.";
    profilePattern = "수동적 청취";
  } else if (top1.key === "frontal_control_or_action_related") {
    dominantInterpretation = "작업기억과 실행 기능이 가장 활발해요. 복잡한 개념을 정리하거나 비교 판단하는 중이에요.";
    profilePattern = "인지적 통합";
  } else if (top1.key === "association_or_default_mode_related") {
    dominantInterpretation = "기본 모드 네트워크가 가장 활발해요. 맥락을 연결하는 깊은 사고이거나, 주의가 분산될 가능성이 있어요.";
    profilePattern = "맥락 연결 / 이탈 가능";
  } else if (top1.key === "sensorimotor_or_attention_related") {
    dominantInterpretation = "주의 전환 네트워크가 활발해요. 새로운 내용에 주의를 재정렬하는 중이에요.";
    profilePattern = "주의 재정렬";
  } else if (top1.key === "visual_processing_related") {
    dominantInterpretation = "시각 처리 영역이 가장 활발해요. 화면 자료나 도표에 집중하는 구간이에요.";
    profilePattern = "시각 정보 처리";
  } else {
    dominantInterpretation = `${top1.label} 영역이 가장 활발하고, ${top2.label} 영역이 그 다음이에요.`;
    profilePattern = `${top1.label} 우세`;
  }

  // 하위 영역 보충
  if (bottom.value < 10) {
    dominantInterpretation += ` ${bottom.label} 영역은 거의 반응하지 않고 있어요.`;
  }

  return { categories, dominantInterpretation, profilePattern };
}

/* ─── Hemisphere Balance (반구 활성도 비율) ─── */

export interface HemisphereBalance {
  left: number;
  right: number;
  dominant: "left" | "right" | "balanced";
  label: string;
}

export function hemisphereBalance(segment: SimulationSegment): HemisphereBalance {
  const rois = segment.roi_insights?.top_active_rois ?? [];
  const leftRois = rois.filter((r) => r.hemisphere === "left");
  const rightRois = rois.filter((r) => r.hemisphere === "right");
  const leftAvg = leftRois.length
    ? leftRois.reduce((s, r) => s + (r.mean_abs_response ?? 0), 0) / leftRois.length
    : 0;
  const rightAvg = rightRois.length
    ? rightRois.reduce((s, r) => s + (r.mean_abs_response ?? 0), 0) / rightRois.length
    : 0;
  const total = leftAvg + rightAvg || 1;
  const leftPct = Math.round((leftAvg / total) * 100);
  const rightPct = 100 - leftPct;
  const dominant: "left" | "right" | "balanced" =
    Math.abs(leftPct - 50) < 8 ? "balanced" : leftPct > 50 ? "left" : "right";
  const label =
    dominant === "balanced"
      ? "균형"
      : dominant === "left"
        ? "좌뇌 우세 (분석적)"
        : "우뇌 우세 (직관적)";
  return { left: leftPct, right: rightPct, dominant, label };
}

/* ─── Load Recovery (인지 부하 회복도) ─── */

export interface LoadRecoveryState {
  recovering: boolean;
  speed: "fast" | "slow" | "none";
  label: string;
}

export function loadRecovery(
  frames: Array<{ load_display: number }>,
  currentIndex: number,
): LoadRecoveryState {
  const start = Math.max(0, currentIndex - 5);
  const window = frames.slice(start, currentIndex + 1);
  if (window.length < 2) return { recovering: false, speed: "none", label: "측정 불가" };
  const peak = Math.max(...window.map((f) => f.load_display));
  if (peak < 70) return { recovering: false, speed: "none", label: "부하 안정" };
  const current = frames[currentIndex]?.load_display ?? 0;
  const drop = peak - current;
  if (drop < 5) return { recovering: false, speed: "none", label: "부하 지속" };
  return {
    recovering: true,
    speed: drop > 20 ? "fast" : "slow",
    label: drop > 20 ? "빠른 회복" : "느린 회복",
  };
}

/* ─── Segment Similarity (세그먼트 전환 유사도) ─── */

export function segmentSimilarity(
  segments: SimulationSegment[],
  currentIndex: number,
): number {
  if (currentIndex === 0 || !segments[currentIndex - 1]) return 1;
  const prev = segments[currentIndex - 1].proxies;
  const curr = segments[currentIndex].proxies;
  const dot =
    prev.attention_proxy * curr.attention_proxy +
    prev.load_proxy * curr.load_proxy +
    prev.novelty_proxy * curr.novelty_proxy;
  const magPrev = Math.sqrt(
    prev.attention_proxy ** 2 + prev.load_proxy ** 2 + prev.novelty_proxy ** 2,
  );
  const magCurr = Math.sqrt(
    curr.attention_proxy ** 2 + curr.load_proxy ** 2 + curr.novelty_proxy ** 2,
  );
  return magPrev && magCurr ? Math.round((dot / (magPrev * magCurr)) * 100) / 100 : 1;
}

/* ─── ROI Prescription (ROI 기반 자동 처방) ─── */

export interface RoiPrescription {
  prescription: string;
  urgency: "info" | "caution" | "warning";
}

export function roiPrescription(profile: FunctionalProfile): RoiPrescription {
  const cats = profile.categories;
  const top1 = cats[0];
  const top2 = cats[1];

  // DMN 최고 → 이탈 신호
  if (top1?.key === "association_or_default_mode_related" && top1.value > 40) {
    return {
      prescription:
        "학생들의 주의가 내용에서 벗어나고 있을 수 있어요. 핵심을 2-3문장으로 단순화하거나 '여기서 당신이라면?' 같은 개인적 질문으로 재진입을 유도하세요.",
      urgency: "warning",
    };
  }

  // 언어만 높고 실행 낮음 → 수동적 청취
  if (
    top1?.key === "auditory_or_language_related" &&
    top1.value > 40 &&
    cats.find((c) => c.key === "frontal_control_or_action_related")?.value
      ? (cats.find((c) => c.key === "frontal_control_or_action_related")?.value ?? 0) < 20
      : true
  ) {
    return {
      prescription:
        "듣고는 있지만 깊이 처리하지 않는 상태예요. 핵심 개념의 예시를 추가하거나, '방금 배운 걸 한 문장으로 정리하면?' 같은 메타인지 질문을 넣어보세요.",
      urgency: "caution",
    };
  }

  // 시각 과부하 (시각 + 실행 모두 높음)
  if (
    cats.find((c) => c.key === "visual_processing_related")?.isTop &&
    cats.find((c) => c.key === "frontal_control_or_action_related")?.isTop
  ) {
    return {
      prescription:
        "시각 정보와 인지 부하가 동시에 높아요. 슬라이드당 텍스트를 줄이거나, 복잡한 다이어그램을 단계별로 보여주세요.",
      urgency: "caution",
    };
  }

  // 주의 전환 높음 → 혼란 가능
  if (top1?.key === "sensorimotor_or_attention_related" && top1.value > 45) {
    return {
      prescription:
        "주의가 자주 전환되는 구간이에요. 시각 자료를 순차적으로 드러내거나, 목소리 톤으로 리듬감을 만들어 안정시키세요.",
      urgency: "caution",
    };
  }

  // 실행 통제 최고 → 능동적 통합 (좋음)
  if (top1?.key === "frontal_control_or_action_related" && top1.value > 35) {
    return {
      prescription:
        "학생들이 적극적으로 개념을 정리하고 통합하는 중이에요. 이 흐름을 유지하세요.",
      urgency: "info",
    };
  }

  // 기본
  return {
    prescription: "현재 구간은 일반적인 학습 패턴을 보이고 있어요.",
    urgency: "info",
  };
}

/* ─── ROI Direct Interpretation (A-grade, Destrieux atlas) ─── */

/**
 * Destrieux ROI를 8가지 뇌 기능 카테고리로 분류.
 * 기존 5카테고리(functional_hint)보다 세밀한 분류.
 * 각 카테고리는 수십 년간의 fMRI/lesion 연구에 기반.
 */
export type BrainFunction =
  | "auditory"    // 청각 처리 (Heschl, STG)
  | "language"    // 언어 이해 (Wernicke, MTG, IFG)
  | "executive"   // 실행 기능/작업기억 (DLPFC, SFG)
  | "attention"   // 주의 집중 (SPL, IPS, SMG)
  | "visual"      // 시각 처리 (V1, cuneus, occipital)
  | "memory"      // 기억 부호화 (parahippocampal, fusiform, angular)
  | "conflict"    // 인지 갈등/현저성 (ACC, insula)
  | "dmn";        // 내적 사고/이탈 (precuneus, PCC)

const ROI_TO_FUNCTION: Record<string, { fn: BrainFunction; label: string; interpretation: string }> = {
  // 청각
  S_temporal_transverse:     { fn: "auditory",   label: "청각 피질",      interpretation: "음성 자극에 반응 중 — 강의 음성을 처리하고 있어요" },
  "G_temp_sup-G_T_transv":  { fn: "auditory",   label: "1차 청각피질",   interpretation: "소리의 시간적 특성을 분석하고 있어요" },
  // 언어 이해
  "G_temp_sup-Lateral":     { fn: "language",    label: "언어 이해",      interpretation: "설명의 언어적 내용을 따라가고 있어요 (Wernicke 영역)" },
  "G_temp_sup-Plan_tempo":  { fn: "language",    label: "음운 처리",      interpretation: "음운 구조를 분석 중 — 새로운 용어 등장 시 상승" },
  "G_temp_sup-Plan_polar":  { fn: "language",    label: "운율 처리",      interpretation: "화자의 톤/억양 변화에 반응하고 있어요" },
  S_temporal_sup:            { fn: "language",    label: "의미 통합",      interpretation: "말의 의미를 적극적으로 해석하고 있어요" },
  G_temporal_middle:         { fn: "language",    label: "개념 처리",      interpretation: "개념/용어의 의미를 처리하고 있어요 (중측두회)" },
  G_temporal_inf:            { fn: "language",    label: "의미 기억",      interpretation: "시각적 개념 이미지나 의미 기억을 연결 중이에요" },
  Pole_temporal:             { fn: "language",    label: "서사 이해",      interpretation: "이야기의 흐름을 연결하고 있어요 (측두극)" },
  // 실행 기능
  "G_front_inf-Opercular":  { fn: "executive",   label: "구문 분석",      interpretation: "문장 구조를 분석하거나 내적으로 정리하고 있어요 (Broca BA44)" },
  "G_front_inf-Triangul":   { fn: "executive",   label: "의미 선택",      interpretation: "여러 의미 중 적절한 해석을 선택하고 있어요 (Broca BA45)" },
  G_front_middle:            { fn: "executive",   label: "작업기억",       interpretation: "정보를 머릿속에 유지하며 조작하고 있어요 (DLPFC)" },
  G_front_sup:               { fn: "executive",   label: "계획/조직화",    interpretation: "정보를 능동적으로 조직화하고 계획하고 있어요" },
  G_and_S_frontomargin:      { fn: "executive",   label: "추상적 통합",    interpretation: "여러 정보를 동시에 비교·통합하고 있어요 (전두극)" },
  G_and_S_transv_frontopol:  { fn: "executive",   label: "메타인지",       interpretation: "자기 이해를 점검하거나 대안적 해석을 탐색하고 있어요" },
  // 주의
  G_parietal_sup:            { fn: "attention",   label: "하향식 주의",    interpretation: "주의를 의도적으로 집중하고 있어요 (상두정소엽)" },
  S_intrapariet_and_P_trans: { fn: "attention",   label: "주의 전환",      interpretation: "주의를 전환하거나 수량 정보를 처리하고 있어요 (IPS)" },
  "G_pariet_inf-Supramar":   { fn: "attention",   label: "음운 유지",      interpretation: "들은 정보를 단기 기억에 유지하며 처리 중이에요 (연상회)" },
  // 시각
  S_calcarine:               { fn: "visual",      label: "1차 시각",       interpretation: "시각 자극이 강하게 입력되고 있어요 (V1)" },
  G_cuneus:                  { fn: "visual",      label: "시각 처리",      interpretation: "기본 시각 패턴을 처리하고 있어요" },
  G_occipital_sup:           { fn: "visual",      label: "공간 시각",      interpretation: "시각적 공간 배치를 처리하고 있어요 (다이어그램/레이아웃)" },
  G_occipital_middle:        { fn: "visual",      label: "형태 인식",      interpretation: "시각적 형태/패턴을 분석하고 있어요" },
  G_and_S_occipital_inf:     { fn: "visual",      label: "객체 식별",      interpretation: "시각적 객체를 식별하고 있어요" },
  Pole_occipital:            { fn: "visual",      label: "중심시야",       interpretation: "화면 중앙을 주시하며 세밀하게 보고 있어요" },
  // 기억
  "G_oc-temp_lat-fusifor":   { fn: "memory",      label: "글자/얼굴 인식", interpretation: "텍스트나 글자를 시각적으로 처리하고 있어요 (방추회)" },
  "G_oc-temp_med-Lingual":   { fn: "memory",      label: "시각 기억",      interpretation: "시각적 세부사항을 기억에 연결하고 있어요 (설회)" },
  "G_oc-temp_med-Parahip":   { fn: "memory",      label: "기억 부호화",    interpretation: "장면/맥락 정보를 기억에 부호화하고 있어요 (해마방회)" },
  "G_pariet_inf-Angular":    { fn: "memory",      label: "의미 통합 허브", interpretation: "여러 정보를 종합하여 이해하고 있어요 (각회)" },
  // 인지 갈등
  "G_and_S_cingul-Ant":      { fn: "conflict",    label: "갈등 감지",      interpretation: "예상과 다른 정보를 감지했어요 — 인지적 갈등 상태 (ACC)" },
  "G_and_S_cingul-Mid-Ant":  { fn: "conflict",    label: "인지 노력",      interpretation: "인지적 노력을 기울이고 있어요" },
  G_insular_short:           { fn: "conflict",    label: "현저성 감지",    interpretation: "감정적으로 현저한 자극에 반응하고 있어요 (전방 도피질)" },
  // DMN (내적 사고/이탈)
  G_precuneus:               { fn: "dmn",         label: "자기참조/심상",  interpretation: "과거 경험과 연결하거나 시각적으로 상상하고 있어요 (쐐기앞소엽)" },
  "G_cingul-Post-dorsal":    { fn: "dmn",         label: "내적 성찰",      interpretation: "내적 성찰 중이거나 주의가 이탈하고 있을 수 있어요 (PCC)" },
  "G_cingul-Post-ventral":   { fn: "dmn",         label: "기억 인출",      interpretation: "기억을 인출하거나 공간 기억을 처리하고 있어요" },
};

/** ROI 하나를 직접 해석 (A등급) */
export function interpretRoiDirectly(roi: RoiMetricSummary): {
  function: BrainFunction;
  label: string;
  interpretation: string;
} | null {
  const entry = ROI_TO_FUNCTION[roi.roi_name];
  if (!entry) return null;
  return { function: entry.fn, label: entry.label, interpretation: entry.interpretation };
}

/** Segment의 활성 ROI를 직접 해석하여 상위 3개 반환 */
export function interpretTopRois(segment: SimulationSegment): Array<{
  roiName: string;
  hemisphere: string;
  response: number;
  function: BrainFunction;
  label: string;
  interpretation: string;
}> {
  const rois = segment.roi_insights?.top_active_rois ?? [];
  return rois
    .map((roi) => {
      const info = ROI_TO_FUNCTION[roi.roi_name];
      if (!info) return null;
      return {
        roiName: roi.roi_display_name,
        hemisphere: roi.hemisphere,
        response: roi.mean_abs_response ?? 0,
        function: info.fn,
        label: info.label,
        interpretation: info.interpretation,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 3);
}

/** 8카테고리 뇌 기능 프로필 (A등급 ROI 기반) */
export interface BrainProfile8 {
  categories: Array<{
    key: BrainFunction;
    label: string;
    value: number; // 0-100 정규화
    isTop: boolean;
  }>;
  dominantFunction: BrainFunction;
  interpretation: string;
}

const FUNCTION_LABELS: Record<BrainFunction, string> = {
  auditory: "청각 처리",
  language: "언어 이해",
  executive: "실행 기능",
  attention: "주의 집중",
  visual: "시각 처리",
  memory: "기억 부호화",
  conflict: "인지 갈등",
  dmn: "내적 사고",
};

const FUNCTION_INTERPRETATIONS: Record<BrainFunction, string> = {
  auditory: "음성 자극을 적극적으로 처리하고 있어요",
  language: "언어적 설명을 따라가며 의미를 해석하고 있어요",
  executive: "정보를 능동적으로 정리하고 통합하고 있어요 — 가장 이상적인 학습 상태",
  attention: "주의를 의도적으로 집중하거나 전환하고 있어요",
  visual: "시각 자료를 처리하고 있어요",
  memory: "정보를 기억에 부호화하거나 기존 지식과 연결하고 있어요",
  conflict: "인지적 갈등이 감지됐어요 — 혼란이거나 깊은 사고일 수 있어요",
  dmn: "내적 사고 중이에요 — 맥락 연결이거나 주의 이탈 가능성",
};

export function computeBrainProfile8(segment: SimulationSegment): BrainProfile8 {
  const allRois = [
    ...(segment.roi_insights?.top_active_rois ?? []),
    ...(segment.roi_insights?.top_changed_rois ?? []),
  ];

  const sums: Record<BrainFunction, number> = {
    auditory: 0, language: 0, executive: 0, attention: 0,
    visual: 0, memory: 0, conflict: 0, dmn: 0,
  };
  const counts: Record<BrainFunction, number> = { ...sums };

  for (const roi of allRois) {
    const info = ROI_TO_FUNCTION[roi.roi_name];
    if (!info) continue;
    const val = roi.mean_abs_response ?? 0;
    sums[info.fn] += val;
    counts[info.fn] += 1;
  }

  // 평균값 계산 후 0-100 정규화
  const avgs: Record<BrainFunction, number> = {} as any;
  let maxAvg = 0;
  for (const fn of Object.keys(sums) as BrainFunction[]) {
    avgs[fn] = counts[fn] > 0 ? sums[fn] / counts[fn] : 0;
    maxAvg = Math.max(maxAvg, avgs[fn]);
  }

  const categories = (Object.keys(sums) as BrainFunction[]).map((fn) => ({
    key: fn,
    label: FUNCTION_LABELS[fn],
    value: maxAvg > 0 ? Math.round((avgs[fn] / maxAvg) * 100) : 0,
    isTop: false,
  }));

  // 상위 2개 isTop
  categories.sort((a, b) => b.value - a.value);
  if (categories[0]) categories[0].isTop = true;
  if (categories[1]) categories[1].isTop = true;

  const dominant = categories[0]?.key ?? "language";

  return {
    categories,
    dominantFunction: dominant,
    interpretation: FUNCTION_INTERPRETATIONS[dominant],
  };
}

/* ─── TRIBE Response Intensity (전체 ROI 평균 반응 강도, 0~10 척도) ─── */

export function tribeResponseIntensity(segment: SimulationSegment): number {
  const rois = segment.roi_insights?.top_active_rois ?? [];
  if (rois.length === 0) return 0;
  const avg = rois.reduce((s, r) => s + (r.mean_abs_response ?? 0), 0) / rois.length;
  return Math.min(10, avg * 100); // 0.10 → 10
}

/* ─── TRIBE Response Change (전체 ROI 평균 변화량, 0~10 척도) ─── */

export function tribeResponseChange(segment: SimulationSegment): number {
  const rois = segment.roi_insights?.top_changed_rois ?? [];
  if (rois.length === 0) return 0;
  const avg = rois.reduce((s, r) => s + (r.delta_abs_response ?? 0), 0) / rois.length;
  return Math.min(10, avg * 100);
}
