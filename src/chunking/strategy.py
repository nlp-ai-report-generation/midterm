"""타임스탬프 기반 청킹 전략.

스크립트를 시간 윈도우 단위로 분할하여 LLM 컨텍스트 윈도우에 맞는 크기로 제공한다.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from src.models import ChunkInfo, TranscriptLine

# <HH:MM:SS> speaker_id: text 형식 파싱
_LINE_RE = re.compile(r"<(\d{2}:\d{2}:\d{2})>\s+(\S+):\s+(.*)")


def _time_to_seconds(time_str: str) -> int:
    """HH:MM:SS 문자열을 초 단위로 변환."""
    parts = time_str.split(":")
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])


def _seconds_to_time(seconds: int) -> str:
    """초를 HH:MM:SS 문자열로 변환."""
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


def parse_transcript(raw_text: str) -> list[TranscriptLine]:
    """스크립트 원문을 파싱하여 TranscriptLine 리스트로 변환."""
    lines: list[TranscriptLine] = []
    offset = 0
    prev_seconds: int | None = None

    for line in raw_text.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        match = _LINE_RE.match(line)
        if match:
            ts, speaker, text = match.groups()
            raw_seconds = _time_to_seconds(ts)
            if prev_seconds is not None and raw_seconds < prev_seconds - 1800:
                offset += 12 * 3600
            seconds = raw_seconds + offset
            lines.append(
                TranscriptLine(
                    timestamp=ts,
                    seconds=seconds,
                    speaker_id=speaker,
                    text=text,
                )
            )
            prev_seconds = raw_seconds
    return lines


def chunk_by_time_window(
    lines: list[TranscriptLine],
    window_minutes: int = 30,
    overlap_minutes: int = 5,
) -> list[ChunkInfo]:
    """타임스탬프 기반 시간 윈도우 청킹.

    Args:
        lines: 파싱된 스크립트 라인 리스트
        window_minutes: 윈도우 크기 (분)
        overlap_minutes: 윈도우 간 오버랩 (분)

    Returns:
        ChunkInfo 리스트
    """
    if not lines:
        return []

    window_sec = window_minutes * 60
    overlap_sec = overlap_minutes * 60
    step_sec = window_sec - overlap_sec

    start_sec = lines[0].seconds
    end_sec = lines[-1].seconds

    chunks: list[ChunkInfo] = []
    chunk_idx = 0
    current_start = start_sec

    while current_start <= end_sec:
        current_end = current_start + window_sec

        chunk_lines = [
            ln for ln in lines if current_start <= ln.seconds < current_end
        ]

        if chunk_lines:
            chunk_text = "\n".join(
                f"<{ln.timestamp}> {ln.speaker_id}: {ln.text}" for ln in chunk_lines
            )
            chunks.append(
                ChunkInfo(
                    chunk_id=f"chunk_{chunk_idx:03d}",
                    start_time=_seconds_to_time(current_start),
                    end_time=_seconds_to_time(min(current_end, end_sec)),
                    text=chunk_text,
                    line_count=len(chunk_lines),
                )
            )
            chunk_idx += 1

        current_start += step_sec

    return chunks


def get_focused_chunks(
    chunks: list[ChunkInfo],
    focus: str = "all",
) -> list[ChunkInfo]:
    """하네스의 chunk_focus 설정에 따라 관련 청크만 반환.

    Args:
        chunks: 전체 청크 리스트
        focus: "all" | "first" | "last"
    """
    if not chunks:
        return []
    if focus == "first":
        return [chunks[0]]
    if focus == "last":
        return [chunks[-1]]
    return chunks
