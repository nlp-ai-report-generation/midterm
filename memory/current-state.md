# 현재 상태

- 기준일: `2026-04-01`
- 현재 운영 목표: LangGraph 기반 평가 결과를 실제 데이터로 축적하는 동시에, TRIBE v2 기반 수강자 반응 시뮬레이션 실험 기능을 정적 프론트 UX로 연결한다.
- 프로젝트 목표: 강의 스크립트와 품질 기준을 바탕으로 강사 개선 인사이트를 자동 생성하는 분석 리포트 시스템을 만든다.

## 최근 완료

- TRIBE 시뮬레이션 UI를 Toss 기사형 레이아웃 리듬 기준으로 재구성하고, 색 체계를 `오렌지 포인트 + 흰색/검은색/회색`으로 재매핑 (`frontend/src/app/globals.css`, `frontend/src/lib/simulation.ts`, `frontend/src/components/simulation/BrainCanvas.tsx`)
- `/lectures/:date/simulation` 요약 탭을 `hero + aside + 리스트형 feature row` 구조로 재정리하고, 결론 읽기 화면 역할에 맞게 strongest/risk/ROI 설명 밀도를 조정 (`frontend/src/pages/LectureSimulationSummaryPage.tsx`)
- `/lectures/:date/simulation/live`를 `좌측 brain/timeline stage + 우측 해석 rail` 구조로 재정리하고, 현재 줄/패턴/metric/ROI 요약만 남겨 first glance를 brain/timeline으로 고정 (`frontend/src/pages/LectureSimulationLivePage.tsx`, `frontend/src/app/globals.css`)
- `/lectures/:date/simulation/live/transcript`를 대시보드형에서 읽기 중심 기사형 레이아웃으로 바꾸고, sticky 세그먼트 nav + 상단 해석 요약 + line row 강조 구조로 단순화 (`frontend/src/pages/LectureSimulationTranscriptPage.tsx`, `frontend/src/app/globals.css`)
- 강의 상세 페이지의 시뮬레이션 카드를 compact teaser + 단일 CTA(`시뮬레이션 보기`)로 축소해 상세 안에서 중복 요약을 읽지 않도록 정리 (`frontend/src/app/lectures/[date]/page.tsx`)
- `cd frontend && npm run build` 통과. 새 simulation summary/live/transcript/detail 카드 구조까지 포함해 정적 빌드 확인 완료
- GitHub Pages 배포 흰 화면 원인을 `simulation.assets.mesh_glb`와 `BrainCanvas` preload의 절대 경로(`/data/...`)로 특정하고 수정: `BASE_URL` 기준 `resolveDataAssetPath()`를 도입해 JSON/GLB 자산을 `/mutsa_nlp/...` 하위 경로에서도 올바르게 읽도록 정리 (`frontend/src/lib/data.ts`, `frontend/src/components/simulation/BrainCanvas.tsx`)
- 실제 배포 URL `https://yj99son.github.io/mutsa_nlp/lectures/2026-02-02`를 브라우저와 `curl`로 재확인해 기존 콘솔 404가 `https://yj99son.github.io/data/simulations/brain-mesh.glb` 절대 경로에서 발생함을 확인
- `cd frontend && GITHUB_PAGES_BASE=/mutsa_nlp/ npm run build` 재통과
- `/lectures/:date/simulation/live` 흰 화면 원인을 `LectureSimulationLivePage.tsx`의 훅 순서 위반으로 특정하고 수정: early return 아래에 있던 `useMemo(derivedMetrics)`를 상단으로 이동해 로딩 후 런타임 blank 이슈 제거
- 로컬 확인 편의를 위해 프론트 dev 서버를 `3000`뿐 아니라 `3001`에서도 최신 코드로 띄울 수 있게 재실행
- 강의 상세 페이지의 시뮬레이션 카드에서 중복 `요약 보기` CTA를 제거하고, 카드 시각화를 평면 brain icon 대신 summary와 같은 축약 3D mesh 톤으로 교체 (`frontend/src/app/lectures/[date]/page.tsx`)
- `/lectures/:date/simulation` 요약 탭의 대표 시각화를 실제 `fsaverage5` mesh 기반 축약 3D로 전환하고, summary 전용 색 대비/자동 회전/flat shading을 적용 (`frontend/src/pages/LectureSimulationSummaryPage.tsx`, `frontend/src/components/simulation/BrainCanvas.tsx`, `frontend/src/app/globals.css`)
- `/lectures/:date/simulation/live` 우측 레일을 `현재 줄 + 지금 읽히는 패턴 + 지금 반응하는 영역 + 왜 이렇게 해석해요` 구조로 재정리하고, 앞뒤 줄 다중 박스 의존도를 줄임 (`frontend/src/pages/LectureSimulationLivePage.tsx`, `frontend/src/app/globals.css`)
- live 화면에서 `currentSegment -> URL 갱신 -> searchParams 의존 fetch` 루프를 끊어 재생 중 새로고침처럼 보이던 버그 수정 (`frontend/src/pages/LectureSimulationLivePage.tsx`, `frontend/src/pages/LectureSimulationTranscriptPage.tsx`)
- `build_simulation_playback_assets.py`에 원문 기반 heuristic remap 추가: 줄 길이, 질문/강조 표현, 전환 키워드, 세그먼트 내 상대 위치를 합성해 line별 `heuristic_intensity`, `heuristic_change_boost`, `heuristic_timeline_emphasis`, `attention_display`, `load_display`, `novelty_display`, `line_weight` 생성 (`scripts/build_simulation_playback_assets.py`, `frontend/public/data/simulations/2026-02-02-*.json`)
- live 화면 heatmap 대비를 heuristic intensity/change boost 기반으로 강화하고, Risk Timeline을 frame 단위 playhead + strongest/risk band 구조로 전환 (`frontend/src/components/simulation/BrainCanvas.tsx`, `frontend/src/pages/LectureSimulationLivePage.tsx`, `frontend/src/types/simulation.ts`)
- live/transcript 화면의 ROI 표기는 raw atlas 명 대신 쉬운 역할 이름 중심으로 바꾸고, 우측 패널을 `현재 줄 + 현재 패턴 설명` 위주로 단순화 (`frontend/src/lib/simulation.ts`, `frontend/src/pages/LectureSimulationLivePage.tsx`, `frontend/src/pages/LectureSimulationTranscriptPage.tsx`, `frontend/src/pages/LectureSimulationSummaryPage.tsx`)
- `cd frontend && npm run build` 재통과. line-weighted playback 자산과 강화된 live UI 계약까지 포함해 정적 빌드 확인 완료
- 시뮬레이션 live 화면에서 하단 transcript 분리 카드를 제거하고, 3D brain / Risk Timeline / 현재 줄 / 앞뒤 줄을 같은 화면에서 읽는 2열 구조로 재배치 (`frontend/src/pages/LectureSimulationLivePage.tsx`, `frontend/src/app/globals.css`)
- 요약 탭과 강의 상세 카드의 brain icon 표현을 구형 3D 메쉬 대신 평면 인포그래픽형 brain graphic으로 교체 (`frontend/src/components/simulation/BrainIconCanvas.tsx`, `frontend/src/pages/LectureSimulationSummaryPage.tsx`, `frontend/src/app/lectures/[date]/page.tsx`)
- TRIBE 시뮬레이션 라우트를 `요약 탭 -> 실시간 Deep View -> 원문 브라우저` 구조로 재구성 (`/lectures/:date/simulation`, `/lectures/:date/simulation/live`, `/lectures/:date/simulation/live/transcript`)
- 요약 탭용 커스텀 brain icon 인포그래픽과 lecture detail CTA 카드 추가 (`frontend/src/components/simulation/BrainIconCanvas.tsx`, `frontend/src/pages/LectureSimulationSummaryPage.tsx`, `frontend/src/app/lectures/[date]/page.tsx`)
- live 화면에 line timestamp 기반 재생 상태, transcript 하이라이트, Risk Timeline playhead, ROI Lens 동기화 추가 (`frontend/src/pages/LectureSimulationLivePage.tsx`, `frontend/src/pages/LectureSimulationTranscriptPage.tsx`)
- 시뮬레이션 데이터 계약을 `summary_visual`, `live_assets`, `segment.playback`, `transcript.relative_seconds/frame_index`까지 확장하고 `2026-02-02` 실제 데이터에 반영 (`scripts/build_simulation_playback_assets.py`, `frontend/public/data/simulations/2026-02-02-*.json`)
- `cd frontend && npm run build`로 summary/live 구조 포함 정적 빌드 통과
- `2026-02-02` TRIBE zip 산출물을 로컬에 반입하고 실제 raw `(55, 20484)` 기준으로 ROI 요약 JSON과 프론트 확장 JSON 생성 (`scripts/import_tribe_zip_and_build_simulation.py`, `analysis/roi/results/2026-02-02-roi-summary.json`, `frontend/public/data/simulations/2026-02-02.json`)
- `fsaverage5 -> Destrieux atlas` 정점 매핑 생성 완료 (`analysis/roi/fsaverage5_destrieux_mapping.npz`, `analysis/roi/fsaverage5_destrieux_mapping.manifest.json`)
- 시뮬레이션 화면을 전역 프록시 + ROI Lens + 방법 설명 카드 구조로 확장하고, 원문 브라우저에도 ROI 기반 요약과 해석 태그를 추가 (`frontend/src/pages/LectureSimulationPage.tsx`, `frontend/src/pages/LectureSimulationTranscriptPage.tsx`, `frontend/src/app/globals.css`, `frontend/src/types/simulation.ts`)
- `/lectures/2026-02-02/simulation`와 `/lectures/2026-02-02/simulation/transcript`를 실제 데이터로 로컬 확인했고 `cd frontend && npm run build` 통과
- TRIBE v2 실험용 프론트 라우트 2종 추가 (`/lectures/:date/simulation`, `/lectures/:date/simulation/transcript`)
- 인터랙티브 3D 뇌 히트맵 추가: 실제 `fsaverage5` cortical mesh GLB + 세그먼트 슬라이더 + autoplay + 원문 브라우저 연동 (`frontend/src/components/simulation/`, `frontend/public/data/simulations/brain-mesh.glb`, `frontend/src/pages/LectureSimulationPage.tsx`, `frontend/src/pages/LectureSimulationTranscriptPage.tsx`)
- 강의 상세 페이지에 수강자 반응 시뮬레이션 실험 카드 추가 (`frontend/src/app/lectures/[date]/page.tsx`)
- 파일럿 3강의(`2026-02-02`, `2026-02-09`, `2026-02-24`)용 정적 simulation JSON / segment-colors JSON / transcript JSON 생성 (`frontend/public/data/simulations/`)
- 시뮬레이션 seed 데이터 생성 스크립트 추가 (`scripts/build_simulation_seed_data.py`)
- 코랩 업로드용 `colab/tribev2-student-reaction/` 폴더 추가 (`README.md`, 4개 ipynb, `requirements-colab.txt`, `sample_outputs/`)
- `01_run_tribev2.ipynb`를 audio-only 최적화 버전으로 갱신: `TextToEvents.get_events()` 우회, 직접 TTS mp3 생성 후 `get_audio_and_text_events(..., audio_only=True)` 사용, `num_workers=0`, `batch_size=1`, 날짜별 partial save + resume 지원
- README와 `docs/`에 TRIBE v2 실험 기능 원리, 코랩 실행 흐름, raw output 해석 로직 문서화 추가 (`README.md`, `docs/TRIBE_v2_수강자_반응_시뮬레이션.md`, `docs/현재-진행상황.md`)
- `analysis/roi/` 작업 공간과 ROI 로컬 후처리 스크립트 2종 추가 (`scripts/export_fsaverage_roi_map.py`, `scripts/build_roi_summary_from_raw.py`, `analysis/roi/README.md`)
- 중간발표용 독립 HTML 덱 원본 추가 (`presentation/index.html`, `presentation/styles.css`, `presentation/script.js`, `presentation/content/outline.json`)
- `presentation-refer` 문법을 기준으로 중간발표 덱 디자인을 Apple-light 내러티브 톤으로 재정비
- 중간발표 덱 카피를 발표용 UX 라이팅 기준으로 전면 리라이트하고 Remotion TTS도 갱신
- 프론트 공개 라우트 `/presentation` 추가 및 정적 덱 iframe 내장 (`frontend/src/pages/PresentationPage.tsx`, `frontend/src/App.tsx`)
- 발표 자료를 프론트 공개본과 Remotion 공개 자산으로 동기화하는 스크립트 추가 (`scripts/sync_presentation_assets.py`)
- 발표 시연용 UI 캡처 4종 생성 (`presentation/assets/ui-dashboard.png`, `presentation/assets/ui-experiments.png`, `presentation/assets/ui-eda.png`, `presentation/assets/ui-lecture-detail.png`)
- Remotion 기반 3분 설명형 영상 프로젝트 골격 추가, TTS 내레이션 8개 생성, 최종 MP4 렌더 완료 (`presentation/remotion/`, `presentation/remotion/out/midterm-deck.mp4`)
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
- 프론트 UX를 Apple 스타일 워크플로 내비게이션으로 재구성 (`frontend/src/lib/navigation.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/components/layout/Header.tsx`, `frontend/src/components/layout/BottomTabBar.tsx`)
- 첫 방문 가이드 투어와 공통 페이지 Hero 시스템 추가 (`frontend/src/components/layout/TourOverlay.tsx`, `frontend/src/components/layout/PageHero.tsx`)
- 홈 화면을 KPI 대시보드가 아닌 운영 허브로 재설계하고, 강의 결과·신뢰도 검증·리포트 흐름 안내를 추가 (`frontend/src/app/dashboard/page.tsx`)
- 강의 결과/실험/EDA/전처리/리포트 화면을 "무엇을 보는지, 왜 중요한지, 다음에 어디로 가야 하는지" 구조로 재편 (`frontend/src/app/lectures/page.tsx`, `frontend/src/app/experiments/page.tsx`, `frontend/src/app/eda/page.tsx`, `frontend/src/app/preprocessing/page.tsx`, `frontend/src/app/reports/page.tsx`)
- 실제 실험 결과를 프론트 정적 JSON으로 내보내는 스크립트 확장 (`scripts/export_frontend_data.py`)
- 12시간제 STT 타임스탬프 래핑 보정 추가로 청킹 0건 문제 해결 (`src/chunking/strategy.py`)
- OpenAI 스모크 테스트 성공: `2026-02-02` 단일 강의 평가 실행 완료 (`experiments/e68eb60a8e70/`)
- 프론트 정적 평가 데이터는 샘플 JSON 대신 스모크 테스트 실제 결과 1건으로 교체 (`frontend/public/data/evaluations/2026-02-02.json`)

