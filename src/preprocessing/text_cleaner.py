"""Utilities for cleaning STT transcript text."""

from __future__ import annotations

import re


MULTISPACE_RE = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Normalize whitespace and strip leading/trailing spaces."""
    return MULTISPACE_RE.sub(" ", text).strip()
