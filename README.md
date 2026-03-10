# AI Lecture Analysis Report Generator

NLP-based project for analyzing lecture STT scripts and generating instructor feedback reports.

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