## 지금 중요한 일

1. 중간발표 덱 카피와 실제 발표 멘트 1차 합 맞추기
2. Remotion 영상 자막·음성 타이밍 미세 조정 및 발표 리허설 반영
3. 전체 15개 배치 평가 실행 후 프론트 정적 evaluation JSON 전체 교체
4. 반복 실행(3패스) → IRR 메트릭 확인 → 신뢰도 임계값 달성 여부 확인
5. A/B 실험 설계 및 실행 (모델, 온도, 청킹 변수)
6. 실험 결과 기반 `/experiments` 페이지 실데이터 연결
7. React SPA 배포 경로와 정적 데이터 갱신 흐름 문서 보강
8. 강의 상세/설정 화면도 새 Apple 스타일 정보 구조에 맞춰 추가 정리
9. `2026-02-09`, `2026-02-24`도 실제 raw 결과를 확보해 같은 ROI 해석 화면 계약으로 확장
10. 시뮬레이션 live 자산을 세그먼트 평균 기반 fallback이 아니라 실제 timestep frame 저장 형식으로 코랩/후처리 계약에 반영
11. `02_build_brain_assets.ipynb`의 좌/우 반구 분할 규약이 실제 TRIBE raw output 정점 순서와 맞는지 검증
12. 코랩에서 A100/H100 기준으로 audio-only 최적화 노트북 3개 날짜를 끝까지 실행해 실제 시간/메모리 개선 폭 확인
13. live 화면을 실제 브라우저로 한 번 더 확인하고, 필요하면 타임라인 높이와 우측 레일 줄 수를 발표 리허설 기준으로 미세 조정
14. 원문 기반 heuristic remap을 진짜 timestep raw frame 저장 형식으로 교체할 코랩/후처리 계약 설계
15. summary/live/transcript 재설계 후 실제 모바일 브라우저에서 line row 길이, stage 높이, CTA 간격을 한 번 더 실기기 기준으로 점검

