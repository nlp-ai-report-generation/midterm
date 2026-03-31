"""전체 강의 배치 평가 실행 스크립트.

Usage:
    python scripts/run_batch.py
    python scripts/run_batch.py --model gpt-4o-mini --passes 3
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from src.experiment.config import ExperimentConfig
from src.experiment.comparator import compute_reliability_metrics
from src.experiment.runner import run_experiment

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def main() -> None:
    parser = argparse.ArgumentParser(description="전체 강의 배치 평가")
    parser.add_argument("--model", default="gpt-4o", help="OpenAI 모델")
    parser.add_argument("--temperature", type=float, default=0.1)
    parser.add_argument("--passes", type=int, default=1, help="반복 횟수 (IRR용)")
    parser.add_argument("--no-calibrator", action="store_true")
    parser.add_argument("--chunk-minutes", type=int, default=30)
    args = parser.parse_args()

    config = ExperimentConfig(
        name=f"batch_{args.model}_t{args.temperature}",
        description=f"전체 15개 강의 배치 평가 (passes={args.passes})",
        model=args.model,
        temperature=args.temperature,
        chunk_duration_minutes=args.chunk_minutes,
        use_calibrator=not args.no_calibrator,
        num_passes=args.passes,
        target_transcripts=[],  # 전체
    )

    print(f"배치 평가 시작 (model={args.model}, passes={args.passes})")
    result_dir = run_experiment(config)
    print(f"완료. 결과: {result_dir}")

    # 신뢰도 메트릭 (passes > 1인 경우)
    if args.passes > 1:
        print("\n신뢰도 메트릭 계산 중...")
        metrics = compute_reliability_metrics(result_dir)
        if "_overall" in metrics:
            print(json.dumps(metrics["_overall"], ensure_ascii=False, indent=2))

    # 요약 출력
    summary_path = result_dir / "summary.json"
    if summary_path.exists():
        with open(summary_path) as f:
            summary = json.load(f)
        print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
