"""LangSmith 트레이싱 설정 (옵션).

환경변수 LANGCHAIN_TRACING_V2=true 설정 시 활성화.
LangGraph는 네이티브로 LangSmith를 지원하므로 추가 코드 불필요.
"""

from __future__ import annotations

import os
import logging

logger = logging.getLogger(__name__)


def setup_langsmith(project_name: str = "lecture-eval") -> bool:
    """LangSmith 트레이싱 활성화 여부 확인 및 설정.

    Returns:
        True if tracing is enabled
    """
    if os.getenv("LANGCHAIN_TRACING_V2", "").lower() == "true":
        os.environ.setdefault("LANGCHAIN_PROJECT", project_name)
        logger.info(
            "LangSmith tracing enabled: project=%s",
            os.environ["LANGCHAIN_PROJECT"],
        )
        return True

    logger.info("LangSmith tracing disabled (set LANGCHAIN_TRACING_V2=true to enable)")
    return False


def set_experiment_project(experiment_id: str) -> None:
    """실험별 LangSmith 프로젝트 설정."""
    project = f"lecture-eval-{experiment_id}"
    os.environ["LANGCHAIN_PROJECT"] = project
    logger.info("LangSmith project set to: %s", project)
