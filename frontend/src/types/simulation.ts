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
