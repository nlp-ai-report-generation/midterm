export interface SimulationResult {
  lecture_date: string;
  source_model: "tribev2";
  source_modality: "text_tts" | "audio_only_fallback";
  generated_at: string;
  assets: {
    mesh_glb: string;
    segment_colors_json: string;
  };
  metadata: {
    subject: string;
    content: string;
    instructor: string;
    segment_minutes: number;
  };
  lecture_summary: {
    strongest_segment_ids: string[];
    risk_segment_ids: string[];
    summary_text: string;
    caution_text: string;
  };
  roi_summary: {
    atlas_name: string;
    lecture_top_rois: RoiMetricSummary[];
    method_explainer: {
      input_summary: string;
      proxy_summary: string;
      roi_summary: string;
    };
  };
  summary_visual: {
    brain_icon_frames_json: string;
    hero_statement: string;
    highlight_cards: SummaryHighlightCard[];
  };
  live_assets: {
    brain_frames_json: string;
    timeline_frames_json: string;
  };
  segments: SimulationSegment[];
  personas: PersonaReaction[];
}

export interface SimulationSegment {
  segment_id: string;
  start_time: string;
  end_time: string;
  proxies: {
    attention_proxy: number;
    load_proxy: number;
    novelty_proxy: number;
  };
  labels: string[];
  interpretation: string;
  roi_insights: {
    top_active_rois: RoiMetricSummary[];
    top_changed_rois: RoiMetricSummary[];
    summary_text: string;
  };
  playback: {
    frame_times: number[];
    line_to_frame: Array<{
      line_index: number;
      start_frame: number;
      end_frame: number;
    }>;
  };
}

export interface PersonaReaction {
  persona_id: "novice" | "builder" | "pace_sensitive";
  label: string;
  overall_score: number;
  top_positive_segment_ids: string[];
  top_risk_segment_ids: string[];
  reaction_summary: string;
}

export interface TranscriptBrowserData {
  lecture_date: string;
  segments: {
    segment_id: string;
    start_time: string;
    end_time: string;
    lines: {
      timestamp: string;
      relative_seconds: number;
      lecture_seconds?: number;
      frame_index?: number;
      line_weight?: number;
      speaker: string;
      text: string;
    }[];
  }[];
}

export interface SegmentColorPayload {
  lecture_date: string;
  mesh_version: string;
  vertex_count: number;
  segments: {
    segment_id: string;
    start_time: string;
    end_time: string;
    hemispheres: {
      left: number[];
      right: number[];
    };
  }[];
}

export interface RoiMetricSummary {
  hemisphere: "left" | "right";
  roi_name: string;
  roi_display_name: string;
  functional_hint:
    | "auditory_or_language_related"
    | "frontal_control_or_action_related"
    | "visual_processing_related"
    | "sensorimotor_or_attention_related"
    | "association_or_default_mode_related"
    | "unclassified_surface_pattern";
  mean_abs_response?: number;
  delta_abs_response?: number;
}

export interface SummaryHighlightCard {
  kind: "attention" | "load" | "novelty";
  title: string;
  summary: string;
  segment_id: string;
  value: number;
}

export interface BrainIconFrame {
  frame_id: string;
  segment_id: string;
  title: string;
  subtitle: string;
  labels: string[];
  proxies: {
    attention: number;
    load: number;
    novelty: number;
  };
  zones: {
    left: number[];
    right: number[];
  };
}

export interface BrainIconFramePayload {
  lecture_date: string;
  frames: BrainIconFrame[];
}

export interface LiveBrainFrame {
  frame_id: string;
  segment_id: string;
  segment_index: number;
  line_index: number;
  timestamp: string;
  relative_seconds: number;
  lecture_seconds: number;
  color_segment_index: number;
  playback_ratio: number;
  heuristic_intensity: number;
  heuristic_change_boost: number;
  heuristic_timeline_emphasis: number;
}

export interface LiveBrainFramePayload {
  lecture_date: string;
  frames: LiveBrainFrame[];
}

export interface LiveTimelineFramePayload {
  lecture_date: string;
  frames: Array<{
    frame_id: string;
    segment_id: string;
    segment_index: number;
    line_index: number;
    lecture_seconds: number;
    attention: number;
    load: number;
    novelty: number;
    attention_display: number;
    load_display: number;
    novelty_display: number;
    heuristic_timeline_emphasis: number;
  }>;
}
