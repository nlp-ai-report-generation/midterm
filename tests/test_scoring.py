"""점수 집계 모듈 테스트."""

from src.models import ItemScore
from src.scoring.aggregation import (
    aggregate_category,
    normalized_percentage,
    weighted_average,
    weighted_total,
)
from src.scoring.weights import Weight, get_weight


class TestWeights:
    def test_high_weight(self):
        assert get_weight("HIGH") == 3.0
        assert get_weight("high") == 3.0

    def test_medium_weight(self):
        assert get_weight("MEDIUM") == 2.0
        assert get_weight("medium") == 2.0

    def test_low_weight(self):
        assert get_weight("LOW") == 1.0
        assert get_weight("low") == 1.0

    def test_unknown_defaults_to_medium(self):
        assert get_weight("unknown") == 2.0


def _make_items() -> list[ItemScore]:
    """테스트용 항목 리스트."""
    return [
        ItemScore(item_id="1.1", item_name="A", category="C1", score=5, weight="HIGH"),
        ItemScore(item_id="1.2", item_name="B", category="C1", score=3, weight="MEDIUM"),
        ItemScore(item_id="1.3", item_name="C", category="C1", score=4, weight="LOW"),
    ]


class TestWeightedAverage:
    def test_basic(self):
        items = _make_items()
        # (5*3 + 3*2 + 4*1) / (3+2+1) = (15+6+4) / 6 = 25/6 ≈ 4.167
        avg = weighted_average(items)
        assert abs(avg - 25 / 6) < 0.01

    def test_empty(self):
        assert weighted_average([]) == 0.0

    def test_all_same_score(self):
        items = [
            ItemScore(item_id="1", item_name="A", category="C", score=3, weight="HIGH"),
            ItemScore(item_id="2", item_name="B", category="C", score=3, weight="LOW"),
        ]
        assert weighted_average(items) == 3.0


class TestWeightedTotal:
    def test_basic(self):
        items = _make_items()
        # 5*3 + 3*2 + 4*1 = 25
        assert weighted_total(items) == 25.0


class TestNormalizedPercentage:
    def test_basic(self):
        items = _make_items()
        # max = 5*3 + 5*2 + 5*1 = 30
        # actual = 25
        # 25/30 * 100 = 83.33%
        pct = normalized_percentage(items)
        assert abs(pct - 83.33) < 0.1

    def test_perfect_score(self):
        items = [
            ItemScore(item_id="1", item_name="A", category="C", score=5, weight="HIGH"),
        ]
        assert normalized_percentage(items) == 100.0

    def test_empty(self):
        assert normalized_percentage([]) == 0.0


class TestAggregateCategory:
    def test_basic(self):
        items = _make_items()
        result = aggregate_category("테스트 카테고리", items)
        assert result.category_name == "테스트 카테고리"
        assert len(result.items) == 3
        assert abs(result.weighted_average - 25 / 6) < 0.01
