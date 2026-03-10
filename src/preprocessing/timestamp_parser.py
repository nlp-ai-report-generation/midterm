"""Timestamp parsing helpers."""

from __future__ import annotations

import re
from dataclasses import dataclass


TS_RE = re.compile(r"^\[(\d{2}):(\d{2}):(\d{2})\]\s*(.*)$")


@dataclass(frozen=True)
class TimestampedLine:
    second: int
    text: str


def parse_timestamped_line(line: str) -> TimestampedLine | None:
    """Parse line format: [HH:MM:SS] message."""
    match = TS_RE.match(line.strip())
    if not match:
        return None
    hour, minute, second, text = match.groups()
    total_seconds = int(hour) * 3600 + int(minute) * 60 + int(second)
    return TimestampedLine(second=total_seconds, text=text)
