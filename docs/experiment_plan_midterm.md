# 중간보고 실험 계획서

> **작성일:** 2026-03-17
> **목적:** AI 강의 평가 시스템의 신뢰성 검증을 위한 가설 검정
> **모델:** GPT-4o-mini (비용 효율)

---

## 실험 1: 평가 일관성 검정 (Test-Retest Reliability)

### 연구 질문
> 동일한 LLM이 동일한 강의를 반복 평가할 때, 결과가 일관적인가?

### 가설
- **H₀ (귀무가설):** GPT-4o-mini의 반복 평가 점수 간 급내상관계수(ICC)가 0.6 이하이다 (일관성 낮음)
- **H₁ (대립가설):** ICC > 0.6 (중등도 이상의 일관성)

### 실험 설계
| 항목 | 값 |
|------|-----|
| 모델 | gpt-4o-mini |
| Temperature | 0.1 |
| 청크 크기 | 30분 (기본값) |
| 오버랩 | 5분 |
| 반복 횟수 | 3회 (pass 0, 1, 2) |
| 대상 | 전체 15개 강의 |
| 보정기 | 비활성화 (calibrator OFF — 순수 모델 일관성 측정) |

### 측정 지표
- **ICC (Intraclass Correlation Coefficient):** 급내상관계수, two-way random
- **Cohen's Weighted Kappa:** 첫 두 패스 간 일치도
- **Krippendorff's Alpha:** 전체 패스 간 신뢰도
- **SSI (Score Stability Index):** 점수 안정성 지수

### 해석 기준 (ICC)
| ICC 값 | 해석 |
|--------|------|
| < 0.50 | Poor |
| 0.50 – 0.75 | Moderate |
| 0.75 – 0.90 | Good |
| > 0.90 | Excellent |

### 실행 명령어
```bash
python scripts/run_batch.py \
    --model gpt-4o-mini \
    --temperature 0.1 \
    --passes 3 \
    --chunk-minutes 30 \
    --no-calibrator
```

---

## 실험 2: 청크 크기 영향 검정

### 연구 질문
> 강의 스크립트를 30분 단위 vs 15분 단위로 분할했을 때, 평가 결과에 유의미한 차이가 있는가?

### 가설
- **H₀ (귀무가설):** 30분 청크와 15분 청크의 평가 점수 평균 차이가 0이다 (μ_30 - μ_15 = 0)
- **H₁ (대립가설):** 30분 청크와 15분 청크의 평가 점수 평균 차이가 0이 아니다 (μ_30 - μ_15 ≠ 0)

### 실험 설계
| 항목 | 조건 A (기존) | 조건 B (실험) |
|------|:---:|:---:|
| 모델 | gpt-4o-mini | gpt-4o-mini |
| Temperature | 0.1 | 0.1 |
| **청크 크기** | **30분** | **15분** |
| 오버랩 | 5분 | 5분 |
| 반복 | 1회 | 1회 |
| 보정기 | OFF | OFF |
| 대상 | 전체 15개 | 전체 15개 |

### 통계 검정
- **대응표본 t-test (Paired t-test):** 동일 강의의 30분 vs 15분 점수 비교
- **유의수준:** α = 0.05
- **효과크기:** Cohen's d

### 실행 명령어
```bash
# 조건 A: 30분 청크 (기존 실험 결과 재사용 가능)
python scripts/run_batch.py \
    --model gpt-4o-mini \
    --temperature 0.1 \
    --chunk-minutes 30 \
    --no-calibrator

# 조건 B: 15분 청크
python scripts/run_batch.py \
    --model gpt-4o-mini \
    --temperature 0.1 \
    --chunk-minutes 15 \
    --no-calibrator
```

---

## 비용 추정

| 실험 | 강의 수 | 패스 | 예상 API 호출 | 비용 (추정) |
|------|---------|------|-------------|------------|
| 실험 1 (일관성) | 15 | 3 | 15 × 3 × 5 카테고리 = 225 | ~$3-5 |
| 실험 2 (청크, 조건B만) | 15 | 1 | 15 × 1 × 5 카테고리 = 75 | ~$1-2 |
| **합계** | | | **~300** | **~$4-7** |

> ※ 실험 2 조건 A는 기존 30분 실험 결과 재사용 가능

---

## 분석 파이프라인

1. 실험 실행 → `experiments/{id}/results/` 에 결과 저장
2. 실험 1: `compute_reliability_metrics()` → ICC, Kappa, Alpha 자동 계산
3. 실험 2: Python scipy로 paired t-test + Cohen's d 계산
4. 결과 시각화 및 보고서 정리
