"""핵심 데이터 모델 - 평가 파이프라인 전체에서 사용되는 Pydantic 모델."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChunkInfo(BaseModel):
    """타임스탬프 기반으로 분할된 스크립트 청크."""

    chunk_id: str
    start_time: str  # HH:MM:SS
    end_time: str  # HH:MM:SS
    text: str
    line_count: int


class TranscriptLine(BaseModel):
    """파싱된 스크립트 한 줄."""

    timestamp: str  # HH:MM:SS
    seconds: int  # 총 초
    speaker_id: str
    text: str


class ItemScore(BaseModel):
    """개별 평가 항목의 점수 및 근거."""

    item_id: str  # e.g., "1.1"
    item_name: str  # e.g., "불필요한 반복 표현"
    category: str  # e.g., "1. 언어 표현 품질"
    score: int = Field(ge=1, le=5)
    weight: str  # HIGH / MEDIUM / LOW
    evidence: list[str] = Field(default_factory=list)
    reasoning: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    caveats: list[str] = Field(default_factory=list)


class CategoryResult(BaseModel):
    """카테고리 단위 평가 결과."""

    category_name: str
    items: list[ItemScore]
    weighted_average: float = 0.0


class EvaluationResult(BaseModel):
    """강의 1개에 대한 전체 평가 결과."""

    lecture_date: str
    transcript_path: str
    metadata: dict = Field(default_factory=dict)
    category_results: list[CategoryResult] = Field(default_factory=list)
    weighted_total: float = 0.0
    weighted_average: float = 0.0
    category_averages: dict[str, float] = Field(default_factory=dict)
    report_markdown: str = ""
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    token_usage: dict = Field(default_factory=dict)
    cost_usd: float = 0.0


class LectureMetadata(BaseModel):
    """메타데이터 CSV에서 로드된 강의 정보 (일별 통합)."""

    course_id: str
    course_name: str
    date: str
    subjects: list[str] = Field(default_factory=list)
    contents: list[str] = Field(default_factory=list)
    instructor: str = ""
    sub_instructors: list[str] = Field(default_factory=list)
