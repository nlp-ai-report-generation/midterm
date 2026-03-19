"""프론트엔드 정적 데이터 생성 스크립트.

실제 트랜스크립트와 메타데이터로 EDA JSON을 생성하고,
실험 결과(JSON)를 프론트엔드가 읽는 evaluation JSON으로 내보낸다.

Usage:
    python scripts/export_frontend_data.py
    python scripts/export_frontend_data.py --experiment-id <id>
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
TRANSCRIPT_DIR = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 스크립트"
METADATA_CSV = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 메타데이터.csv"
OUTPUT_DIR = BASE / "frontend" / "public" / "data"
EDA_DIR = OUTPUT_DIR / "eda"
EVALUATIONS_DIR = OUTPUT_DIR / "evaluations"
EXPERIMENTS_DIR = BASE / "experiments"

LINE_PATTERN = re.compile(r"<(\d{2}:\d{2}:\d{2})>\s+(\S+):\s+(.*)")
FILLER_WORDS = ["그래서", "이제", "네", "자"]


def save_json(data: object, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  -> {path} ({path.stat().st_size:,} bytes)")


def timestamp_to_seconds(ts: str) -> int:
    h, m, s = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + int(s)


def compute_monotonic_seconds(lines: list[dict]) -> list[int]:
    if not lines:
        return []

    result = []
    offset = 0
    prev_raw = None
    for line in lines:
        raw = timestamp_to_seconds(line["timestamp"])
        if prev_raw is not None and raw < prev_raw - 1800:
            offset += 12 * 3600
        result.append(raw + offset)
        prev_raw = raw
    return result


def parse_transcript(path: Path) -> list[dict]:
    lines = []
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            match = LINE_PATTERN.match(raw.strip())
            if match:
                lines.append(
                    {
                        "timestamp": match.group(1),
                        "speaker": match.group(2),
                        "text": match.group(3),
                    }
                )
    return lines


def parse_metadata_csv() -> list[dict]:
    rows = []
    with open(METADATA_CSV, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows.extend(reader)
    return rows


def date_from_filename(filename: str) -> str:
    return filename.split("_")[0]


def generate_metadata(csv_rows: list[dict]) -> list[dict]:
    grouped: dict[str, dict] = {}
    for row in csv_rows:
        date = row["date"]
        if date not in grouped:
            grouped[date] = {
                "course_id": row["course_id"],
                "course_name": row["course_name"],
                "date": date,
                "subjects": [],
                "contents": [],
                "instructor": row["instructor"],
                "sub_instructors": [
                    s.strip()
                    for s in row["sub_instructor"].split(",")
                    if s.strip()
                ],
            }
        entry = grouped[date]
        subject = row["subject"].strip()
        if subject and subject not in entry["subjects"]:
            entry["subjects"].append(subject)
        content = row["content"].strip()
        if content and content not in entry["contents"]:
            entry["contents"].append(content)
    return sorted(grouped.values(), key=lambda item: item["date"])


def generate_transcript_stats(transcript_files: list[Path]) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        mono = compute_monotonic_seconds(lines)
        duration_hours = max((mono[-1] - mono[0]) / 3600, 0.01)
        results.append(
            {
                "date": date_from_filename(path.name),
                "file": path.name,
                "line_count": len(lines),
                "speaker_count": len({line["speaker"] for line in lines}),
                "start_time": lines[0]["timestamp"],
                "estimated_duration_hours": round(duration_hours, 2),
                "utterance_rate": round(len(lines) / duration_hours, 1),
            }
        )
    return sorted(results, key=lambda item: item["date"])


def generate_speaker_distribution(transcript_files: list[Path]) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        counts: dict[str, int] = {}
        for line in lines:
            counts[line["speaker"]] = counts.get(line["speaker"], 0) + 1
        speakers = []
        for idx, (speaker_id, count) in enumerate(
            sorted(counts.items(), key=lambda item: -item[1])
        ):
            role = "주강사" if idx == 0 else f"보조강사{idx}"
            speakers.append(
                {
                    "speaker_id": speaker_id,
                    "line_count": count,
                    "role": role,
                }
            )
        results.append(
            {
                "date": date_from_filename(path.name),
                "file": path.name,
                "speakers": speakers,
            }
        )
    return sorted(results, key=lambda item: item["date"])


def generate_filler_words(transcript_files: list[Path]) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        full_text = " ".join(line["text"] for line in lines)
        counts = {word: full_text.count(word) for word in FILLER_WORDS}
        results.append(
            {
                "date": date_from_filename(path.name),
                "file": path.name,
                "filler_counts": counts,
                "total_fillers": sum(counts.values()),
            }
        )
    return sorted(results, key=lambda item: item["date"])


def generate_interaction_metrics(transcript_files: list[Path]) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        question_count = sum(1 for line in lines if "?" in line["text"])
        understanding_check_count = sum(
            1 for line in lines if any(keyword in line["text"] for keyword in ("되셨", "됐을", "됐나"))
        )
        participation_prompts = sum(
            1 for line in lines if any(keyword in line["text"] for keyword in ("해보", "한번", "같이"))
        )
        results.append(
            {
                "date": date_from_filename(path.name),
                "file": path.name,
                "question_count": question_count,
                "understanding_check_count": understanding_check_count,
                "participation_prompts": participation_prompts,
            }
        )
    return sorted(results, key=lambda item: item["date"])


def generate_curriculum_flow(csv_rows: list[dict]) -> list[dict]:
    grouped: dict[str, dict] = {}
    for row in csv_rows:
        date = row["date"]
        grouped.setdefault(date, {"date": date, "subjects": [], "contents": []})
        entry = grouped[date]
        subject = row["subject"].strip()
        if subject and subject not in entry["subjects"]:
            entry["subjects"].append(subject)
        content = row["content"].strip()
        if content and content not in entry["contents"]:
            entry["contents"].append(content)
    return [
        {
            "date": entry["date"],
            "subject": ", ".join(entry["subjects"]),
            "contents": entry["contents"],
        }
        for entry in sorted(grouped.values(), key=lambda item: item["date"])
    ]


def resolve_experiment_dir(experiment_id: str | None) -> Path | None:
    if experiment_id:
        candidate = EXPERIMENTS_DIR / experiment_id
        return candidate if candidate.exists() else None

    candidates = sorted(
        [path for path in EXPERIMENTS_DIR.iterdir() if path.is_dir()],
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def export_evaluations(experiment_dir: Path) -> None:
    results_dir = experiment_dir / "results"
    if not results_dir.exists():
        raise FileNotFoundError(f"실험 결과 디렉토리가 없습니다: {results_dir}")

    latest_results: dict[str, dict] = {}
    for result_file in sorted(results_dir.glob("*.json")):
        with open(result_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        lecture_date = data["lecture_date"]
        pass_num = data.get("pass_num", 0)
        current = latest_results.get(lecture_date)
        if current is None or pass_num >= current.get("pass_num", -1):
            latest_results[lecture_date] = data

    if not latest_results:
        raise ValueError(f"실험 결과가 비어 있습니다: {results_dir}")

    EVALUATIONS_DIR.mkdir(parents=True, exist_ok=True)
    for stale_file in EVALUATIONS_DIR.glob("*.json"):
        stale_file.unlink()

    print(f"\n[{experiment_dir.name}] evaluation JSON 내보내기...")
    for lecture_date, payload in sorted(latest_results.items()):
        export_payload = {k: v for k, v in payload.items() if k != "pass_num"}
        save_json(export_payload, EVALUATIONS_DIR / f"{lecture_date}.json")


def main() -> None:
    parser = argparse.ArgumentParser(description="프론트엔드 정적 데이터 생성")
    parser.add_argument(
        "--experiment-id",
        default=None,
        help="evaluation JSON으로 내보낼 실험 ID (미지정 시 가장 최근 실험)",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("프론트엔드 데이터 생성")
    print("=" * 60)

    transcript_files = sorted(TRANSCRIPT_DIR.glob("*.txt"))
    csv_rows = parse_metadata_csv()

    print(f"\n트랜스크립트 파일 {len(transcript_files)}개 발견")
    print(f"메타데이터 CSV 행 {len(csv_rows)}개 읽음")

    print("\n[1/7] metadata.json 생성 중...")
    save_json(generate_metadata(csv_rows), OUTPUT_DIR / "metadata.json")

    print("\n[2/7] eda/transcript_stats.json 생성 중...")
    save_json(generate_transcript_stats(transcript_files), EDA_DIR / "transcript_stats.json")

    print("\n[3/7] eda/speaker_distribution.json 생성 중...")
    save_json(generate_speaker_distribution(transcript_files), EDA_DIR / "speaker_distribution.json")

    print("\n[4/7] eda/filler_words.json 생성 중...")
    save_json(generate_filler_words(transcript_files), EDA_DIR / "filler_words.json")

    print("\n[5/7] eda/interaction_metrics.json 생성 중...")
    save_json(generate_interaction_metrics(transcript_files), EDA_DIR / "interaction_metrics.json")

    print("\n[6/7] eda/curriculum_flow.json 생성 중...")
    save_json(generate_curriculum_flow(csv_rows), EDA_DIR / "curriculum_flow.json")

    experiment_dir = resolve_experiment_dir(args.experiment_id)
    if experiment_dir is None:
        print("\n[7/7] evaluation JSON은 건너뜁니다. 사용 가능한 실험 결과가 없습니다.")
    else:
        print(f"\n[7/7] evaluation JSON 생성 중... (source={experiment_dir.name})")
        export_evaluations(experiment_dir)

    print("\n" + "=" * 60)
    print("완료")
    print("=" * 60)


if __name__ == "__main__":
    main()
