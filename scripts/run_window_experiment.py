"""Window Length 실험 실행 스크립트.

hop 비율을 window의 50%로 고정하고, window 길이(30/60/120분)를 비교한다.

Usage:
    python scripts/run_window_experiment.py
    python scripts/run_window_experiment.py --model gpt-4o-mini --temperature 0.1
    python scripts/run_window_experiment.py --compare-only exp_id_1 exp_id_2 exp_id_3
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from src.experiment.config import ExperimentConfig
from src.experiment.window_comparator import compare_window_experiments

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

EXPERIMENTS_DIR = Path(__file__).parents[1] / "experiments"

DEFAULT_TRANSCRIPTS = [
    "2026-02-02_kdt-backendj-21th.txt",
    "2026-02-09_kdt-backendj-21th.txt",
    "2026-02-24_kdt-backendj-21th.txt",
]

# (window, hop)
WINDOW_CONDITIONS = [
    (30, 15),
    (60, 30),
    (120, 60),
]


def build_configs(model: str, temperature: float) -> list[ExperimentConfig]:
    """Window 조건별 실험 설정 생성."""
    configs: list[ExperimentConfig] = []
    for window, hop in WINDOW_CONDITIONS:
        configs.append(
            ExperimentConfig(
                name=f"window_{window}m_h{hop}m",
                description=(
                    "Window size experiment "
                    f"(window={window}min, hop={hop}min, hop_ratio=0.5)"
                ),
                model=model,
                temperature=temperature,
                chunk_duration_minutes=window,
                chunk_hop_minutes=hop,
                num_passes=1,
                use_calibrator=False,
                weight_scheme="default",
                target_transcripts=DEFAULT_TRANSCRIPTS,
            )
        )
    return configs


def run_all(configs: list[ExperimentConfig]) -> list[str]:
    """조건 3개를 순차 실행하고 실험 ID를 반환."""
    from src.experiment.runner import run_experiment

    experiment_ids: list[str] = []
    for i, config in enumerate(configs, start=1):
        print(f"\n{'='*60}")
        print(f"[{i}/{len(configs)}] {config.name}")
        print(
            f"  window={config.chunk_duration_minutes}min, "
            f"hop={config.chunk_hop_minutes}min (ratio=0.5)"
        )
        print(f"  model={config.model}, id={config.experiment_id}")
        print(f"{'='*60}")

        result_dir = run_experiment(config)
        experiment_ids.append(config.experiment_id)
        print(f"  완료: {result_dir}")

    return experiment_ids


def compare_only(experiment_ids: list[str]) -> Path:
    """기존 3개 실험 ID를 비교하여 리포트 생성."""
    exp_dirs = [EXPERIMENTS_DIR / exp_id for exp_id in experiment_ids]
    missing = [d for d in exp_dirs if not d.exists()]
    if missing:
        raise FileNotFoundError(f"결과 디렉토리 없음: {missing}")
    return compare_window_experiments(exp_dirs)


def main() -> None:
    parser = argparse.ArgumentParser(description="Window Length 실험 실행 및 비교")
    parser.add_argument("--model", default="gpt-4o-mini", help="모델 (기본: gpt-4o-mini)")
    parser.add_argument("--temperature", type=float, default=0.1, help="온도 (기본: 0.1)")
    parser.add_argument(
        "--compare-only",
        nargs=3,
        metavar="EXP_ID",
        help="실험 실행 없이 기존 3개 실험 ID로 비교만 수행",
    )
    args = parser.parse_args()

    if args.compare_only:
        report_path = compare_only(args.compare_only)
        print(f"\n비교 리포트: {report_path}")
        return

    configs = build_configs(model=args.model, temperature=args.temperature)

    print("\n=== Window Length 실험 ===")
    print(f"Model: {args.model}")
    print(f"Temperature: {args.temperature}")
    print(f"Transcripts ({len(DEFAULT_TRANSCRIPTS)}): {DEFAULT_TRANSCRIPTS}")
    for window, hop in WINDOW_CONDITIONS:
        print(f"  - window={window}min, hop={hop}min (ratio=0.5)")

    experiment_ids = run_all(configs)

    print("\n=== 실험 완료 ===")
    for exp_id in experiment_ids:
        print(f"  - {exp_id}")

    report_path = compare_only(experiment_ids)
    print(f"\n비교 리포트: {report_path}")


if __name__ == "__main__":
    main()
