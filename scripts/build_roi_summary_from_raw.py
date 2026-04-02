"""TRIBE raw output을 ROI 단위 요약 JSON으로 변환한다."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np

BASE = Path(__file__).resolve().parent.parent
DEFAULT_RAW_DIR = BASE / "analysis" / "roi" / "input" / "raw"
DEFAULT_PREPARED_DIR = BASE / "analysis" / "roi" / "input" / "prepared"
DEFAULT_OUTPUT_DIR = BASE / "analysis" / "roi" / "results"
DEFAULT_ROI_MAP = BASE / "analysis" / "roi" / "fsaverage5_destrieux_mapping.npz"
DEFAULT_METADATA_CSV = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 메타데이터.csv"


def load_json(path: Path) -> dict | list:
    return json.loads(path.read_text(encoding="utf-8"))


def load_metadata(path: Path) -> dict[str, dict[str, str]]:
    if not path.exists():
        return {}

    grouped: dict[str, dict[str, str]] = {}
    with open(path, "r", encoding="utf-8-sig") as file:
        for row in csv.DictReader(file):
            date = row["date"]
            entry = grouped.setdefault(
                date,
                {
                    "subject": row["subject"].strip(),
                    "content": row["content"].strip(),
                    "instructor": row["instructor"].strip(),
                },
            )
            if row["subject"].strip() and row["subject"].strip() not in entry["subject"]:
                entry["subject"] = row["subject"].strip()
            if row["content"].strip() and row["content"].strip() not in entry["content"]:
                entry["content"] = row["content"].strip()
    return grouped


def decode(value: object) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return str(value)


def display_name(name: str) -> str:
    return name.replace("_", " ").replace("G&S", "G and S").replace("G_", "G ").replace("S_", "S ").strip()


def infer_functional_hint(roi_name: str) -> str:
    name = roi_name.lower()
    if any(token in name for token in ("temp", "heschl", "transv", "planum", "sylv", "insula")):
        return "auditory_or_language_related"
    if any(token in name for token in ("front", "cingul-ant", "precentral", "supp-motor")):
        return "frontal_control_or_action_related"
    if any(token in name for token in ("occip", "calcar", "cuneus", "lingual")):
        return "visual_processing_related"
    if any(token in name for token in ("postcentral", "pariet", "supramarginal", "intrapariet")):
        return "sensorimotor_or_attention_related"
    if any(token in name for token in ("precuneus", "cingul-post", "angular", "temporal_pole")):
        return "association_or_default_mode_related"
    return "unclassified_surface_pattern"


def summarize_hemisphere(
    vector: np.ndarray,
    previous_vector: np.ndarray | None,
    roi_ids: np.ndarray,
    hemisphere: str,
    roi_names: list[str],
) -> list[dict]:
    rows: list[dict] = []
    for roi_id in np.unique(roi_ids):
        if roi_id < 0 or roi_id >= len(roi_names):
            continue
        roi_name = roi_names[int(roi_id)]
        if roi_name.lower() in {"unknown", "medial wall"}:
            continue

        mask = roi_ids == roi_id
        current = vector[mask]
        previous = previous_vector[mask] if previous_vector is not None else None

        rows.append(
            {
                "hemisphere": hemisphere,
                "roi_id": int(roi_id),
                "roi_name": roi_name,
                "roi_display_name": display_name(roi_name),
                "functional_hint": infer_functional_hint(roi_name),
                "vertex_count": int(mask.sum()),
                "signed_mean_response": round(float(current.mean()), 6),
                "mean_abs_response": round(float(np.abs(current).mean()), 6),
                "delta_abs_response": round(float(np.abs(current - previous).mean()), 6) if previous is not None else 0.0,
            }
        )
    return rows


def top_rows(rows: list[dict], key: str, limit: int = 8) -> list[dict]:
    return sorted(rows, key=lambda row: row[key], reverse=True)[:limit]


def normalize(values: np.ndarray) -> np.ndarray:
    lo = float(values.min())
    hi = float(values.max())
    if hi - lo < 1e-6:
        return np.full_like(values, 50.0, dtype=np.float32)
    return ((values - lo) / (hi - lo) * 100.0).astype(np.float32)


def summarize_date(
    date: str,
    raw_dir: Path,
    prepared_dir: Path,
    output_dir: Path,
    roi_map_path: Path,
    metadata_by_date: dict[str, dict[str, str]],
) -> Path:
    mapping = np.load(roi_map_path, allow_pickle=True)
    left_roi_ids = mapping["left_roi_ids"].astype(np.int32)
    right_roi_ids = mapping["right_roi_ids"].astype(np.int32)
    roi_names = [decode(name) for name in mapping["roi_names"].tolist()]
    atlas_name = decode(mapping["atlas_name"][0])

    raw_preds = np.load(raw_dir / f"{date}-tribe-raw.npz")["preds"].astype(np.float32)
    prepared_segments = load_json(prepared_dir / date / "segments.json")

    expected_vertices = int(left_roi_ids.shape[0] + right_roi_ids.shape[0])
    if raw_preds.shape[1] != expected_vertices:
        raise ValueError(f"{date}: raw vertex count {raw_preds.shape[1]} != expected {expected_vertices}")
    if raw_preds.shape[0] != len(prepared_segments):
        raise ValueError(
            f"{date}: raw segment count {raw_preds.shape[0]} != prepared segment count {len(prepared_segments)}"
        )

    magnitudes = np.linalg.norm(raw_preds, axis=1)
    changes = np.concatenate([[0.0], np.linalg.norm(np.diff(raw_preds, axis=0), axis=1)])
    normalized_magnitude = normalize(magnitudes)
    normalized_change = normalize(changes)

    left_size = int(left_roi_ids.shape[0])
    previous_vector: np.ndarray | None = None
    segment_payloads: list[dict] = []
    lecture_accumulator: dict[tuple[str, str], list[float]] = {}

    for index, segment in enumerate(prepared_segments):
        vector = raw_preds[index]
        left = vector[:left_size]
        right = vector[left_size:]
        previous_left = previous_vector[:left_size] if previous_vector is not None else None
        previous_right = previous_vector[left_size:] if previous_vector is not None else None

        roi_rows = summarize_hemisphere(left, previous_left, left_roi_ids, "left", roi_names)
        roi_rows.extend(summarize_hemisphere(right, previous_right, right_roi_ids, "right", roi_names))

        for row in roi_rows:
            lecture_accumulator.setdefault((row["hemisphere"], row["roi_name"]), []).append(row["mean_abs_response"])

        segment_payloads.append(
            {
                "segment_id": segment["segment_id"],
                "start_time": segment["start_time"],
                "end_time": segment["end_time"],
                "global_metrics": {
                    "magnitude": round(float(magnitudes[index]), 6),
                    "change_from_previous": round(float(changes[index]), 6),
                    "normalized_magnitude": round(float(normalized_magnitude[index]), 1),
                    "normalized_change": round(float(normalized_change[index]), 1),
                },
                "top_active_rois": top_rows(roi_rows, "mean_abs_response"),
                "top_changed_rois": top_rows(roi_rows, "delta_abs_response"),
                "roi_metrics": roi_rows,
            }
        )
        previous_vector = vector

    lecture_top_rois = sorted(
        (
            {
                "hemisphere": hemisphere,
                "roi_name": roi_name,
                "roi_display_name": display_name(roi_name),
                "functional_hint": infer_functional_hint(roi_name),
                "mean_abs_response": round(float(np.mean(values)), 6),
            }
            for (hemisphere, roi_name), values in lecture_accumulator.items()
        ),
        key=lambda row: row["mean_abs_response"],
        reverse=True,
    )[:12]

    payload = {
        "lecture_date": date,
        "atlas_name": atlas_name,
        "vertex_count_total": expected_vertices,
        "segment_count": int(raw_preds.shape[0]),
        "metadata": metadata_by_date.get(date, {}),
        "lecture_top_rois": lecture_top_rois,
        "segments": segment_payloads,
        "caution_text": (
            "ROI 결과는 fsaverage5 surface atlas 기반의 보조 해석 레이어이며, "
            "실제 수강생 심리 상태를 직접 측정한 값이 아닙니다."
        ),
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{date}-roi-summary.json"
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--prepared-dir", type=Path, default=DEFAULT_PREPARED_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--roi-map", type=Path, default=DEFAULT_ROI_MAP)
    parser.add_argument("--metadata-csv", type=Path, default=DEFAULT_METADATA_CSV)
    parser.add_argument("--dates", nargs="*", default=None, help="예: 2026-02-02 2026-02-09")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    metadata_by_date = load_metadata(args.metadata_csv)

    if args.dates:
        dates = args.dates
    else:
        dates = sorted(path.stem.replace("-tribe-raw", "") for path in args.raw_dir.glob("*-tribe-raw.npz"))

    if not dates:
        raise SystemExit("처리할 raw output이 없습니다.")

    for date in dates:
        output_path = summarize_date(
            date=date,
            raw_dir=args.raw_dir,
            prepared_dir=args.prepared_dir,
            output_dir=args.output_dir,
            roi_map_path=args.roi_map,
            metadata_by_date=metadata_by_date,
        )
        print(f"wrote {output_path.relative_to(BASE)}")


if __name__ == "__main__":
    main()
