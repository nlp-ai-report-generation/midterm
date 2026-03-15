# 현재 상태

- 기준일: `2026-03-16`
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
- 로컬 `main` 브랜치를 `origin/main` 최신 커밋(`add509d`)까지 fast-forward 동기화
- 프론트 대시보드 UI를 토스 스타일 토큰 기준으로 재정비 (`frontend/src/app/globals.css`, `frontend/src/components/layout/`, `frontend/src/app/dashboard/page.tsx`)
- 프론트엔드를 Next.js에서 React + Vite + React Router SPA로 전환 (`frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/vite.config.ts`)
- 프론트 레이아웃/타이포/카드 체계를 재설계해 공통 디자인 토큰과 패널 스타일로 통일 (`frontend/src/app/globals.css`, `frontend/src/components/layout/`, `frontend/src/app/dashboard/page.tsx`)
- 실제 실험 결과를 프론트 정적 JSON으로 내보내는 스크립트 확장 (`scripts/export_frontend_data.py`)
- 12시간제 STT 타임스탬프 래핑 보정 추가로 청킹 0건 문제 해결 (`src/chunking/strategy.py`)
- OpenAI 스모크 테스트 성공: `2026-02-02` 단일 강의 평가 실행 완료 (`experiments/e68eb60a8e70/`)
- 프론트 정적 평가 데이터는 샘플 JSON 대신 스모크 테스트 실제 결과 1건으로 교체 (`frontend/public/data/evaluations/2026-02-02.json`)

## 지금 중요한 일

1. 스모크 테스트 결과 기반으로 하네스 프롬프트 품질 튜닝
2. 전체 15개 배치 평가 실행 후 프론트 정적 evaluation JSON 전체 교체
3. 반복 실행(3패스) → IRR 메트릭 확인 → 신뢰도 임계값 달성 여부 확인
4. A/B 실험 설계 및 실행 (모델, 온도, 청킹 변수)
5. 실험 결과 기반 `/experiments` 페이지 실데이터 연결
6. React SPA 배포 경로와 정적 데이터 갱신 흐름 문서 보강

## 현재 저장소 상태

- 평가 파이프라인: **구현 완료** (`src/graph/`, `src/harnesses/`, `src/chunking/`, `src/scoring/`)
- 실험 프레임워크: **구현 완료** (`src/experiment/`)
- 기존 코드(src/preprocessing, src/rule_analysis 등): 유지, 하이브리드 활용 가능
- 테스트: 46개 통과 (chunking, scoring, metrics, harness loading)
- 프론트 UI: 토스 계열 색상 + 공통 hero/panel/card 체계 기준으로 재정비 완료 (`frontend/`)
- 정적 평가 데이터: 실제 분석 결과 1건 반영, 나머지 강의는 배치 실행 필요
- Git 상태: 프론트 React 전환 관련 변경 존재, `.claude/` 디렉터리는 계속 미추적 상태

## 다음 세션 시작 체크리스트

1. `AGENTS.md` 읽기
2. `memory/decisions.md` 확인
3. `.env`에 `OPENAI_API_KEY` 확인
4. `cd frontend && npm run dev`로 React SPA 확인
5. `python3 scripts/run_single.py --date 2026-02-02 --model gpt-4o-mini` 실행
6. `python3 scripts/export_frontend_data.py --experiment-id <id>` 실행

## 현재 블로커

- 전체 15개 강의 실제 평가 결과를 아직 생성하지 않음
