# 프론트엔드 로컬 실행 가이드

## 사전 준비

- **Node.js 18+** (`node -v`로 확인)
- **Python 3.11+** (API 서버 실행 시)

## 1. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 **http://localhost:3000** 접속 → 대시보드로 자동 리다이렉트.

## 2. API 서버 실행 (OpenAI 연동)

실제 강의 평가를 실행하려면 백엔드 API 서버가 필요합니다.

```bash
# 프로젝트 루트에서
pip install -r api/requirements.txt
uvicorn api.main:app --reload --port 8000
```

API 서버가 **http://localhost:8000** 에서 실행됩니다.

### API 키 설정

프론트엔드 설정 페이지(`/settings`)에서 OpenAI API 키를 입력하거나,
`.env` 파일에 직접 설정:

```bash
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY=sk-... 설정
```

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/dashboard` | 대시보드 — KPI 카드, 점수 트렌드 차트, 카테고리 히트맵 |
| `/eda` | EDA 분석 — 스크립트 통계, 화자 분석, 상호작용, 습관어, 커리큘럼 |
| `/preprocessing` | 전처리 — LangGraph 파이프라인 다이어그램 |
| `/lectures` | 강의 목록 — 15개 강의 카드 그리드 |
| `/lectures/{date}` | 개별 강의 — 레이더 차트, 항목별 점수, 근거 |
| `/experiments` | 실험 비교 — 신뢰도 지표 (κ, α, ICC, SSI) |
| `/reports` | 리포트 생성 — 강의 선택, 마크다운 미리보기, 다운로드 |
| `/settings` | 설정 — OpenAI API 키, 모델, 파라미터 설정 |

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 헬스 체크 |
| POST | `/api/settings` | API 키 설정 |
| POST | `/api/validate-key` | API 키 유효성 검증 |
| POST | `/api/evaluate` | 강의 평가 실행 |
| GET | `/api/experiments` | 실험 결과 목록 |
| GET | `/api/experiments/{id}` | 실험 상세 결과 |

## 빌드 확인

```bash
cd frontend
npm run build
```

## Vercel 배포

```bash
# CLI 배포
cd frontend && npx vercel

# 또는 GitHub 연동 (Root Directory → frontend)
```

## 기술 스택

- **프론트엔드:** Next.js 15, TypeScript, Tailwind CSS, Recharts, Framer Motion
- **백엔드 API:** FastAPI, uvicorn
- **평가 파이프라인:** LangGraph, OpenAI GPT-4o

## 데이터

- **정적 데이터:** `public/data/` — 원본 스크립트 기반 EDA JSON + 실험 결과에서 내보낸 evaluation JSON
- **실시간 평가:** API 서버 + OpenAI API 키 필요
- **내보내기 스크립트:** 프로젝트 루트에서 `python3 scripts/export_frontend_data.py --experiment-id <id>`
- **현재 커밋 기준:** 실제 스모크 테스트 결과 1건(`2026-02-02`)이 evaluation JSON으로 반영됨
