"""하네스 MD 파일 로더.

YAML 프론트매터를 설정으로, 마크다운 본문을 시스템 프롬프트로 분리하여 로드한다.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from pathlib import Path

import frontmatter

logger = logging.getLogger(__name__)

HARNESSES_DIR = Path(__file__).parent


@dataclass
class HarnessItem:
    """하네스에 정의된 개별 평가 항목 설정."""

    item_id: str
    name: str
    weight: str = "MEDIUM"
    chunk_focus: str = "all"
    merge_strategy: str = "average"


@dataclass
class Harness:
    """로드된 하네스 설정 및 프롬프트."""

    harness_id: str
    category: str
    version: str = "1.0"
    model: str = "gpt-4o"
    temperature: float = 0.1
    items: list[HarnessItem] = field(default_factory=list)
    system_prompt: str = ""


def load_harness(path: Path | str) -> Harness:
    """하네스 MD 파일을 로드하여 Harness 객체 반환."""
    path = Path(path)
    post = frontmatter.load(str(path))
    meta = post.metadata

    items = [
        HarnessItem(
            item_id=item["item_id"],
            name=item["name"],
            weight=item.get("weight", "MEDIUM"),
            chunk_focus=item.get("chunk_focus", "all"),
            merge_strategy=item.get("merge_strategy", "average"),
        )
        for item in meta.get("items", [])
    ]

    return Harness(
        harness_id=meta.get("harness_id", path.stem),
        category=meta.get("category", ""),
        version=meta.get("version", "1.0"),
        model=meta.get("model", "gpt-4o"),
        temperature=meta.get("temperature", 0.1),
        items=items,
        system_prompt=post.content,
    )


def load_all_category_harnesses() -> list[Harness]:
    """카테고리 하네스 (category_*.md) 전체 로드."""
    harnesses = []
    for path in sorted(HARNESSES_DIR.glob("category_*.md")):
        try:
            harness = load_harness(path)
            harnesses.append(harness)
            logger.info("Loaded harness: %s (%d items)", harness.harness_id, len(harness.items))
        except Exception:
            logger.exception("Failed to load harness: %s", path)
    return harnesses


def load_calibration_harness() -> Harness:
    """보정 하네스 로드."""
    return load_harness(HARNESSES_DIR / "calibration.md")


def load_report_harness() -> Harness:
    """리포트 생성 하네스 로드."""
    return load_harness(HARNESSES_DIR / "report_synthesis.md")
