"""시뮬레이션 JSON을 요약 탭 + live 재생 자산 계약으로 확장한다."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DEFAULT_FRONTEND_DIR = BASE / "frontend" / "public" / "data" / "simulations"


def load_json(path: Path) -> dict | list:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(data: object, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_clock_to_seconds(value: str) -> int:
    hours, minutes, seconds = [int(part) for part in value.split(":")]
    return hours * 3600 + minutes * 60 + seconds


def monotonize_timestamps(timestamps: list[str]) -> list[int]:
    results: list[int] = []
    offset = 0
    previous: int | None = None

    for timestamp in timestamps:
        raw_seconds = parse_clock_to_seconds(timestamp)
        if previous is not None and raw_seconds + offset < previous - 6 * 3600:
            offset += 12 * 3600
        current = raw_seconds + offset
        if previous is not None and current < previous:
            current = previous
        results.append(current)
        previous = current

    return results


def normalize(value: float, min_value: float, max_value: float) -> float:
    if max_value - min_value < 1e-6:
        return 0.5
    return max(0.0, min(1.0, (value - min_value) / (max_value - min_value)))


def unique_segments_by_order(segment_ids: list[str], segments: list[dict]) -> list[dict]:
    seen: set[str] = set()
    by_id = {segment["segment_id"]: segment for segment in segments}
    ordered: list[dict] = []

    for segment_id in segment_ids:
        if segment_id in seen or segment_id not in by_id:
            continue
        ordered.append(by_id[segment_id])
        seen.add(segment_id)

    return ordered


def hint_zone_index(hint: str) -> int:
    return {
        "frontal_control_or_action_related": 0,
        "auditory_or_language_related": 1,
        "sensorimotor_or_attention_related": 2,
        "visual_processing_related": 3,
        "association_or_default_mode_related": 2,
        "unclassified_surface_pattern": 1,
    }.get(hint, 1)


def build_zone_values(segment: dict) -> dict[str, list[float]]:
    attention = float(segment["proxies"]["attention_proxy"])
    load = float(segment["proxies"]["load_proxy"])
    novelty = float(segment["proxies"]["novelty_proxy"])
    left = [0.22 + attention / 220.0] * 4
    right = [0.22 + attention / 220.0] * 4

    for row in segment["roi_insights"]["top_active_rois"][:4]:
        base = min(1.0, 0.28 + float(row.get("mean_abs_response", 0.0)) * 7.0 + attention / 180.0)
        target = left if row["hemisphere"] == "left" else right
        target[hint_zone_index(row["functional_hint"])] = max(target[hint_zone_index(row["functional_hint"])], base)

    for row in segment["roi_insights"]["top_changed_rois"][:3]:
        base = min(1.0, 0.2 + float(row.get("delta_abs_response", 0.0)) * 8.0 + novelty / 170.0)
        target = left if row["hemisphere"] == "left" else right
        target[hint_zone_index(row["functional_hint"])] = max(target[hint_zone_index(row["functional_hint"])], base)

    load_boost = min(0.18, load / 700.0)
    left = [min(1.0, value + load_boost) for value in left]
    right = [min(1.0, value + load_boost) for value in right]

    return {"left": [round(value, 4) for value in left], "right": [round(value, 4) for value in right]}


def build_hero_statement(simulation: dict) -> str:
    segments = simulation["segments"]
    highest_load = max(segments, key=lambda item: item["proxies"]["load_proxy"])
    highest_novelty = max(segments, key=lambda item: item["proxies"]["novelty_proxy"])
    strongest = max(segments, key=lambda item: item["proxies"]["attention_proxy"])

    if highest_load["proxies"]["load_proxy"] >= 75 and highest_novelty["proxies"]["novelty_proxy"] >= 55:
        return "설명이 빨라지는 구간에서 반응이 크게 바뀌어요."
    if strongest["proxies"]["attention_proxy"] >= 70:
        return "핵심 설명이 들어오는 구간에서 반응이 또렷하게 올라와요."
    return "강의 리듬이 바뀌는 지점을 따라 반응 패턴이 함께 움직여요."


def build_highlight_cards(simulation: dict) -> list[dict]:
    segments = simulation["segments"]
    strongest = max(segments, key=lambda item: item["proxies"]["attention_proxy"])
    highest_load = max(segments, key=lambda item: item["proxies"]["load_proxy"])
    highest_novelty = max(segments, key=lambda item: item["proxies"]["novelty_proxy"])
    return [
        {
            "kind": "attention",
            "title": "반응이 가장 큰 구간",
            "summary": f"{strongest['segment_id']}에서 설명 추적 반응이 가장 또렷하게 보여요.",
            "segment_id": strongest["segment_id"],
            "value": round(float(strongest["proxies"]["attention_proxy"]), 1),
        },
        {
            "kind": "load",
            "title": "부하가 가장 높은 구간",
            "summary": f"{highest_load['segment_id']}에서 정보 밀도가 높아져요.",
            "segment_id": highest_load["segment_id"],
            "value": round(float(highest_load["proxies"]["load_proxy"]), 1),
        },
        {
            "kind": "novelty",
            "title": "변화가 가장 큰 구간",
            "summary": f"{highest_novelty['segment_id']}에서 설명 축이 크게 바뀌어요.",
            "segment_id": highest_novelty["segment_id"],
            "value": round(float(highest_novelty["proxies"]["novelty_proxy"]), 1),
        },
    ]


def build_summary_frames(simulation: dict) -> list[dict]:
    segments = simulation["segments"]
    by_attention = max(segments, key=lambda item: item["proxies"]["attention_proxy"])
    by_load = max(segments, key=lambda item: item["proxies"]["load_proxy"])
    by_novelty = max(segments, key=lambda item: item["proxies"]["novelty_proxy"])
    by_risk = max(
        segments,
        key=lambda item: item["proxies"]["load_proxy"] - item["proxies"]["attention_proxy"] * 0.35,
    )

    ordered = unique_segments_by_order(
        [
            by_attention["segment_id"],
            by_load["segment_id"],
            by_novelty["segment_id"],
            by_risk["segment_id"],
            simulation["lecture_summary"]["strongest_segment_ids"][0],
        ],
        segments,
    )

    frames: list[dict] = []
    for index, segment in enumerate(ordered[:5]):
        frames.append(
            {
                "frame_id": f"{segment['segment_id']}-summary-{index + 1}",
                "segment_id": segment["segment_id"],
                "title": segment["segment_id"],
                "subtitle": segment["roi_insights"]["summary_text"],
                "labels": segment["labels"][:3],
                "proxies": {
                    "attention": round(float(segment["proxies"]["attention_proxy"]), 1),
                    "load": round(float(segment["proxies"]["load_proxy"]), 1),
                    "novelty": round(float(segment["proxies"]["novelty_proxy"]), 1),
                },
                "zones": build_zone_values(segment),
            }
        )
    return frames


def enrich_transcript_and_build_assets(date: str, frontend_dir: Path) -> None:
    simulation_path = frontend_dir / f"{date}.json"
    transcript_path = frontend_dir / f"{date}-transcript.json"

    simulation = load_json(simulation_path)
    transcript = load_json(transcript_path)

    if not isinstance(simulation, dict) or not isinstance(transcript, dict):
        raise ValueError("시뮬레이션 또는 transcript JSON 형식이 잘못되었습니다.")

    flat_timestamps = [
        line["timestamp"]
        for segment in transcript["segments"]
        for line in segment["lines"]
    ]
    flat_lecture_seconds = monotonize_timestamps(flat_timestamps)

    segment_start_seconds = monotonize_timestamps([segment["start_time"] for segment in transcript["segments"]])
    segment_end_seconds = monotonize_timestamps([segment["end_time"] for segment in transcript["segments"]])

    frame_cursor = 0
    live_frames: list[dict] = []
    timeline_frames: list[dict] = []
    flat_index = 0

    max_attention = max(segment["proxies"]["attention_proxy"] for segment in simulation["segments"])
    max_load = max(segment["proxies"]["load_proxy"] for segment in simulation["segments"])
    max_novelty = max(segment["proxies"]["novelty_proxy"] for segment in simulation["segments"])

    for segment_index, transcript_segment in enumerate(transcript["segments"]):
        simulation_segment = simulation["segments"][segment_index]
        segment_global_start = segment_start_seconds[segment_index]
        segment_global_end = segment_end_seconds[segment_index]
        segment_duration = max(1, segment_global_end - segment_global_start)
        local_frame_times: list[float] = []
        line_to_frame: list[dict] = []

        for line_index, line in enumerate(transcript_segment["lines"]):
            lecture_seconds = flat_lecture_seconds[flat_index]
            relative_seconds = max(0.0, float(lecture_seconds - segment_global_start))
            playback_ratio = min(1.0, relative_seconds / segment_duration)

            line["relative_seconds"] = round(relative_seconds, 2)
            line["lecture_seconds"] = lecture_seconds
            line["frame_index"] = frame_cursor

            local_frame_times.append(round(relative_seconds, 2))
            line_to_frame.append(
                {
                    "line_index": line_index,
                    "start_frame": frame_cursor,
                    "end_frame": frame_cursor,
                }
            )

            frame_id = f"{simulation_segment['segment_id']}-line-{line_index + 1}"
            live_frame = {
                "frame_id": frame_id,
                "segment_id": simulation_segment["segment_id"],
                "segment_index": segment_index,
                "line_index": line_index,
                "timestamp": line["timestamp"],
                "relative_seconds": round(relative_seconds, 2),
                "lecture_seconds": lecture_seconds,
                "color_segment_index": segment_index,
                "playback_ratio": round(playback_ratio, 4),
            }
            live_frames.append(live_frame)
            timeline_frames.append(
                {
                    "frame_id": frame_id,
                    "segment_id": simulation_segment["segment_id"],
                    "segment_index": segment_index,
                    "line_index": line_index,
                    "lecture_seconds": lecture_seconds,
                    "attention": round(float(simulation_segment["proxies"]["attention_proxy"]), 1),
                    "load": round(float(simulation_segment["proxies"]["load_proxy"]), 1),
                    "novelty": round(float(simulation_segment["proxies"]["novelty_proxy"]), 1),
                    "attention_ratio": round(
                        normalize(float(simulation_segment["proxies"]["attention_proxy"]), 0.0, max_attention), 4
                    ),
                    "load_ratio": round(normalize(float(simulation_segment["proxies"]["load_proxy"]), 0.0, max_load), 4),
                    "novelty_ratio": round(
                        normalize(float(simulation_segment["proxies"]["novelty_proxy"]), 0.0, max_novelty), 4
                    ),
                }
            )

            frame_cursor += 1
            flat_index += 1

        simulation_segment["playback"] = {
            "frame_times": local_frame_times,
            "line_to_frame": line_to_frame,
        }

    summary_frames = build_summary_frames(simulation)
    summary_visual_path = frontend_dir / f"{date}-brain-icon-frames.json"
    live_frame_path = frontend_dir / f"{date}-live-frames.json"
    timeline_frame_path = frontend_dir / f"{date}-timeline-frames.json"

    save_json(
        {
            "lecture_date": date,
            "frames": summary_frames,
        },
        summary_visual_path,
    )
    save_json(
        {
            "lecture_date": date,
            "frames": live_frames,
        },
        live_frame_path,
    )
    save_json(
        {
            "lecture_date": date,
            "frames": timeline_frames,
        },
        timeline_frame_path,
    )

    simulation["summary_visual"] = {
        "brain_icon_frames_json": f"/data/simulations/{summary_visual_path.name}",
        "hero_statement": build_hero_statement(simulation),
        "highlight_cards": build_highlight_cards(simulation),
    }
    simulation["live_assets"] = {
        "brain_frames_json": f"/data/simulations/{live_frame_path.name}",
        "timeline_frames_json": f"/data/simulations/{timeline_frame_path.name}",
    }

    save_json(simulation, simulation_path)
    save_json(transcript, transcript_path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default="2026-02-02")
    parser.add_argument("--frontend-dir", type=Path, default=DEFAULT_FRONTEND_DIR)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    enrich_transcript_and_build_assets(args.date, args.frontend_dir)
    print(f"updated playback assets for {args.date}")


if __name__ == "__main__":
    main()
