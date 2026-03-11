"""전처리 노드: 스크립트 로딩, 타임스탬프 파싱, 메타데이터 조인, 청킹."""

from __future__ import annotations

import csv
import logging
from pathlib import Path

from src.chunking.strategy import chunk_by_time_window, parse_transcript
from src.graph.state import EvaluationState
from src.models import LectureMetadata

logger = logging.getLogger(__name__)

# 데이터 디렉토리 기본 경로
DATA_DIR = Path(__file__).parents[3] / "NLP 과제 1 - AI 강의 분석 리포트 생성기"
SCRIPTS_DIR = DATA_DIR / "강의 스크립트"
METADATA_CSV = DATA_DIR / "강의 메타데이터.csv"


def load_metadata_for_date(date_str: str, csv_path: Path | None = None) -> LectureMetadata:
    """날짜 기준으로 메타데이터를 로드하고 오전/오후 세션을 통합.

    Args:
        date_str: 날짜 문자열 (e.g., "2026-02-02")
        csv_path: 메타데이터 CSV 경로 (None이면 기본 경로)
    """
    csv_path = csv_path or METADATA_CSV

    subjects: list[str] = []
    contents: list[str] = []
    instructor = ""
    sub_instructors: list[str] = []
    course_id = ""
    course_name = ""

    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["date"] == date_str:
                course_id = row.get("course_id", "")
                course_name = row.get("course_name", "")
                instructor = row.get("instructor", "")

                subject = row.get("subject", "")
                if subject and subject not in subjects:
                    subjects.append(subject)

                content = row.get("content", "")
                if content and content not in contents:
                    contents.append(content)

                sub = row.get("sub_instructor", "")
                if sub:
                    for s in sub.split(","):
                        s = s.strip()
                        if s and s not in sub_instructors:
                            sub_instructors.append(s)

    return LectureMetadata(
        course_id=course_id,
        course_name=course_name,
        date=date_str,
        subjects=subjects,
        contents=contents,
        instructor=instructor,
        sub_instructors=sub_instructors,
    )


def preprocess(state: EvaluationState) -> dict:
    """전처리 노드 함수.

    1. 스크립트 파일 로드
    2. 메타데이터 CSV에서 해당 날짜 정보 조인 (일별 통합)
    3. 타임스탬프 기반 청킹
    """
    transcript_path = Path(state["transcript_path"])
    lecture_date = state["lecture_date"]
    config = state.get("experiment_config", {})

    # 스크립트 로드
    raw_text = transcript_path.read_text(encoding="utf-8")
    logger.info("Loaded transcript: %s (%d chars)", transcript_path.name, len(raw_text))

    # 메타데이터 로드 (일별 통합)
    metadata = load_metadata_for_date(lecture_date)
    logger.info(
        "Metadata: date=%s, subjects=%s, instructor=%s",
        metadata.date,
        metadata.subjects,
        metadata.instructor,
    )

    # 청킹
    lines = parse_transcript(raw_text)
    window_min = config.get("chunk_duration_minutes", 30)
    overlap_min = config.get("chunk_overlap_minutes", 5)
    chunks = chunk_by_time_window(lines, window_minutes=window_min, overlap_minutes=overlap_min)
    logger.info("Chunked into %d chunks (window=%dmin, overlap=%dmin)", len(chunks), window_min, overlap_min)

    return {
        "raw_text": raw_text,
        "metadata": metadata,
        "chunks": chunks,
    }
