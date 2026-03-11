"""IRR 메트릭 테스트."""

import pytest

from src.experiment.metrics import (
    cohens_weighted_kappa,
    icc_two_way,
    krippendorffs_alpha,
    score_stability_index,
)


class TestCohensWeightedKappa:
    def test_perfect_agreement(self):
        r1 = [1, 2, 3, 4, 5]
        r2 = [1, 2, 3, 4, 5]
        assert cohens_weighted_kappa(r1, r2) == pytest.approx(1.0, abs=0.01)

    def test_no_agreement_random(self):
        # 상수 평가(모두 1 vs 모두 5)는 kappa=0 (우연과 동일)
        r1 = [1, 1, 1, 1, 1]
        r2 = [5, 5, 5, 5, 5]
        kappa = cohens_weighted_kappa(r1, r2)
        assert kappa <= 0  # 0 또는 음수

    def test_partial_agreement(self):
        r1 = [3, 4, 3, 4, 5]
        r2 = [3, 3, 4, 4, 5]
        kappa = cohens_weighted_kappa(r1, r2)
        assert 0 < kappa < 1

    def test_empty(self):
        assert cohens_weighted_kappa([], []) == 0.0


class TestKrippendorffsAlpha:
    def test_perfect_agreement(self):
        matrix = [[3, 4, 5, 3], [3, 4, 5, 3], [3, 4, 5, 3]]
        alpha = krippendorffs_alpha(matrix)
        assert alpha == pytest.approx(1.0, abs=0.01)

    def test_low_agreement(self):
        matrix = [[1, 5, 3, 2], [5, 1, 2, 4], [3, 3, 5, 1]]
        alpha = krippendorffs_alpha(matrix)
        assert alpha < 0.5

    def test_single_rater(self):
        matrix = [[1, 2, 3]]
        assert krippendorffs_alpha(matrix) == 0.0

    def test_with_none(self):
        matrix = [[3, None, 5], [3, 4, 5]]
        alpha = krippendorffs_alpha(matrix)
        assert isinstance(alpha, float)


class TestICCTwoWay:
    def test_perfect_agreement(self):
        matrix = [[3, 4, 5], [3, 4, 5]]
        icc = icc_two_way(matrix)
        assert icc == pytest.approx(1.0, abs=0.01)

    def test_high_agreement(self):
        matrix = [[3, 4, 5, 3], [3, 4, 4, 3], [3, 4, 5, 4]]
        icc = icc_two_way(matrix)
        assert icc > 0.7

    def test_low_agreement(self):
        matrix = [[1, 5, 3, 2], [5, 1, 2, 4]]
        icc = icc_two_way(matrix)
        assert icc < 0.5


class TestScoreStabilityIndex:
    def test_perfect_stability(self):
        matrix = [[3, 4, 5], [3, 4, 5], [3, 4, 5]]
        ssi = score_stability_index(matrix)
        assert ssi == pytest.approx(1.0, abs=0.01)

    def test_moderate_stability(self):
        matrix = [[3, 4, 5], [3, 3, 4], [4, 4, 5]]
        ssi = score_stability_index(matrix)
        assert 0.8 < ssi < 1.0

    def test_zero_data(self):
        assert score_stability_index([]) == 0.0
