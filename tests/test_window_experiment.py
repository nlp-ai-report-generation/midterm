"""Window Length 실험 스크립트/비교기 테스트."""

from __future__ import annotations

import json
import runpy
import shutil
import uuid
from pathlib import Path

from src.experiment.window_comparator import compare_window_experiments


def _write_experiment(
    base_dir: Path,
    exp_id: str,
    window: int,
    hop: int,
    date_payloads: dict[str, dict],
) -> Path:
    exp_dir = base_dir / exp_id
    results_dir = exp_dir / "results"
    results_dir.mkdir(parents=True, exist_ok=True)

    with open(exp_dir / "config.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "experiment_id": exp_id,
                "name": f"window_{window}m_h{hop}m",
                "model": "gpt-4o-mini",
                "temperature": 0.1,
                "chunk_duration_minutes": window,
                "chunk_hop_minutes": hop,
                "use_calibrator": False,
                "num_passes": 1,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    average_scores: dict[str, float] = {}
    for lecture_date, payload in date_payloads.items():
        result_path = results_dir / f"{lecture_date}_pass_0.json"
        average_scores[lecture_date] = payload["overall"]
        with open(result_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "lecture_date": lecture_date,
                    "pass_num": 0,
                    "transcript_path": str(
                        Path("NLP 과제 1 - AI 강의 분석 리포트 생성기")
                        / "강의 스크립트"
                        / f"{lecture_date}_kdt-backendj-21th.txt"
                    ),
                    "weighted_average": payload["overall"],
                    "category_averages": payload["categories"],
                    "category_scores": payload["items"],
                },
                f,
                ensure_ascii=False,
                indent=2,
            )

    with open(exp_dir / "summary.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "experiment_id": exp_id,
                "average_scores": average_scores,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    return exp_dir


def _make_local_tmp_dir() -> Path:
    root = Path(__file__).parents[1] / "tests" / "_tmp_window_experiment"
    root.mkdir(parents=True, exist_ok=True)
    target = root / uuid.uuid4().hex
    target.mkdir(parents=True, exist_ok=True)
    return target


def _sample_payload(window_bias: float) -> dict[str, dict]:
    return {
        "2026-02-02": {
            "overall": round(3.2 + window_bias, 3),
            "categories": {
                "1. 언어 표현 품질": round(3.1 + window_bias, 3),
                "2. 강의 구조": round(3.3 + window_bias, 3),
            },
            "items": {
                "1. 언어 표현 품질": [
                    {
                        "item_id": "1.1",
                        "item_name": "발음/전달",
                        "score": round(3.0 + window_bias, 3),
                        "weight": "HIGH",
                    }
                ],
                "2. 강의 구조": [
                    {
                        "item_id": "2.1",
                        "item_name": "학습목표 안내",
                        "score": round(3.5 + window_bias, 3),
                        "weight": "HIGH",
                    }
                ],
            },
        },
        "2026-02-09": {
            "overall": round(3.0 + window_bias, 3),
            "categories": {
                "1. 언어 표현 품질": round(2.9 + window_bias, 3),
                "2. 강의 구조": round(3.1 + window_bias, 3),
            },
            "items": {
                "1. 언어 표현 품질": [
                    {
                        "item_id": "1.1",
                        "item_name": "발음/전달",
                        "score": round(2.8 + window_bias, 3),
                        "weight": "HIGH",
                    }
                ],
                "2. 강의 구조": [
                    {
                        "item_id": "2.1",
                        "item_name": "학습목표 안내",
                        "score": round(3.2 + window_bias, 3),
                        "weight": "HIGH",
                    }
                ],
            },
        },
    }


def test_build_configs_has_three_fixed_window_hop_pairs():
    script = runpy.run_path(
        str(Path(__file__).parents[1] / "scripts" / "run_window_experiment.py")
    )
    build_configs = script["build_configs"]
    configs = build_configs(model="gpt-4o-mini", temperature=0.1)

    assert len(configs) == 3
    assert [(c.chunk_duration_minutes, c.chunk_hop_minutes) for c in configs] == [
        (30, 15),
        (60, 30),
        (120, 60),
    ]
    assert configs[0].target_transcripts == [
        "2026-02-02_kdt-backendj-21th.txt",
        "2026-02-09_kdt-backendj-21th.txt",
        "2026-02-24_kdt-backendj-21th.txt",
    ]


def test_window_comparator_sorts_experiments_and_writes_required_sections():
    tmp_path = _make_local_tmp_dir()
    try:
        exp120 = _write_experiment(
            tmp_path,
            "exp120",
            window=120,
            hop=60,
            date_payloads=_sample_payload(window_bias=0.20),
        )
        exp30 = _write_experiment(
            tmp_path,
            "exp30",
            window=30,
            hop=15,
            date_payloads=_sample_payload(window_bias=0.00),
        )
        exp60 = _write_experiment(
            tmp_path,
            "exp60",
            window=60,
            hop=30,
            date_payloads=_sample_payload(window_bias=0.10),
        )

        report_path = compare_window_experiments([exp120, exp30, exp60], output_dir=tmp_path)
        assert report_path.exists()

        json_path = report_path.with_suffix(".json")
        assert json_path.exists()
        with open(json_path, encoding="utf-8") as f:
            payload = json.load(f)
        windows = [row["chunk_duration_minutes"] for row in payload["experiment_settings"]]
        assert windows == [30, 60, 120]

        with open(report_path, encoding="utf-8") as f:
            report_text = f.read()
        assert "## 사용 데이터" in report_text
        assert "## 실험 설정" in report_text
        assert "## 관찰된 사실" in report_text
        assert "## 해석" in report_text
        assert "## 개선 제안" in report_text
    finally:
        shutil.rmtree(tmp_path, ignore_errors=True)


def test_compare_only_flow_creates_report_for_three_experiment_ids():
    tmp_path = _make_local_tmp_dir()
    try:
        _write_experiment(
            tmp_path,
            "win30",
            window=30,
            hop=15,
            date_payloads=_sample_payload(window_bias=0.00),
        )
        _write_experiment(
            tmp_path,
            "win60",
            window=60,
            hop=30,
            date_payloads=_sample_payload(window_bias=0.05),
        )
        _write_experiment(
            tmp_path,
            "win120",
            window=120,
            hop=60,
            date_payloads=_sample_payload(window_bias=0.10),
        )

        script = runpy.run_path(
            str(Path(__file__).parents[1] / "scripts" / "run_window_experiment.py")
        )
        compare_only = script["compare_only"]
        compare_only.__globals__["EXPERIMENTS_DIR"] = tmp_path

        report_path = compare_only(["win30", "win60", "win120"])
        assert report_path.exists()
        with open(report_path, encoding="utf-8") as f:
            report = f.read()
        assert "2026-02-02_kdt-backendj-21th.txt" in report
        assert "Window (분)" in report
        assert "Hop 비율" in report
    finally:
        shutil.rmtree(tmp_path, ignore_errors=True)
