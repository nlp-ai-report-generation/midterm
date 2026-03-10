# AI Lecture Analysis Report Generator

NLP-based project for analyzing lecture STT scripts and generating instructor feedback reports.

## 아키텍처 결정: 분석 접근 방식 비교

프로젝트의 핵심인 "강의 품질 분석"을 어떻게 구현할지 두 가지 접근 방식이 있습니다.

---

### 1. 전통적 파이프라인 방식 (Rule-Based Pipeline)

**흐름:**
```
STT 원문 → 파싱 → 청킹(Chunking) → 전처리 → 규칙 기반 분석 → 점수 산출 → 리포트
```

**특징:**
- 각 단계가 명확히 분리된 파이프라인
- 정규표현식, 통계적 기법, 사전 정의된 규칙 활용
- 2년 전 NLP 프로젝트에서 주로 사용하던 방식

**장점:**
- 실행 속도 빠름
- 비용 저렴 (LLM 호출 없음)
- 결과 일관성 높음
- 디버깅 용이
- 배포 단순

**단점:**
- 문맥 이해 부족 ("이건 반복인가?" 판단 어려움)
- 새로운 분석 항목 추가 시 규칙 추가 필요
- STT 오류에 취약
- "설명의 명확성" 같은 정성 항목 분석 어려움

**적합한 항목:**
- 불필요한 반복 표현 (단순 카운트)
- 부적절한 표현 (금지어 목록)
- 발화 속도, 침묵 구간 등 시간 기반 분석

---

### 2. 에이전틱 방식 (Agentic AI)

**흐름:**
```
STT 원문 → LLM 에이전트 (도구 하네스 장착) → 분석 수행 → 결과 반환
```

**특징:**
- LLM이 "분석가" 역할을 수행
- 필요할 때마다 도구(Tool)를 호출하여 작업 수행
- Chain-of-Thought, ReAct 등의 프롬프팅 기법 활용

**장점:**
- 문맥 이해 가능 ("이 반복은 의도적인가?")
- 유연한 분석 (새로운 항목 추가 시 프롬프트만 수정)
- 정성 항목 분석 가능 ("설명이 명확한가?")
- 자연어로 된 피드백 생성 용이

**단점:**
- 실행 속도 느림 (LLM 호출 비용)
- 결과 일관성 낮음 (동일 입력, 다른 출력 가능)
- 비용 증가
- 디버깅 어려움 (왜 이런 결과가 나왔는지 추적 어려움)

**적합한 항목:**
- 설명의 명확성
- 예시의 적절성
- 질문 유도 패턴
- 종합적인 개선 제안

---

### 3. 하이브리드 방식 (추천)

**흐름:**
```
STT 원문 → [전처리 파이프라인] → [규칙 기반 1차 분석] → [LLM 2차 정성 분석] → 리포트
```

**전략:**
- **규칙 기반**: 빠르고 확실한 항목 (반복 표현, 부적절 표현, 발화 속도)
- **LLM 기반**: 문맥 이해가 필요한 항목 (설명 명확성, 예시 적절성)
- **결과 통합**: 정량 점수 + 정성 피드백

**장점:**
- 각 방식의 장점 결합
- 비용 효율적 (LLM은 필요한 부분만 호출)
- 정량 + 정성 리포트 모두 가능
- 일관성과 유연성 균형

**구현 포인트:**
```python
# 예시 구조
def analyze_lecture(transcript):
    # 1차: 규칙 기반 분석 (빠름, 저렴)
    rule_results = rule_based_analyze(transcript)
    
    # 2차: LLM 정성 분석 (필요한 부분만)
    llm_results = llm_qualitative_analyze(
        transcript, 
        focus_areas=["clarity", "examples", "engagement"]
    )
    
    # 결과 통합
    return merge_results(rule_results, llm_results)
```

---

### 결정 필요 사항

| 질문 | 옵션 | 고려사항 |
|------|------|----------|
| 기본 접근 방식은? | 파이프라인 / 에이전틱 / 하이브리드 | 시간, 비용, 품질 균형 |
| LLM 사용 범위는? | 전체 / 일부 / 없음 | 어떤 항목에 LLM 필요한가? |
| 규칙 기반으로 먼저 MVP? | 예 / 아니오 | 중간평가 시연 고려 |
| 점수 체계는? | 규칙 기반 / LLM 보조 / LLM主导 | 신뢰성 vs 풍부함 |

---

## Repository Layout

- `src/preprocessing`: STT cleaning, timestamp parsing, speaker separation
- `src/rule_analysis`: rule-based metrics and scoring
- `src/llm_analysis`: model client abstraction and qualitative analysis
- `src/report`: report data assembly and file export
- `app`: Streamlit UI
- `config`: settings and checklist definitions
- `data/sample`: versioned sample data only

## Quick Start

1. Create virtual environment.
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill API keys.
4. Run checks: `python scripts/check_env.py`
5. Run tests: `pytest`
6. Start app: `streamlit run app/main.py`

## Branch Strategy

- `main`: stable releases
- `develop`: integration branch
- `feature/a-preprocessing`
- `feature/b-rule-analysis`
- `feature/c-llm-analysis`
- `feature/d-report-ui`

## 팀 구성

4인 1팀 (PM, 개발, 데이터, 발표 역할 분담)

## 일정

- 기간: 4주 (총 60시간)
- 중간평가: 2주차 (기획서, 시연 영상, 진행 현황 보고서)
- 최종평가: 4주차 (분석 리포트 샘플, 대시보드 시연, 최종 보고서)

## 평가 기준

| 평가 항목 | 배점 | 세부 기준 |
|----------|------|----------|
| 서비스 완성도 | 30% | 분석 리포트의 품질, UI/UX 완성도, 결과물의 실용성 |
| 커뮤니케이션 | 25% | 기획서/보고서 전달력, 진행 현황 공유의 적절성 |
| 문제 해결력 | 25% | 데이터 한계 극복 방식, 분석 정확도 개선 노력 |
| 프레젠테이션 | 20% | 시연의 명확성, 클라이언트 관점 어필 |

## 제공 데이터

- 강의 스크립트 (STT 기반 텍스트)
- 강의 메타데이터 (과목명, 강사명, 강의 시간 정보)
- 강의 품질 기준 (내부 평가 체크리스트)

## 기술 스택

(팀 내 논의 후 결정 예정)

## 문서

- [의사결정 포인트](./docs/decision-points.md)

## Agent Workflow

- 공용 작업 규칙: [AGENTS.md](./AGENTS.md)
- 공유 메모리 시작점: [memory/current-state.md](./memory/current-state.md)
- 장기 결정 기록: [memory/decisions.md](./memory/decisions.md)
- 저장소 전용 스킬: `agents/skills/`

새 에이전트는 보통 아래 순서로 시작합니다.

1. `AGENTS.md`와 `memory/current-state.md`를 읽습니다.
2. `memory/decisions.md`에서 이미 정해진 방향을 확인합니다.
3. 이번 작업에 맞는 스킬과 관련 문서만 추가로 읽습니다.
4. 작업이 끝나면 메모리 문서를 업데이트합니다.