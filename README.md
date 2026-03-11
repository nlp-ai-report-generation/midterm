# AI 강의 분석 리포트 생성기

STT 강의 스크립트를 자동 분석하여 강사 개선 인사이트를 생성하는 시스템.
LangGraph 기반 에이전틱 평가 파이프라인으로 5개 카테고리, 18개 항목을 정량 평가한다.

## 아키텍처

```
                    ┌──────────────┐
                    │ Preprocessor │  스크립트 로드 + 타임스탬프 청킹
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  Cat 1~2   │  │   Cat 3    │  │  Cat 4~5   │   ← 5개 카테고리 병렬 평가
   │ (하네스 MD)│  │ (하네스 MD)│  │ (하네스 MD)│     (OpenAI GPT-4o)
   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
         └────────────────┼────────────────┘
                          ▼
                   ┌──────────────┐
                   │  Aggregator  │  가중 평균 계산 (HIGH=3, MED=2, LOW=1)
                   └──────┬───────┘
                          ▼
                   ┌──────────────┐
                   │  Calibrator  │  교차 항목 일관성 보정 (±1점)
                   └──────┬───────┘
                          ▼
                   ┌──────────────┐
                   │   Report     │  한국어 마크다운 리포트 생성
                   │  Generator   │
                   └──────────────┘
```

**핵심 설계 결정:**
- 룰베이스 대신 **LLM-as-Judge** 방식 채택 (18개 항목 중 다수가 맥락 이해 필요)
- 각 평가 노드는 **MD 하네스 파일**로 구동 (프롬프트를 코드와 분리)
- **실험 프레임워크** 내장 — 모델, 온도, 청킹 등 변수별 A/B 비교 가능
- **IRR 메트릭** 내장 — Krippendorff's α, Cohen's κ, ICC로 평가 신뢰도 측정

## 평가 체계

체크리스트 ver 2.0 기준, 5개 카테고리 × 18개 항목:

| 카테고리 | 항목 수 | 핵심(HIGH) | 주요 평가 내용 |
|---------|---------|-----------|--------------|
| 1. 언어 표현 품질 | 3 | 1 | 반복 표현, 발화 완결성, 언어 일관성 |
| 2. 강의 도입 및 구조 | 5 | 2 | 학습 목표, 복습 연계, 설명 순서, 마무리 |
| 3. 개념 설명 명확성 | 4 | 2 | 개념 정의, 비유/예시, 발화 속도 |
| 4. 예시 및 실습 연계 | 2 | 2 | 예시 적절성, 이론→실습 연결 |
| 5. 수강생 상호작용 | 4 | 3 | 이해 확인, 참여 유도, 질문 응답 |

- 점수: 1~5점 (매우미흡~매우우수)
- 가중치: HIGH=3, MEDIUM=2, LOW=1
- 가중 평균 범위: 1.0 ~ 5.0

## 디렉토리 구조

```
src/
├── graph/                  # LangGraph 평가 파이프라인
│   ├── builder.py          #   그래프 토폴로지 빌드
│   ├── state.py            #   공유 상태 정의
│   └── nodes/              #   개별 노드 구현
├── harnesses/              # MD 기반 프롬프트 하네스
│   ├── category_1~5_*.md   #   카테고리별 평가 프롬프트
│   ├── calibration.md      #   교차 항목 보정
│   └── report_synthesis.md #   리포트 생성
├── chunking/               # 타임스탬프 기반 청킹
├── scoring/                # 가중치 및 집계 로직
├── experiment/             # 실험 프레임워크
│   ├── config.py           #   ExperimentConfig
│   ├── runner.py           #   실험 실행기
│   ├── comparator.py       #   결과 비교
│   └── metrics.py          #   IRR 메트릭 (κ, α, ICC)
├── integrations/           # OpenAI 클라이언트, LangSmith
├── models.py               # Pydantic 데이터 모델
├── preprocessing/          # STT 파싱, 텍스트 정제
└── rule_analysis/          # 규칙 기반 보조 분석

scripts/
├── run_single.py           # 단일 강의 평가
├── run_batch.py            # 전체 15개 배치 평가
└── run_experiment.py       # A/B 실험 실행/비교

experiments/                # 실험 결과 저장 (JSON + 마크다운)
tests/                      # 50개 단위 테스트
```

## 빠른 시작

### 1. 환경 설정

```bash
pip install -e ".[dev]"
```

### 2. API 키 설정

```bash
cp .env.example .env
# .env 파일에 OPENAI_API_KEY 입력
```

### 3. 단일 강의 평가

```bash
python scripts/run_single.py --date 2026-02-02
```

### 4. 전체 배치 평가

```bash
python scripts/run_batch.py --model gpt-4o --passes 3
```

### 5. 실험 비교

```bash
python scripts/run_experiment.py --compare <exp_id_1> <exp_id_2>
```

### 6. 테스트 실행

```bash
pytest -v
```

## 실험 프레임워크

변수를 바꿔가며 평가 품질을 비교할 수 있다:

| 실험 변수 | 기본값 | 대안 |
|----------|--------|------|
| 모델 | gpt-4o | gpt-4o-mini |
| 온도 | 0.1 | 0.0, 0.3 |
| 청킹 | 30분 윈도우 | 45분, 60분 |
| 보정 | on | off |
| 반복 | 1패스 | 3패스, 5패스 |

결과는 `experiments/{id}/`에 JSON + 마크다운 리포트로 저장된다.

## 신뢰도 메트릭

인간 ground truth 없이 LLM 자기 일관성 기반으로 측정:

| 메트릭 | 목표 임계값 | 근거 |
|--------|-----------|------|
| Krippendorff's α | ≥ 0.667 | 교육측정 표준 |
| Cohen's κ (가중) | ≥ 0.61 | Landis & Koch |
| ICC(2,1) | ≥ 0.75 | Cicchetti, 1994 |

## 데이터

- 강의 스크립트: 15개 (STT 기반, 2026-02-02 ~ 02-27)
- 강의 메타데이터: 30개 세션 (일별 통합)
- 품질 체크리스트: 5 카테고리, 18 항목 (ver 2.0)

## 기술 스택

- **파이프라인**: LangGraph (병렬 팬아웃/팬인)
- **LLM**: OpenAI GPT-4o (structured output)
- **관측성**: LangSmith (옵션)
- **데이터 모델**: Pydantic v2
- **테스트**: pytest (50개)

## 팀

4인 1팀 · 멋쟁이사자처럼 인턴 · 4주 (60시간)

## 문서

- [의사결정 기록](./memory/decisions.md)
- [현재 상태](./memory/current-state.md)
- [열린 질문](./memory/open-questions.md)
- [의사결정 포인트](./docs/decision-points.md)
