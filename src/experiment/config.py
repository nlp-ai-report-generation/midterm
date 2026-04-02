"""실험 구성 정의."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ExperimentConfig:
    """실험 설정.

    다양한 변수를 조합하여 A/B 실험을 수행할 수 있다.
    """

    # 식별
    experiment_id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    name: str = ""
    description: str = ""

    # 모델
    model: str = "gpt-4o"
    temperature: float = 0.1

    # 청킹
    chunk_duration_minutes: int = 30
    chunk_hop_minutes: int = 25

    # 평가
    harness_dir: str = ""  # 빈 문자열이면 기본 하네스 디렉토리
    num_passes: int = 1  # 반복 횟수 (IRR 계산용)
    use_calibrator: bool = True

    # 점수
    weight_scheme: str = "default"  # "default" | "equal"

    # 대상
    target_transcripts: list[str] = field(default_factory=list)  # 빈 리스트 = 전체

    # 메타데이터
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> dict:
        """JSON 직렬화용 딕셔너리."""
        return {
            "experiment_id": self.experiment_id,
            "name": self.name,
            "description": self.description,
            "model": self.model,
            "temperature": self.temperature,
            "chunk_duration_minutes": self.chunk_duration_minutes,
            "chunk_hop_minutes": self.chunk_hop_minutes,
            "harness_dir": self.harness_dir,
            "num_passes": self.num_passes,
            "use_calibrator": self.use_calibrator,
            "weight_scheme": self.weight_scheme,
            "target_transcripts": self.target_transcripts,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> ExperimentConfig:
        """딕셔너리에서 ExperimentConfig 생성."""
        normalized = dict(data)
        if "chunk_hop_minutes" not in normalized and "chunk_overlap_minutes" in normalized:
            window = int(normalized.get("chunk_duration_minutes", 30))
            overlap = int(normalized["chunk_overlap_minutes"])
            normalized["chunk_hop_minutes"] = window - overlap

        return cls(**{k: v for k, v in normalized.items() if k in cls.__dataclass_fields__})
