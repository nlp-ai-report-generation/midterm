"""Repetition and filler word detection."""

from __future__ import annotations

from collections import Counter
import re


TOKEN_RE = re.compile(r"[A-Za-z0-9_가-힣]+")


def count_filler_words(text: str, filler_words: list[str]) -> dict[str, int]:
    """Count target filler words in transcript text."""
    counts = Counter(token.lower() for token in TOKEN_RE.findall(text))
    return {word: counts[word.lower()] for word in filler_words}
