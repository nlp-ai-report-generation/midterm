# 하네스 MD 포맷 스펙

## 구조

각 하네스 파일은 **YAML 프론트매터** + **마크다운 본문**으로 구성된다.

### 프론트매터 (YAML)

```yaml
---
harness_id: category_1_language        # 고유 ID
category: "1. 언어 표현 품질"           # 카테고리 한국어명
version: "1.0"                          # 하네스 버전
model: "gpt-4o"                         # 기본 모델 (실험 config로 오버라이드 가능)
temperature: 0.1                        # 기본 온도
items:                                  # 평가 항목 리스트
  - item_id: "1.1"
    name: "불필요한 반복 표현"
    weight: HIGH                        # HIGH / MEDIUM / LOW
    chunk_focus: all                    # all / first / last
    merge_strategy: frequency_aggregate # frequency_aggregate / average / rate_calculation
---
```

### 본문 (마크다운)

LLM에 전달되는 시스템 프롬프트로 사용된다.

필수 섹션:
1. **역할** - 평가자 페르소나 정의
2. **평가 대상** - STT 특성 및 주의사항
3. **평가 항목 상세** - 각 항목별 세부 기준 원문 + 1~5점 앵커 예시
4. **출력 형식** - JSON 스키마 명시
5. **주의사항** - 가드레일

### merge_strategy 옵션

- `frequency_aggregate`: 빈도 기반 항목 (반복 표현, 이해 확인 질문 등). 청크별 증거를 합산하고 점수를 평균.
- `average`: 일반 항목. 청크별 점수의 가중 평균.
- `rate_calculation`: 수치 계산 기반 (발화 속도). 전체 시간/발화량으로 산출.

### chunk_focus 옵션

- `all`: 전체 청크 대상
- `first`: 첫 번째 청크만 (도입부 항목: 학습 목표, 복습 연계)
- `last`: 마지막 청크만 (마무리 항목: 마무리 요약)
