# ROI 기반 로컬 후처리 준비

이 폴더는 코랩에서 내려받은 `TRIBE raw output`을 로컬에서 다시 해석하기 위한 작업 공간이다.

목표는 두 가지다.

- 코랩에서는 무거운 추론만 수행한다.
- 로컬에서는 `fsaverage5` 정점 결과를 ROI 단위로 다시 묶어 해석한다.

## 폴더 구조

```text
analysis/roi/
  input/
    raw/                 # {date}-tribe-raw.npz
    prepared/            # {date}/segments.json, transcript.json
  results/               # ROI 요약 결과 JSON
  fsaverage5_destrieux_mapping.npz
  fsaverage5_destrieux_mapping.manifest.json
```

## 1. ROI 매핑 파일 만들기

먼저 `fsaverage5` 정점과 atlas ROI를 맞춘다.

```bash
python3 scripts/export_fsaverage_roi_map.py
```

기본 atlas는 `Destrieux surface atlas`다. 결과는 아래 파일로 저장된다.

- `analysis/roi/fsaverage5_destrieux_mapping.npz`
- `analysis/roi/fsaverage5_destrieux_mapping.manifest.json`

## 2. 코랩 산출물 복사

코랩에서 받은 산출물을 아래 경로에 복사한다.

- `analysis/roi/input/raw/{date}-tribe-raw.npz`
- `analysis/roi/input/prepared/{date}/segments.json`
- `analysis/roi/input/prepared/{date}/transcript.json`

필요하면 `metadata.csv`는 저장소 루트의 원본을 그대로 사용한다.

## 3. ROI 요약 생성

```bash
python3 scripts/build_roi_summary_from_raw.py
```

원하면 날짜를 제한해서 돌릴 수도 있다.

```bash
python3 scripts/build_roi_summary_from_raw.py --dates 2026-02-02 2026-02-09
```

## 출력 결과

스크립트는 날짜별로 아래 파일을 만든다.

- `analysis/roi/results/{date}-roi-summary.json`

결과에는 아래 정보가 들어간다.

- 세그먼트별 global magnitude / change
- 세그먼트별 ROI 평균 반응
- 세그먼트별 top active ROI
- 세그먼트별 top changed ROI
- lecture-level top ROI
- atlas 이름과 vertex count

## 해석 원칙

- ROI 결과는 `기능적 단정`이 아니라 `패턴 힌트`로만 쓴다.
- 예를 들어 `language / auditory / frontal-control` 같은 기능 힌트는 atlas 이름 기반의 보수적 분류다.
- 실제 문구는 `가능성`, `시사`, `패턴` 수준으로만 쓴다.

즉 이 폴더의 출력은 "학생이 실제로 무엇을 느꼈다"가 아니라, "어떤 cortical response 패턴이 상대적으로 강했는지"를 더 해부학적으로 정리한 보조 레이어다.
