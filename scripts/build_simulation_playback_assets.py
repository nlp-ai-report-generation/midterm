"""시뮬레이션 JSON을 요약 탭 + live 재생 자산 계약으로 확장한다."""

from __future__ import annotations

import argparse
import json
import math
import re
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


QUESTION_PATTERN = re.compile(r"[?？]|(인가요|할까요|되나요|보이죠|아시겠죠|맞죠|볼게요\?|보실래요)")
EMPHASIS_PATTERN = re.compile(r"(중요|핵심|반드시|꼭|포인트|기억|주의|다시|정리하면|강조)")
TRANSITION_PATTERN = re.compile(r"(이제|그다음|다음|반대로|정리하면|여기서|그러면|자,|자\s|이번에는|한편|먼저|마지막으로)")
TECH_PATTERN = re.compile(r"[A-Z]{2,}|\b(Java|NIO|HTTP|React|API|SQL|JDK|TCP|UDP|MVC)\b")


def percentile_bounds(values: list[float], lower_ratio: float = 0.12, upper_ratio: float = 0.88) -> tuple[float, float]:
    if not values:
        return (0.0, 1.0)
    ordered = sorted(values)
    low_index = max(0, min(len(ordered) - 1, int((len(ordered) - 1) * lower_ratio)))
    high_index = max(0, min(len(ordered) - 1, int((len(ordered) - 1) * upper_ratio)))
    low = ordered[low_index]
    high = ordered[high_index]
    if high - low < 1e-6:
        return (min(ordered), max(ordered) + 1e-6)
    return (low, high)


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def compute_line_features(lines: list[dict]) -> list[dict]:
    lengths = [len(line["text"].strip()) for line in lines]
    avg_length = sum(lengths) / max(1, len(lengths))
    features: list[dict] = []
    previous_tokens: set[str] = set()

    for index, line in enumerate(lines):
        text = line["text"].strip()
        length = len(text)
        tokens = set(re.findall(r"[A-Za-z가-힣0-9]+", text))
        transition_score = 1.0 if TRANSITION_PATTERN.search(text) else 0.0
        question_score = 1.0 if QUESTION_PATTERN.search(text) else 0.0
        emphasis_score = 1.0 if EMPHASIS_PATTERN.search(text) else 0.0
        tech_score = 1.0 if TECH_PATTERN.search(text) else 0.0
        density_score = clamp(length / max(1.0, avg_length), 0.55, 1.65)
        novelty_ratio = 0.0
        if tokens:
            new_tokens = len(tokens - previous_tokens)
            novelty_ratio = new_tokens / max(1, len(tokens))
        previous_tokens = tokens if tokens else previous_tokens

        position_ratio = index / max(1, len(lines) - 1)
        position_curve = 0.82 + math.sin(position_ratio * math.pi) * 0.2
        cue_weight = (
            1.0
            + question_score * 0.18
            + emphasis_score * 0.16
            + transition_score * 0.22
            + tech_score * 0.1
            + novelty_ratio * 0.18
        )
        line_weight = density_score * cue_weight * position_curve
        features.append(
            {
                "length": length,
                "density_score": round(density_score, 4),
                "question_score": question_score,
                "emphasis_score": emphasis_score,
                "transition_score": transition_score,
                "tech_score": tech_score,
                "novelty_ratio": round(novelty_ratio, 4),
                "position_ratio": round(position_ratio, 4),
                "line_weight": round(line_weight, 4),
            }
        )

    return features


