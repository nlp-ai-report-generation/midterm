"""단일 강의 평가 실행 스크립트.

Usage:
    python scripts/run_single.py --date 2026-02-02
    python scripts/run_single.py --date 2026-02-02 --model gpt-4o-mini --no-calibrator
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parents[1]))

from src.experiment.config import ExperimentConfig
from src.experiment.runner import run_experiment

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


def main() -> None:
    parser = argparse.ArgumentParser(description="단일 강의 평가")
    parser.add_argument("--date", required=True, help="강의 날짜 (e.g., 2026-02-02)")
    parser.add_argument("--model", default="gpt-4o", help="OpenAI 모델")
    parser.add_argument("--temperature", type=float, default=0.1)
    parser.add_argument("--chunk-minutes", type=int, default=30)
    parser.add_argument("--no-calibrator", action="store_true", help="보정 노드 비활성화")
    parser.add_argument("--output-dir", default=None, help="결과 출력 디렉토리")
    args = parser.parse_args()

    transcript_name = f"{args.date}_kdt-backendj-21th.txt"

    config = ExperimentConfig(
        name=f"single_{args.date}",
        description=f"단일 강의 평가: {args.date}",
        model=args.model,
        temperature=args.temperature,
        chunk_duration_minutes=args.chunk_minutes,
        use_calibrator=not args.no_calibrator,
        target_transcripts=[transcript_name],
        num_passes=1,
    )

    print(f"평가 시작: {args.date} (model={args.model})")
    result_dir = run_experiment(config)
    print(f"완료. 결과: {result_dir}")

    # 요약 출력
    summary_path = result_dir / "summary.json"
    if summary_path.exists():
        with open(summary_path) as f:
            summary = json.load(f)
        print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
