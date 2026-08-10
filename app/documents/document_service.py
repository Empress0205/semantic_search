"""Note CRUD on top of the vector store.

ChromaDB metadata values must be scalars, so the tag list is stored as a
comma-separated string and split again on the way out. Everything the API
returns passes through `_to_note`, so the shape is defined in one place.
"""

from datetime import datetime, timezone

from app.config import DEFAULT_COLLECTION


def _now():
    return datetime.now(timezone.utc).isoformat()


def _join_tags(tags):
    cleaned = []
    for tag in tags or []:
        tag = tag.strip().lower()
        if tag and tag not in cleaned:
            cleaned.append(tag)
    return ",".join(cleaned)


def _split_tags(raw):
    return [tag for tag in (raw or "").split(",") if tag]


class DocumentService:
    def __init__(self, db):
        self.db = db

    # --- Reads ---------------------------------------------------------------

    def list_notes(self):
        notes = [_to_note(record) for record in self.db.get_all()]
        notes.sort(key=lambda note: note["created_at"], reverse=True)
        return notes

    def get_note(self, note_id):
        record = self.db.get(note_id)
        return _to_note(record) if record else None

    def count(self):
        return self.db.count()

    # --- Writes --------------------------------------------------------------

    def create_note(self, title, content, collection=None, tags=None):
        timestamp = _now()

        metadata = {
            "title": title.strip(),
            "collection": (collection or "").strip() or DEFAULT_COLLECTION,
            "tags": _join_tags(tags),
            "created_at": timestamp,
            "updated_at": timestamp,
        }

        note_id = self.db.add(
            document=_embeddable_text(title, content, tags),
            metadata={**metadata, "content": content.strip()},
        )

        return _to_note(
            {
                "id": note_id,
                "document": content.strip(),
                "metadata": {**metadata, "content": content.strip()},
            }
        )

    def update_note(self, note_id, title, content, collection=None, tags=None):
        existing = self.db.get(note_id)
        if existing is None:
            return None

        metadata = {
            "title": title.strip(),
            "collection": (collection or "").strip() or DEFAULT_COLLECTION,
            "tags": _join_tags(tags),
            # Keep the original creation time; only the update stamp moves.
            "created_at": existing["metadata"].get("created_at", _now()),
            "updated_at": _now(),
            "content": content.strip(),
        }

        # Editing changes the meaning, so the embedding is regenerated here.
        self.db.update(
            document_id=note_id,
            document=_embeddable_text(title, content, tags),
            metadata=metadata,
        )

        return _to_note({"id": note_id, "document": content.strip(), "metadata": metadata})

    def delete_note(self, note_id):
        if self.db.get(note_id) is None:
            return False
        self.db.delete(note_id)
        return True


def _embeddable_text(title, content, tags):
    """What actually gets embedded.

    Title and tags are included so a note can be found by its subject even when
    the body never states it directly.
    """
    parts = [title.strip(), content.strip()]
    if tags:
        parts.append(" ".join(tags))
    return "\n".join(part for part in parts if part)


def _to_note(record):
    """Turn a raw store record into the shape the API returns."""
    metadata = record["metadata"]

    return {
        "id": record["id"],
        "title": metadata.get("title") or "Untitled note",
        # `content` is kept in metadata because the stored document also
        # carries the title and tags for embedding purposes.
        "content": metadata.get("content", record["document"]),
        "collection": metadata.get("collection") or DEFAULT_COLLECTION,
        "tags": _split_tags(metadata.get("tags")),
        "created_at": metadata.get("created_at"),
        "updated_at": metadata.get("updated_at"),
    }
