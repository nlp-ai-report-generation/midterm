"""TRIBE 산출 zip에서 단일 날짜 결과를 가져와 frontend 시뮬레이션 데이터를 갱신한다."""

from __future__ import annotations

import argparse
import csv
import json
import shutil
import zipfile
from pathlib import Path

import numpy as np

BASE = Path(__file__).resolve().parent.parent
DEFAULT_ANALYSIS_DIR = BASE / "analysis" / "roi"
DEFAULT_FRONTEND_DIR = BASE / "frontend" / "public" / "data" / "simulations"
DEFAULT_METADATA_CSV = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 메타데이터.csv"


def load_json(path: Path) -> dict | list:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(data: object, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_metadata(path: Path) -> dict[str, dict[str, str]]:
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
    display = name.replace("_", " ").replace("G&S", "G and S").replace("G_", "G ").replace("S_", "S ")
    return " ".join(display.split())


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


def normalize(values: np.ndarray) -> np.ndarray:
    lo = float(values.min())
    hi = float(values.max())
    if hi - lo < 1e-6:
        return np.full_like(values, 50.0, dtype=np.float32)
    return ((values - lo) / (hi - lo) * 100.0).astype(np.float32)


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


def top_rows(rows: list[dict], key: str, limit: int = 3) -> list[dict]:
    return sorted(rows, key=lambda row: row[key], reverse=True)[:limit]


def hint_label(hint: str) -> str:
    return {
        "auditory_or_language_related": "설명 추적 반응",
        "frontal_control_or_action_related": "통제와 전환 반응",
        "visual_processing_related": "시각 처리 반응",
        "sensorimotor_or_attention_related": "주의 전환 반응",
        "association_or_default_mode_related": "연결 패턴 반응",
        "unclassified_surface_pattern": "표면 반응 변화",
    }.get(hint, "반응 변화")


def unique_hint_labels(rows: list[dict]) -> list[str]:
    labels: list[str] = []
    for row in rows:
        label = hint_label(row["functional_hint"])
        if label not in labels:
            labels.append(label)
    return labels


def transcript_excerpt(lines: list[dict], limit: int = 2) -> str:
    texts = [line["text"].strip() for line in lines[:limit] if line.get("text", "").strip()]
    return " ".join(texts)[:160]


def build_roi_summary_text(segment: dict, excerpt: str, active_rows: list[dict], changed_rows: list[dict]) -> str:
    labels = segment["labels"]
    active_hint = hint_label(active_rows[0]["functional_hint"]) if active_rows else "설명 반응"
    changed_hint = hint_label(changed_rows[0]["functional_hint"]) if changed_rows else "전환 반응"

    if "부하 높음" in labels:
        return f"{active_hint}이 보이는 구간이에요. 정보가 촘촘해서 {changed_hint.lower()}도 함께 커졌어요."
    if "집중 상승" in labels:
        return f"{active_hint}이 올라가는 구간이에요. {changed_hint}도 함께 움직여서 흐름 전환이 또렷하게 보여요."
    if "집중 하락" in labels:
        return f"{active_hint}이 낮아지는 구간이에요. {changed_hint}을 한 번 살려주면 다시 따라가기 쉬워져요."
    if "복습 필요" in labels:
        return f"{active_hint}은 유지되지만 변화 폭은 크지 않아요. 핵심을 한 번 묶어주면 더 또렷하게 읽혀요."
    if excerpt:
        return f"{active_hint}이 안정적으로 이어지는 구간이에요. 지금 설명 흐름을 유지하면서 핵심 문장을 더 분명하게 잡아주면 좋아요."
    return f"{active_hint}이 안정적으로 이어지는 구간이에요. {changed_hint}도 함께 보면서 리듬을 조정해보면 좋아요."


def build_method_explainer(source_modality: str) -> dict[str, str]:
    modality_text = "오디오 fallback 자극" if source_modality == "audio_only_fallback" else "텍스트 기반 자극"
    return {
        "input_summary": f"강의 원문을 5분 세그먼트로 나누고 {modality_text}으로 TRIBE에 넣어요.",
        "proxy_summary": "세그먼트 반응 강도와 변화량을 attention, load, novelty로 묶어 보여줘요.",
        "roi_summary": "정점 반응을 뇌 영역 단위로 다시 묶어서 어느 패턴이 두드러지는지 읽어요.",
    }


def update_simulation_payload(frontend_payload: dict, prepared_segments: list[dict], roi_payload: dict) -> dict:
    roi_by_segment = {segment["segment_id"]: segment for segment in roi_payload["segments"]}
    prepared_by_segment = {segment["segment_id"]: segment for segment in prepared_segments}

    enhanced_segments = []
    for segment in frontend_payload["segments"]:
        prepared = prepared_by_segment[segment["segment_id"]]
        roi_segment = roi_by_segment[segment["segment_id"]]
        active_rows = roi_segment["top_active_rois"]
        changed_rows = roi_segment["top_changed_rois"]
        excerpt = transcript_excerpt(prepared["lines"])
        enhanced_segments.append(
            {
                **segment,
                "labels": list(dict.fromkeys(segment["labels"] + unique_hint_labels(active_rows[:2]))),
                "interpretation": build_roi_summary_text(segment, excerpt, active_rows, changed_rows),
                "roi_insights": {
                    "top_active_rois": active_rows,
                    "top_changed_rois": changed_rows,
                    "summary_text": build_roi_summary_text(segment, excerpt, active_rows, changed_rows),
                },
            }
        )

    source_modality = frontend_payload.get("source_modality", "text_tts")
    if source_modality == "text_tts":
        source_modality = "audio_only_fallback"

    frontend_payload["source_modality"] = source_modality
    frontend_payload["generated_at"] = "2026-03-30T17:05:00+09:00"
    frontend_payload["segments"] = enhanced_segments
    frontend_payload["lecture_summary"]["summary_text"] = (
        "TRIBE raw output을 전역 프록시와 영역 패턴으로 함께 묶어 강의 리듬을 읽은 결과예요."
    )
    frontend_payload["roi_summary"] = {
        "atlas_name": roi_payload["atlas_name"],
        "lecture_top_rois": roi_payload["lecture_top_rois"],
        "method_explainer": build_method_explainer(source_modality),
    }
    return frontend_payload


def copy_from_zip(zip_path: Path, member: str, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as archive, archive.open(member) as source, open(target, "wb") as dest:
        shutil.copyfileobj(source, dest)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip_path", type=Path)
    parser.add_argument("--date", default="2026-02-02")
    parser.add_argument("--analysis-dir", type=Path, default=DEFAULT_ANALYSIS_DIR)
    parser.add_argument("--frontend-dir", type=Path, default=DEFAULT_FRONTEND_DIR)
    parser.add_argument("--metadata-csv", type=Path, default=DEFAULT_METADATA_CSV)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    date = args.date

    raw_dir = args.analysis_dir / "input" / "raw"
    prepared_dir = args.analysis_dir / "input" / "prepared"
    results_dir = args.analysis_dir / "results"
    roi_map_path = args.analysis_dir / "fsaverage5_destrieux_mapping.npz"

    if not roi_map_path.exists():
        raise SystemExit("ROI 매핑 파일이 없습니다. 먼저 scripts/export_fsaverage_roi_map.py를 실행하세요.")

    copy_from_zip(args.zip_path, f"outputs/raw/{date}-tribe-raw.npz", raw_dir / f"{date}-tribe-raw.npz")
    copy_from_zip(args.zip_path, f"outputs/raw/{date}-tribe-raw-meta.json", raw_dir / f"{date}-tribe-raw-meta.json")
    copy_from_zip(args.zip_path, f"outputs/prepared/{date}/segments.json", prepared_dir / date / "segments.json")
    copy_from_zip(args.zip_path, f"outputs/prepared/{date}/transcript.json", prepared_dir / date / "transcript.json")
    copy_from_zip(args.zip_path, f"outputs/prepared/{date}/metadata.json", prepared_dir / date / "metadata.json")
    copy_from_zip(args.zip_path, f"outputs/frontend/{date}.json", args.frontend_dir / f"{date}.json")
    copy_from_zip(args.zip_path, f"outputs/frontend/{date}-transcript.json", args.frontend_dir / f"{date}-transcript.json")
    copy_from_zip(args.zip_path, f"outputs/assets/{date}-segment-colors.json", args.frontend_dir / f"{date}-segment-colors.json")

    metadata_by_date = load_metadata(args.metadata_csv)

    mapping = np.load(roi_map_path, allow_pickle=True)
    left_roi_ids = mapping["left_roi_ids"].astype(np.int32)
    right_roi_ids = mapping["right_roi_ids"].astype(np.int32)
    roi_names = [decode(name) for name in mapping["roi_names"].tolist()]
    atlas_name = decode(mapping["atlas_name"][0])

    raw_preds = np.load(raw_dir / f"{date}-tribe-raw.npz")["preds"].astype(np.float32)
    prepared_segments = load_json(prepared_dir / date / "segments.json")
    frontend_payload = load_json(args.frontend_dir / f"{date}.json")

    expected_vertices = int(left_roi_ids.shape[0] + right_roi_ids.shape[0])
    if raw_preds.shape != (len(prepared_segments), expected_vertices):
        raise ValueError(f"{date}: raw shape {raw_preds.shape} is not aligned with prepared segments / atlas")

    magnitudes = np.linalg.norm(raw_preds, axis=1)
    changes = np.concatenate([[0.0], np.linalg.norm(np.diff(raw_preds, axis=0), axis=1)])
    normalized_magnitude = normalize(magnitudes)
    normalized_change = normalize(changes)

    left_size = int(left_roi_ids.shape[0])
    previous_vector: np.ndarray | None = None
    segment_payloads = []
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

    roi_payload = {
        "lecture_date": date,
        "atlas_name": atlas_name,
        "vertex_count_total": expected_vertices,
        "segment_count": int(raw_preds.shape[0]),
        "metadata": metadata_by_date.get(date, {}),
        "lecture_top_rois": sorted(
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
        )[:12],
        "segments": segment_payloads,
        "caution_text": (
            "ROI 결과는 fsaverage5 surface atlas 기반의 보조 해석 레이어이며, "
            "실제 수강생 심리 상태를 직접 측정한 값이 아니에요."
        ),
    }
    save_json(roi_payload, results_dir / f"{date}-roi-summary.json")

    updated_frontend = update_simulation_payload(frontend_payload, prepared_segments, roi_payload)
    save_json(updated_frontend, args.frontend_dir / f"{date}.json")

    manifest_path = args.frontend_dir / "manifest.json"
    if manifest_path.exists():
        manifest = load_json(manifest_path)
        if isinstance(manifest, dict):
            dates = manifest.get("dates")
            if isinstance(dates, list):
                if date not in dates:
                    dates.append(date)
                manifest["dates"] = sorted(set(dates))
            save_json(manifest, manifest_path)
        elif isinstance(manifest, list):
            for item in manifest:
                if isinstance(item, dict) and item.get("date") == date:
                    item["simulation_ready"] = True
            save_json(manifest, manifest_path)

    print(f"updated simulation payload for {date}")


if __name__ == "__main__":
    main()
