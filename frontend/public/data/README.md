# 데이터 디렉토리

이 디렉토리에는 강의 평가 결과 JSON 파일이 위치한다. 보안 정책에 따라 원본 데이터는 이 레포지토리에 포함되지 않는다.

## 필요한 데이터 구조

```
data/
├── metadata.json                    # 15개 강의 메타데이터
├── evaluations/                     # GPT-4o-mini 평가 결과
│   └── 2026-02-{02..27}.json
├── evaluations-opus/                # Claude Opus 평가 결과
│   └── 2026-02-{02..27}.json
├── evaluations-sonnet/              # Claude Sonnet 평가 결과
│   └── 2026-02-{02..27}.json
├── eda/                             # 탐색적 분석 데이터
│   ├── transcript_stats.json
│   ├── speaker_distribution.json
│   ├── interaction_metrics.json
│   ├── filler_words.json
│   └── curriculum_flow.json
└── preprocessing/                   # 전처리 결과
    └── 2026-02-{02..27}.json
```

## 데이터 생성 방법

```bash
# 1. 평가 실행
python3 scripts/run_batch.py --model gpt-4o-mini --passes 1

# 2. 결과를 프론트엔드 JSON으로 내보내기
python3 scripts/export_frontend_data.py --experiment-id <ID>
```
