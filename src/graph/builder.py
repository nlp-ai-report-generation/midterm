"""LangGraph 평가 그래프 빌드.

토폴로지: Preprocessor → [Cat1..Cat5] (병렬) → Aggregator → Calibrator(옵션) → ReportGenerator
"""

from __future__ import annotations

import logging
from pathlib import Path

from langgraph.graph import END, StateGraph

from src.graph.nodes.aggregator import aggregate
from src.graph.nodes.calibrator import calibrate
from src.graph.nodes.category_evaluator import make_evaluator
from src.graph.nodes.preprocessor import preprocess
from src.graph.nodes.report_generator import generate_report
from src.graph.state import EvaluationState
from src.harnesses.loader import HARNESSES_DIR

logger = logging.getLogger(__name__)


def build_evaluation_graph(
    use_calibrator: bool = True,
    harness_dir: Path | str | None = None,
) -> StateGraph:
    """평가 파이프라인 LangGraph 빌드.

    Args:
        use_calibrator: 보정 노드 사용 여부
        harness_dir: 하네스 디렉토리 (None이면 기본 경로)

    Returns:
        컴파일된 StateGraph
    """
    harness_dir = Path(harness_dir) if harness_dir else HARNESSES_DIR

    graph = StateGraph(EvaluationState)

    # 1. 전처리 노드
    graph.add_node("preprocessor", preprocess)

    # 2. 카테고리 평가기 노드 (5개)
    category_harnesses = sorted(harness_dir.glob("category_*.md"))
    evaluator_names: list[str] = []

    for harness_path in category_harnesses:
        node_name = f"eval_{harness_path.stem}"
        evaluator = make_evaluator(harness_path)
        graph.add_node(node_name, evaluator)
        evaluator_names.append(node_name)
        logger.info("Added evaluator node: %s", node_name)

    # 3. 집계 노드
    graph.add_node("aggregator", aggregate)

    # 4. 보정 노드 (옵션)
    if use_calibrator:
        graph.add_node("calibrator", calibrate)

    # 5. 리포트 생성 노드
    graph.add_node("report_generator", generate_report)

    # --- 엣지 연결 ---

    # 시작 → 전처리
    graph.set_entry_point("preprocessor")

    # 전처리 → 카테고리 평가기들 (팬아웃)
    for name in evaluator_names:
        graph.add_edge("preprocessor", name)

    # 카테고리 평가기들 → 집계 (팬인)
    for name in evaluator_names:
        graph.add_edge(name, "aggregator")

    # 집계 → 보정 또는 리포트
    if use_calibrator:
        graph.add_edge("aggregator", "calibrator")
        graph.add_edge("calibrator", "report_generator")
    else:
        graph.add_edge("aggregator", "report_generator")

    # 리포트 → 종료
    graph.add_edge("report_generator", END)

    return graph.compile()
