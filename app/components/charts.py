"""Reusable chart helpers for Streamlit pages."""

from __future__ import annotations


def to_radar_payload(score_map: dict[str, float]) -> dict[str, list[float | str]]:
    """Build minimal radar chart payload format."""
    labels = list(score_map.keys())
    values = list(score_map.values())
    return {"labels": labels, "values": values}
