"""Fill an empty database with sample notes.

Semantic search is hard to judge with two documents, so this loads a small set
covering several subjects. Safe to run repeatedly: it does nothing if notes
already exist, unless --force is passed.

    python scripts/seed_notes.py
    python scripts/seed_notes.py --force
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.database.chroma_db import ChromaDBService
from app.documents.document_service import DocumentService

NOTES = [
    {
        "title": "Machine Learning Fundamentals",
        "content": (
            "Machine learning models learn patterns from data instead of being "
            "explicitly programmed with rules.\n\n"
            "Supervised learning uses labelled examples: the model sees an input and "
            "the correct answer, then adjusts itself to reduce the gap between its "
            "prediction and the truth. Unsupervised learning has no labels and instead "
            "looks for structure, such as clusters of similar points.\n\n"
            "The training loop is always the same shape: make a prediction, measure the "
            "error with a loss function, and nudge the parameters in the direction that "
            "lowers that error."
        ),
        "collection": "AI & Machine Learning",
        "tags": ["fundamentals", "training", "theory"],
    },
    {
        "title": "Deep Learning Notes",
        "content": (
            "Deep learning uses neural networks with many stacked layers. Each layer "
            "transforms its input into a slightly more abstract representation, so early "
            "layers capture simple features and later layers capture meaning.\n\n"
            "Backpropagation computes how much each weight contributed to the final "
            "error, and gradient descent uses those gradients to update the weights.\n\n"
            "Depth is what makes the representation useful: the last hidden layer of a "
            "trained network is effectively an embedding of the input."
        ),
        "collection": "AI & Machine Learning",
        "tags": ["neural-networks", "backpropagation"],
    },
    {
        "title": "How Text Embeddings Work",
        "content": (
            "An embedding converts text into a fixed-length vector of numbers. Sentences "
            "with similar meaning end up close together in that vector space, even when "
            "they share no words at all.\n\n"
            '"I love learning artificial intelligence" and "I enjoy studying AI" should '
            'sit near each other. "The weather is very cold today" should sit far away.\n\n'
            "Closeness is usually measured with cosine similarity, which compares the "
            "angle between two vectors and ignores their length. The all-MiniLM-L6-v2 "
            "model produces 384-dimensional vectors and is a good default for small "
            "projects."
        ),
        "collection": "AI & Machine Learning",
        "tags": ["embeddings", "sentence-transformers", "cosine-similarity"],
    },
    {
        "title": "ChromaDB Quick Reference",
        "content": (
            "ChromaDB is a vector database: it stores embeddings alongside documents and "
            "metadata, and retrieves the nearest neighbours of a query vector.\n\n"
            "Create a client, then get_or_create_collection to hold the notes. Add "
            "documents with their embeddings, ids and metadata. Query with a query "
            "embedding and n_results to control how many neighbours come back.\n\n"
            "Results include distances, not similarities - a smaller distance means a "
            "closer match, so convert before showing a percentage to the user."
        ),
        "collection": "Databases",
        "tags": ["chromadb", "vector-database", "reference"],
    },
    {
        "title": "Keyword Search vs Semantic Search",
        "content": (
            'Keyword search matches literal strings. If a note says "vector database" and '
            'the query says "where do I store embeddings", keyword search finds nothing.\n\n'
            "Semantic search compares meaning through embeddings, so the two match even "
            "with no shared words. The trade-off is that semantic search can return "
            "loosely related notes, which is why a relevance score and a similarity "
            "threshold matter in the interface.\n\n"
            "Hybrid search combines both: keyword matching for precision, embeddings for "
            "recall."
        ),
        "collection": "AI & Machine Learning",
        "tags": ["search", "comparison", "retrieval"],
    },
    {
        "title": "FastAPI Backend Structure",
        "content": (
            "The backend exposes three endpoints: POST /documents to add a note, "
            "GET /documents to list them, and POST /search to run a semantic query.\n\n"
            "Keep the services separate from the routes. The embedding service owns the "
            "Sentence Transformer, the database service owns the ChromaDB collection, and "
            "the route layer only translates HTTP into service calls.\n\n"
            "Load the model once at startup - instantiating a Sentence Transformer per "
            "request is what makes an API feel slow."
        ),
        "collection": "Software Engineering",
        "tags": ["fastapi", "python", "api-design"],
    },
    {
        "title": "Retrieval-Augmented Generation",
        "content": (
            "RAG puts semantic search in front of a language model. The user asks a "
            "question, the system retrieves the most relevant chunks from the vector "
            "database, and those chunks are pasted into the prompt as context.\n\n"
            "The model then answers from the retrieved material rather than from memory "
            "alone, which reduces invented facts and lets the answer cite sources.\n\n"
            "Chunking matters more than people expect: chunks that are too large dilute "
            "the embedding, and chunks that are too small lose the context needed to "
            "answer."
        ),
        "collection": "AI & Machine Learning",
        "tags": ["rag", "llm", "chunking"],
    },
    {
        "title": "Exam Preparation Plan",
        "content": (
            "Two weeks before the AI exam, work backwards from the topic list rather than "
            "reading front to back.\n\n"
            "Day 1-3: embeddings, vector spaces and similarity measures. Day 4-6: neural "
            "network training and backpropagation. Day 7-9: retrieval systems and RAG. "
            "Remaining days: past papers under timed conditions.\n\n"
            "Active recall beats rereading. After each topic, close the notes and write "
            "down everything remembered, then check what was missed."
        ),
        "collection": "Personal Learning",
        "tags": ["study-plan", "revision"],
    },
    {
        "title": "Semantic Notes - Project Roadmap",
        "content": (
            "Phase 1 to 4 cover the learning path: generate embeddings, measure "
            "similarity, store vectors in ChromaDB, and build search on top.\n\n"
            "Phase 5 wraps everything in a FastAPI service. Phase 6 adds the interface. "
            "Phase 7 extends the project into a small RAG system.\n\n"
            "The point is not just a working app but being able to explain why each "
            "component exists and how they fit together."
        ),
        "collection": "Projects",
        "tags": ["roadmap", "planning"],
    },
    {
        "title": "Cosine Similarity by Hand",
        "content": (
            "Cosine similarity is the dot product of two vectors divided by the product "
            "of their magnitudes. The result runs from -1 to 1, where 1 means the vectors "
            "point in exactly the same direction.\n\n"
            "Because it ignores magnitude, a long document and a short sentence about the "
            "same subject can still score highly - which is exactly what is wanted when "
            "comparing notes of different lengths.\n\n"
            "Euclidean distance is the alternative, but it punishes length differences, "
            "so cosine is the usual choice for text."
        ),
        "collection": "AI & Machine Learning",
        "tags": ["maths", "similarity", "vectors"],
    },
]


def main():
    force = "--force" in sys.argv

    documents = DocumentService(ChromaDBService())
    existing = documents.count()

    if existing and not force:
        print(f"{existing} note(s) already stored. Nothing to do.")
        print("Run with --force to add the sample notes anyway.")
        return

    print(f"Embedding and storing {len(NOTES)} notes...")
    for note in NOTES:
        created = documents.create_note(**note)
        print(f"  + {created['title']}")

    print(f"\nDone. {documents.count()} notes in the collection.")


if __name__ == "__main__":
    main()
