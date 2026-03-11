"""집계 노드: 카테고리별 점수를 가중 평균으로 집계."""

from __future__ import annotations

import logging

from src.graph.state import EvaluationState
from src.models import ItemScore
from src.scoring.aggregation import aggregate_category, weighted_average, weighted_total

logger = logging.getLogger(__name__)


def aggregate(state: EvaluationState) -> dict:
    """모든 카테고리 점수를 집계하여 가중 평균 계산.

    순수 연산 노드 - LLM 호출 없음.
    """
    category_scores = state.get("category_scores", {})

    all_items: list[ItemScore] = []
    category_results = []
    category_averages: dict[str, float] = {}

    for cat_name, items in sorted(category_scores.items()):
        result = aggregate_category(cat_name, items)
        category_results.append(result)
        category_averages[cat_name] = result.weighted_average
        all_items.extend(items)

    total = weighted_total(all_items)
    avg = weighted_average(all_items)

    logger.info(
        "Aggregated %d items: weighted_total=%.1f, weighted_average=%.2f",
        len(all_items),
        total,
        avg,
    )

    return {
        "weighted_total": total,
        "weighted_average": avg,
        "category_averages": category_averages,
        "category_results": category_results,
    }