## 현재 저장소 상태

- 평가 파이프라인: **구현 완료** (`src/graph/`, `src/harnesses/`, `src/chunking/`, `src/scoring/`)
- 실험 프레임워크: **구현 완료** (`src/experiment/`)
- 기존 코드(src/preprocessing, src/rule_analysis 등): 유지, 하이브리드 활용 가능
- 테스트: 46개 통과 (chunking, scoring, metrics, harness loading)
- 프론트 UI: Apple 스타일 rail + 플로팅 내비 패널 + 모바일 하단 탭 + 공통 hero/panel 체계 기준으로 재정비 완료 (`frontend/`)
- 프론트 시뮬레이션 UI: 파일럿 3강의 대상 실험용 3D 뇌 시각화/원문 브라우저 라우트 추가 완료, `fsaverage5` cortical mesh GLB 자산 연결 완료 (`frontend/src/pages/LectureSimulationPage.tsx`, `frontend/src/pages/LectureSimulationTranscriptPage.tsx`, `frontend/public/data/simulations/brain-mesh.glb`)
- 프론트 시뮬레이션 UI 최신 상태: Toss 기사형 레이아웃 리듬을 참조해 `summary = 결론 읽기`, `live = stage 집중`, `transcript = 읽기 전용`, `lecture detail = CTA teaser` 역할로 재분리 완료
- 정적 평가 데이터: 실제 분석 결과 1건 반영, 나머지 강의는 배치 실행 필요
- 정적 시뮬레이션 데이터: `2026-02-02`는 실제 TRIBE raw 기반 ROI 해석 결과로 교체 완료, 나머지 파일럿 날짜는 추가 실데이터 확보 필요
- 정적 시뮬레이션 데이터 계약: `2026-02-02`는 summary/live 자산과 transcript line mapping까지 확장 완료. 다만 live frame은 현재 세그먼트 평균 반응을 라인 timestamp에 매핑한 fallback이며 진짜 timestep raw는 아직 저장되지 않음
- TRIBE 코랩 노트북: audio-only fallback을 실제 audio-only preprocessing으로 최적화했고, worker 수를 0으로 낮췄으며 날짜별 partial resume 저장을 지원함 (`colab/tribev2-student-reaction/01_run_tribev2.ipynb`)
- 발표 자산: `presentation/`이 소스 오브 트루스이며, `scripts/sync_presentation_assets.py`로 `frontend/public/presentation/`과 `presentation/remotion/public/`에 동기화함
- 발표 영상: `presentation/remotion/`에서 TTS 자막형 설명 영상 렌더링 가능, 캡처 자산 4종과 내레이션 mp3 8개 생성 완료
- Git 상태: GitHub Pages 하위 경로용 data/mesh asset resolve 수정 반영 완료, `.claude/` 디렉터리는 계속 미추적 상태

