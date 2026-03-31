"""평가 항목 가중치 정의.

체크리스트 ver 2.0 기준:
- HIGH (핵심평가항목): 3.0
- MEDIUM (일반평가항목): 2.0
- LOW (참고평가항목): 1.0
"""

from __future__ import annotations

from enum import Enum


class Weight(Enum):
    HIGH = 3.0
    MEDIUM = 2.0
    LOW = 1.0


WEIGHT_MAP: dict[str, float] = {
    "HIGH": Weight.HIGH.value,
    "MEDIUM": Weight.MEDIUM.value,
    "LOW": Weight.LOW.value,
    # 호환성: 기존 config/checklist.yaml의 소문자 키
    "high": Weight.HIGH.value,
    "medium": Weight.MEDIUM.value,
    "low": Weight.LOW.value,
}


def get_weight(weight_str: str) -> float:
    """가중치 문자열을 숫자로 변환."""
    return WEIGHT_MAP.get(weight_str.strip(), Weight.MEDIUM.value)
