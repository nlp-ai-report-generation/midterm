"""TRIBE v2 시뮬레이션용 파일럿 정적 데이터를 생성한다.

실제 TRIBE v2 추론 결과가 준비되기 전에도 프론트와 코랩 흐름을 검증할 수 있도록
3개 강의에 대한 세그먼트/원문/뇌 색상 시드 데이터를 만든다.
"""

from __future__ import annotations

import csv
import json
import math
import random
import re
from dataclasses import dataclass
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
TRANSCRIPT_DIR = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 스크립트"
METADATA_CSV = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 메타데이터.csv"
OUTPUT_DIR = BASE / "frontend" / "public" / "data" / "simulations"
PILOT_DATES = ("2026-02-02", "2026-02-09", "2026-02-24")
LINE_PATTERN = re.compile(r"<(\d{2}:\d{2}:\d{2})>\s+(\S+):\s+(.*)")
SEGMENT_MINUTES = 5
VERTEX_COUNT = 10242
TECH_WORDS = (
    "패턴",
    "제너릭",
    "리액트",
    "쿼리",
    "서버",
    "클라이언트",
    "트랜잭션",
    "데이터베이스",
    "HTTP",
    "렌더링",
    "컴포넌트",
    "상태",
    "네트워크",
)


@dataclass
class TranscriptLine:
    timestamp: str
    speaker: str
    text: str
    seconds: int


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def save_json(data: object, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"wrote {path.relative_to(BASE)}")


def timestamp_to_seconds(ts: str) -> int:
    h, m, s = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + int(s)


def parse_transcript(path: Path) -> list[TranscriptLine]:
    raw_lines: list[tuple[str, str, str, int]] = []
    prev_raw: int | None = None
    offset = 0
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            match = LINE_PATTERN.match(raw.strip())
            if not match:
                continue
            timestamp, speaker, text = match.groups()
            raw_seconds = timestamp_to_seconds(timestamp)
            if prev_raw is not None and raw_seconds < prev_raw - 1800:
                offset += 12 * 3600
            prev_raw = raw_seconds
            raw_lines.append((timestamp, speaker, text, raw_seconds + offset))
    return [TranscriptLine(*line) for line in raw_lines]


