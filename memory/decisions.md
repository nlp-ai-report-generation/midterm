# 결정 기록

## 2026-04-02

### 강의 section JSON은 원문 시각을 그대로 보존하고 긴 공백은 break로 남긴다

- 결정: `frontend/public/data/lectures/YYYY-MM-DD-sections.json`의 `start`/`end`는 원문 STT에 적힌 타임스탬프 문자열을 그대로 사용하고, 오후 구간도 `13:xx`처럼 재계산하지 않는다. 수업 종료 후 회고/팀 이동 전처럼 20분 이상 비는 큰 공백도 `break` 섹션으로 명시한다.
- 이유: 사용자 지시사항이 "원문의 실제 타임스탬프" 사용을 요구했고, 프론트에서 원문 줄과 직접 맞물려야 하므로 24시간 재계산보다 원문 좌표 보존이 중요하다. 또한 긴 공백을 숨기면 실제 수업 흐름과 세션 전환이 왜곡된다.
- 결과: 15개 강의의 section JSON을 모두 같은 규칙으로 정리했고, 점심/쉬는시간/회고 전 공백까지 `break` 타입으로 일관되게 표현한다.

## 2026-04-01

### TRIBE 시뮬레이션 화면은 Toss 기사형 레이아웃 리듬 + 오렌지/모노톤 팔레트로 고정

- 결정: simulation summary/live/transcript/detail 카드는 기존 혼합 대시보드 스타일 대신 Toss 계열 기사형 레이아웃 리듬을 직접 차용하고, 색상은 블루 계열을 버리고 `오렌지 포인트 + 흰색/검은색/회색`으로 재매핑한다.
- 이유: 기존 화면은 카드 수와 강조 포인트가 너무 많아 first glance가 흐렸고, 사용자 요청도 "레퍼런스를 거의 그대로 가져오되 색만 오렌지/모노톤으로 바꾸기"였다.
- 결과: `summary`는 hero + aside + feature row, `live`는 좌측 stage + 우측 해석 rail, `transcript`는 읽기 중심 column, `lecture detail`은 teaser + 단일 CTA 구조로 정리했다.

### 강의 상세의 시뮬레이션 카드는 중복 요약 대신 단일 CTA로 운영

- 결정: 강의 상세 페이지에서는 simulation summary 텍스트, caution, 다중 CTA를 두지 않고 compact teaser와 `시뮬레이션 보기` 버튼 하나만 남긴다.
- 이유: 상세 페이지 안에서 이미 결론을 소비하게 만들면 simulation summary 화면의 역할이 사라지고, 정보 위계가 다시 겹친다.
- 결과: 강의 상세는 simulation 진입 역할만 맡고, 실제 해석은 `/lectures/:date/simulation` 이하 전용 화면에서 읽도록 흐름을 고정했다.

## 2026-03-31

### 프론트 정적 data/mesh 자산 경로는 항상 `BASE_URL` 기준으로 resolve

- 결정: GitHub Pages 같은 하위 경로 배포를 고려해 `/data/...` 절대 경로를 직접 쓰지 않고, `import.meta.env.BASE_URL`을 거치는 공용 resolve 함수로 정적 JSON/GLB 자산 경로를 만든다.
- 이유: `https://yj99son.github.io/mutsa_nlp/...`처럼 repo path 아래에 배포될 때 절대 경로 `/data/...`는 루트 도메인으로 향해 404가 나고, `useGLTF()` 같은 런타임 loader 예외가 에러 바운더리 없이 전체 화면 blank로 이어질 수 있다.
- 결과: `frontend/src/lib/data.ts`에 `resolveDataAssetPath()`를 두고, simulation JSON fetch와 `BrainCanvas` mesh preload가 같은 규칙을 사용한다.

## 2026-03-10

### 에이전트 운영 문서는 벤더 중립으로 작성

- 결정: 특정 AI 도구 문법보다 저장소 공통 작업 규칙을 우선한다.
- 이유: Codex, Claude, 기타 에이전트가 같은 저장소 문맥을 재사용할 수 있어야 한다.
- 결과: `AGENTS.md`와 `agents/skills/`는 특정 런타임 종속 표현을 최소화한다.

### 작업 컨텍스트는 풀 프로젝트 메모리 구조로 운영

