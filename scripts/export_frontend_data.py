"""
export_frontend_data.py
========================
15개 강의 트랜스크립트와 메타데이터 CSV로부터 실제 EDA 통계를 생성하여
frontend/public/data/ 아래에 JSON 파일로 내보내는 스크립트.

사용법:
    cd /Users/youngjinson/멋사-인턴 && python scripts/export_frontend_data.py
"""

import csv
import json
import re
from pathlib import Path

# ── 경로 설정 ──────────────────────────────────────────────
BASE = Path(__file__).resolve().parent.parent
TRANSCRIPT_DIR = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 스크립트"
METADATA_CSV = BASE / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 메타데이터.csv"
OUTPUT_DIR = BASE / "frontend" / "public" / "data"
EDA_DIR = OUTPUT_DIR / "eda"

LINE_PATTERN = re.compile(r"<(\d{2}:\d{2}:\d{2})>\s+(\S+):\s+(.*)")

FILLER_WORDS = ["그래서", "이제", "네", "자"]


def timestamp_to_seconds(ts: str) -> int:
    h, m, s = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + int(s)


def compute_monotonic_seconds(lines: list[dict]) -> list[int]:
    """Convert 12-hour-style timestamps to monotonic seconds.

    The transcripts use 12-hour format without AM/PM markers.
    When the timestamp decreases (e.g. 12:xx -> 01:xx), we add 12 hours.
    """
    if not lines:
        return []
    result = []
    offset = 0
    prev_raw = None
    for l in lines:
        raw = timestamp_to_seconds(l["timestamp"])
        if prev_raw is not None and raw < prev_raw - 1800:
            # Wrapped around 12 hours (with 30-min tolerance for minor reorders)
            offset += 12 * 3600
        result.append(raw + offset)
        prev_raw = raw
    return result


def parse_transcript(path: Path) -> list[dict]:
    """Parse a transcript file and return list of {timestamp, speaker, text}."""
    lines = []
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            m = LINE_PATTERN.match(raw.strip())
            if m:
                lines.append({
                    "timestamp": m.group(1),
                    "speaker": m.group(2),
                    "text": m.group(3),
                })
    return lines


