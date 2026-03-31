# TRIBE v2 수강자 반응 시뮬레이션 코랩 폴더

이 폴더는 `원본 강의 텍스트 -> 코랩 업로드 -> TRIBE v2 추론 -> 프론트용 JSON/색상 자산 생성` 흐름을 빠르게 검증하기 위한 작업 묶음이다.

## 포함 파일

- `00_prepare_inputs.ipynb`
- `01_run_tribev2.ipynb`
- `02_build_brain_assets.ipynb`
- `03_build_frontend_json.ipynb`
- `requirements-colab.txt`
- `sample_outputs/`

## 권장 Drive 구조

`drive_template/` 폴더를 통째로 Drive에 올린 뒤, 이름만 `tribe-v2-student-reaction`으로 맞춰 쓰면 된다.

```text
MyDrive/
  tribe-v2-student-reaction/
    notebooks/                     # 이 폴더 전체 업로드
    inputs/
      transcripts/                 # 원본 txt
      metadata/
        강의 메타데이터.csv
    outputs/
      prepared/
      raw/
      assets/
      frontend/
```

### 바로 넣을 파일

- `inputs/transcripts/`
  - `2026-02-02_kdt-backendj-21th.txt`
  - `2026-02-09_kdt-backendj-21th.txt`
  - `2026-02-24_kdt-backendj-21th.txt`
- `inputs/metadata/`
  - `강의 메타데이터.csv`

## 실행 순서

1. `00_prepare_inputs.ipynb`
2. `01_run_tribev2.ipynb`
3. `02_build_brain_assets.ipynb`
4. `03_build_frontend_json.ipynb`

## 현재 범위

- 파일럿 날짜: `2026-02-02`, `2026-02-09`, `2026-02-24`
- 세그먼트 길이: `5분`
- 1차 입력 모달리티: `text -> TTS audio`
- 프론트 계약:
  - `{date}.json`
  - `{date}-segment-colors.json`
  - `{date}-transcript.json`

## 주의

- 이 폴더는 코랩 런타임과 공식 `facebookresearch/tribev2` 저장소를 기준으로 작성했다.
- 실제 추론 API 호출 방식은 TRIBE v2 저장소 업데이트에 따라 달라질 수 있다.
- 프론트 화면에서 사용하는 프록시 지표는 `attention/load/novelty`이며, 실제 수강생 감정 측정값이 아니다.
