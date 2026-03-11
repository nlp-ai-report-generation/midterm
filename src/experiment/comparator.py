"""실험 결과 비교기.

두 개 이상의 실험 결과를 로드하여 비교 분석한다.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from src.experiment.metrics import (
    cohens_weighted_kappa,
    icc_two_way,
    krippendorffs_alpha,
    score_stability_index,
)

logger = logging.getLogger(__name__)


def load_experiment_results(experiment_dir: Path) -> dict:
    """실험 결과 로드."""
    results: dict = {
        "config": {},
        "summary": {},
        "results": [],
    }

    config_path = experiment_dir / "config.json"
    if config_path.exists():
        with open(config_path, encoding="utf-8") as f:
            results["config"] = json.load(f)

    summary_path = experiment_dir / "summary.json"
    if summary_path.exists():
        with open(summary_path, encoding="utf-8") as f:
            results["summary"] = json.load(f)

    results_dir = experiment_dir / "results"
    if results_dir.exists():
        for result_file in sorted(results_dir.glob("*.json")):
            with open(result_file, encoding="utf-8") as f:
                results["results"].append(json.load(f))

    return results


def compute_reliability_metrics(experiment_dir: Path) -> dict:
    """실험 내 반복 실행 간 신뢰도 메트릭 계산.

    num_passes > 1인 실험에서만 의미있음.
    """
    data = load_experiment_results(experiment_dir)
    results = data["results"]

    if len(results) < 2:
        return {"error": "Need at least 2 passes for reliability metrics"}

    # 강의별, 패스별 점수 정리
    lecture_passes: dict[str, list[list[int]]] = {}
    for result in results:
        date = result["lecture_date"]
        pass_scores = []
        for cat_items in result.get("category_scores", {}).values():
            for item in cat_items:
                pass_scores.append(item.get("score", 3))

        lecture_passes.setdefault(date, []).append(pass_scores)

    metrics: dict = {}

    for date, passes in lecture_passes.items():
        if len(passes) < 2:
            continue

        # 모든 패스의 항목 수가 같은지 확인
        min_items = min(len(p) for p in passes)
        trimmed = [p[:min_items] for p in passes]

        if min_items == 0:
            continue

        # Cohen's Kappa (첫 두 패스)
        kappa = cohens_weighted_kappa(trimmed[0], trimmed[1])

        # Krippendorff's Alpha (모든 패스)
        alpha = krippendorffs_alpha(trimmed)

        # ICC (모든 패스)
        icc = icc_two_way(trimmed)

        # SSI
        ssi = score_stability_index(trimmed)

        metrics[date] = {
            "cohens_kappa": round(kappa, 4),
            "krippendorffs_alpha": round(alpha, 4),
            "icc": round(icc, 4),
            "score_stability_index": round(ssi, 4),
            "n_passes": len(passes),
            "n_items": min_items,
        }

    # 전체 평균
    if metrics:
        avg_kappa = sum(m["cohens_kappa"] for m in metrics.values()) / len(metrics)
        avg_alpha = sum(m["krippendorffs_alpha"] for m in metrics.values()) / len(metrics)
        avg_icc = sum(m["icc"] for m in metrics.values()) / len(metrics)
        avg_ssi = sum(m["score_stability_index"] for m in metrics.values()) / len(metrics)

        metrics["_overall"] = {
            "avg_cohens_kappa": round(avg_kappa, 4),
            "avg_krippendorffs_alpha": round(avg_alpha, 4),
            "avg_icc": round(avg_icc, 4),
            "avg_score_stability_index": round(avg_ssi, 4),
        }

    # 저장
    metrics_path = experiment_dir / "metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    logger.info("Reliability metrics saved to %s", metrics_path)
    return metrics


def compare_experiments(
    experiment_dirs: list[Path],
) -> dict:
    """두 개 이상의 실험 결과 비교."""
    comparison: dict = {"experiments": []}

    for exp_dir in experiment_dirs:
        data = load_experiment_results(exp_dir)
        config = data["config"]
        summary = data["summary"]

        # 평균 점수 수집
        avg_scores = summary.get("average_scores", {})
        overall_avg = (
            sum(avg_scores.values()) / len(avg_scores) if avg_scores else 0
        )

        comparison["experiments"].append({
            "experiment_id": config.get("experiment_id", ""),
            "name": config.get("name", ""),
            "model": config.get("model", ""),
            "temperature": config.get("temperature", 0),
            "chunk_duration": config.get("chunk_duration_minutes", 0),
            "use_calibrator": config.get("use_calibrator", True),
            "overall_average": round(overall_avg, 3),
            "per_lecture_averages": avg_scores,
        })

    return comparison
