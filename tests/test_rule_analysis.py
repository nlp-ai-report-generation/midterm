from src.rule_analysis.scoring import ScoreItem, weighted_average


def test_weighted_average_basic() -> None:
    items = [
        ScoreItem(item="a", score=5, weight="high"),
        ScoreItem(item="b", score=3, weight="medium"),
    ]
    assert weighted_average(items) > 0
