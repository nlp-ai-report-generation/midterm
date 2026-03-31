/** src/models.py의 Pydantic 모델 미러링 */

export interface TranscriptLine {
  timestamp: string; // HH:MM:SS
  seconds: number;
  speaker_id: string;
  text: string;
}

export interface ChunkInfo {
  chunk_id: string;
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  text: string;
  line_count: number;
}

export interface ItemScore {
  item_id: string; // e.g., "1.1"
  item_name: string;
  category: string;
  score: number; // 1-5
  weight: string; // HIGH | MEDIUM | LOW
  evidence: string[];
  reasoning: string;
  confidence: number; // 0.0-1.0
  caveats: string[];
}

export interface CategoryResult {
  category_name: string;
  items: ItemScore[];
  weighted_average: number;
}

export interface EvaluationResult {
  lecture_date: string;
  transcript_path: string;
  metadata: LectureMetadata;
  category_results: CategoryResult[];
  weighted_total: number;
  weighted_average: number;
  category_averages: Record<string, number>;
  report_markdown: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  token_usage?: Record<string, number>;
  cost_usd?: number;
}

export interface LectureMetadata {
  course_id: string;
  course_name: string;
  date: string;
  subjects: string[];
  contents: string[];
  instructor: string;
  sub_instructors: string[];
}

/** EDA 관련 타입 */
export interface TranscriptStats {
  date: string;
  line_count: number;
  speaker_count: number;
  start_time: string;
  estimated_duration_hours: number;
  utterance_rate: number; // 줄/시간
}

export interface SpeakerDistribution {
  date: string;
  speakers: Record<string, number>; // speaker_id -> line count
}

export interface FillerWordStats {
  date: string;
  words: Record<string, number>; // word -> count
  total: number;
}

export interface InteractionMetrics {
  date: string;
  question_count: number;
  understanding_check_count: number;
  participation_prompts: number;
}

export interface CurriculumEntry {
  date: string;
  subject: string;
  contents: string[];
}

/** 실험 관련 타입 */
export interface ExperimentConfig {
  experiment_id: string;
  model: string;
  temperature: number;
  chunk_minutes: number;
  overlap_minutes: number;
  use_calibrator: boolean;
  passes: number;
}

export interface ExperimentSummary {
  config: ExperimentConfig;
  mean_score: number;
  std_score: number;
  lecture_count: number;
}

export interface ReliabilityMetrics {
  cohens_kappa: number;
  krippendorffs_alpha: number;
  icc: number;
  ssi: number;
}

/** 체크리스트 항목 */
export interface ChecklistItem {
  category: string;
  item: string;
  weight: string; // high | medium | low
}
