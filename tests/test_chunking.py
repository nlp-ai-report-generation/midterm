"""청킹 모듈 테스트."""

from src.chunking.strategy import (
    chunk_by_time_window,
    get_focused_chunks,
    parse_transcript,
)
from src.models import TranscriptLine


def _make_sample_transcript() -> str:
    """테스트용 스크립트 텍스트 생성."""
    lines = []
    # 09:00 ~ 09:59 (1시간, 분당 1줄)
    for minute in range(60):
        ts = f"09:{minute:02d}:00"
        lines.append(f"<{ts}> speaker1: 테스트 발화 {minute}")
    # 10:00 ~ 10:29 (30분)
    for minute in range(30):
        ts = f"10:{minute:02d}:00"
        lines.append(f"<{ts}> speaker1: 테스트 발화 {60 + minute}")
    return "\n".join(lines)


class TestParseTranscript:
    def test_basic_parsing(self):
        text = "<09:11:17> b54f46b0: 여러분 오늘 수업 진행하도록 하겠습니다."
        lines = parse_transcript(text)
        assert len(lines) == 1
        assert lines[0].timestamp == "09:11:17"
        assert lines[0].seconds == 9 * 3600 + 11 * 60 + 17
        assert lines[0].speaker_id == "b54f46b0"
        assert "여러분" in lines[0].text

    def test_multi_line(self):
        text = (
            "<09:00:00> sp1: 첫 번째 줄\n"
            "<09:01:00> sp2: 두 번째 줄\n"
            "<09:02:00> sp1: 세 번째 줄"
        )
        lines = parse_transcript(text)
        assert len(lines) == 3
        assert lines[1].speaker_id == "sp2"

    def test_empty_lines_ignored(self):
        text = "<09:00:00> sp1: 텍스트\n\n\n<09:01:00> sp1: 다음"
        lines = parse_transcript(text)
        assert len(lines) == 2

    def test_invalid_format_skipped(self):
        text = "이건 유효하지 않은 줄\n<09:00:00> sp1: 유효한 줄"
        lines = parse_transcript(text)
        assert len(lines) == 1


class TestChunkByTimeWindow:
    def test_basic_chunking(self):
        text = _make_sample_transcript()
        lines = parse_transcript(text)
        chunks = chunk_by_time_window(lines, window_minutes=30, overlap_minutes=5)

        assert len(chunks) >= 2
        assert chunks[0].start_time == "09:00:00"

    def test_chunk_ids_sequential(self):
        text = _make_sample_transcript()
        lines = parse_transcript(text)
        chunks = chunk_by_time_window(lines, window_minutes=30, overlap_minutes=0)

        for i, chunk in enumerate(chunks):
            assert chunk.chunk_id == f"chunk_{i:03d}"

    def test_empty_input(self):
        chunks = chunk_by_time_window([], window_minutes=30, overlap_minutes=5)
        assert chunks == []

    def test_overlap_creates_more_chunks(self):
        text = _make_sample_transcript()
        lines = parse_transcript(text)
        no_overlap = chunk_by_time_window(lines, window_minutes=30, overlap_minutes=0)
        with_overlap = chunk_by_time_window(lines, window_minutes=30, overlap_minutes=10)

        assert len(with_overlap) >= len(no_overlap)


class TestGetFocusedChunks:
    def test_all(self):
        text = _make_sample_transcript()
        lines = parse_transcript(text)
        chunks = chunk_by_time_window(lines, window_minutes=30, overlap_minutes=0)
        focused = get_focused_chunks(chunks, "all")
        assert focused == chunks

    def test_first(self):
        text = _make_sample_transcript()
        lines = parse_transcript(text)
        chunks = chunk_by_time_window(lines, window_minutes=30, overlap_minutes=0)
        focused = get_focused_chunks(chunks, "first")
        assert len(focused) == 1
        assert focused[0] == chunks[0]

    def test_last(self):
        text = _make_sample_transcript()
        lines = parse_transcript(text)
        chunks = chunk_by_time_window(lines, window_minutes=30, overlap_minutes=0)
        focused = get_focused_chunks(chunks, "last")
        assert len(focused) == 1
        assert focused[0] == chunks[-1]

    def test_empty(self):
        assert get_focused_chunks([], "all") == []
