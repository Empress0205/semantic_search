"""Thin wrapper around the ChromaDB collection that stores note vectors."""

import uuid

import chromadb

from app.config import CHROMA_PATH, COLLECTION_NAME, DISTANCE_METRIC
from app.embeddings.embedding_service import EmbeddingService


class ChromaDBService:
    def __init__(self, collection_name=None):
        """Pass `collection_name` to work in a scratch collection instead of
        the one the application serves — useful for experiments."""
        self.client = chromadb.PersistentClient(path=CHROMA_PATH)

        self.collection = self.client.get_or_create_collection(
            name=collection_name or COLLECTION_NAME,
            metadata={"hnsw:space": DISTANCE_METRIC},
        )
        self.embedding_service = EmbeddingService()

    def drop_collection(self):
        """Delete this collection entirely. Intended for scratch collections."""
        self.client.delete_collection(self.collection.name)

    # --- Single documents (used by the API) ----------------------------------

    def add(self, document, metadata, document_id=None):
        """Store one document and return the id it was stored under."""
        document_id = document_id or str(uuid.uuid4())
        embedding = self.embedding_service.generate(document)

        self.collection.add(
            ids=[document_id],
            documents=[document],
            embeddings=[embedding.tolist()],
            metadatas=[metadata],
        )
        return document_id

    def update(self, document_id, document, metadata):
        """Replace a document and regenerate its embedding."""
        embedding = self.embedding_service.generate(document)

        self.collection.update(
            ids=[document_id],
            documents=[document],
            embeddings=[embedding.tolist()],
            metadatas=[metadata],
        )

    def delete(self, document_id):
        self.collection.delete(ids=[document_id])

    def get(self, document_id):
        """Return one raw record, or None if the id is unknown."""
        result = self.collection.get(
            ids=[document_id],
            include=["documents", "metadatas"],
        )

        if not result["ids"]:
            return None

        return {
            "id": result["ids"][0],
            "document": result["documents"][0],
            "metadata": result["metadatas"][0] or {},
        }

    def get_all(self):
        """Return every stored record."""
        result = self.collection.get(include=["documents", "metadatas"])

        return [
            {
                "id": document_id,
                "document": document,
                "metadata": metadata or {},
            }
            for document_id, document, metadata in zip(
                result["ids"], result["documents"], result["metadatas"]
            )
        ]

    def count(self):
        return self.collection.count()

    # --- Querying ------------------------------------------------------------

    def query(self, query_text, n_results=5):
        """Nearest neighbours of `query_text`, with their metadata."""
        if self.collection.count() == 0:
            return []

        query_embedding = self.embedding_service.generate(query_text)

        # Chroma raises if n_results exceeds what is stored.
        n_results = min(n_results, self.collection.count())

        result = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            include=["documents", "distances", "metadatas"],
        )

        return [
            {
                "id": document_id,
                "document": document,
                "metadata": metadata or {},
                "distance": distance,
            }
            for document_id, document, metadata, distance in zip(
                result["ids"][0],
                result["documents"][0],
                result["metadatas"][0],
                result["distances"][0],
            )
        ]

    # --- Batch helpers (used by the learning scripts in tests/) ---------------

    def add_documents(self, documents):
        """Add a batch of plain strings. Returns the generated ids.

        Ids are random rather than positional so repeated calls append instead
        of overwriting earlier batches.
        """
        ids = [str(uuid.uuid4()) for _ in documents]
        embeddings = self.embedding_service.generate_batch(documents)

        self.collection.add(
            documents=documents,
            embeddings=embeddings.tolist(),
            ids=ids,
        )
        return ids

    def search(self, query, n_results=5):
        """Raw ChromaDB query result, kept for the scripts in tests/."""
        query_embeddings = self.embedding_service.generate(query)

        return self.collection.query(
            query_embeddings=[query_embeddings.tolist()],
            n_results=min(n_results, max(self.collection.count(), 1)),
            include=["documents", "distances"],
        )
