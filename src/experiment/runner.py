"""실험 실행기.

ExperimentConfig를 받아 평가 파이프라인을 실행하고 결과를 저장한다.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from src.experiment.config import ExperimentConfig
from src.graph.builder import build_evaluation_graph
from src.graph.nodes.preprocessor import SCRIPTS_DIR
from src.integrations.langsmith import set_experiment_project, setup_langsmith
from src.models import EvaluationResult

logger = logging.getLogger(__name__)

EXPERIMENTS_DIR = Path(__file__).parents[2] / "experiments"


def _discover_transcripts(config: ExperimentConfig) -> list[Path]:
    """대상 스크립트 파일 탐색."""
    if config.target_transcripts:
        return [SCRIPTS_DIR / t for t in config.target_transcripts]

    # 전체 스크립트
    return sorted(SCRIPTS_DIR.glob("*.txt"))


def _extract_date_from_filename(path: Path) -> str:
    """파일명에서 날짜 추출. e.g., 2026-02-02_kdt-backendj-21th.txt → 2026-02-02"""
    return path.stem.split("_")[0]


def run_experiment(config: ExperimentConfig) -> Path:
    """실험 실행.

    Args:
        config: 실험 설정

    Returns:
        실험 결과 디렉토리 경로
    """
    # LangSmith 설정
    setup_langsmith()
    set_experiment_project(config.experiment_id)

    # 결과 디렉토리 생성
    result_dir = EXPERIMENTS_DIR / config.experiment_id
    results_sub = result_dir / "results"
    results_sub.mkdir(parents=True, exist_ok=True)

    # 설정 저장
    with open(result_dir / "config.json", "w", encoding="utf-8") as f:
        json.dump(config.to_dict(), f, ensure_ascii=False, indent=2)

    # 그래프 빌드
    graph = build_evaluation_graph(
        use_calibrator=config.use_calibrator,
        harness_dir=config.harness_dir or None,
    )

    # 대상 스크립트 탐색
    transcripts = _discover_transcripts(config)
    logger.info(
        "Experiment %s: %d transcripts, %d passes",
        config.experiment_id,
        len(transcripts),
        config.num_passes,
    )

    all_results: list[dict] = []

    for transcript_path in transcripts:
        lecture_date = _extract_date_from_filename(transcript_path)

        for pass_num in range(config.num_passes):
            logger.info(
                "Evaluating %s (pass %d/%d)",
                lecture_date,
                pass_num + 1,
                config.num_passes,
            )

            # 그래프 실행
            initial_state = {
                "lecture_date": lecture_date,
                "transcript_path": str(transcript_path),
                "experiment_config": config.to_dict(),
                "category_scores": {},
            }

            result = graph.invoke(initial_state)

            # 결과 저장
            result_file = results_sub / f"{lecture_date}_pass_{pass_num}.json"
            result_data = {
                "lecture_date": lecture_date,
                "pass_num": pass_num,
                "weighted_average": result.get("weighted_average", 0),
                "weighted_total": result.get("weighted_total", 0),
                "category_averages": result.get("category_averages", {}),
                "category_scores": {
                    cat: [item.model_dump() for item in items]
                    for cat, items in result.get("calibrated_scores", result.get("category_scores", {})).items()
                },
                "report_markdown": result.get("report_markdown", ""),
                "strengths": result.get("strengths", []),
                "improvements": result.get("improvements", []),
                "recommendations": result.get("recommendations", []),
            }

            with open(result_file, "w", encoding="utf-8") as f:
                json.dump(result_data, f, ensure_ascii=False, indent=2)

            all_results.append(result_data)

            # 마크다운 리포트 저장
            if result.get("report_markdown"):
                report_file = result_dir / f"report_{lecture_date}_pass_{pass_num}.md"
                with open(report_file, "w", encoding="utf-8") as f:
                    f.write(result["report_markdown"])

            logger.info(
                "Completed %s pass %d: avg=%.2f",
                lecture_date,
                pass_num,
                result.get("weighted_average", 0),
            )

    # 요약 저장
    summary = {
        "experiment_id": config.experiment_id,
        "name": config.name,
        "total_lectures": len(transcripts),
        "total_passes": config.num_passes,
        "results_count": len(all_results),
        "average_scores": {
            r["lecture_date"]: r["weighted_average"] for r in all_results
        },
    }
    with open(result_dir / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    logger.info("Experiment %s complete. Results at: %s", config.experiment_id, result_dir)
    return result_dir