def parse_metadata_csv() -> list[dict]:
    """Read the metadata CSV and return rows as dicts."""
    rows = []
    with open(METADATA_CSV, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def date_from_filename(filename: str) -> str:
    return filename.split("_")[0]


def course_id_from_filename(filename: str) -> str:
    return filename.replace(".txt", "").split("_", 1)[1]


# ── 1. metadata.json ──────────────────────────────────────
def generate_metadata(csv_rows: list[dict]) -> list[dict]:
    """Merge AM/PM sessions per date into single entries."""
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
        subj = row["subject"].strip()
        if subj and subj not in entry["subjects"]:
            entry["subjects"].append(subj)
        content = row["content"].strip()
        if content and content not in entry["contents"]:
            entry["contents"].append(content)
    return sorted(grouped.values(), key=lambda x: x["date"])


# ── 2. transcript_stats.json ──────────────────────────────
def generate_transcript_stats(
    transcript_files: list[Path],
) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        date = date_from_filename(path.name)
        speakers = {l["speaker"] for l in lines}
        mono = compute_monotonic_seconds(lines)
        first_sec = mono[0]
        last_sec = mono[-1]
        duration_hours = max((last_sec - first_sec) / 3600, 0.01)
        results.append({
            "date": date,
            "file": path.name,
            "line_count": len(lines),
            "speaker_count": len(speakers),
            "start_time": lines[0]["timestamp"],
            "estimated_duration_hours": round(duration_hours, 2),
            "utterance_rate": round(len(lines) / duration_hours, 1),
        })
    return sorted(results, key=lambda x: x["date"])


# ── 3. speaker_distribution.json ──────────────────────────
def generate_speaker_distribution(
    transcript_files: list[Path],
) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        date = date_from_filename(path.name)
        counts: dict[str, int] = {}
        for l in lines:
            counts[l["speaker"]] = counts.get(l["speaker"], 0) + 1
        # Sort by count descending
        sorted_speakers = sorted(counts.items(), key=lambda x: -x[1])
        speakers = []
        for idx, (speaker_id, count) in enumerate(sorted_speakers):
            if idx == 0:
                role = "주강사"
            else:
                role = f"보조강사{idx}"
            speakers.append({
                "speaker_id": speaker_id,
                "line_count": count,
                "role": role,
            })
        results.append({"date": date, "file": path.name, "speakers": speakers})
    return sorted(results, key=lambda x: x["date"])


# ── 4. filler_words.json ──────────────────────────────────
def generate_filler_words(
    transcript_files: list[Path],
) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        date = date_from_filename(path.name)
        full_text = " ".join(l["text"] for l in lines)
        word_counts = {}
        for word in FILLER_WORDS:
            word_counts[word] = full_text.count(word)
        results.append({
            "date": date,
            "file": path.name,
            "filler_counts": word_counts,
            "total_fillers": sum(word_counts.values()),
        })
    return sorted(results, key=lambda x: x["date"])


# ── 5. interaction_metrics.json ───────────────────────────
def generate_interaction_metrics(
    transcript_files: list[Path],
) -> list[dict]:
    results = []
    for path in transcript_files:
        lines = parse_transcript(path)
        if not lines:
            continue
        date = date_from_filename(path.name)
        question_count = sum(1 for l in lines if "?" in l["text"])
        understanding_check_count = sum(
            1 for l in lines
            if any(kw in l["text"] for kw in ("되셨", "됐을", "됐나"))
        )
        participation_prompts = sum(
            1 for l in lines
            if any(kw in l["text"] for kw in ("해보", "한번", "같이"))
        )
        results.append({
            "date": date,
            "file": path.name,
            "question_count": question_count,
            "understanding_check_count": understanding_check_count,
            "participation_prompts": participation_prompts,
        })
    return sorted(results, key=lambda x: x["date"])


# ── 6. curriculum_flow.json ───────────────────────────────
def generate_curriculum_flow(csv_rows: list[dict]) -> list[dict]:
    grouped: dict[str, dict] = {}
    for row in csv_rows:
        date = row["date"]
        if date not in grouped:
            grouped[date] = {"date": date, "subjects": [], "contents": []}
        entry = grouped[date]
        subj = row["subject"].strip()
        if subj and subj not in entry["subjects"]:
            entry["subjects"].append(subj)
        content = row["content"].strip()
        if content and content not in entry["contents"]:
            entry["contents"].append(content)
    # Flatten subjects to single string if only one
    results = []
    for entry in sorted(grouped.values(), key=lambda x: x["date"]):
        results.append({
            "date": entry["date"],
            "subject": ", ".join(entry["subjects"]),
            "contents": entry["contents"],
        })
    return results


# ── JSON 저장 유틸 ────────────────────────────────────────
def save_json(data, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  -> {path}  ({path.stat().st_size:,} bytes)")


# ── main ──────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("강의 EDA 데이터 생성 스크립트")
    print("=" * 60)

    # Gather transcript files
    transcript_files = sorted(TRANSCRIPT_DIR.glob("*.txt"))
    print(f"\n트랜스크립트 파일 {len(transcript_files)}개 발견")

    # Read metadata CSV
    csv_rows = parse_metadata_csv()
    print(f"메타데이터 CSV 행 {len(csv_rows)}개 읽음")

    # 1. metadata.json
    print("\n[1/6] metadata.json 생성 중...")
    metadata = generate_metadata(csv_rows)
    save_json(metadata, OUTPUT_DIR / "metadata.json")

    # 2. transcript_stats.json
    print("\n[2/6] eda/transcript_stats.json 생성 중...")
    for f in transcript_files:
        print(f"  처리: {f.name}")
    stats = generate_transcript_stats(transcript_files)
    save_json(stats, EDA_DIR / "transcript_stats.json")

    # 3. speaker_distribution.json
    print("\n[3/6] eda/speaker_distribution.json 생성 중...")
    speaker_dist = generate_speaker_distribution(transcript_files)
    save_json(speaker_dist, EDA_DIR / "speaker_distribution.json")

    # 4. filler_words.json
    print("\n[4/6] eda/filler_words.json 생성 중...")
    fillers = generate_filler_words(transcript_files)
    save_json(fillers, EDA_DIR / "filler_words.json")

    # 5. interaction_metrics.json
    print("\n[5/6] eda/interaction_metrics.json 생성 중...")
    interactions = generate_interaction_metrics(transcript_files)
    save_json(interactions, EDA_DIR / "interaction_metrics.json")

    # 6. curriculum_flow.json
    print("\n[6/6] eda/curriculum_flow.json 생성 중...")
    curriculum = generate_curriculum_flow(csv_rows)
    save_json(curriculum, EDA_DIR / "curriculum_flow.json")

    print("\n" + "=" * 60)
    print("완료! 모든 JSON 파일이 생성되었습니다.")
    print("=" * 60)


if __name__ == "__main__":
    main()
