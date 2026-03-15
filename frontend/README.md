# 프론트엔드 개요

이 디렉터리는 강의 분석 결과를 보여주는 Next.js 대시보드입니다.
기본 톤은 토스 스타일 토큰을 참고해 재정비했고, `frontend/public/data/` 아래 정적 JSON을 읽어 화면을 구성합니다.

## 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 `/dashboard`로 이동합니다.

## 데이터 흐름

1. 실험 실행: `python3 scripts/run_single.py --date 2026-02-02 --model gpt-4o-mini`
2. 프론트 데이터 내보내기: `python3 scripts/export_frontend_data.py --experiment-id <id>`
3. 대시보드가 `public/data/evaluations/*.json`과 `public/data/eda/*.json`을 읽어 렌더링

## 현재 커밋 상태

- 평가 JSON: 실제 스모크 테스트 결과 1건 (`2026-02-02`)
- EDA JSON: 원본 15개 강의 스크립트로 재생성
- 백엔드 API 키 검증: `/api/validate-key` 실동작 확인