- 결정: 단일 세션 메모가 아니라 장기 메모리 구조를 둔다.
- 이유: 과제 기간이 4주이고, 계획, 구현, 보고, 발표가 분리되어 누적 맥락 관리가 필요하다.
- 결과: `memory/current-state.md`, `decisions.md`, `open-questions.md` 등을 공통 진입점으로 유지한다.

### 원본 데이터는 저장소 내부 제한 자산으로 취급

- 결정: 현재 저장소에 포함된 강의 스크립트와 메타데이터는 제거하지 않고 관리 규칙을 둔다.
- 이유: 현재 저장소 상태와 작업 현실을 반영해야 하며, 과제 수행에 직접 필요하다.
- 결과: 에이전트는 원문 재배포 대신 최소 인용과 요약을 우선 사용한다.

### 기본 문서 언어는 한국어 우선

- 결정: 에이전트 운영 문서와 작업 메모는 한국어를 기본으로 작성한다.
- 이유: 과제 설명과 협업 맥락이 한국어 중심이며, 평가자와 팀 커뮤니케이션에도 적합하다.
- 결과: 영어가 필요한 경우를 제외하면 문서와 리포트 초안은 한국어 중심으로 정리한다.

## 2026-03-11

### LLM 에이전틱 평가 방식 채택 (규칙 기반 대신)

- 결정: 전통적 룰베이스 방식 대신 LLM 기반 에이전틱 평가 시스템으로 전환한다.
- 이유: 팀 논의 결과, 18개 평가 항목의 다수가 맥락 이해와 판단을 요구하며 규칙으로 포착하기 어렵다. LLM-as-Judge 접근이 업계 표준으로 자리잡고 있다.
- 결과: LangGraph 멀티노드 그래프 + MD 하네스(프롬프트 템플릿) + OpenAI API(GPT-4o) 조합으로 구현.

### 기술 스택 확정: LangGraph + OpenAI + LangSmith(옵션)

- 결정: 핵심 파이프라인은 LangGraph, 모델은 OpenAI GPT-4o, 관측성은 LangSmith(옵션 토글).
- 이유: LangGraph가 병렬 팬아웃/팬인을 네이티브로 지원하고 LangSmith와 자연스럽게 통합된다.
- 결과: `src/graph/` (LangGraph), `src/integrations/openai_client.py`, `src/integrations/langsmith.py`로 구현.

### 점수 가중치 체계: HIGH=3, MEDIUM=2, LOW=1

- 결정: 체크리스트의 높음/중간/낮음 가중치를 3:2:1 배수로 매핑한다.
- 이유: 가중 평균이 1~5 척도로 직관적으로 해석되며, 핵심 항목(10개)의 영향력이 충분히 반영된다.
- 결과: `src/scoring/weights.py`에 정의. 총 가중치 합=45, 최대 가중 총점=225.

### 세션 매핑: 일별 통합

- 결정: 하루치 스크립트(오전+오후)를 하나의 평가 단위로 취급한다.
- 이유: 스크립트 파일이 일별 1개이고, 오전/오후 분리 시 불완전한 평가 단위가 된다.
- 결과: 메타데이터 CSV에서 같은 날짜의 오전/오후 세션을 병합하여 과목/내용 정보를 통합한다.

### MVP 범위: 전체 15개 강의

- 결정: 1-3개가 아닌 전체 15개 강의를 MVP 범위로 한다.
- 이유: 배치 처리와 비교 분석이 과제 평가 항목에 포함되어 있으며, 파이프라인 자체가 자동화되므로 추가 비용이 크지 않다.
- 결과: `scripts/run_batch.py`로 전체 배치 실행 지원.

### 결과 공유 형식: JSON + 마크다운 리포트

