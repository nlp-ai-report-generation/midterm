"""Concept clarity evaluation."""

from __future__ import annotations


def evaluate_clarity(text: str) -> dict[str, bool]:
    """Heuristic fallback for clarity cues."""
    return {
        "has_definition": "란" in text or "정의" in text,
        "has_analogy_or_example": "예를" in text or "비유" in text,
        "checks_prerequisite": "기억나" in text or "복습" in text,
    }
