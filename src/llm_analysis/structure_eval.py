"""Lecture structure evaluation."""

from __future__ import annotations


def evaluate_structure(text: str) -> dict[str, bool]:
    """Heuristic fallback for structure indicators."""
    return {
        "has_learning_goal": "목표" in text,
        "has_previous_link": "지난" in text or "저번" in text,
        "has_closing_summary": "정리" in text or "요약" in text,
    }
