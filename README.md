# AI 강의 분석 리포트

> LangGraph 기반 에이전틱 강의 평가 파이프라인 + 대시보드

## 프로젝트 개요

STT 트랜스크립트를 AI가 분석하여 **5개 카테고리 × 18개 항목**으로 강의 품질을 평가하고,
교육 운영자와 강사에게 **근거 기반 피드백**을 제공하는 시스템입니다.

백엔드 부트캠프 21기(Java, KDT) 15개 강의를 대상으로 3개 AI 모델이 교차 평가한 결과를
인터랙티브 대시보드에서 탐색할 수 있습니다.

## 주요 기능

- **18개 항목 자동 평가** — 언어 품질, 강의 구조, 개념 명확성, 예시/실습, 상호작용
- **3모델 비교** — GPT-4o mini, Claude Opus, Claude Sonnet 교차 평가
- **역할 기반 UI** — 운영자(전체 관리) / 강사(개인 피드백)
- **데이터 분석** — 발화량, 화자 구성, 소통 빈도, 습관 표현, 수업 흐름
- **AI 심층 분석** — 강의별 교수법 특징, 습관 패턴, 소통 품질
- **반응형 디자인** — 데스크탑 + 모바일

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19, Vite, TypeScript, Tailwind CSS v4, Recharts |
| 백엔드 | Python 3.11, LangGraph, FastAPI |
| LLM | OpenAI GPT-4o mini, Claude Opus, Claude Sonnet |
| 배포 | GitHub Pages (Actions 자동 배포) |
| 데이터 | 정적 JSON (DB 불필요) |

## 아키텍처

### 평가 파이프라인

```
Preprocessor (STT 파싱 + 청킹)
    ↓
[언어 품질] [강의 구조] [개념 명확성] [예시/실습] [상호작용]  ← 5개 병렬 평가
    ↓
Aggregator (가중 평균 계산)
    ↓
Calibrator (교차 보정, 선택)
    ↓
Report Generator (마크다운 리포트)
```

### 평가 체계

| 카테고리 | 항목 수 | 핵심(HIGH) | 주요 평가 내용 |
|---------|---------|-----------|--------------|
| 1. 언어 표현 품질 | 3 | 1 | 반복 표현, 발화 완결성, 언어 일관성 |
| 2. 강의 도입 및 구조 | 5 | 2 | 학습 목표, 복습 연계, 설명 순서, 마무리 |
| 3. 개념 설명 명확성 | 4 | 2 | 개념 정의, 비유/예시, 발화 속도 |
| 4. 예시 및 실습 연계 | 2 | 2 | 예시 적절성, 이론→실습 연결 |
| 5. 수강생 상호작용 | 4 | 3 | 이해 확인, 참여 유도, 질문 응답 |

- 점수: 1~5점 (매우미흡~매우우수)
- 가중치: HIGH=3, MEDIUM=2, LOW=1

### 프로젝트 구조

```
├── frontend/          # React 대시보드 (Vite + TypeScript)
│   └── src/
│       ├── app/       # 라우트별 페이지
│       ├── components/# 공통 컴포넌트
│       ├── contexts/  # 상태 관리
│       └── pages/     # 기능 페이지
├── src/               # LangGraph 평가 파이프라인
│   ├── graph/         # 그래프 토폴로지, 상태, 노드
│   ├── harnesses/     # MD 기반 프롬프트 하네스
│   ├── scoring/       # 가중치 및 집계 로직
│   └── experiment/    # 실험 프레임워크 (IRR 메트릭 포함)
├── api/               # FastAPI 서버
├── scripts/           # 배치 실행 스크립트
├── data/              # STT 트랜스크립트 + 평가 결과 JSON
├── experiments/       # 모델 비교 실험 결과
├── config/            # 설정 파일
└── tests/             # 단위 테스트
```

## 시작하기

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

### 백엔드 API

```bash
pip install -r api/requirements.txt
uvicorn api.main:app --reload --port 8000
```

### 평가 실행

```bash
# 단일 강의 평가
python3 scripts/run_single.py --date 2026-02-02 --model gpt-4o-mini

# 전체 배치 평가
python3 scripts/run_batch.py --model gpt-4o-mini --passes 1
```

### 테스트

```bash
pytest -v
```

## 데이터

- **15개** 강의 STT 트랜스크립트 (2026.02.02 ~ 02.27)
- **백엔드 부트캠프 21기**: Java (KDT)
- **3개 AI 모델** × 15개 강의 = **45개** 평가 결과

## 실험 프레임워크

변수를 바꿔가며 평가 품질을 비교할 수 있습니다:

| 실험 변수 | 기본값 | 대안 |
|----------|--------|------|
| 모델 | gpt-4o | gpt-4o-mini |
| 온도 | 0.1 | 0.0, 0.3 |
| 청킹 | 30분 윈도우 | 45분, 60분 |
| 보정 | on | off |
| 반복 | 1패스 | 3패스, 5패스 |

## 배포

GitHub Pages 자동 배포 — `main` 브랜치에 push 시 GitHub Actions가 빌드 및 배포를 실행합니다.

## 팀

4인 인턴팀 (멋쟁이사자처럼, 4주 프로젝트)

## 라이선스

MIT
