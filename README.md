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
- **강의 비교** — 2개 강의를 나란히 카테고리별 비교
- **점수 추이** — 카테고리별 시계열 변화 추적
- **항목별 분석** — 18개 항목 중 하나를 전 강의에 걸쳐 분석
- **로그인** — Google / Notion OAuth (Supabase Auth)
- **외부 연동** — 구글 드라이브 파일 가져오기, 노션 결과 내보내기
- **GitHub Actions 평가** — 파일 업로드 → 자동 평가 → 결과 배포
- **반응형 디자인** — 데스크탑 + 모바일 (하단 탭바)

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 19, Vite, TypeScript, Tailwind CSS v4, Recharts |
| 백엔드 | Python 3.11, LangGraph, FastAPI |
| LLM | OpenAI GPT-4o mini, Claude Opus, Claude Sonnet |
| 인증 | Supabase Auth (Google, Notion OAuth) |
| 데이터베이스 | Supabase (PostgreSQL) |
| 서버리스 | Supabase Edge Functions (Deno) |
| CI/CD | GitHub Actions (평가 자동화 + Pages 배포) |
| 배포 | GitHub Pages |

## 아키텍처

### 평가 파이프라인

```
Preprocessor (STT 파싱 + 30분 윈도우 청킹)
    ↓
[언어 품질] [강의 구조] [개념 명확성] [예시/실습] [상호작용]  ← 5개 병렬 평가
    ↓
Aggregator (가중 평균: HIGH=3, MEDIUM=2, LOW=1)
    ↓
Calibrator (교차 보정, 선택)
    ↓
Report Generator (마크다운 리포트)
```

### 자동 평가 흐름 (GitHub Actions)

```
트랜스크립트 업로드 → Actions 트리거
    ↓
Python 파이프라인 실행 (LangGraph + OpenAI)
    ↓
결과 JSON 커밋 → GitHub Pages 자동 재배포
```

### 외부 연동

```
구글 드라이브 → 파일 가져오기 → 평가 실행
평가 결과 → 노션 데이터베이스에 기록
사용자 설정 → Supabase DB에 저장 (기기 간 동기화)
```

### 평가 체계

| 카테고리 | 항목 수 | 핵심(HIGH) | 주요 평가 내용 |
|---------|---------|-----------|--------------|
| 1. 언어 표현 품질 | 3 | 1 | 반복 표현, 발화 완결성, 언어 일관성 |
| 2. 강의 도입 및 구조 | 5 | 2 | 학습 목표, 복습 연계, 설명 순서, 마무리 |
| 3. 개념 설명 명확성 | 4 | 2 | 개념 정의, 비유/예시, 발화 속도 |
| 4. 예시 및 실습 연계 | 2 | 2 | 예시 적절성, 이론→실습 연결 |
| 5. 수강생 상호작용 | 4 | 3 | 이해 확인, 참여 유도, 질문 응답 |

### 프로젝트 구조

```
├── frontend/              # React 대시보드 (Vite + TypeScript)
│   └── src/
│       ├── app/            # 대시보드, 강의 페이지
│       ├── pages/          # EDA, 모델비교, 설정, 비교, 추이 등
│       ├── components/     # 레이아웃 + 공유 컴포넌트
│       ├── contexts/       # AuthContext, RoleContext
│       └── lib/            # 데이터, API, Supabase 클라이언트
├── src/                    # LangGraph 평가 파이프라인
│   ├── graph/              # 그래프 토폴로지, 상태, 노드
│   ├── harnesses/          # MD 기반 프롬프트 하네스 (5개 카테고리)
│   ├── scoring/            # 가중치 및 집계 로직
│   └── experiment/         # 실험 프레임워크 (IRR 메트릭)
├── api/                    # FastAPI 서버 (OAuth, 평가 실행)
├── supabase/               # DB 스키마 + Edge Functions
├── .github/workflows/      # 배포 + 평가 자동화
├── scripts/                # 배치 실행, 데이터 내보내기
├── experiments/            # 모델별 실험 결과
└── tests/                  # 단위 테스트 (46개)
```

## 시작하기

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### 백엔드 API

```bash
cp .env.example .env
# .env에 OPENAI_API_KEY 설정

pip install -r requirements.txt
pip install -r api/requirements.txt
uvicorn api.main:app --reload --port 8000
```

### 평가 실행

```bash
# 단일 강의 평가
python3 scripts/run_single.py --date 2026-02-02 --model gpt-4o-mini

# 전체 배치 평가
python3 scripts/run_batch.py --model gpt-4o-mini --passes 1

# 결과를 프론트엔드 JSON으로 내보내기
python3 scripts/export_frontend_data.py --experiment-id <ID>
```

### GitHub Actions로 평가

GitHub 레포 → Actions → "Evaluate Lecture" → Run workflow
- `transcript_filename`: 파일명
- `date`: 강의 날짜
- `model`: gpt-4o-mini (기본)

⚠️ GitHub Secrets에 `OPENAI_API_KEY` 설정 필요

### 테스트

```bash
pytest -v
```

## 데이터

- **15개** 강의 STT 트랜스크립트 (2026.02.02 ~ 02.27)
- **백엔드 부트캠프 21기**: Java (KDT)
- **3개 AI 모델** × 15개 강의 = **45개** 평가 결과
- **EDA**: 실제 트랜스크립트에서 추출한 정량 분석 (22,756줄)
- **AI 심층 분석**: Claude Opus가 직접 읽고 정성 분석

## 대시보드 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 대시보드 | /dashboard | 전체 현황, KPI, 히트맵, 추이 |
| 강의 평가 | /lectures | 15개 강의 목록 + 모델 전환 |
| 데이터 분석 | /eda | 발화량, 화자, 소통, 습관, 수업흐름, AI 심층분석 |
| 평가 기준 | /checklist | 18개 항목 시각화 |
| 모델 비교 | /experiments | 3모델 점수 비교 + 카테고리 차트 |
| 강의 비교 | /compare | 2개 강의 나란히 비교 |
| 점수 추이 | /trends | 카테고리별 시계열 변화 |
| 항목별 분석 | /items | 특정 항목의 전 강의 점수 + 근거 |
| 설정 | /settings | API 키, 모델, 파라미터, 파일 업로드 |
| 연동 설정 | /integrations | 구글 드라이브, 노션 연동 |
| 프로젝트 소개 | /about | 아키텍처, 기술스택, 통계 |

## 배포

**GitHub Pages** — `main` 브랜치 push 시 자동 빌드 + 배포 (GitHub Actions)

**Supabase** — Auth, DB, Edge Functions

## 팀

4인 인턴팀 (멋쟁이사자처럼, 4주 프로젝트)

## 라이선스

MIT
