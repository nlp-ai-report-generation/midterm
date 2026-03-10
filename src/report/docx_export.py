"""DOCX export helpers."""

from __future__ import annotations


def export_docx(path: str, report_text: str) -> None:
    """Write a plain-text fallback file with .docx extension."""
    with open(path, "w", encoding="utf-8") as fp:
        fp.write(report_text)
