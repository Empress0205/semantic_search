"""Semantic search over the stored notes.

The vector store returns distances; the interface wants a relevance score. The
conversion lives here so the rest of the app only ever deals with a 0-1 score.
"""

from app.config import DEFAULT_N_RESULTS, DISTANCE_METRIC, MAX_N_RESULTS
from app.documents.document_service import _to_note


def _to_similarity(distance):
    """Map a ChromaDB distance onto a 0-1 relevance score.

    With the cosine metric, distance is 1 - cosine_similarity, so the score is
    simply the complement. Sentence-transformer vectors rarely point in
    opposing directions, but the result is clamped so a negative similarity can
    never surface as a negative percentage.

    Other metrics have no bounded upper limit, so they fall back to a decay
    that is monotonic — the ordering stays correct even if the absolute number
    is only indicative.
    """
    if DISTANCE_METRIC == "cosine":
        return max(0.0, min(1.0, 1.0 - distance))
    return 1.0 / (1.0 + max(distance, 0.0))


class SemanticSearch:
    def __init__(self, db):
        self.db = db

    def search(self, query, n_results=DEFAULT_N_RESULTS, threshold=0.0):
        """Return the notes closest in meaning to `query`, best match first."""
        query = (query or "").strip()
        if not query:
            return []

        n_results = max(1, min(n_results, MAX_N_RESULTS))

        results = []
        for record in self.db.query(query, n_results=n_results):
            score = _to_similarity(record["distance"])
            if score < threshold:
                continue

            note = _to_note(record)
            note["score"] = round(score, 4)
            note["distance"] = round(record["distance"], 4)
            results.append(note)

        # Chroma returns nearest-first already; sorting keeps the guarantee
        # explicit and independent of that.
        results.sort(key=lambda note: note["score"], reverse=True)
        return results

    def related(self, note_id, n_results=3):
        """Notes semantically closest to an existing note, excluding itself."""
        record = self.db.get(note_id)
        if record is None:
            return []

        # Ask for one extra, since the note itself is its own nearest neighbour.
        found = self.search(record["document"], n_results=n_results + 1)
        return [note for note in found if note["id"] != note_id][:n_results]
