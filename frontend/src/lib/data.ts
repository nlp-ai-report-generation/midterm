import type {
  LectureMetadata,
  EvaluationResult,
  TranscriptStats,
  SpeakerDistribution,
  FillerWordStats,
  InteractionMetrics,
  CurriculumEntry,
  ChunkInfo,
  ChecklistItem,
} from "@/types/evaluation";
import type {
  BrainIconFramePayload,
  LiveBrainFramePayload,
  LiveTimelineFramePayload,
  SegmentColorPayload,
  SimulationResult,
  TranscriptBrowserData,
} from "@/types/simulation";

const DATA_BASE = `${import.meta.env.BASE_URL}data`;
const BASE_DATA_PREFIX = DATA_BASE.replace(/^\//, "");

function normalizeDataPath(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  if (path.startsWith(DATA_BASE)) return path.slice(DATA_BASE.length).replace(/^\/+/, "");
  if (path.startsWith(`/${BASE_DATA_PREFIX}`)) return path.slice(BASE_DATA_PREFIX.length + 1).replace(/^\/+/, "");
  if (path.startsWith("/data/")) return path.replace(/^\/data\//, "");
  if (path.startsWith("data/")) return path.replace(/^data\//, "");
  return path.replace(/^\/+/, "");
}

export function resolveDataAssetPath(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  return `${DATA_BASE}/${normalizeDataPath(path)}`;
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(resolveDataAssetPath(path));
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

/** 전체 강의 메타데이터 목록 */
export async function getAllLectures(): Promise<LectureMetadata[]> {
  return fetchJSON<LectureMetadata[]>("metadata.json");
}

/** 체크리스트 항목 (18개) */
export async function getChecklist(): Promise<{ weights: Record<string, number>; items: ChecklistItem[] }> {
  return fetchJSON("checklist.json");
}

/** 개별 강의 평가 결과 */
export async function getEvaluation(date: string): Promise<EvaluationResult> {
  return fetchJSON<EvaluationResult>(`evaluations/${date}.json`);
}

/** 전체 평가 결과 (모든 강의) */
export async function getAllEvaluations(): Promise<EvaluationResult[]> {
  const lectures = await getAllLectures();
  const results = await Promise.all(
    lectures.map((l) => getEvaluation(l.date).catch(() => null))
  );
  return results.filter((r): r is EvaluationResult => r !== null);
}

/* ── 멀티 모델 비교 ── */

export type ModelKey = "gpt4o-mini" | "opus" | "sonnet";

export const MODEL_LABELS: Record<ModelKey, string> = {
  "gpt4o-mini": "GPT-4o mini",
  "opus": "Claude Opus",
  "sonnet": "Claude Sonnet",
};

const MODEL_DIRS: Record<ModelKey, string> = {
  "gpt4o-mini": "evaluations",
  "opus": "evaluations-opus",
  "sonnet": "evaluations-sonnet",
};

export async function getEvaluationByModel(date: string, model: ModelKey): Promise<EvaluationResult> {
  return fetchJSON<EvaluationResult>(`${MODEL_DIRS[model]}/${date}.json`);
}

export async function getAllEvaluationsByModel(model: ModelKey): Promise<EvaluationResult[]> {
  const lectures = await getAllLectures();
  const results = await Promise.all(
    lectures.map((l) => getEvaluationByModel(l.date, model).catch(() => null))
  );
  return results.filter((r): r is EvaluationResult => r !== null);
}

/** EDA: 스크립트 통계 */
export async function getTranscriptStats(): Promise<TranscriptStats[]> {
  return fetchJSON<TranscriptStats[]>("eda/transcript_stats.json");
}

/** EDA: 화자 분포 — 새 형식(배열) → 기존 형식(Record) 변환 */
export async function getSpeakerDistribution(): Promise<SpeakerDistribution[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await fetchJSON<any[]>("eda/speaker_distribution.json");
  return raw.map((item) => {
    // 새 형식: speakers가 배열인 경우
    if (Array.isArray(item.speakers)) {
      const speakersMap: Record<string, number> = {};
      for (const s of item.speakers) {
        speakersMap[s.role || s.speaker_id] = s.line_count;
      }
      return { date: item.date, speakers: speakersMap };
    }
    // 기존 형식: speakers가 Record인 경우
    return item as SpeakerDistribution;
  });
}

/** EDA: 습관어 통계 — 새 형식 → 기존 형식 변환 */
export async function getFillerWords(): Promise<FillerWordStats[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await fetchJSON<any[]>("eda/filler_words.json");
  return raw.map((item) => ({
    date: item.date,
    words: item.filler_counts ?? item.words ?? {},
    total: item.total_fillers ?? item.total ?? 0,
  }));
}

/** EDA: 상호작용 지표 */
export async function getInteractionMetrics(): Promise<InteractionMetrics[]> {
  return fetchJSON<InteractionMetrics[]>("eda/interaction_metrics.json");
}

/** EDA: 커리큘럼 흐름 */
export async function getCurriculumFlow(): Promise<CurriculumEntry[]> {
  return fetchJSON<CurriculumEntry[]>("eda/curriculum_flow.json");
}

/** 전처리: 청킹 결과 */
export async function getChunks(date: string): Promise<ChunkInfo[]> {
  return fetchJSON<ChunkInfo[]>(`preprocessing/${date}_chunks.json`);
}

/* ── TRIBE v2 시뮬레이션 ── */

export async function getSimulation(date: string): Promise<SimulationResult> {
  return fetchJSON<SimulationResult>(`simulations/${date}.json`);
}

export async function getSimulationTranscript(date: string): Promise<TranscriptBrowserData> {
  return fetchJSON<TranscriptBrowserData>(`simulations/${date}-transcript.json`);
}

export async function getSimulationColors(path: string): Promise<SegmentColorPayload> {
  return fetchJSON<SegmentColorPayload>(path);
}

export async function getSimulationSummaryVisual(path: string): Promise<BrainIconFramePayload> {
  return fetchJSON<BrainIconFramePayload>(path);
}

export async function getSimulationLiveFrames(path: string): Promise<LiveBrainFramePayload> {
  return fetchJSON<LiveBrainFramePayload>(path);
}

export async function getSimulationTimelineFrames(path: string): Promise<LiveTimelineFramePayload> {
  return fetchJSON<LiveTimelineFramePayload>(path);
}

/* ── Opus 심층 분석 ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOpusAnalysis(): Promise<any> {
  return fetchJSON("eda-opus/analysis_summary.json");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOpusFillerAnalysis(): Promise<any> {
  return fetchJSON("eda-opus/filler_analysis.json");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOpusInteractionAnalysis(): Promise<any> {
  return fetchJSON("eda-opus/interaction_analysis.json");
}
