"""PDF export helpers."""

from __future__ import annotations


def export_pdf(path: str, report_text: str) -> None:
    """Write a plain-text fallback file with .pdf extension."""
    with open(path, "w", encoding="utf-8") as fp:
        fp.write(report_text)