- 결정: 실험 결과는 JSON으로 저장하고, 사람이 읽을 수 있는 마크다운 리포트를 자동 생성한다.
- 이유: JSON은 프로그래밍적 비교 분석에, 마크다운은 팀 리뷰와 발표에 적합하다.
- 결과: `experiments/{id}/` 디렉토리에 config.json, results/*.json, report_*.md 형태로 저장.

### 메타 평가 메트릭: Krippendorff's α + Cohen's κ + ICC

- 결정: 인간 ground truth 없이 LLM 자기 일관성 기반으로 평가한다.
- 이유: 교육 평가 분야 표준(Krippendorff, 2004), LLM-as-Judge 연구(Zheng et al., 2023) 근거.
- 결과: `src/experiment/metrics.py`에 4개 메트릭 구현. 목표 임계값: α≥0.667, κ≥0.61, ICC≥0.75.

## 2026-03-15

### 프론트 UI는 토스 스타일 토큰 기반으로 정리

- 결정: 대시보드 전역 색상과 핵심 카드/차트 스타일을 토스 계열 블루/그레이 토큰 중심으로 재정비한다.
- 이유: 기존 주황색 중심 스타일이 서비스 톤과 맞지 않았고, 사용자 요청이 토스 디자인 규칙 반영이었다.
- 결과: `frontend/src/app/globals.css`에 토큰 재정의, `layout`, `dashboard`, 공용 카드/차트 컴포넌트 UI 정리.

### 프론트 정적 evaluation JSON은 실험 결과에서 생성

- 결정: 수동 샘플 JSON 유지 대신 `scripts/export_frontend_data.py`로 최신 실험 결과를 `frontend/public/data/evaluations/`로 내보낸다.
- 이유: 샘플 기반 데모는 실제 분석 결과와 화면이 어긋나며, 사용자 요청도 직접 분석한 결과 반영이었다.
- 결과: 스크립트가 EDA JSON과 evaluation JSON을 함께 생성하고, 스모크 테스트 결과 1건을 프론트 데이터로 반영했다.

### STT 12시간제 타임스탬프 래핑을 청킹 단계에서 보정

- 결정: `12:xx -> 01:xx`처럼 시각이 되감기면 12시간 오프셋을 더해 단조 증가 시간축으로 변환한다.
- 이유: 실제 스크립트가 오전/오후 표기 없는 12시간 형식이라 기존 청킹 로직에서 0개 청크가 발생했다.
- 결과: `src/chunking/strategy.py`와 테스트가 갱신됐고, `2026-02-02` 스모크 테스트에서 14개 청크가 생성됐다.

### OpenAI 키는 `.env` 자동 로드와 API 검증 엔드포인트로 확인

- 결정: OpenAI 클라이언트와 FastAPI 서버 시작 시 `.env`를 자동 로드하고, 설정 화면의 연결 테스트는 `/api/validate-key`를 실제 호출한다.
- 이유: 로컬 정규식만으로는 실제 키 동작 여부를 검증할 수 없고, `health` 상태도 거짓 음성이 발생했다.
- 결과: `src/integrations/openai_client.py`, `api/main.py`, `frontend/src/lib/api.ts`, `frontend/src/app/settings/page.tsx`가 갱신됐다.

## 2026-03-16

### 프론트엔드는 Next.js 대신 React SPA로 운영

- 결정: 프론트엔드 런타임을 Next.js에서 React + Vite + React Router로 전환한다.
- 이유: 사용자 요청이 "Next.js 말고 그냥 React로 싹다 바꾸기"였고, 현재 앱은 SSR/서버 컴포넌트 이점보다 정적 데이터 대시보드와 API 호출 중심 구조가 더 적합하다.
- 결과: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/vite.config.ts`를 기준 진입점으로 사용하고, 기존 페이지 컴포넌트는 React Router 경로로 재연결한다.

### 프론트 화면은 공통 hero/panel/card 시스템으로 정리

- 결정: 페이지별로 제각각 쓰던 카드와 버튼 스타일 대신 `globals.css`의 공통 토큰과 `page-hero`, `panel-card`, `primary-button`, `segmented-control` 계열 스타일을 기준으로 화면을 정리한다.
- 이유: 색상만 토스 계열로 바꾸고 레이아웃 리듬이 남아 있으면 여백, 타이포, 정보 위계가 무너져 전체 화면이 산만해진다.
- 결과: 대시보드, 강의 목록, 실험, 리포트, 전처리, EDA 탭 UI가 같은 밀도와 위계를 공유하도록 갱신했다.

### 프론트 내비게이션은 워크플로형 Apple 스타일 구조로 통합

- 결정: 영구 넓은 사이드바 대신 `좁은 아이콘 레일 + 확장형 글래스 패널 + 모바일 하단 탭` 구조로 통일하고, 모든 라우트 설명은 중앙 navigation metadata에서 관리한다.
- 이유: 기존 좌측 내비게이션은 본문을 가리고 각 메뉴의 목적 설명도 부족해 처음 들어온 평가자가 "어디서 무엇을 봐야 하는지" 이해하기 어려웠다.
- 결과: `frontend/src/lib/navigation.tsx`를 단일 진실 공급원으로 추가했고, `Sidebar`, `Header`, `BottomTabBar`가 같은 라우트 메타데이터를 사용해 제목, 설명, 추천 다음 화면을 함께 노출한다.

### 홈 화면은 KPI 대시보드가 아니라 운영 허브로 본다

- 결정: `/dashboard`는 단순 집계판이 아니라 `무엇을 먼저 보고`, `왜 중요한지`, `다음에 어디로 갈지`를 안내하는 홈 허브 역할로 유지한다.
- 이유: 사용자층이 개발자보다 평가자/심사자 중심이어서, 수치보다 먼저 전체 흐름과 판단 포인트를 제공해야 길을 잃지 않는다.
- 결과: 추천 탐색 순서, 핵심 경고, 최근 평가 흐름, 근거 확인 화면 링크를 홈 중심 구조로 재배치했다.

### 첫 방문 가이드는 선택형 투어로 제공

- 결정: 강한 강제 온보딩 대신 첫 방문 1회 자동 오픈 후 닫을 수 있는 선택형 투어를 둔다.
- 이유: 화면 설명은 필요하지만, 매번 방해되는 오버레이는 운영 도구 사용성을 해친다.
- 결과: `localStorage` 키 `lecture_ops_tour_seen`로 노출 여부를 저장하고, 사용자가 언제든 헤더/내비게이션에서 다시 열 수 있게 구현했다.

## 2026-03-19

### 중간발표 자산은 `presentation/`을 소스 오브 트루스로 둔다

- 결정: 발표용 HTML 덱, 콘텐츠 스키마, 영상 프로젝트는 `presentation/` 아래에서 관리하고, 프론트 공개본은 동기화 결과물로 취급한다.
- 이유: 제품 SPA와 발표 자산은 목적과 배포 흐름이 다르고, 한쪽을 수정할 때 다른 쪽도 같은 내용을 유지해야 하기 때문이다.
- 결과: `presentation/content/outline.json`을 공통 원천으로 두고, `scripts/sync_presentation_assets.py`로 `frontend/public/presentation/`과 `presentation/remotion/public/`에 복제한다.

### 중간발표 영상은 TTS + 자막형 Remotion 영상으로 제작

- 결정: 설명형 3분 내 발표 영상은 별도 Remotion 프로젝트에서 만들고, 오디오는 macOS 기본 한국어 음성(`Yuna`) 기반 TTS를 기본값으로 사용한다.
- 이유: 혼자 재생해도 이해 가능한 형태가 필요하고, 발표 현장에서는 음소거 재생 가능성도 있어 자막 중심 구성이 안전하다.
- 결과: `presentation/remotion/`에 `MidtermDeckVideo` composition, `public/audio/scene-*.mp3`, 렌더 스크립트를 추가했다.

## 2026-03-30

### 시뮬레이션 live 화면은 brain, timeline, 현재 줄을 같은 화면에서 읽는 구조로 고정

- 결정: `/lectures/:date/simulation/live`에서는 하단에 전체 transcript를 길게 두지 않고, 3D brain 패널 옆에서 현재 줄과 앞뒤 줄을 바로 읽는 2열 구조로 유지한다.
- 이유: 사용자가 뇌 반응 재생과 원문 해석을 같은 시야 안에서 동시에 확인해야 UX가 자연스럽고, 아래로 오가며 보는 흐름은 집중을 끊는다.
- 결과: live 화면은 `brain + inline timeline`과 `현재 줄/앞뒤 줄 + ROI 해석`을 한 화면에 배치하고, 전체 원문은 별도 `/simulation/live/transcript` 화면으로 분리한다.

### 요약 탭의 brain 표현은 3D 구형 메쉬 대신 평면 인포그래픽으로 고정

- 결정: `/lectures/:date/simulation`과 강의 상세 카드의 대표 brain 표현은 장난감 같은 3D 메쉬 대신 평면형 brain infographic으로 통일한다.
- 이유: 요약 화면은 결론을 빠르게 전달하는 역할이어서 사실적인 3D보다 단순하고 즉시 읽히는 시각 표현이 더 적합하다.
- 결과: `BrainIconCanvas`는 summary/detail에서 zone 기반 평면 인포그래픽을 렌더하고, 실제 3D mesh는 live 화면에서만 유지한다.

### 수강자 반응 시뮬레이션은 TRIBE v2 기반 실험 기능으로 운영

- 결정: 수강자 반응 시뮬레이션은 정식 평가 기능이 아니라 `TRIBE v2 기반 신경 반응 프록시` 실험 기능으로 소개한다.
- 이유: 모델 출력은 시간축별 뇌 반응 예측이지 실제 수강생 감정·만족도 측정값이 아니므로, 과장된 제품 표현을 피해야 한다.
- 결과: 프론트 라우트와 설명 문구에서 `실험 기능` 배지를 유지하고, 주의 문구를 함께 노출한다.

### 원본 강의 txt의 코랩 업로드와 공개 원문 브라우저를 허용

- 결정: 사용자 요청에 따라 원본 강의 txt를 개인 Drive/코랩에 업로드하는 흐름과 공개 배포본의 전체 원문 브라우저를 허용한다.
- 이유: TRIBE v2 시뮬레이션과 시각화 데모를 위해 원문 접근성과 전체 맥락 탐색이 필요하다고 판단했다.
- 결과: `colab/tribev2-student-reaction/` 노트북은 원본 txt 업로드를 전제로 작성했고, 프론트에 `/lectures/:date/simulation/transcript` 라우트를 추가했다.

### 시뮬레이션 1차 범위는 파일럿 3강의 + 인터랙티브 3D 전체 히트맵

- 결정: 1차 구현은 `2026-02-02`, `2026-02-09`, `2026-02-24` 세 강의만 대상으로 하고, 시각화는 `전체 3D 히트맵 + 세그먼트 슬라이더 + 원문 브라우저` 조합으로 고정한다.
- 이유: 발표 임팩트와 구현 리스크를 함께 관리하려면 전 강의 일괄 처리보다 파일럿 3강의와 전체 히트맵 중심 인터랙션이 적절하다.
- 결과: `frontend/public/data/simulations/`에 3강의용 정적 seed 데이터가 생성됐고, 강의 상세에서 실험 뷰로 연결된다.

### 3D 뇌 시각화는 실제 fsaverage5 cortical mesh를 사용

- 결정: 프론트 3D 시각화는 절차적 hemisphere가 아니라 `fsaverage5` cortical mesh GLB를 사용한다.
- 이유: TRIBE v2 공식 출력이 fsaverage5 cortical mesh 위에 정의되므로, 실제 표면 자산을 쓰는 편이 모델 출력 구조와 시각화 의미에 맞다.
- 결과: `scripts/export_fsaverage_mesh.py`로 `frontend/public/data/simulations/brain-mesh.glb`를 생성하고, `frontend/src/components/simulation/BrainCanvas.tsx`가 해당 GLB를 로드해 vertex color를 입힌다.

### TRIBE 코랩 실행은 병렬화보다 audio-only 최적화 + low-worker + resume 전략을 우선한다

- 결정: 코랩에서는 세그먼트 병렬 추론을 하지 않고, `audio_only` 경로를 진짜 audio-only preprocessing으로 단순화한 뒤 `num_workers=0`, `batch_size=1`, 날짜별 partial save + resume 방식으로 운영한다.
- 이유: 기존 fallback은 `TextToEvents.get_events()`를 통해 단어 추출과 context 추가까지 한 번 더 돌려 메모리와 시간이 과도하게 들었고, Colab에서 worker 20개가 뜨며 OOM 위험이 커졌다.
- 결과: `colab/tribev2-student-reaction/01_run_tribev2.ipynb`가 직접 gTTS mp3를 만들고 `get_audio_and_text_events(..., audio_only=True)`만 호출하도록 갱신됐다. 런타임은 `H100/A100 > L4 > T4`, TPU/CPU는 비권장으로 안내한다.

### 2026-02-02 시뮬레이션 화면은 실제 raw 기반 ROI 해석본을 우선 공개한다

- 결정: `2026-02-02` 강의 시뮬레이션 화면은 heuristic seed 데이터 대신 실제 TRIBE raw `(55, 20484)` 결과와 ROI 후처리 결과를 사용한다.
- 이유: 발표/데모에서 실제 계산 흐름과 근거를 설명하려면 최소 1개 강의라도 실데이터 기준으로 검증된 화면이 필요하다.
- 결과: `scripts/import_tribe_zip_and_build_simulation.py`로 zip 산출물을 로컬에 반입해 `frontend/public/data/simulations/2026-02-02.json`을 ROI 확장 계약으로 갱신했다.

### ROI 해석은 Destrieux atlas + 규칙 기반 설명으로 고정한다

- 결정: 정점 반응의 영역 해석은 `fsaverage5 -> Destrieux atlas` 매핑을 사용하고, 자연어 설명은 외부 API 없이 로컬 템플릿 규칙으로 생성한다.
- 이유: 해석 재현성과 비용 통제가 필요하고, 심리 상태를 과장하지 않는 안전한 설명 방식이 필요하다.
- 결과: `analysis/roi/fsaverage5_destrieux_mapping.npz`를 생성했고, `scripts/build_roi_summary_from_raw.py`와 import 스크립트가 `top_active_rois`, `top_changed_rois`, `summary_text`, `method_explainer`를 만든다.

### 시뮬레이션 화면에는 계산 방법 설명 카드를 항상 노출한다

- 결정: 시뮬레이션 메인 화면과 원문 브라우저에는 결과 해석 방식을 설명하는 카드 또는 문구를 기본으로 넣는다.
- 이유: attention/load/novelty와 ROI 결과는 익숙하지 않은 개념이라, 사용자가 “왜 이런 값이 나왔는지” 바로 이해할 수 있어야 한다.
- 결과: `/lectures/:date/simulation`에는 `TRIBE 결과를 이렇게 읽어요`와 `이 결과는 이렇게 만들어요` 섹션을, transcript 화면에는 축약 설명 카드를 둔다.

### TRIBE 시뮬레이션은 `요약 탭 + 실시간 Deep View` 2단 구조로 운영한다

- 결정: 강의 상세에는 시뮬레이션 본문을 임베드하지 않고 요약 카드와 CTA만 두고, 실제 시뮬레이션은 `/lectures/:date/simulation` 요약 탭과 `/lectures/:date/simulation/live` 심층 화면으로 분리한다.
- 이유: 평가 화면 안에서 3D와 원문을 바로 모두 보여주면 정보 밀도가 과해지고, 사용자는 먼저 결론을 빠르게 읽은 뒤 필요할 때 깊게 들어가는 흐름이 더 적합하다.
- 결과: summary 탭은 커스텀 brain icon 인포그래픽과 한 줄 결론 중심으로, live 화면은 3D brain + Risk Timeline + transcript 동기화 중심으로 설계한다.

### 요약 탭 3D는 실제 cortical mesh 대신 커스텀 brain icon mesh를 쓴다

- 결정: `/simulation` 요약 탭에서는 실제 fsaverage5 mesh를 쓰지 않고, 단순한 좌/우 반구 brain icon canvas를 사용한다.
- 이유: 요약 탭의 목적은 해부학적 충실도가 아니라 결론 전달과 시선 유도이며, 아이콘형 시각화가 더 가볍고 읽기 쉽다.
- 결과: `frontend/src/components/simulation/BrainIconCanvas.tsx`가 요약 탭과 강의 상세 카드의 대표 시각 자산이 된다.

### live 화면은 현재 라인 timestamp를 기준으로 반응 패널을 동기화한다

- 결정: `/simulation/live`와 `/simulation/live/transcript`는 초기 진입 시에만 `?segment=`를 읽고, 재생 중에는 URL을 자동으로 갱신하지 않는다. URL 갱신은 사용자가 직접 클릭, 드래그, 점프했을 때만 수행한다.
- 이유: 재생 루프에서 `setSearchParams()`가 반복 호출되면 `searchParams` 의존 fetch가 다시 돌며 loading이 켜지고, 사용자에게 새로고침처럼 느껴지는 UX 버그가 발생한다.
- 결과: live 화면은 playback state를 내부 상태로 유지하고, `currentSegment` 변화만으로 데이터를 다시 fetch하지 않는다.

### live fallback은 원문 기반 heuristic remap으로 체감을 보정한다

- 결정: 진짜 timestep raw가 내려오기 전까지 live 화면은 세그먼트 평균 반응을 그대로 반복하지 않고, 원문 줄 단위 feature를 이용해 `heuristic_intensity`, `heuristic_change_boost`, `heuristic_timeline_emphasis`를 계산한 fallback remap을 사용한다.
- 이유: 현재 코랩 산출물에는 per-timestep cortical frame이 없어 line 단위 brain 변화 체감이 약하다. 다만 완전한 가짜 보간으로 보이지 않도록 transcript timestamp, 줄 길이, 질문/강조 표현, 전환 키워드, 세그먼트 내 상대 위치를 함께 반영해야 한다.
- 결과: `scripts/build_simulation_playback_assets.py`가 line별 heuristic score와 display metric을 생성하고, live heatmap과 Risk Timeline은 그 값을 이용해 색 대비와 playhead 체감을 강화한다.

### 요약 탭은 실제 mesh 기반 축약 3D로, live는 현재 줄 중심 우측 레일로 운영한다

- 결정: `/simulation` 요약 탭은 실제 fsaverage5 mesh를 요약 전용 렌더 규칙으로 축약해 보여주고, `/simulation/live`는 우측 레일을 `현재 줄 + 현재 패턴 + 쉬운 영역 설명` 중심으로 최소화한다.
- 이유: summary 탭은 결론을 먼저 읽히게 하면서도 너무 평면 아이콘처럼 보이면 임팩트가 약하고, live 화면은 텍스트 박스가 많으면 뇌 반응과 playhead를 보는 집중을 깨뜨린다.
- 결과: `BrainCanvas`에 summary variant를 추가해 flat/satin 느낌과 강한 단계형 대비를 적용했고, live 우측 패널은 atlas 기술명과 앞뒤 줄 나열보다 현재 줄 해석을 우선하는 구조로 재정리했다.

- 결정: `/simulation/live`와 `/simulation/live/transcript`는 transcript line 선택/재생 위치를 기준으로 현재 세그먼트, Risk Timeline playhead, ROI Lens, 해석 문구를 같이 바꾸는 구조로 간다.
- 이유: 사용자가 “지금 설명 중인 부분에서 어떤 반응으로 읽히는지”를 바로 확인하려면 세그먼트 선택보다 라인 중심 상호작용이 더 직관적이다.
- 결과: transcript JSON에 `relative_seconds`, `frame_index`를 추가하고, `SimulationSegment.playback`, `live_assets` 계약을 확장했다.

### 현재 live 자산은 line timestamp + 세그먼트 평균 반응 기반 fallback으로 운영한다

- 결정: 현재 공개본의 live frame은 진짜 timestep cortical raw가 아니라, transcript line timestamp에 세그먼트 평균 반응을 매핑한 fallback으로 운영한다.
- 이유: 현재 zip 산출물에는 per-timestep cortical frame 배열이 저장되어 있지 않아, line 단위 실시간 UX를 바로 만들려면 세그먼트 평균 반응을 활용한 중간 계약이 필요했다.
- 결과: `scripts/build_simulation_playback_assets.py`가 `summary_visual`, `live_assets`, `segment.playback`, `transcript.relative_seconds/frame_index`를 생성한다. 이후 코랩 산출물에 실제 timestep raw가 추가되면 같은 프론트 계약으로 대체할 예정이다.

## 2026-03-31

### 청킹 파라미터는 `hop_minutes`로 전환하되 `overlap_minutes` 하위 호환을 유지

- 결정: 청킹 함수의 기본 인터페이스는 `hop_minutes`를 사용하되, 기존 호출부/테스트에서 쓰던 `overlap_minutes`도 계속 허용한다.
- 이유: 최근 hop 실험 기능 추가로 용어를 hop 중심으로 통일할 필요가 있었지만, 기존 코드와 테스트가 즉시 깨지는 회귀를 막아야 했다.
- 결과: `src/chunking/strategy.py`에서 `overlap_minutes`를 받으면 `hop_minutes = window - overlap`으로 변환하도록 처리했고, `src/graph/nodes/preprocessor.py`와 `src/experiment/config.py`도 구설정 JSON을 자동 변환하도록 맞췄다.

### window 길이 실험은 `hop=window*0.5` 고정 + 필수 리포트 섹션을 강제한다

- 결정: window 비교 실험은 30/60/120분 조건과 각각의 hop 15/30/60분(비율 50%)으로 고정하고, 보고서에는 `사용 데이터`와 `실험 설정` 섹션을 반드시 포함한다.
- 이유: 실험 재현성을 높이고, 평가자/강사가 결과 해석 전에 어떤 데이터와 설정으로 나온 결과인지 즉시 확인할 수 있어야 한다.
- 결과: `scripts/run_window_experiment.py`를 추가해 파일럿 3강의 고정 실행/비교 흐름을 만들었고, `src/experiment/window_comparator.py`에서 Markdown/JSON 리포트 생성 시 `사용 데이터`, `실험 설정`, `관찰된 사실`, `해석`, `개선 제안` 섹션을 기본 구조로 출력한다.
