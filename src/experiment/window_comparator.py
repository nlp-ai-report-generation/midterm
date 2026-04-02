"""Window Size 실험 비교 분석 모듈.

hop 비율(50%)을 고정한 상태에서 window 길이(30/60/120분) 변화에 따른
강의별/카테고리별/항목별 점수 변화를 비교한다.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

from src.experiment.comparator import load_experiment_results

logger = logging.getLogger(__name__)


def _mean(values: list[float]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def _sort_experiments_by_window(experiments: list[dict]) -> list[dict]:
    return sorted(
        experiments,
        key=lambda e: int(e.get("config", {}).get("chunk_duration_minutes", 0)),
    )


def _collect_used_data(experiments: list[dict]) -> dict:
    files: set[str] = set()
    dates: set[str] = set()

    for exp in experiments:
        for result in exp.get("results", []):
            transcript_path = result.get("transcript_path", "")
            if transcript_path:
                files.add(Path(transcript_path).name)
            date = result.get("lecture_date", "")
            if date:
                dates.add(date)

    return {
        "file_names": sorted(files),
        "lecture_dates": sorted(dates),
        "lecture_count": len(dates),
    }


def _group_results_by_date(results: list[dict]) -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    for result in results:
        date = result.get("lecture_date", "")
        if not date:
            continue
        grouped.setdefault(date, []).append(result)
    return grouped


def _extract_overall_by_date(experiment: dict) -> dict[str, float]:
    grouped = _group_results_by_date(experiment.get("results", []))
    per_date: dict[str, float] = {}
    for date, rows in grouped.items():
        values = [float(r.get("weighted_average", 0.0)) for r in rows]
        per_date[date] = _mean(values)
    return per_date


def _extract_category_by_date(experiment: dict) -> dict[str, dict[str, float]]:
    grouped = _group_results_by_date(experiment.get("results", []))
    per_date: dict[str, dict[str, float]] = {}

    for date, rows in grouped.items():
        bucket: dict[str, list[float]] = {}
        for row in rows:
            for category, value in row.get("category_averages", {}).items():
                bucket.setdefault(category, []).append(float(value))
        per_date[date] = {cat: _mean(vals) for cat, vals in bucket.items()}

    return per_date


def _extract_items_by_date(experiment: dict) -> dict[str, dict[str, dict]]:
    grouped = _group_results_by_date(experiment.get("results", []))
    per_date: dict[str, dict[str, dict]] = {}

    for date, rows in grouped.items():
        item_bucket: dict[str, dict] = {}
        for row in rows:
            for category, items in row.get("category_scores", {}).items():
                for item in items:
                    item_id = item.get("item_id", "")
                    if not item_id:
                        continue
                    entry = item_bucket.setdefault(
                        item_id,
                        {
                            "item_id": item_id,
                            "item_name": item.get("item_name", ""),
                            "category": category,
                            "weight": item.get("weight", "MEDIUM"),
                            "scores": [],
                        },
                    )
                    entry["scores"].append(float(item.get("score", 0.0)))

        per_date[date] = {
            item_id: {
                "item_id": payload["item_id"],
                "item_name": payload["item_name"],
                "category": payload["category"],
                "weight": payload["weight"],
                "score": _mean(payload["scores"]),
            }
            for item_id, payload in item_bucket.items()
        }

    return per_date


def _build_overall_comparison(experiments: list[dict]) -> list[dict]:
    all_dates: set[str] = set()
    per_exp: list[tuple[dict, dict[str, float]]] = []
    for exp in experiments:
        scores = _extract_overall_by_date(exp)
        all_dates.update(scores.keys())
        per_exp.append((exp, scores))

    rows: list[dict] = []
    for date in sorted(all_dates):
        entries: list[dict] = []
        numeric_scores: list[float] = []

        for exp, scores in per_exp:
            config = exp.get("config", {})
            window = int(config.get("chunk_duration_minutes", 0))
            score = scores.get(date)
            if score is not None:
                numeric_scores.append(score)
            entries.append(
                {
                    "experiment_id": config.get("experiment_id", ""),
                    "name": config.get("name", ""),
                    "window_minutes": window,
                    "hop_minutes": int(config.get("chunk_hop_minutes", 0)),
                    "average_score": round(score, 3) if score is not None else None,
                }
            )

        delta = max(numeric_scores) - min(numeric_scores) if numeric_scores else 0.0
        rows.append(
            {
                "lecture_date": date,
                "scores": sorted(entries, key=lambda x: x["window_minutes"]),
                "delta": round(delta, 3),
            }
        )

    return rows


def _build_category_comparison(experiments: list[dict]) -> dict[str, list[dict]]:
    all_dates: set[str] = set()
    per_exp: list[tuple[dict, dict[str, dict[str, float]]]] = []
    for exp in experiments:
        cat_scores = _extract_category_by_date(exp)
        all_dates.update(cat_scores.keys())
        per_exp.append((exp, cat_scores))

    comparison: dict[str, list[dict]] = {}
    for date in sorted(all_dates):
        categories: set[str] = set()
        for _exp, data in per_exp:
            categories.update(data.get(date, {}).keys())

        rows: list[dict] = []
        for category in sorted(categories):
            entries: list[dict] = []
            numeric_scores: list[float] = []

            for exp, data in per_exp:
                config = exp.get("config", {})
                window = int(config.get("chunk_duration_minutes", 0))
                score = data.get(date, {}).get(category)
                if score is not None:
                    numeric_scores.append(score)
                entries.append(
                    {
                        "experiment_id": config.get("experiment_id", ""),
                        "name": config.get("name", ""),
                        "window_minutes": window,
                        "score": round(score, 3) if score is not None else None,
                    }
                )

            delta = max(numeric_scores) - min(numeric_scores) if numeric_scores else 0.0
            rows.append(
                {
                    "category": category,
                    "scores": sorted(entries, key=lambda x: x["window_minutes"]),
                    "delta": round(delta, 3),
                }
            )

        comparison[date] = sorted(rows, key=lambda x: x["category"])

    return comparison


def _build_item_sensitivity(experiments: list[dict]) -> dict[str, list[dict]]:
    all_dates: set[str] = set()
    per_exp: list[tuple[dict, dict[str, dict[str, dict]]]] = []
    for exp in experiments:
        item_scores = _extract_items_by_date(exp)
        all_dates.update(item_scores.keys())
        per_exp.append((exp, item_scores))

    comparison: dict[str, list[dict]] = {}
    for date in sorted(all_dates):
        item_ids: set[str] = set()
        for _exp, data in per_exp:
            item_ids.update(data.get(date, {}).keys())

        rows: list[dict] = []
        for item_id in sorted(item_ids):
            item_name = ""
            category = ""
            weight = "MEDIUM"
            entries: list[dict] = []
            numeric_scores: list[float] = []

            for exp, data in per_exp:
                config = exp.get("config", {})
                payload = data.get(date, {}).get(item_id)
                score = payload.get("score") if payload else None
                if payload:
                    item_name = payload.get("item_name", item_name)
                    category = payload.get("category", category)
                    weight = payload.get("weight", weight)
                if score is not None:
                    numeric_scores.append(float(score))

                entries.append(
                    {
                        "experiment_id": config.get("experiment_id", ""),
                        "name": config.get("name", ""),
                        "window_minutes": int(config.get("chunk_duration_minutes", 0)),
                        "score": round(float(score), 3) if score is not None else None,
                    }
                )

            delta = max(numeric_scores) - min(numeric_scores) if numeric_scores else 0.0
            if delta >= 2:
                band = "high"
            elif delta >= 1:
                band = "medium"
            else:
                band = "low"

            rows.append(
                {
                    "item_id": item_id,
                    "item_name": item_name,
                    "category": category,
                    "weight": weight,
                    "scores": sorted(entries, key=lambda x: x["window_minutes"]),
                    "delta": round(delta, 3),
                    "sensitivity": band,
                }
            )

        comparison[date] = sorted(rows, key=lambda x: (-x["delta"], x["item_id"]))

    return comparison


def _build_experiment_settings(experiments: list[dict]) -> list[dict]:
    settings: list[dict] = []
    for exp in experiments:
        config = exp.get("config", {})
        window = int(config.get("chunk_duration_minutes", 0))
        hop = int(config.get("chunk_hop_minutes", 0))
        ratio = round((hop / window), 3) if window > 0 else 0.0
        settings.append(
            {
                "experiment_id": config.get("experiment_id", ""),
                "name": config.get("name", ""),
                "model": config.get("model", ""),
                "temperature": config.get("temperature", 0),
                "chunk_duration_minutes": window,
                "chunk_hop_minutes": hop,
                "hop_ratio": ratio,
                "use_calibrator": config.get("use_calibrator", True),
                "num_passes": config.get("num_passes", 1),
            }
        )
    return sorted(settings, key=lambda x: x["chunk_duration_minutes"])


def _build_insights(
    overall_rows: list[dict],
    category_rows: dict[str, list[dict]],
    item_rows: dict[str, list[dict]],
) -> dict:
    overall_deltas = [float(row.get("delta", 0)) for row in overall_rows]
    avg_overall_delta = _mean(overall_deltas)

    category_delta_bucket: dict[str, list[float]] = {}
    for rows in category_rows.values():
        for row in rows:
            category_delta_bucket.setdefault(row["category"], []).append(float(row["delta"]))
    category_delta_avg = {
        cat: _mean(vals) for cat, vals in category_delta_bucket.items()
    }
    top_category_deltas = sorted(
        category_delta_avg.items(),
        key=lambda x: x[1],
        reverse=True,
    )[:3]

    sensitivity_count = {"high": 0, "medium": 0, "low": 0}
    for rows in item_rows.values():
        for row in rows:
            band = row.get("sensitivity", "low")
            if band in sensitivity_count:
                sensitivity_count[band] += 1

    return {
        "avg_overall_delta": round(avg_overall_delta, 3),
        "top_category_deltas": [
            {"category": cat, "avg_delta": round(delta, 3)}
            for cat, delta in top_category_deltas
        ],
        "item_sensitivity_count": sensitivity_count,
    }


def _format_score(value: float | None) -> str:
    if value is None:
        return "-"
    return f"{value:.3f}"


def _generate_markdown_report(
    used_data: dict,
    settings: list[dict],
    overall_rows: list[dict],
    category_rows: dict[str, list[dict]],
    item_rows: dict[str, list[dict]],
    insights: dict,
) -> str:
    lines: list[str] = []
    lines.append("# Window Length 실험 비교 리포트\n")
    lines.append(f"생성일: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    lines.append("## 사용 데이터\n")
    lines.append(f"- 실험 대상 강의 수: {used_data['lecture_count']}개")
    lines.append(f"- 강의 날짜: {', '.join(used_data['lecture_dates'])}")
    lines.append(f"- 데이터 파일 수: {len(used_data['file_names'])}개\n")
    lines.append("| 파일명 | 강의 날짜 |")
    lines.append("| --- | --- |")
    for file_name in used_data["file_names"]:
        date = file_name.split("_")[0] if "_" in file_name else "-"
        lines.append(f"| {file_name} | {date} |")
    lines.append("")

    lines.append("## 실험 설정\n")
    lines.append(
        "- 전처리 시간 단위 정책: 타임스탬프를 내부에서 초 단위로 통일하고, "
        "window/hop는 분 단위 입력값을 초로 변환해 청킹 계산에 사용함."
    )
    lines.append("| 실험명 | Window (분) | Hop (분) | Hop 비율 | Model | Temperature | Calibrator | Passes |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- | --- |")
    for row in settings:
        lines.append(
            f"| {row['name'] or row['experiment_id']} | {row['chunk_duration_minutes']} | "
            f"{row['chunk_hop_minutes']} | {row['hop_ratio']:.2f} | {row['model']} | "
            f"{row['temperature']} | {row['use_calibrator']} | {row['num_passes']} |"
        )
    lines.append("")

    lines.append("## 관찰된 사실\n")
    lines.append("### 1) 강의별 종합 점수 변화\n")
    lines.append("| 강의 날짜 | 30분 | 60분 | 120분 | Delta(최대-최소) |")
    lines.append("| --- | --- | --- | --- | --- |")
    for row in overall_rows:
        by_window = {s["window_minutes"]: s["average_score"] for s in row["scores"]}
        lines.append(
            f"| {row['lecture_date']} | {_format_score(by_window.get(30))} | "
            f"{_format_score(by_window.get(60))} | {_format_score(by_window.get(120))} | "
            f"{row['delta']:.3f} |"
        )
    lines.append("")

    lines.append("### 2) 카테고리별 평균 점수 변화\n")
    for date in sorted(category_rows):
        lines.append(f"#### {date}\n")
        lines.append("| 카테고리 | 30분 | 60분 | 120분 | Delta |")
        lines.append("| --- | --- | --- | --- | --- |")
        for row in category_rows[date]:
            by_window = {s["window_minutes"]: s["score"] for s in row["scores"]}
            lines.append(
                f"| {row['category']} | {_format_score(by_window.get(30))} | "
                f"{_format_score(by_window.get(60))} | {_format_score(by_window.get(120))} | "
                f"{row['delta']:.3f} |"
            )
        lines.append("")

    lines.append("### 3) 항목 민감도\n")
    for date in sorted(item_rows):
        high = [r for r in item_rows[date] if r["sensitivity"] == "high"]
        medium = [r for r in item_rows[date] if r["sensitivity"] == "medium"]
        lines.append(f"#### {date}")
        lines.append(f"- high(delta>=2): {len(high)}개")
        lines.append(f"- medium(delta>=1): {len(medium)}개")
        lines.append("- 상위 민감 항목:")
        lines.append("| 항목 | 카테고리 | 30분 | 60분 | 120분 | Delta | 민감도 |")
        lines.append("| --- | --- | --- | --- | --- | --- | --- |")
        for row in item_rows[date][:5]:
            by_window = {s["window_minutes"]: s["score"] for s in row["scores"]}
            lines.append(
                f"| {row['item_id']} {row['item_name']} | {row['category']} | "
                f"{_format_score(by_window.get(30))} | {_format_score(by_window.get(60))} | "
                f"{_format_score(by_window.get(120))} | {row['delta']:.3f} | {row['sensitivity']} |"
            )
        lines.append("")

    lines.append("## 해석\n")
    lines.append(f"- 강의별 종합 점수 평균 delta는 {insights['avg_overall_delta']:.3f}임.")
    top_categories = insights.get("top_category_deltas", [])
    if top_categories:
        cat_text = ", ".join(
            f"{row['category']}({row['avg_delta']:.3f})" for row in top_categories
        )
        lines.append(f"- window 길이에 상대적으로 민감한 카테고리는 {cat_text} 순으로 나타남.")
    sensitivity_count = insights.get("item_sensitivity_count", {})
    lines.append(
        f"- 항목 민감도 분포는 high {sensitivity_count.get('high', 0)}개, "
        f"medium {sensitivity_count.get('medium', 0)}개, "
        f"low {sensitivity_count.get('low', 0)}개임."
    )
    lines.append("")

    lines.append("## 개선 제안\n")
    lines.append("- 운영 기본 window는 60분(hop 30분)으로 두고, 조건별 보조 정책을 병행할 것을 권장함.")
    lines.append("- 항목 민감도가 큰 카테고리는 30분 window 결과를 함께 검토해 피드백 세분화를 강화함.")
    lines.append("- 비용/속도 우선 배치에서는 120분 window를 후보로 쓰되, 민감 항목 누락 가능성을 함께 보고함.")
    lines.append("")

    return "\n".join(lines)


def compare_window_experiments(
    experiment_dirs: list[Path],
    output_dir: Path | None = None,
) -> Path:
    """Window size 실험들을 비교하여 리포트를 생성한다."""
    experiments = [load_experiment_results(exp_dir) for exp_dir in experiment_dirs]
    experiments = _sort_experiments_by_window(experiments)

    used_data = _collect_used_data(experiments)
    settings = _build_experiment_settings(experiments)
    overall_rows = _build_overall_comparison(experiments)
    category_rows = _build_category_comparison(experiments)
    item_rows = _build_item_sensitivity(experiments)
    insights = _build_insights(overall_rows, category_rows, item_rows)

    report = _generate_markdown_report(
        used_data=used_data,
        settings=settings,
        overall_rows=overall_rows,
        category_rows=category_rows,
        item_rows=item_rows,
        insights=insights,
    )

    output_dir = output_dir or experiment_dirs[0].parent
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = output_dir / f"window_comparison_{timestamp}.md"
    json_path = output_dir / f"window_comparison_{timestamp}.json"

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "generated_at": datetime.now().isoformat(),
                "used_data": used_data,
                "experiment_settings": settings,
                "overall_comparison": overall_rows,
                "category_comparison": category_rows,
                "item_sensitivity": item_rows,
                "insights": insights,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    logger.info("Window comparison report saved to %s", report_path)
    return report_path
