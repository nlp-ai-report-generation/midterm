"""가중 점수 집계 로직.

WAS = Σ(score_i × weight_i) / Σ(weight_i)
총 가중치 합: 10×3 + 7×2 + 1×1 = 45
범위: 1.0 ~ 5.0
"""

from __future__ import annotations

from src.models import CategoryResult, ItemScore
from src.scoring.weights import get_weight


def weighted_average(items: list[ItemScore]) -> float:
    """항목 리스트의 가중 평균 계산."""
    if not items:
        return 0.0

    total_weighted = sum(item.score * get_weight(item.weight) for item in items)
    total_weight = sum(get_weight(item.weight) for item in items)

    if total_weight == 0:
        return 0.0
    return total_weighted / total_weight


def weighted_total(items: list[ItemScore]) -> float:
    """항목 리스트의 가중 총점."""
    return sum(item.score * get_weight(item.weight) for item in items)


def normalized_percentage(items: list[ItemScore]) -> float:
    """정규화 총점 (백분율).

    NT = Σ(score_i × weight_i) / max_possible × 100
    max_possible = Σ(5 × weight_i)
    """
    if not items:
        return 0.0

    max_possible = sum(5 * get_weight(item.weight) for item in items)
    if max_possible == 0:
        return 0.0

    actual = weighted_total(items)
    return (actual / max_possible) * 100


def aggregate_category(category_name: str, items: list[ItemScore]) -> CategoryResult:
    """카테고리 단위 결과 집계."""
    return CategoryResult(
        category_name=category_name,
        items=items,
        weighted_average=weighted_average(items),
    )
