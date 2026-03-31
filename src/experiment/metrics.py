"""평가 신뢰도 메트릭 (Inter-Rater Reliability).

- Cohen's Weighted Kappa
- Krippendorff's Alpha
- Intraclass Correlation Coefficient (ICC)
- Score Stability Index (SSI)
"""

from __future__ import annotations

import numpy as np


def cohens_weighted_kappa(
    ratings1: list[int],
    ratings2: list[int],
    num_categories: int = 5,
) -> float:
    """가중 Cohen's Kappa (quadratic weighting).

    두 평가 결과 간 합치도를 측정한다.

    Args:
        ratings1: 첫 번째 평가 점수 리스트
        ratings2: 두 번째 평가 점수 리스트
        num_categories: 점수 카테고리 수 (기본 5, 1~5점)

    Returns:
        Kappa 값 (-1 ~ 1, 1이 완전 합치)
    """
    if len(ratings1) != len(ratings2) or not ratings1:
        return 0.0

    n = len(ratings1)
    k = num_categories

    # 혼동 행렬
    confusion = np.zeros((k, k))
    for r1, r2 in zip(ratings1, ratings2):
        confusion[r1 - 1][r2 - 1] += 1

    confusion /= n

    # 주변 확률
    row_marginals = confusion.sum(axis=1)
    col_marginals = confusion.sum(axis=0)

    # 가중치 행렬 (quadratic)
    weights = np.zeros((k, k))
    for i in range(k):
        for j in range(k):
            weights[i][j] = ((i - j) ** 2) / ((k - 1) ** 2)

    # 관찰 비동의
    observed = np.sum(weights * confusion)

    # 기대 비동의
    expected_matrix = np.outer(row_marginals, col_marginals)
    expected = np.sum(weights * expected_matrix)

    if expected == 0:
        return 1.0

    return 1.0 - (observed / expected)


def krippendorffs_alpha(
    ratings_matrix: list[list[int | None]],
) -> float:
    """Krippendorff's Alpha (순서형 데이터).

    다수 평가자/실행의 일관성을 측정한다.

    Args:
        ratings_matrix: 2D 리스트 [raters x items]. None은 결측.
            예: [[3,4,2,5], [3,3,2,4], [4,4,3,5]]  (3회 실행, 4개 항목)

    Returns:
        Alpha 값 (-1 ~ 1, 1이 완전 합치, ≥0.667 잠정, ≥0.800 확정)
    """
    if not ratings_matrix or len(ratings_matrix) < 2:
        return 0.0

    n_raters = len(ratings_matrix)
    n_items = len(ratings_matrix[0])

    # 유효 값만 수집
    values_per_item: list[list[int]] = []
    for j in range(n_items):
        vals = [ratings_matrix[i][j] for i in range(n_raters) if ratings_matrix[i][j] is not None]
        if len(vals) >= 2:
            values_per_item.append(vals)

    if not values_per_item:
        return 0.0

    # 관찰된 비동의
    d_observed = 0.0
    n_pairs = 0

    for vals in values_per_item:
        m = len(vals)
        for i in range(m):
            for j in range(i + 1, m):
                d_observed += (vals[i] - vals[j]) ** 2
                n_pairs += 1

    if n_pairs == 0:
        return 1.0

    d_observed /= n_pairs

    # 기대 비동의
    all_values = [v for vals in values_per_item for v in vals]
    n_total = len(all_values)

    d_expected = 0.0
    expected_pairs = 0
    for i in range(n_total):
        for j in range(i + 1, n_total):
            d_expected += (all_values[i] - all_values[j]) ** 2
            expected_pairs += 1

    if expected_pairs == 0:
        return 1.0

    d_expected /= expected_pairs

    if d_expected == 0:
        return 1.0

    return 1.0 - (d_observed / d_expected)


def icc_two_way(
    ratings_matrix: list[list[int]],
) -> float:
    """Intraclass Correlation Coefficient ICC(2,1).

    동일 설정 반복 실행의 일관성 측정.

    Args:
        ratings_matrix: 2D 리스트 [raters x items]. 결측 없음.
            각 행이 하나의 평가 실행(rater), 각 열이 하나의 항목(target).

    Returns:
        ICC 값 (0 ~ 1, ≥0.75 good)
    """
    # ICC 공식은 [items x raters] 형태를 기준으로 하므로 전치
    data = np.array(ratings_matrix, dtype=float).T  # [items x raters]
    n_items, n_raters = data.shape

    if n_raters < 2 or n_items < 2:
        return 0.0

    grand_mean = data.mean()

    # 행 평균 (item means)
    item_means = data.mean(axis=1)
    # 열 평균 (rater means)
    rater_means = data.mean(axis=0)

    # Sum of Squares
    ss_rows = n_raters * np.sum((item_means - grand_mean) ** 2)  # between items
    ss_cols = n_items * np.sum((rater_means - grand_mean) ** 2)  # between raters
    ss_total = np.sum((data - grand_mean) ** 2)
    ss_error = ss_total - ss_rows - ss_cols

    df_rows = n_items - 1
    df_cols = n_raters - 1
    df_error = df_rows * df_cols

    if df_error == 0:
        return 0.0

    ms_rows = ss_rows / df_rows if df_rows > 0 else 0
    ms_cols = ss_cols / df_cols if df_cols > 0 else 0
    ms_error = ss_error / df_error

    # ICC(2,1) formula
    denominator = ms_rows + (n_raters - 1) * ms_error + n_raters * (ms_cols - ms_error) / n_items
    if denominator == 0:
        return 0.0

    return (ms_rows - ms_error) / denominator


def score_stability_index(
    ratings_matrix: list[list[int]],
) -> float:
    """Score Stability Index (SSI).

    SSI = 1 - (mean_absolute_deviation / max_possible_deviation)
    max_possible_deviation = 4 (1~5점 척도)

    Args:
        ratings_matrix: [raters x items]

    Returns:
        SSI (0 ~ 1, ≥0.85 목표)
    """
    data = np.array(ratings_matrix, dtype=float)
    if data.size == 0:
        return 0.0

    # 항목별 MAD
    item_means = data.mean(axis=0)
    mad_per_item = np.mean(np.abs(data - item_means), axis=0)
    mean_mad = np.mean(mad_per_item)

    max_dev = 4.0  # 1~5점 척도에서 최대 편차
    return 1.0 - (mean_mad / max_dev)
