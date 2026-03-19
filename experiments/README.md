# 실험 결과 디렉토리

이 디렉토리에는 평가 파이프라인 실험 결과가 저장된다. 보안 정책에 따라 원본 결과 데이터는 이 레포지토리에 포함되지 않는다.

## 디렉토리 구조

각 실험은 고유 ID를 가진 하위 디렉토리에 저장된다.

```
experiments/
└── {experiment_id}/
    ├── config.json          # 실험 설정 (모델, 청크 크기, 반복 횟수 등)
    ├── summary.json         # 실험 요약 (평균 점수, 소요 시간, 비용)
    ├── metrics.json         # 신뢰도 메트릭 (ICC, Kappa, Alpha, SSI)
    ├── results/             # 강의별 평가 결과 JSON
    │   └── 2026-02-{dd}_pass_{n}.json
    └── report_*.md          # 강의별 자연어 리포트
```

## 실험 실행 방법

```bash
# 신뢰도 검증 (3회 반복)
python3 scripts/run_batch.py --model gpt-4o-mini --passes 3 --no-calibrator

# 청크 크기 실험
python3 scripts/run_batch.py --model gpt-4o-mini --chunk-minutes 15
```
