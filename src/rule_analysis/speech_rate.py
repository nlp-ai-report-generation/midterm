"""Speech rate analysis."""

from __future__ import annotations

import re


TOKEN_RE = re.compile(r"[A-Za-z0-9_가-힣]+")


def words_per_minute(text: str, duration_seconds: int) -> float:
    """Compute words-per-minute from text and duration in seconds."""
    if duration_seconds <= 0:
        return 0.0
    word_count = len(TOKEN_RE.findall(text))
    return (word_count / duration_seconds) * 60.0
