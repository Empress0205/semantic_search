"""The distance-to-score conversion the whole interface depends on."""

import pytest

from app.search import semantic_search
from app.search.semantic_search import _to_similarity


@pytest.mark.parametrize(
    "distance, expected",
    [
        (0.0, 1.0),   # identical direction
        (0.5, 0.5),
        (1.0, 0.0),   # unrelated
    ],
)
def test_cosine_distance_is_the_complement_of_the_score(distance, expected):
    assert _to_similarity(distance) == pytest.approx(expected)


@pytest.mark.parametrize("distance", [-0.2, 1.4, 2.0])
def test_scores_stay_inside_zero_and_one(distance):
    """Opposing vectors and floating-point drift must not show as -12%."""
    assert 0.0 <= _to_similarity(distance) <= 1.0


def test_non_cosine_metric_falls_back_to_a_monotonic_decay(monkeypatch):
    """Other metrics are unbounded, so the score is only order-preserving.

    The absolute number stops being meaningful, but a nearer document must
    still score higher than a further one.
    """
    monkeypatch.setattr(semantic_search, "DISTANCE_METRIC", "l2")

    near, far = _to_similarity(0.5), _to_similarity(4.0)

    assert near > far
    assert 0.0 <= far < near <= 1.0