## 다음 세션 시작 체크리스트

1. `AGENTS.md` 읽기
2. `memory/decisions.md` 확인
3. `.env`에 `OPENAI_API_KEY` 확인
4. `cd frontend && npm run dev`로 React SPA 확인
5. `python3 scripts/sync_presentation_assets.py`로 발표 공개본 재동기화
6. `cd presentation/remotion && npm run tts && npm run render`로 발표 영상 갱신
7. `python3 scripts/run_single.py --date 2026-02-02 --model gpt-4o-mini` 실행
8. `python3 scripts/export_frontend_data.py --experiment-id <id>` 실행
9. `python3 scripts/build_simulation_seed_data.py`로 시뮬레이션 정적 데이터 재생성
10. `python3 scripts/build_simulation_playback_assets.py --date 2026-02-02`로 summary/live 자산 재생성
11. `cd frontend && npm run build`로 시뮬레이션 라우트 포함 정적 빌드 확인

## 현재 블로커

- 전체 15개 강의 실제 평가 결과를 아직 생성하지 않음
- `2026-02-09`, `2026-02-24` TRIBE raw 결과가 아직 완주본이 아니어서 ROI 기반 시뮬레이션 화면은 현재 `2026-02-02` 실데이터 중심으로만 검증됨
- 현재 zip 산출물에는 per-timestep cortical frame이 저장되지 않아 live 화면은 `원문 timestamp + 세그먼트 평균 반응 + heuristic remap` fallback으로 동작함
