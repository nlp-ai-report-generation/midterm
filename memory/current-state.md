# 현재 상태

- 기준일: `2026-03-11`
- 현재 운영 목표: LangGraph 기반 에이전틱 평가 시스템의 핵심 파이프라인을 구현하고, 15개 강의 배치 평가를 실행한다.
- 프로젝트 목표: 강의 스크립트와 품질 기준을 바탕으로 강사 개선 인사이트를 자동 생성하는 분석 리포트 시스템을 만든다.

## 최근 완료

- LangGraph 기반 평가 파이프라인 전체 구현 (5-노드 병렬 그래프)
- 5개 카테고리 하네스 MD 작성 (18개 항목 세부 기준 + 5점 앵커)
- 보정 하네스 및 리포트 생성 하네스 작성
- 타임스탬프 기반 청킹 전략 구현 (30분 윈도우, 5분 오버랩)
- 실험 프레임워크 구현 (ExperimentConfig, runner, comparator)
- IRR 메트릭 구현 (Cohen's κ, Krippendorff's α, ICC, SSI)
- OpenAI 비동기 클라이언트 구현 (structured output, rate limiting)
- LangSmith 옵션 통합
- 단위 테스트 46개 전부 통과
- 엔트리 스크립트 3종 (run_single, run_batch, run_experiment)

## 지금 중요한 일

1. `.env` 파일에 `OPENAI_API_KEY` 설정 후 단일 강의 스모크 테스트
2. 스모크 테스트 결과 기반으로 하네스 프롬프트 품질 튜닝
3. 전체 15개 배치 평가 실행
4. 반복 실행(3패스) → IRR 메트릭 확인 → 신뢰도 임계값 달성 여부 확인
5. A/B 실험 설계 및 실행 (모델, 온도, 청킹 변수)

## 현재 저장소 상태

- 평가 파이프라인: **구현 완료** (`src/graph/`, `src/harnesses/`, `src/chunking/`, `src/scoring/`)
- 실험 프레임워크: **구현 완료** (`src/experiment/`)
- 기존 코드(src/preprocessing, src/rule_analysis 등): 유지, 하이브리드 활용 가능
- 테스트: 46개 통과 (chunking, scoring, metrics, harness loading)
- 대시보드/UI: 미구현 (Streamlit 스캐폴드만 존재)

## 다음 세션 시작 체크리스트

1. `AGENTS.md` 읽기
2. `memory/decisions.md` 확인
3. `.env`에 `OPENAI_API_KEY` 확인
4. `python3 scripts/run_single.py --date 2026-02-02` 실행

## 현재 블로커

- `OPENAI_API_KEY` 설정 필요 (실제 평가 실행 전제조건)
