# 스크린샷 디렉토리

이 디렉토리에는 발표 영상에 사용되는 UI 스크린샷(.png)이 위치한다.

## 생성 방법

프론트엔드 서버가 실행 중인 상태에서:

```bash
cd presentation/remotion
node scripts/capture-screenshots.mjs
```

Puppeteer로 `http://localhost:3003`의 각 페이지를 자동 캡처한다.
