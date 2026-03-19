# 오디오 디렉토리

이 디렉토리에는 발표 영상용 TTS 음성 파일(.mp3)이 위치한다.

## 생성 방법

```bash
cd presentation/remotion
npm run tts
```

OpenAI TTS API를 사용하여 `src/data/scenes.ts`의 narration 텍스트를 음성으로 변환한다.
`.env`에 `OPENAI_API_KEY`가 필요하다.
