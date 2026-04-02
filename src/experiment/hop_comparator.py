"""Hop Size 실험 비교 분석 모듈.

서로 다른 hop 설정으로 수행된 실험들의 청크별·항목별 점수를 비교한다.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

from src.experiment.comparator import load_experiment_results

logger = logging.getLogger(__name__)


def _time_to_seconds(time_str: str) -> int:
    """HH:MM:SS → 초."""
    parts = time_str.split(":")
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])


def compute_time_overlap(
    start1: str, end1: str, start2: str, end2: str,
) -> float:
    """두 시간 구간의 겹침 비율 (작은 구간 기준).

    Returns:
        0.0~1.0 사이의 겹침 비율
    """
    s1, e1 = _time_to_seconds(start1), _time_to_seconds(end1)
    s2, e2 = _time_to_seconds(start2), _time_to_seconds(end2)

    overlap_start = max(s1, s2)
    overlap_end = min(e1, e2)
    overlap = max(0, overlap_end - overlap_start)

    smaller = min(e1 - s1, e2 - s2)
    if smaller <= 0:
        return 0.0
    return overlap / smaller


def _align_chunks(
    anchor_chunks: list[dict],
    other_chunks: list[dict],
    min_overlap: float = 0.5,
) -> list[tuple[dict, list[dict]]]:
    """앵커 청크에 대해 겹치는 다른 실험의 청크들을 매핑.

    Args:
        anchor_chunks: 기준 실험의 청크 목록 (가장 적은 청크)
        other_chunks: 비교 실험의 청크 목록
        min_overlap: 최소 겹침 비율

    Returns:
        (앵커 청크, 매핑된 청크 리스트)의 리스트
    """
    aligned = []
    for anchor in anchor_chunks:
        matches = []
        for other in other_chunks:
            overlap = compute_time_overlap(
                anchor["start_time"], anchor["end_time"],
                other["start_time"], other["end_time"],
            )
            if overlap >= min_overlap:
                matches.append(other)
        aligned.append((anchor, matches))
    return aligned


def _extract_chunk_item_scores(
    chunk_details: dict[str, list[dict]],
) -> dict[str, dict[str, list[dict]]]:
    """chunk_scores_detail에서 item_id별 청크별 점수를 추출.

    Returns:
        {item_id: {chunk_id: [score_dict, ...]}}
    """
    item_chunks: dict[str, dict[str, list[dict]]] = {}
    for _category, chunks in chunk_details.items():
        for chunk in chunks:
            chunk_id = chunk["chunk_id"]
            for score in chunk.get("scores", []):
                item_id = score.get("item_id", "")
                item_chunks.setdefault(item_id, {}).setdefault(chunk_id, []).append(score)
    return item_chunks


def _build_per_item_comparison(
    experiments: list[dict],
) -> dict[str, list[dict]]:
    """날짜별 항목별 비교 데이터 구성.

    Returns:
        {lecture_date: [
            {item_id, item_name, category, weight, focus,
             scores: [{exp_name, merged_score, chunk_scores: [...]}, ...]},
            ...
        ]}
    """
    comparison: dict[str, list[dict]] = {}

    # 모든 실험에서 공통 날짜 추출
    all_dates: set[str] = set()
    for exp in experiments:
        for result in exp["results"]:
            all_dates.add(result["lecture_date"])

    for date in sorted(all_dates):
        items_map: dict[str, dict] = {}

        for exp in experiments:
            exp_name = exp["config"].get("name", exp["config"].get("experiment_id", ""))
            hop = exp["config"].get("chunk_hop_minutes", 25)

            # 해당 날짜의 결과 찾기
            date_result = None
            for result in exp["results"]:
                if result["lecture_date"] == date:
                    date_result = result
                    break
            if not date_result:
                continue

            # 병합된 최종 점수
            for category, items in date_result.get("category_scores", {}).items():
                for item in items:
                    item_id = item.get("item_id", "")
                    if item_id not in items_map:
                        items_map[item_id] = {
                            "item_id": item_id,
                            "item_name": item.get("item_name", ""),
                            "category": category,
                            "weight": item.get("weight", "MEDIUM"),
                            "scores": [],
                        }

                    # 청크별 상세 점수
                    chunk_detail = date_result.get("chunk_scores_detail", {})
                    chunk_scores_for_item = []
                    for _cat, chunks in chunk_detail.items():
                        for chunk in chunks:
                            for s in chunk.get("scores", []):
                                if s.get("item_id") == item_id:
                                    chunk_scores_for_item.append({
                                        "chunk_id": chunk["chunk_id"],
                                        "start_time": chunk["start_time"],
                                        "end_time": chunk["end_time"],
                                        "score": s.get("score", 0),
                                    })

                    items_map[item_id]["scores"].append({
                        "exp_name": exp_name,
                        "hop": hop,
                        "merged_score": item.get("score", 0),
                        "chunk_scores": chunk_scores_for_item,
                    })

        comparison[date] = sorted(items_map.values(), key=lambda x: x["item_id"])

    return comparison


def _classify_sensitivity(items: list[dict]) -> dict[str, list[dict]]:
    """항목별 hop 민감도 분류.

    Returns:
        {"high": [...], "medium": [...], "low": [...]}
    """
    classified: dict[str, list[dict]] = {"high": [], "medium": [], "low": []}

    for item in items:
        scores = [s["merged_score"] for s in item["scores"]]
        if not scores:
            continue
        delta = max(scores) - min(scores)

        if delta >= 2:
            classified["high"].append(item)
        elif delta == 1:
            classified["medium"].append(item)
        else:
            classified["low"].append(item)

    return classified


def _generate_markdown_report(
    experiments: list[dict],
    per_item: dict[str, list[dict]],
) -> str:
    """비교 리포트 마크다운 생성."""
    lines: list[str] = []
    lines.append("# Hop Size 실험 비교 리포트\n")
    lines.append(f"생성일: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # 실험 설정 요약
    lines.append("## 실험 설정\n")
    lines.append("| 설정 | " + " | ".join(
        exp["config"].get("name", exp["config"].get("experiment_id", ""))
        for exp in experiments
    ) + " |")
    lines.append("| --- | " + " | ".join("---" for _ in experiments) + " |")

    rows = [
        ("Model", lambda e: e["config"].get("model", "")),
        ("Temperature", lambda e: str(e["config"].get("temperature", ""))),
        ("Window", lambda e: f"{e['config'].get('chunk_duration_minutes', 30)}min"),
        ("Hop", lambda e: f"{e['config'].get('chunk_hop_minutes', 25)}min"),
        ("Overlap", lambda e: f"{e['config'].get('chunk_duration_minutes', 30) - e['config'].get('chunk_hop_minutes', 25)}min"),
        ("Calibrator", lambda e: str(e["config"].get("use_calibrator", True))),
    ]
    for label, getter in rows:
        lines.append(f"| {label} | " + " | ".join(getter(e) for e in experiments) + " |")
    lines.append("")

    # 날짜별 항목 비교
    for date, items in per_item.items():
        lines.append(f"## 항목별 점수 비교 ({date})\n")

        # 헤더
        exp_names = []
        for exp in experiments:
            name = exp["config"].get("name", exp["config"].get("experiment_id", ""))
            exp_names.append(name)

        lines.append("| 항목 | 카테고리 | 가중치 | " + " | ".join(exp_names) + " | delta |")
        lines.append("| --- | --- | --- | " + " | ".join("---" for _ in exp_names) + " | --- |")

        for item in items:
            scores_by_exp = {s["exp_name"]: s["merged_score"] for s in item["scores"]}
            score_values = [scores_by_exp.get(name, "-") for name in exp_names]
            numeric_scores = [s["merged_score"] for s in item["scores"]]
            delta = max(numeric_scores) - min(numeric_scores) if numeric_scores else 0

            lines.append(
                f"| {item['item_id']} {item['item_name']} | {item['category']} | {item['weight']} | "
                + " | ".join(str(v) for v in score_values)
                + f" | {delta} |"
            )
        lines.append("")

        # 민감도 분류
        sensitivity = _classify_sensitivity(items)

        lines.append(f"### Hop 민감도 분류 ({date})\n")

        if sensitivity["high"]:
            lines.append("**높음 (delta >= 2):**")
            for item in sensitivity["high"]:
                scores_str = ", ".join(f"{s['exp_name']}={s['merged_score']}" for s in item["scores"])
                lines.append(f"- {item['item_id']} {item['item_name']}: {scores_str}")
            lines.append("")

        if sensitivity["medium"]:
            lines.append("**보통 (delta = 1):**")
            for item in sensitivity["medium"]:
                scores_str = ", ".join(f"{s['exp_name']}={s['merged_score']}" for s in item["scores"])
                lines.append(f"- {item['item_id']} {item['item_name']}: {scores_str}")
            lines.append("")

        if sensitivity["low"]:
            lines.append("**낮음 (delta = 0):**")
            for item in sensitivity["low"]:
                lines.append(f"- {item['item_id']} {item['item_name']}: 모든 실험에서 동일 ({item['scores'][0]['merged_score'] if item['scores'] else '-'})")
            lines.append("")

        # 청크별 상세 비교 (항목 중 민감도 높은 것만)
        if sensitivity["high"] or sensitivity["medium"]:
            lines.append(f"### 청크별 점수 상세 ({date})\n")
            target_items = sensitivity["high"] + sensitivity["medium"]

            for item in target_items:
                lines.append(f"#### {item['item_id']} {item['item_name']}\n")
                for exp_score in item["scores"]:
                    lines.append(f"**{exp_score['exp_name']}** (병합 점수: {exp_score['merged_score']})")
                    if exp_score["chunk_scores"]:
                        lines.append("| 청크 | 구간 | 점수 |")
                        lines.append("| --- | --- | --- |")
                        for cs in exp_score["chunk_scores"]:
                            lines.append(f"| {cs['chunk_id']} | {cs['start_time']}~{cs['end_time']} | {cs['score']} |")
                    else:
                        lines.append("  (청크별 상세 없음)")
                    lines.append("")

    # 종합 요약
    lines.append("## 종합 요약\n")

    all_items_flat = [item for items in per_item.values() for item in items]
    if all_items_flat:
        all_sensitivity = _classify_sensitivity(all_items_flat)
        total = len(all_items_flat)
        lines.append(f"- 전체 비교 항목 수: {total}")
        lines.append(f"- 높은 민감도 (delta >= 2): {len(all_sensitivity['high'])}개")
        lines.append(f"- 보통 민감도 (delta = 1): {len(all_sensitivity['medium'])}개")
        lines.append(f"- 낮은 민감도 (delta = 0): {len(all_sensitivity['low'])}개")
        if total > 0:
            pct_stable = len(all_sensitivity["low"]) / total * 100
            lines.append(f"- hop 변경에 안정적인 항목 비율: {pct_stable:.1f}%")
    lines.append("")

    return "\n".join(lines)


def compare_hop_experiments(
    experiment_dirs: list[Path],
    output_dir: Path | None = None,
) -> Path:
    """hop 실험들을 비교하여 마크다운 리포트를 생성.

    Args:
        experiment_dirs: 비교할 실험 디렉토리 리스트 (2~3개)
        output_dir: 리포트 저장 디렉토리 (None이면 첫 실험의 상위 디렉토리)

    Returns:
        생성된 리포트 파일 경로
    """
    experiments = []
    for exp_dir in experiment_dirs:
        data = load_experiment_results(exp_dir)
        experiments.append(data)

    # 항목별 비교 데이터 구성
    per_item = _build_per_item_comparison(experiments)

    # 마크다운 리포트 생성
    report = _generate_markdown_report(experiments, per_item)

    # 저장
    output_dir = output_dir or experiment_dirs[0].parent
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = output_dir / f"hop_comparison_{timestamp}.md"

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    # JSON 데이터도 저장
    json_path = output_dir / f"hop_comparison_{timestamp}.json"
    json_data = {
        "experiments": [
            {
                "experiment_id": e["config"].get("experiment_id", ""),
                "name": e["config"].get("name", ""),
                "hop": e["config"].get("chunk_hop_minutes", 25),
                "window": e["config"].get("chunk_duration_minutes", 30),
            }
            for e in experiments
        ],
        "per_item_comparison": per_item,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)

    logger.info("Hop comparison report saved to %s", report_path)
    return report_path
