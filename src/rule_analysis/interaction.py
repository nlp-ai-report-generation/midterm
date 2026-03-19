"""Interaction pattern detection."""

from __future__ import annotations


def detect_interaction_prompts(text: str) -> dict[str, int]:
    """Count common engagement prompts."""
    patterns = {
        "understanding_check": ["이해하셨", "되셨어", "괜찮으"],
        "participation_prompt": ["해보세요", "질문 있", "따라해"],
    }

    result: dict[str, int] = {}
    lowered = text.lower()
    for key, needles in patterns.items():
        result[key] = sum(lowered.count(needle.lower()) for needle in needles)
    return result
