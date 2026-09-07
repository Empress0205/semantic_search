"""The HTTP contract the frontend codes against.

The real services are swapped out with dependency overrides, so these run
without ChromaDB or the embedding model. That also means the app's lifespan is
deliberately not started: entering the TestClient context would build the real
services and load the model.
"""

import pytest
from fastapi.testclient import TestClient

from app.documents.document_service import DocumentService
from app.main import app, get_documents, get_search
from app.search.semantic_search import SemanticSearch


@pytest.fixture
def client(make_db):
    """A client wired to a small in-memory store."""
    db = make_db([("How to cook pasta", 0.2), ("Deep Learning Notes", 0.6)])

    app.dependency_overrides[get_documents] = lambda: DocumentService(db)
    app.dependency_overrides[get_search] = lambda: SemanticSearch(db)
    test_client = TestClient(app)
    test_client.db = db
    yield test_client
    app.dependency_overrides.clear()


def test_health_reports_the_model_and_note_count(client):
    body = client.get("/health").json()

    assert body["status"] == "ok"
    assert body["notes"] == 2
    assert body["model"] and body["distance_metric"]


def test_search_returns_scored_results_newest_first(client):
    body = client.post("/search", json={"query": "pasta"}).json()

    scores = [result["score"] for result in body["results"]]
    assert body["count"] == len(body["results"])
    assert scores == sorted(scores, reverse=True)
    assert body["results"][0]["title"] == "How to cook pasta"


def test_search_results_expose_both_a_score_and_a_distance(client):
    """The UI shows a percentage; the raw distance stays available for debugging."""
    result = client.post("/search", json={"query": "pasta"}).json()["results"][0]

    assert 0.0 <= result["score"] <= 1.0
    assert result["distance"] == pytest.approx(0.2)


def test_a_high_threshold_returns_an_empty_result_set_not_an_error(client):
    response = client.post("/search", json={"query": "pasta", "threshold": 0.95})

    assert response.status_code == 200
    assert response.json() == {"query": "pasta", "count": 0, "results": []}


@pytest.mark.parametrize(
    "payload",
    [
        {"query": ""},                       # nothing to search for
        {"query": "x", "threshold": 1.5},    # scores never exceed 1
        {"query": "x", "threshold": -0.1},
        {"query": "x", "n_results": 0},
        {"query": "x", "n_results": 10_000},
    ],
)
def test_nonsense_search_requests_are_rejected(client, payload):
    assert client.post("/search", json=payload).status_code == 422


def test_a_note_can_be_created_and_read_back(client):
    created = client.post(
        "/documents",
        json={"title": "New note", "content": "Body text", "tags": ["a", "a", "B"]},
    )

    assert created.status_code == 201
    note = created.json()
    assert note["title"] == "New note"
    assert note["tags"] == ["a", "b"]

    fetched = client.get(f"/documents/{note['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["content"] == "Body text"


def test_creating_a_note_without_a_title_is_rejected(client):
    response = client.post("/documents", json={"title": "", "content": "Body"})

    assert response.status_code == 422


def test_listing_returns_every_note(client):
    body = client.get("/documents").json()

    assert {note["title"] for note in body} == {
        "How to cook pasta",
        "Deep Learning Notes",
    }


def test_unknown_notes_are_404_not_500(client):
    assert client.get("/documents/nope").status_code == 404
    assert client.delete("/documents/nope").status_code == 404
    assert client.get("/documents/nope/related").status_code == 404
    assert (
        client.put(
            "/documents/nope", json={"title": "T", "content": "C"}
        ).status_code
        == 404
    )


def test_deleting_a_note_removes_it(client):
    note_id = client.get("/documents").json()[0]["id"]

    assert client.delete(f"/documents/{note_id}").status_code == 204
    assert client.get(f"/documents/{note_id}").status_code == 404


def test_related_notes_never_include_the_note_itself(client):
    note_id = client.get("/documents").json()[0]["id"]

    related = client.get(f"/documents/{note_id}/related").json()

    assert all(item["id"] != note_id for item in related)
