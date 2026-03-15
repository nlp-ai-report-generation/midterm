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

const DATA_BASE = "/data";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}/${path}`);
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

/** EDA: 스크립트 통계 */
export async function getTranscriptStats(): Promise<TranscriptStats[]> {
  return fetchJSON<TranscriptStats[]>("eda/transcript_stats.json");
}

/** EDA: 화자 분포 */
export async function getSpeakerDistribution(): Promise<SpeakerDistribution[]> {
  return fetchJSON<SpeakerDistribution[]>("eda/speaker_distribution.json");
}

/** EDA: 습관어 통계 */
export async function getFillerWords(): Promise<FillerWordStats[]> {
  return fetchJSON<FillerWordStats[]>("eda/filler_words.json");
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
