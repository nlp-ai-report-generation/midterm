"""Hop Size 실험 실행 스크립트.

윈도우 크기를 고정하고 hop 비율(50%, 75%, 90%)을 변경하며
같은 스크립트에 대한 평가 차이를 비교한다.

Usage:
    python scripts/run_hop_experiment.py
    python scripts/run_hop_experiment.py --window 30 --model gpt-4o-mini
    python scripts/run_hop_experiment.py --transcripts 2026-02-02 2026-02-12
    python scripts/run_hop_experiment.py --compare-only exp_id_1 exp_id_2 exp_id_3
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from src.experiment.config import ExperimentConfig
from src.experiment.hop_comparator import compare_hop_experiments
from src.experiment.runner import EXPERIMENTS_DIR, run_experiment

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# 기본 대상 스크립트 (날짜 기준)
DEFAULT_TRANSCRIPTS = [
    "2026-02-02_kdt-backendj-21th.txt",
    "2026-02-12_kdt-backendj-21th.txt",
]

# hop 비율 설정 (이름, 비율)
HOP_RATIOS = [
    ("hop_50pct", 0.50),
    ("hop_75pct", 0.75),
    ("hop_90pct", 0.90),
]


def build_configs(
    window: int,
    model: str,
    temperature: float,
    transcripts: list[str],
) -> list[ExperimentConfig]:
    """3개 hop 비율에 대한 ExperimentConfig 생성."""
    configs = []
    for name, ratio in HOP_RATIOS:
        hop = round(window * ratio)
        overlap = window - hop
        config = ExperimentConfig(
            name=f"{name}_w{window}",
            description=f"Hop size experiment: window={window}min, hop={hop}min ({int(ratio*100)}%), overlap={overlap}min",
            model=model,
            temperature=temperature,
            chunk_duration_minutes=window,
            chunk_hop_minutes=hop,
            num_passes=1,
            use_calibrator=False,
            weight_scheme="default",
            target_transcripts=transcripts,
        )
        configs.append(config)
    return configs


def run_all(configs: list[ExperimentConfig]) -> list[str]:
    """3개 실험을 순차 실행하고 실험 ID 리스트를 반환."""
    experiment_ids = []
    for i, config in enumerate(configs):
        print(f"\n{'='*60}")
        print(f"[{i+1}/{len(configs)}] {config.name}")
        print(f"  hop={config.chunk_hop_minutes}min, window={config.chunk_duration_minutes}min")
        print(f"  model={config.model}, id={config.experiment_id}")
        print(f"{'='*60}")

        result_dir = run_experiment(config)
        experiment_ids.append(config.experiment_id)
        print(f"  완료: {result_dir}")

    return experiment_ids


def main() -> None:
    parser = argparse.ArgumentParser(description="Hop Size 실험 실행 및 비교")
    parser.add_argument("--window", type=int, default=30, help="윈도우 크기 (분, 기본: 30)")
    parser.add_argument("--model", default="gpt-4o-mini", help="모델 (기본: gpt-4o-mini)")
    parser.add_argument("--temperature", type=float, default=0.1, help="온도 (기본: 0.1)")
    parser.add_argument(
        "--transcripts",
        nargs="+",
        default=None,
        help="대상 스크립트 날짜 (e.g., 2026-02-02 2026-02-12)",
    )
    parser.add_argument(
        "--compare-only",
        nargs=3,
        metavar="EXP_ID",
        help="실험 실행 없이 기존 3개 실험 ID로 비교만 수행",
    )
    args = parser.parse_args()

    # 비교만 수행
    if args.compare_only:
        exp_dirs = [EXPERIMENTS_DIR / eid for eid in args.compare_only]
        missing = [d for d in exp_dirs if not d.exists()]
        if missing:
            print(f"결과 디렉토리 없음: {missing}")
            sys.exit(1)

        report_path = compare_hop_experiments(exp_dirs)
        print(f"\n비교 리포트: {report_path}")
        return

    # 스크립트 파일명 결정
    if args.transcripts:
        transcripts = [
            f"{date}_kdt-backendj-21th.txt" if not date.endswith(".txt") else date
            for date in args.transcripts
        ]
    else:
        transcripts = DEFAULT_TRANSCRIPTS

    # 실험 설정 생성
    configs = build_configs(
        window=args.window,
        model=args.model,
        temperature=args.temperature,
        transcripts=transcripts,
    )

    print(f"\n=== Hop Size 실험 ===")
    print(f"Window: {args.window}min")
    print(f"Model: {args.model}")
    print(f"Transcripts: {transcripts}")
    print(f"실험 수: {len(configs)}")
    for c in configs:
        print(f"  - {c.name}: hop={c.chunk_hop_minutes}min")

    # 실험 실행
    experiment_ids = run_all(configs)

    print(f"\n=== 실험 완료 ===")
    for eid in experiment_ids:
        print(f"  - {eid}")

    # 비교 리포트 생성
    exp_dirs = [EXPERIMENTS_DIR / eid for eid in experiment_ids]
    report_path = compare_hop_experiments(exp_dirs)
    print(f"\n비교 리포트: {report_path}")


if __name__ == "__main__":
    main()
