"""Report data assembly."""

from __future__ import annotations


def build_report(lecture_id: str, total_score: float, items: list[dict]) -> dict:
    """Assemble normalized report payload."""
    return {
        "lecture_id": lecture_id,
        "total_score": total_score,
        "item_count": len(items),
        "items": items,
    }
