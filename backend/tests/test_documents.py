"""Note CRUD: metadata shaping, tag handling and timestamps."""

from app.config import DEFAULT_COLLECTION
from app.documents.document_service import DocumentService


def test_a_note_without_a_collection_gets_the_default(db):
    service = DocumentService(db)

    note = service.create_note(title="Title", content="Body", collection="   ")

    assert note["collection"] == DEFAULT_COLLECTION


def test_tags_are_lowercased_trimmed_and_deduplicated(db):
    service = DocumentService(db)

    note = service.create_note(
        title="Title", content="Body", tags=["  Pasta ", "pasta", "FOOD", ""]
    )

    assert note["tags"] == ["pasta", "food"]


def test_the_embedded_text_carries_the_title_and_tags(db):
    """A note should be findable by its subject even when the body never says it."""

    DocumentService(db).create_note(
        title="How to cook pasta", content="Boil water.", tags=["dinner"]
    )

    embedded = db.added[0]["document"]
    assert "How to cook pasta" in embedded
    assert "Boil water." in embedded
    assert "dinner" in embedded


def test_content_is_stored_in_metadata_separately_from_the_embedded_text(db):

    DocumentService(db).create_note(title="Title", content="Just the body")

    assert db.added[0]["metadata"]["content"] == "Just the body"


def test_editing_keeps_the_original_creation_time(db):
    service = DocumentService(db)
    created = service.create_note(title="First", content="Body")

    updated = service.update_note(created["id"], title="Second", content="New body")

    assert updated["created_at"] == created["created_at"]
    assert updated["updated_at"] >= created["updated_at"]
    assert updated["title"] == "Second"


def test_editing_regenerates_the_embedding(db):
    """Changing the words changes the meaning, so the vector must be rewritten."""
    service = DocumentService(db)
    note = service.create_note(title="First", content="Body")

    service.update_note(note["id"], title="Totally different", content="New body")

    assert db.updated[0]["document"].startswith("Totally different")


def test_updating_a_missing_note_reports_it_rather_than_creating_one(db):

    assert DocumentService(db).update_note("nope", title="T", content="C") is None
    assert db.updated == []


def test_deleting_reports_whether_anything_was_removed(db):
    service = DocumentService(db)
    note = service.create_note(title="Title", content="Body")

    assert service.delete_note(note["id"]) is True
    assert service.delete_note("nope") is False
    assert db.deleted == [note["id"]]


def test_notes_are_listed_newest_first(db):
    service = DocumentService(db)
    older = service.create_note(title="Older", content="Body")
    newer = service.create_note(title="Newer", content="Body")
    # Timestamps come from the clock, so pin them to make the order explicit.
    service.db.records[0]["metadata"]["created_at"] = "2026-01-01T00:00:00+00:00"
    service.db.records[1]["metadata"]["created_at"] = "2026-06-01T00:00:00+00:00"

    titles = [note["title"] for note in service.list_notes()]

    assert titles == [newer["title"], older["title"]]


def test_a_note_with_no_title_still_renders(db_from_records):
    """Metadata can be incomplete; the API contract must not break because of it."""
    db = db_from_records([{"id": "x", "document": "Body", "metadata": {}, "distance": 0.0}])

    note = DocumentService(db).get_note("x")

    assert note["title"] == "Untitled note"
    assert note["content"] == "Body"
    assert note["tags"] == []
