"""LangGraph 평가 그래프의 상태 정의."""

from __future__ import annotations

import operator
from typing import Annotated, TypedDict

from src.models import CategoryResult, ChunkInfo, ItemScore, LectureMetadata


def _merge_category_scores(
    existing: dict[str, list[ItemScore]],
    new: dict[str, list[ItemScore]],
) -> dict[str, list[ItemScore]]:
    """병렬 카테고리 평가 결과를 병합하는 리듀서."""
    merged = dict(existing)
    for key, value in new.items():
        merged[key] = value
    return merged


class EvaluationState(TypedDict):
    """LangGraph 평가 파이프라인의 공유 상태."""

    # 입력
    lecture_date: str
    transcript_path: str
    metadata: LectureMetadata

    # 실험 설정
    experiment_config: dict

    # 전처리 결과
    raw_text: str
    chunks: list[ChunkInfo]

    # 카테고리별 평가 결과 (병렬 노드가 각각 채움)
    category_scores: Annotated[dict[str, list[ItemScore]], _merge_category_scores]

    # 집계 결과
    weighted_total: float
    weighted_average: float
    category_averages: dict[str, float]
    category_results: list[CategoryResult]

    # 보정 결과
    calibration_notes: str
    calibrated_scores: dict[str, list[ItemScore]]

    # 리포트
    report_markdown: str
    strengths: list[str]
    improvements: list[str]
    recommendations: list[str]

    # 비용 추적
    token_usage: dict
    cost_usd: float
