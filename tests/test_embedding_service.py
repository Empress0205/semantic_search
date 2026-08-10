import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.embeddings.embedding_service import EmbeddingService


embedding_service = EmbeddingService()

text = "I love learning artificial intelligence."

embedding = embedding_service.generate(text)

print("Text:")
print(text)

print("\nEmbedding shape:")
print(embedding.shape)

print("\nFirst 10 values:")
print(embedding[:10])