def load_metadata() -> dict[str, dict[str, str]]:
    grouped: dict[str, dict[str, str]] = {}
    with open(METADATA_CSV, "r", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
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


def normalize(value: float, source_min: float, source_max: float) -> float:
    if source_max - source_min <= 1e-6:
        return 50.0
    ratio = (value - source_min) / (source_max - source_min)
    return round(clamp(ratio * 100.0, 0.0, 100.0), 1)


def segment_lines(lines: list[TranscriptLine], segment_minutes: int) -> list[list[TranscriptLine]]:
    if not lines:
        return []
    segment_seconds = segment_minutes * 60
    start = lines[0].seconds
    end = lines[-1].seconds
    windows: list[list[TranscriptLine]] = []
    cursor = start
    while cursor <= end:
        window = [line for line in lines if cursor <= line.seconds < cursor + segment_seconds]
        if window:
            windows.append(window)
        cursor += segment_seconds
    return windows


def build_interpretation(attention: float, load: float, novelty: float) -> str:
    if attention >= 72 and novelty >= 58:
        return "새 개념이 들어오면서 반응 강도가 함께 올라가는 구간입니다. 데모나 예시 전환이 집중을 끌어올린 것으로 해석할 수 있습니다."
    if load >= 70 and attention < 55:
        return "설명 밀도에 비해 반응 유지가 떨어져 인지 부하가 높게 읽히는 구간입니다. 속도 조절이나 요약 신호가 필요합니다."
    if attention < 45:
        return "반응 강도가 낮아지는 구간입니다. 질문, 예시, 리캡 같은 리듬 전환 장치가 있으면 다시 끌어올릴 수 있습니다."
    return "반응이 큰 흔들림 없이 유지되는 구간입니다. 현재 리듬을 유지하면서 핵심 문장을 조금 더 분명하게 강조하는 편이 좋습니다."


def build_labels(attention: float, load: float, novelty: float) -> list[str]:
    labels: list[str] = []
    if attention >= 70:
        labels.append("집중 상승")
    elif attention <= 42:
        labels.append("집중 하락")
    if load >= 68:
        labels.append("부하 높음")
    elif novelty <= 35:
        labels.append("복습 필요")
    return labels[:2] or ["리듬 안정"]


def make_excerpt(lines: list[TranscriptLine], limit: int = 3) -> str:
    texts = [line.text.strip() for line in lines[:limit] if line.text.strip()]
    return " ".join(texts)[:280]


def build_color_series(base: float, novelty: float, side: str, segment_index: int) -> list[float]:
    colors: list[float] = []
    side_phase = 0.7 if side == "left" else 1.4
    intensity = clamp(base / 100.0, 0.15, 0.98)
    novelty_factor = novelty / 100.0
    for idx in range(VERTEX_COUNT):
        theta = idx / 28.0
        ripple = math.sin(theta + segment_index * 0.85 + side_phase) * 0.18
        wave = math.cos(theta / 3.7 + side_phase) * 0.12
        local = intensity + ripple + wave + (novelty_factor - 0.5) * 0.22
        colors.append(round(clamp(local, 0.0, 1.0), 4))
    return colors


def build_personas(segments: list[dict]) -> list[dict]:
    def mean(key: str) -> float:
        return round(sum(seg["proxies"][key] for seg in segments) / max(len(segments), 1), 1)

    attention = mean("attention_proxy")
    load = mean("load_proxy")
    novelty = mean("novelty_proxy")

    def rank_segments(score_fn) -> tuple[list[str], list[str]]:
        ranked = sorted(segments, key=score_fn, reverse=True)
        positive = [seg["segment_id"] for seg in ranked[:2]]
        risk = [seg["segment_id"] for seg in ranked[-2:]]
        return positive, risk

    novice_positive, novice_risk = rank_segments(
        lambda seg: seg["proxies"]["attention_proxy"] - seg["proxies"]["load_proxy"] * 0.35
    )
    builder_positive, builder_risk = rank_segments(
        lambda seg: seg["proxies"]["novelty_proxy"] + seg["proxies"]["attention_proxy"] * 0.2
    )
    pace_positive, pace_risk = rank_segments(
        lambda seg: 100 - abs(seg["proxies"]["load_proxy"] - 48) - abs(seg["proxies"]["attention_proxy"] - 60)
    )

    return [
        {
            "persona_id": "novice",
            "label": "초보 수강자",
            "overall_score": round(clamp(attention * 0.55 + (100 - load) * 0.45, 0, 100), 1),
            "top_positive_segment_ids": novice_positive,
            "top_risk_segment_ids": novice_risk,
            "reaction_summary": "기본 개념과 흐름이 분명한 구간에서 반응이 안정적으로 올라갑니다. 밀도가 급격히 올라가는 구간은 따라가기 어렵게 느껴질 수 있습니다.",
        },
        {
            "persona_id": "builder",
            "label": "실습형 수강자",
            "overall_score": round(clamp(attention * 0.35 + novelty * 0.65, 0, 100), 1),
            "top_positive_segment_ids": builder_positive,
            "top_risk_segment_ids": builder_risk,
            "reaction_summary": "새로운 예시나 패턴 전환이 보이는 구간에서 반응이 크게 올라갑니다. 반복 설명만 길어지면 체감 가치가 떨어질 수 있습니다.",
        },
        {
            "persona_id": "pace_sensitive",
            "label": "속도 민감형",
            "overall_score": round(clamp((100 - abs(load - 50)) * 0.6 + attention * 0.4, 0, 100), 1),
            "top_positive_segment_ids": pace_positive,
            "top_risk_segment_ids": pace_risk,
            "reaction_summary": "설명 속도와 정보량이 적절하게 맞는 구간에서 반응이 고르게 유지됩니다. 부하가 한 번 높아지면 회복이 느린 편입니다.",
        },
    ]


def build_simulation_for_date(date: str, metadata: dict[str, str]) -> None:
    transcript_path = TRANSCRIPT_DIR / f"{date}_kdt-backendj-21th.txt"
    lines = parse_transcript(transcript_path)
    windows = segment_lines(lines, SEGMENT_MINUTES)
    if not windows:
        raise RuntimeError(f"세그먼트를 만들 수 없습니다: {date}")

    raw_attention: list[float] = []
    raw_load: list[float] = []
    raw_novelty: list[float] = []
    feature_rows: list[dict] = []
    prev_signature = 0.0

    for idx, window in enumerate(windows):
        joined = " ".join(line.text for line in window)
        line_count = len(window)
        question_count = sum(1 for line in window if "?" in line.text or "죠" in line.text)
        participation_count = sum(1 for line in window if any(token in line.text for token in ("해보", "한번", "같이", "질문")))
        char_density = len(joined) / max(line_count, 1)
        tech_density = sum(joined.count(token) for token in TECH_WORDS) / max(line_count, 1)
        signature = question_count * 1.8 + participation_count * 1.5 + tech_density * 12 + char_density * 0.08

        raw_attention.append(line_count * 0.6 + question_count * 8.5 + participation_count * 9.5)
        raw_load.append(char_density * 0.7 + tech_density * 28 + max(line_count - 28, 0) * 0.85)
        raw_novelty.append(abs(signature - prev_signature) * 8.5 + tech_density * 20)
        prev_signature = signature

        feature_rows.append(
            {
                "window": window,
                "segment_index": idx,
                "excerpt": make_excerpt(window),
            }
        )

    att_min, att_max = min(raw_attention), max(raw_attention)
    load_min, load_max = min(raw_load), max(raw_load)
    nov_min, nov_max = min(raw_novelty), max(raw_novelty)

    segments: list[dict] = []
    color_segments: list[dict] = []
    transcript_segments: list[dict] = []

    for idx, row in enumerate(feature_rows):
        window = row["window"]
        segment_id = f"seg-{idx + 1:02d}"
        attention = normalize(raw_attention[idx], att_min, att_max)
        load = normalize(raw_load[idx], load_min, load_max)
        novelty = normalize(raw_novelty[idx], nov_min, nov_max)
        interpretation = build_interpretation(attention, load, novelty)
        labels = build_labels(attention, load, novelty)

        segments.append(
            {
                "segment_id": segment_id,
                "start_time": window[0].timestamp,
                "end_time": window[-1].timestamp,
                "proxies": {
                    "attention_proxy": attention,
                    "load_proxy": load,
                    "novelty_proxy": novelty,
                },
                "labels": labels,
                "interpretation": interpretation,
            }
        )

        transcript_segments.append(
            {
                "segment_id": segment_id,
                "start_time": window[0].timestamp,
                "end_time": window[-1].timestamp,
                "lines": [
                    {
                        "timestamp": line.timestamp,
                        "speaker": line.speaker,
                        "text": line.text,
                    }
                    for line in window
                ],
            }
        )

        color_segments.append(
            {
                "segment_id": segment_id,
                "start_time": window[0].timestamp,
                "end_time": window[-1].timestamp,
                "hemispheres": {
                    "left": build_color_series(attention, novelty, "left", idx),
                    "right": build_color_series(attention * 0.94 + novelty * 0.06, novelty, "right", idx),
                },
            }
        )

    personas = build_personas(segments)
    strongest = sorted(segments, key=lambda item: item["proxies"]["attention_proxy"], reverse=True)[:2]
    risky = sorted(
        segments,
        key=lambda item: item["proxies"]["load_proxy"] * 0.7 - item["proxies"]["attention_proxy"] * 0.3,
        reverse=True,
    )[:2]

    simulation = {
        "lecture_date": date,
        "source_model": "tribev2",
        "source_modality": "text_tts",
        "generated_at": "2026-03-30T12:00:00+09:00",
        "assets": {
            "mesh_glb": "/data/simulations/brain-mesh.glb",
            "segment_colors_json": f"/data/simulations/{date}-segment-colors.json",
        },
        "metadata": {
            "subject": metadata["subject"],
            "content": metadata["content"],
            "instructor": metadata["instructor"],
            "segment_minutes": SEGMENT_MINUTES,
        },
        "lecture_summary": {
            "strongest_segment_ids": [item["segment_id"] for item in strongest],
            "risk_segment_ids": [item["segment_id"] for item in risky],
            "summary_text": "강의 리듬이 안정적인 가운데 일부 구간에서 설명 밀도가 올라가며 반응 변동폭이 커집니다. 예시나 질문이 들어가는 순간에 집중 프록시가 비교적 선명하게 상승합니다.",
            "caution_text": "이 결과는 TRIBE v2 기반 신경 반응 프록시 시뮬레이션이며 실제 수강생 설문·생체신호를 대체하지 않습니다.",
        },
        "segments": segments,
        "personas": personas,
    }

    transcript_browser = {
        "lecture_date": date,
        "segments": transcript_segments,
    }

    color_payload = {
        "lecture_date": date,
        "mesh_version": "pilot-v1",
        "vertex_count": VERTEX_COUNT,
        "segments": color_segments,
    }

    save_json(simulation, OUTPUT_DIR / f"{date}.json")
    save_json(transcript_browser, OUTPUT_DIR / f"{date}-transcript.json")
    save_json(color_payload, OUTPUT_DIR / f"{date}-segment-colors.json")


def main() -> None:
    metadata = load_metadata()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    save_json(
        {
            "mesh_version": "pilot-v1",
            "vertex_count": VERTEX_COUNT,
            "segment_minutes": SEGMENT_MINUTES,
            "dates": list(PILOT_DATES),
        },
        OUTPUT_DIR / "manifest.json",
    )
    for date in PILOT_DATES:
        build_simulation_for_date(date, metadata[date])


if __name__ == "__main__":
    random.seed(42)
    main()
