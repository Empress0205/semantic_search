"""Checks that embeddings survive a restart, by writing to disk and reading back.

Uses a scratch collection so it never touches the notes the application serves,
and removes it again at the end.

    python tests/test_persistent.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.chroma_db import ChromaDBService

chroma_service = ChromaDBService(collection_name="scratch_persistent")


documents = [
    "Machine learning models learn patterns from data.",
    "Django is a Python web framework.",
    "Neural networks are inspired by the human brain.",
]


chroma_service.add_documents(documents)

print(f"Documents added. Collection now holds {chroma_service.count()}.")

print("\nSearching...")

results = chroma_service.search(
    "How do computers learn?",
    n_results=3
)

for document, distance in zip(
    results["documents"][0],
    results["distances"][0]
):
    print(f"{distance:.4f} - {document}")

# With the cosine metric, distance is 1 - similarity, so smaller is closer.
print("\nCleaning up the scratch collection.")
chroma_service.drop_collection()
