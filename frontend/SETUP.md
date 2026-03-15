# 프론트엔드 로컬 실행 가이드

## 사전 준비

- **Node.js 18+** 설치 필요 (`node -v`로 확인)
- **npm** 패키지 매니저 (Node.js에 포함)

## 로컬 실행

```bash
# 1. 프론트엔드 디렉토리 이동
cd frontend

# 2. 의존성 설치
npm install

# 3. 개발 서버 시작
npm run dev
```

브라우저에서 **http://localhost:3000** 접속하면 대시보드로 자동 리다이렉트됩니다.

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

## 빌드 확인

```bash
npm run build
```

에러 없이 완료되면 프로덕션 배포 준비 완료.

## Vercel 배포

### 방법 1: CLI

```bash
npx vercel
```

### 방법 2: GitHub 연동

1. GitHub 레포를 Vercel에 연결
2. **Root Directory**를 `frontend`로 설정
3. 자동 배포 활성화

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (차트)
- Framer Motion (애니메이션)
- react-markdown (리포트 렌더링)

## 데이터

`public/data/` 디렉토리에 정적 JSON 파일로 관리됩니다.
별도의 백엔드 서버 없이 동작합니다.
