"""A/B 실험 실행 스크립트.

Usage:
    python scripts/run_experiment.py --config experiments/my_config.json
    python scripts/run_experiment.py --compare exp_id_1 exp_id_2
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from src.experiment.comparator import compare_experiments, compute_reliability_metrics
from src.experiment.config import ExperimentConfig
from src.experiment.runner import EXPERIMENTS_DIR, run_experiment

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def run_from_config(config_path: str) -> None:
    """JSON 설정 파일로 실험 실행."""
    with open(config_path, encoding="utf-8") as f:
        config_data = json.load(f)

    config = ExperimentConfig.from_dict(config_data)
    print(f"실험 시작: {config.name} (id={config.experiment_id})")

    result_dir = run_experiment(config)
    print(f"완료. 결과: {result_dir}")

    if config.num_passes > 1:
        metrics = compute_reliability_metrics(result_dir)
        print("\n=== 신뢰도 메트릭 ===")
        if "_overall" in metrics:
            print(json.dumps(metrics["_overall"], ensure_ascii=False, indent=2))


def compare(exp_ids: list[str]) -> None:
    """실험 결과 비교."""
    dirs = [EXPERIMENTS_DIR / eid for eid in exp_ids]
    missing = [d for d in dirs if not d.exists()]
    if missing:
        print(f"결과 디렉토리 없음: {missing}")
        return

    result = compare_experiments(dirs)
    print("\n=== 실험 비교 ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="A/B 실험 실행 및 비교")
    parser.add_argument("--config", help="실험 설정 JSON 경로")
    parser.add_argument("--compare", nargs="+", help="비교할 실험 ID들")
    args = parser.parse_args()

    if args.config:
        run_from_config(args.config)
    elif args.compare:
        compare(args.compare)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
