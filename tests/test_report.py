from src.report.generator import build_report


def test_build_report() -> None:
    report = build_report("lecture-1", 82.3, [])
    assert report["lecture_id"] == "lecture-1"
    assert report["total_score"] == 82.3
