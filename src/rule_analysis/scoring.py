"""Weighted scoring logic."""

from __future__ import annotations

from dataclasses import dataclass


WEIGHT_MAP = {"high": 1.0, "medium": 0.7, "low": 0.4}


@dataclass(frozen=True)
class ScoreItem:
    item: str
    score: float
    weight: str


def weighted_average(items: list[ScoreItem]) -> float:
    """Compute weighted average score for checklist items."""
    if not items:
        return 0.0

    numerator = 0.0
    denominator = 0.0
    for item in items:
        weight = WEIGHT_MAP.get(item.weight, 0.0)
        numerator += item.score * weight
        denominator += weight

    return round(numerator / denominator, 2) if denominator else 0.0
