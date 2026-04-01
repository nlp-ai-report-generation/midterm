"""카테고리 평가기 노드 팩토리.

하네스 MD를 로드하여 LLM 기반 평가를 수행하는 그래프 노드를 생성한다.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable
from pathlib import Path

from src.chunking.strategy import get_focused_chunks
from src.graph.state import EvaluationState
from src.harnesses.loader import Harness, HarnessItem, load_harness
from src.integrations.openai_client import OpenAIEvalClient
from src.models import ChunkInfo, ItemScore

logger = logging.getLogger(__name__)


def _build_user_prompt(chunk: ChunkInfo, metadata_summary: str) -> str:
    """청크 텍스트와 메타데이터를 결합한 사용자 프롬프트."""
    return (
        f"## 강의 정보\n{metadata_summary}\n\n"
        f"## 스크립트 구간\n"
        f"- 시작: {chunk.start_time}\n"
        f"- 종료: {chunk.end_time}\n"
        f"- 라인 수: {chunk.line_count}\n\n"
        f"## 스크립트 내용\n\n{chunk.text}"
    )


def _merge_chunk_scores(
    all_chunk_results: list[list[ItemScore]],
    harness_items: list[HarnessItem],
) -> list[ItemScore]:
    """청크별 점수를 항목별로 병합.

    merge_strategy에 따라:
    - frequency_aggregate: 증거 합산, 점수 평균
    - average: 점수 평균
    - rate_calculation: 점수 평균 (발화 속도는 LLM이 산출)
    """
    if not all_chunk_results:
        return []

    # 항목별 점수 모음
    item_scores_map: dict[str, list[ItemScore]] = {}
    for chunk_scores in all_chunk_results:
        for score in chunk_scores:
            item_scores_map.setdefault(score.item_id, []).append(score)

    merged: list[ItemScore] = []
    for harness_item in harness_items:
        scores = item_scores_map.get(harness_item.item_id, [])
        if not scores:
            continue

        # 점수 평균 (정수 반올림)
        avg_score = round(sum(s.score for s in scores) / len(scores))
        avg_score = max(1, min(5, avg_score))

        # 증거/추론 합산
        all_evidence: list[str] = []
        all_caveats: list[str] = []
        all_reasoning: list[str] = []
        for s in scores:
            all_evidence.extend(s.evidence)
            all_caveats.extend(s.caveats)
            if s.reasoning:
                all_reasoning.append(s.reasoning)

        avg_confidence = sum(s.confidence for s in scores) / len(scores)

        merged.append(
            ItemScore(
                item_id=harness_item.item_id,
                item_name=harness_item.name,
                category=scores[0].category,
                score=avg_score,
                weight=harness_item.weight,
                evidence=all_evidence[:10],  # 최대 10개
                reasoning=" | ".join(all_reasoning[:3]),
                confidence=round(avg_confidence, 2),
                caveats=list(set(all_caveats))[:5],
            )
        )

    return merged


def _parse_llm_response(
    response: dict,
    harness: Harness,
) -> list[ItemScore]:
    """LLM JSON 응답을 ItemScore 리스트로 변환."""
    items_data = response.get("items", [])
    scores: list[ItemScore] = []

    # 하네스 항목 맵
    item_map = {item.item_id: item for item in harness.items}

    for item_data in items_data:
        item_id = item_data.get("item_id", "")
        harness_item = item_map.get(item_id)
        if not harness_item:
            continue

        scores.append(
            ItemScore(
                item_id=item_id,
                item_name=item_data.get("item_name", harness_item.name),
                category=harness.category,
                score=max(1, min(5, int(item_data.get("score", 3)))),
                weight=harness_item.weight,
                evidence=item_data.get("evidence", []),
                reasoning=item_data.get("reasoning", ""),
                confidence=float(item_data.get("confidence", 0.5)),
                caveats=item_data.get("caveats", []),
            )
        )

    return scores


def make_evaluator(harness_path: str | Path) -> Callable:
    """하네스 파일로부터 평가 노드 함수를 생성하는 팩토리.

    Args:
        harness_path: 하네스 MD 파일 경로

    Returns:
        LangGraph 노드 함수
    """
    harness = load_harness(harness_path)

    async def _evaluate_async(state: EvaluationState) -> dict:
        config = state.get("experiment_config", {})
        model = config.get("model", harness.model)
        temperature = config.get("temperature", harness.temperature)

        client = OpenAIEvalClient(model=model, temperature=temperature)
        chunks = state["chunks"]

        # 메타데이터 요약
        metadata = state["metadata"]
        meta_summary = (
            f"- 과정: {metadata.course_name}\n"
            f"- 날짜: {metadata.date}\n"
            f"- 과목: {', '.join(metadata.subjects)}\n"
            f"- 내용: {', '.join(metadata.contents)}\n"
            f"- 강사: {metadata.instructor}"
        )

        # 항목별 chunk_focus에 따라 평가
        all_chunk_results: list[list[ItemScore]] = []
        chunk_detail_results: list[dict] = []

        # 모든 항목의 chunk_focus가 동일한지 확인
        focus_groups: dict[str, list[HarnessItem]] = {}
        for item in harness.items:
            focus_groups.setdefault(item.chunk_focus, []).append(item)

        for focus, items in focus_groups.items():
            focused_chunks = get_focused_chunks(chunks, focus)

            for chunk in focused_chunks:
                user_prompt = _build_user_prompt(chunk, meta_summary)
                try:
                    response = await client.evaluate(
                        system_prompt=harness.system_prompt,
                        user_prompt=user_prompt,
                    )
                    chunk_scores = _parse_llm_response(response, harness)
                    # 해당 focus의 항목만 필터
                    item_ids = {i.item_id for i in items}
                    filtered = [s for s in chunk_scores if s.item_id in item_ids]
                    all_chunk_results.append(filtered)

                    # 청크별 개별 점수 기록 (hop 실험용)
                    chunk_detail_results.append({
                        "chunk_id": chunk.chunk_id,
                        "start_time": chunk.start_time,
                        "end_time": chunk.end_time,
                        "focus": focus,
                        "scores": [s.model_dump() for s in filtered],
                    })
                except Exception:
                    logger.exception(
                        "Failed to evaluate chunk %s for %s",
                        chunk.chunk_id,
                        harness.category,
                    )

        # 청크별 결과 병합
        merged_scores = _merge_chunk_scores(all_chunk_results, harness.items)

        logger.info(
            "Category '%s': evaluated %d items across %d chunks",
            harness.category,
            len(merged_scores),
            len(chunks),
        )

        return {
            "category_scores": {harness.category: merged_scores},
            "chunk_scores_detail": {harness.category: chunk_detail_results},
        }

    def evaluate(state: EvaluationState) -> dict:
        """동기 래퍼 - LangGraph 노드로 사용."""
        return asyncio.run(_evaluate_async(state))

    evaluate.__name__ = f"evaluate_{harness.harness_id}"
    return evaluate
