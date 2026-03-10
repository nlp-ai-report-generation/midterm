"""Simple speaker separation helpers."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Utterance:
    speaker: str
    text: str


def split_speaker(line: str) -> Utterance:
    """Split `speaker: text` line format. Falls back to `unknown`."""
    if ":" not in line:
        return Utterance(speaker="unknown", text=line.strip())
    speaker, text = line.split(":", 1)
    return Utterance(speaker=speaker.strip().lower(), text=text.strip())
