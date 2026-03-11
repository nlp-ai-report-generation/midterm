"""보정 노드: 교차 항목 일관성 검토 및 점수 조정."""

from __future__ import annotations

import asyncio
import json
import logging

from src.graph.state import EvaluationState
from src.harnesses.loader import load_calibration_harness
from src.integrations.openai_client import OpenAIEvalClient
from src.models import ItemScore

logger = logging.getLogger(__name__)


def _build_calibration_input(category_scores: dict[str, list[ItemScore]]) -> str:
    """보정 입력용 전체 점수 요약 생성."""
    lines: list[str] = []
    for cat_name, items in sorted(category_scores.items()):
        lines.append(f"\n### {cat_name}")
        for item in items:
            evidence_preview = item.evidence[0][:100] if item.evidence else "(증거 없음)"
            lines.append(
                f"- [{item.item_id}] {item.item_name}: "
                f"{item.score}점 (가중치: {item.weight}, 신뢰도: {item.confidence})\n"
                f"  근거: {evidence_preview}\n"
                f"  추론: {item.reasoning[:200]}"
            )
    return "\n".join(lines)


def _apply_adjustments(
    category_scores: dict[str, list[ItemScore]],
    adjustments: list[dict],
) -> dict[str, list[ItemScore]]:
    """보정 결과를 적용하여 새 점수 딕셔너리 생성."""
    adjustment_map = {adj["item_id"]: adj["adjusted_score"] for adj in adjustments}

    calibrated: dict[str, list[ItemScore]] = {}
    for cat_name, items in category_scores.items():
        new_items = []
        for item in items:
            if item.item_id in adjustment_map:
                new_score = max(1, min(5, adjustment_map[item.item_id]))
                new_items.append(item.model_copy(update={"score": new_score}))
                logger.info(
                    "Calibrated %s: %d -> %d",
                    item.item_id,
                    item.score,
                    new_score,
                )
            else:
                new_items.append(item)
        calibrated[cat_name] = new_items

    return calibrated


async def _calibrate_async(state: EvaluationState) -> dict:
    """비동기 보정 로직."""
    config = state.get("experiment_config", {})
    category_scores = state.get("category_scores", {})

    if not category_scores:
        return {}

    harness = load_calibration_harness()
    model = config.get("model", harness.model)
    temperature = config.get("temperature", harness.temperature)

    client = OpenAIEvalClient(model=model, temperature=temperature)

    calibration_input = _build_calibration_input(category_scores)
    user_prompt = f"다음은 강의 평가 결과입니다. 교차 항목 일관성을 검토하고 보정을 제안하세요.\n\n{calibration_input}"

    try:
        response = await client.evaluate(
            system_prompt=harness.system_prompt,
            user_prompt=user_prompt,
        )

        adjustments = response.get("adjustments", [])
        calibration_notes = response.get("calibration_notes", "")
        consistency_issues = response.get("consistency_issues", [])

        calibrated = _apply_adjustments(category_scores, adjustments)

        logger.info(
            "Calibration complete: %d adjustments, %d consistency issues",
            len(adjustments),
            len(consistency_issues),
        )

        return {
            "calibration_notes": calibration_notes,
            "calibrated_scores": calibrated,
        }

    except Exception:
        logger.exception("Calibration failed, using original scores")
        return {
            "calibration_notes": "보정 실패 - 원점수 사용",
            "calibrated_scores": category_scores,
        }


def calibrate(state: EvaluationState) -> dict:
    """보정 노드 - LangGraph 동기 인터페이스."""
    return asyncio.run(_calibrate_async(state))