def weighted_display_values(segment: dict, feature: dict, segment_duration: int, relative_seconds: float) -> dict[str, float]:
    attention = float(segment["proxies"]["attention_proxy"])
    load = float(segment["proxies"]["load_proxy"])
    novelty = float(segment["proxies"]["novelty_proxy"])

    time_pressure = clamp(relative_seconds / max(1.0, segment_duration), 0.0, 1.0)
    intensity = (
        attention * 0.56
        + load * 0.2
        + feature["density_score"] * 18.0
        + feature["emphasis_score"] * 9.0
        + feature["tech_score"] * 6.0
    ) / 100.0
    change_boost = (
        novelty * 0.58
        + feature["transition_score"] * 28.0
        + feature["question_score"] * 18.0
        + feature["novelty_ratio"] * 36.0
        + time_pressure * 8.0
    ) / 100.0
    timeline_emphasis = (
        attention * 0.34
        + load * 0.22
        + novelty * 0.28
        + feature["line_weight"] * 9.0
    ) / 100.0

    attention_display = attention * (0.82 + intensity * 0.28 + change_boost * 0.1)
    load_display = load * (0.86 + feature["density_score"] * 0.18 + feature["emphasis_score"] * 0.08)
    novelty_display = novelty * (0.78 + change_boost * 0.34 + feature["transition_score"] * 0.16)

    return {
        "heuristic_intensity": round(clamp(intensity, 0.22, 1.0), 4),
        "heuristic_change_boost": round(clamp(change_boost, 0.12, 1.0), 4),
        "heuristic_timeline_emphasis": round(clamp(timeline_emphasis, 0.18, 1.0), 4),
        "attention_display": round(clamp(attention_display, 0.0, 100.0), 2),
        "load_display": round(clamp(load_display, 0.0, 100.0), 2),
        "novelty_display": round(clamp(novelty_display, 0.0, 100.0), 2),
    }


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
    frame_attention_values: list[float] = []
    frame_load_values: list[float] = []
    frame_novelty_values: list[float] = []

    for segment_index, transcript_segment in enumerate(transcript["segments"]):
        simulation_segment = simulation["segments"][segment_index]
        segment_global_start = segment_start_seconds[segment_index]
        segment_global_end = segment_end_seconds[segment_index]
        segment_duration = max(1, segment_global_end - segment_global_start)
        local_frame_times: list[float] = []
        line_to_frame: list[dict] = []
        line_features = compute_line_features(transcript_segment["lines"])

        for line_index, line in enumerate(transcript_segment["lines"]):
            lecture_seconds = flat_lecture_seconds[flat_index]
            relative_seconds = max(0.0, float(lecture_seconds - segment_global_start))
            playback_ratio = min(1.0, relative_seconds / segment_duration)
            feature = line_features[line_index]
            display_values = weighted_display_values(simulation_segment, feature, segment_duration, relative_seconds)

            line["relative_seconds"] = round(relative_seconds, 2)
            line["lecture_seconds"] = lecture_seconds
            line["frame_index"] = frame_cursor
            line["line_weight"] = feature["line_weight"]

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
                "heuristic_intensity": display_values["heuristic_intensity"],
                "heuristic_change_boost": display_values["heuristic_change_boost"],
                "heuristic_timeline_emphasis": display_values["heuristic_timeline_emphasis"],
            }
            live_frames.append(live_frame)
            frame_attention_values.append(display_values["attention_display"])
            frame_load_values.append(display_values["load_display"])
            frame_novelty_values.append(display_values["novelty_display"])
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
                    "attention_display": display_values["attention_display"],
                    "load_display": display_values["load_display"],
                    "novelty_display": display_values["novelty_display"],
                    "attention_ratio": round(normalize(display_values["attention_display"], 0.0, max_attention), 4),
                    "load_ratio": round(normalize(display_values["load_display"], 0.0, max_load), 4),
                    "novelty_ratio": round(normalize(display_values["novelty_display"], 0.0, max_novelty), 4),
                    "heuristic_timeline_emphasis": display_values["heuristic_timeline_emphasis"],
                }
            )

            frame_cursor += 1
            flat_index += 1

        simulation_segment["playback"] = {
            "frame_times": local_frame_times,
            "line_to_frame": line_to_frame,
        }

    attention_low, attention_high = percentile_bounds(frame_attention_values)
    load_low, load_high = percentile_bounds(frame_load_values)
    novelty_low, novelty_high = percentile_bounds(frame_novelty_values)
    for frame in timeline_frames:
        frame["attention_ratio"] = round(normalize(frame["attention_display"], attention_low, attention_high), 4)
        frame["load_ratio"] = round(normalize(frame["load_display"], load_low, load_high), 4)
        frame["novelty_ratio"] = round(normalize(frame["novelty_display"], novelty_low, novelty_high), 4)

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
