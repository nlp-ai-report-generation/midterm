"""리포트 생성 노드: 보정된 점수를 바탕으로 한국어 마크다운 리포트 생성."""

from __future__ import annotations

import asyncio
import json
import logging

from src.graph.state import EvaluationState
from src.harnesses.loader import load_report_harness
from src.integrations.openai_client import OpenAIEvalClient
from src.models import ItemScore

logger = logging.getLogger(__name__)


def _build_report_input(state: EvaluationState) -> str:
    """리포트 생성 입력 구성."""
    metadata = state["metadata"]
    scores = state.get("calibrated_scores") or state.get("category_scores", {})
    calibration_notes = state.get("calibration_notes", "")

    lines: list[str] = [
        "# 평가 결과 데이터",
        "",
        "## 강의 정보",
        f"- 과정: {metadata.course_name}",
        f"- 날짜: {metadata.date}",
        f"- 과목: {', '.join(metadata.subjects)}",
        f"- 내용: {', '.join(metadata.contents)}",
        f"- 강사: {metadata.instructor}",
        "",
        f"## 종합 점수",
        f"- 가중 평균: {state.get('weighted_average', 0):.2f} / 5.0",
        f"- 가중 총점: {state.get('weighted_total', 0):.1f}",
        "",
    ]

    if calibration_notes:
        lines.append(f"## 보정 소견\n{calibration_notes}\n")

    for cat_name, items in sorted(scores.items()):
        lines.append(f"## {cat_name}")
        for item in items:
            evidence_str = "\n    ".join(e[:150] for e in item.evidence[:3])
            lines.append(
                f"### [{item.item_id}] {item.item_name}\n"
                f"- 점수: {item.score}/5 (가중치: {item.weight})\n"
                f"- 근거:\n    {evidence_str}\n"
                f"- 추론: {item.reasoning[:300]}\n"
                f"- 신뢰도: {item.confidence}"
            )
        lines.append("")

    return "\n".join(lines)


async def _generate_report_async(state: EvaluationState) -> dict:
    """비동기 리포트 생성."""
    config = state.get("experiment_config", {})
    harness = load_report_harness()
    model = config.get("model", harness.model)
    temperature = config.get("temperature", harness.temperature)

    client = OpenAIEvalClient(model=model, temperature=temperature)

    report_input = _build_report_input(state)

    try:
        response = await client.evaluate(
            system_prompt=harness.system_prompt,
            user_prompt=report_input,
        )

        return {
            "report_markdown": response.get("report_markdown", ""),
            "strengths": response.get("strengths", []),
            "improvements": response.get("improvements", []),
            "recommendations": response.get("recommendations", []),
        }

    except Exception:
        logger.exception("Report generation failed")
        return {
            "report_markdown": "# 리포트 생성 실패\n\n리포트 생성 중 오류가 발생했습니다.",
            "strengths": [],
            "improvements": [],
            "recommendations": [],
        }


def generate_report(state: EvaluationState) -> dict:
    """리포트 생성 노드 - LangGraph 동기 인터페이스."""
    return asyncio.run(_generate_report_async(state))
