"""Search ranking, threshold filtering and related notes."""

import pytest

from app.config import MAX_N_RESULTS
from app.search.semantic_search import SemanticSearch


def test_results_come_back_best_first(make_db):
    db = make_db([("Far", 0.8), ("Near", 0.1), ("Middle", 0.4)])

    titles = [note["title"] for note in SemanticSearch(db).search("anything")]

    assert titles == ["Near", "Middle", "Far"]


def test_scores_are_attached_alongside_the_raw_distance(make_db):
    db = make_db([("Only", 0.25)])

    note = SemanticSearch(db).search("anything")[0]

    assert note["score"] == pytest.approx(0.75)
    assert note["distance"] == pytest.approx(0.25)


@pytest.mark.parametrize("query", ["", "   ", None])
def test_an_empty_query_never_reaches_the_store(make_db, query):
    db = make_db([("Something", 0.1)])

    assert SemanticSearch(db).search(query) == []
    assert db.queries == []


def test_notes_below_the_threshold_are_dropped(make_db):
    # Scores are 0.9, 0.5 and 0.2.
    db = make_db([("Strong", 0.1), ("Weak", 0.5), ("Noise", 0.8)])

    titles = [n["title"] for n in SemanticSearch(db).search("anything", threshold=0.4)]

    assert titles == ["Strong", "Weak"]


def test_a_threshold_can_legitimately_return_nothing(make_db):
    """The point of the feature: no good match is a valid answer."""
    db = make_db([("Noise", 0.95), ("More noise", 0.97)])

    assert SemanticSearch(db).search("pasta recipe", threshold=0.5) == []


def test_a_filtered_search_still_fills_up_to_n_results(make_db):
    """Filtering happens after the store picks its nearest N.

    Without over-fetching, asking for 3 with a threshold could return 1 even
    though plenty of qualifying notes existed just outside the window.
    """
    pairs = [(f"Note {i}", 0.1 + i * 0.01) for i in range(20)]
    db = make_db(pairs)

    results = SemanticSearch(db).search("anything", n_results=3, threshold=0.5)

    assert len(results) == 3
    assert db.queries[0]["n_results"] > 3


def test_no_over_fetching_when_nothing_would_be_filtered(make_db):
    db = make_db([(f"Note {i}", 0.1) for i in range(10)])

    SemanticSearch(db).search("anything", n_results=4, threshold=0)

    assert db.queries[0]["n_results"] == 4


def test_n_results_is_clamped_to_the_configured_ceiling(make_db):
    db = make_db([("Only", 0.1)])

    SemanticSearch(db).search("anything", n_results=MAX_N_RESULTS + 500)

    assert db.queries[0]["n_results"] == MAX_N_RESULTS


def test_related_excludes_the_note_itself(make_db):
    # A note is always its own nearest neighbour, at distance 0.
    db = make_db([("Source", 0.0), ("Sibling", 0.3), ("Cousin", 0.5)])

    titles = [n["title"] for n in SemanticSearch(db).related("n1", n_results=2)]

    assert "Source" not in titles
    assert titles == ["Sibling", "Cousin"]


def test_related_hides_weak_neighbours(make_db):
    """Better an empty panel than three unrelated notes presented as related."""
    db = make_db([("Source", 0.0), ("Unrelated", 0.9), ("Also unrelated", 0.95)])

    assert SemanticSearch(db).related("n1", n_results=3) == []


def test_related_on_an_unknown_note_is_empty(make_db):
    db = make_db([("Source", 0.0)])

    assert SemanticSearch(db).related("does-not-exist") == []
