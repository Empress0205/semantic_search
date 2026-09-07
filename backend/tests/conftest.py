"""Fakes shared by the tests.

Nothing here touches ChromaDB or loads the embedding model: the services take
their store as a constructor argument, so a dictionary-backed stand-in is
enough to exercise every branch. That keeps the suite fast and offline.
"""

import itertools

import pytest


class FakeDB:
    """In-memory stand-in for ChromaDBService.

    Distances are supplied by the test rather than computed, so search
    behaviour can be checked without an embedding model in the way.
    """

    def __init__(self, records=None):
        self.records = list(records or [])
        self._ids = itertools.count(1)
        # Test assertions read these to check what the service asked for.
        self.queries = []
        self.added = []
        self.updated = []
        self.deleted = []

    # --- Reads ---
    def query(self, query_text, n_results=5):
        self.queries.append({"text": query_text, "n_results": n_results})
        ordered = sorted(self.records, key=lambda r: r["distance"])
        return [dict(r) for r in ordered[:n_results]]

    def get(self, document_id):
        for record in self.records:
            if record["id"] == document_id:
                return dict(record)
        return None

    def get_all(self):
        return [dict(r) for r in self.records]

    def count(self):
        return len(self.records)

    # --- Writes ---
    def add(self, document, metadata, document_id=None):
        document_id = document_id or f"id-{next(self._ids)}"
        self.added.append({"id": document_id, "document": document, "metadata": metadata})
        self.records.append(
            {"id": document_id, "document": document, "metadata": metadata, "distance": 0.0}
        )
        return document_id

    def update(self, document_id, document, metadata):
        self.updated.append(
            {"id": document_id, "document": document, "metadata": metadata}
        )
        for record in self.records:
            if record["id"] == document_id:
                record.update(document=document, metadata=metadata)

    def delete(self, document_id):
        self.deleted.append(document_id)
        self.records = [r for r in self.records if r["id"] != document_id]


def make_record(note_id, title, distance, content=None, collection="Notes", tags=""):
    """A store record in the shape ChromaDBService.query returns."""
    content = content or f"Body of {title}."
    return {
        "id": note_id,
        "document": f"{title}\n{content}",
        "distance": distance,
        "metadata": {
            "title": title,
            "content": content,
            "collection": collection,
            "tags": tags,
            "created_at": "2026-01-01T00:00:00+00:00",
            "updated_at": "2026-01-01T00:00:00+00:00",
        },
    }


@pytest.fixture
def make_db():
    """Build a FakeDB from (title, distance) pairs, ids assigned in order."""

    def build(pairs):
        return FakeDB(
            [
                make_record(f"n{i}", title, distance)
                for i, (title, distance) in enumerate(pairs, start=1)
            ]
        )

    return build


@pytest.fixture
def db():
    """An empty store, for the CRUD tests."""
    return FakeDB()


@pytest.fixture
def db_from_records():
    """A store built from hand-written records, for awkward-shape cases."""
    return FakeDB
