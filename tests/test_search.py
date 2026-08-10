from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model=SentenceTransformer('all-MiniLM-L6-v2')

document=[
    "Machine learning models learn patterns from data.",
    "Django is a Python web framework.",
    "Neural networks are inspired by the human brain.",
    "Tanzania has a tropical climate.",
    "Python is popular for artificial intelligence development.",
    "ChromaDB is a vector database.",
    "Football is a popular sport.",
    "Embeddings represent text as vectors.",
    "PostgreSQL is a relational database.",
    "Deep learning uses neural networks.",
]

query='How do computers learn from data?'

query_embeddings=model.encode(query)
document_embeddings=model.encode(document)

print("Query embedding shape:", query_embeddings.shape)
print("Document embeddings shape:", document_embeddings.shape)

similarities=cosine_similarity(
    query_embeddings.reshape(1,-1),
    document_embeddings
)[0]

results=list(zip(document, similarities))
results.sort(key=lambda x: x[1], reverse=True)

print("\nSearch query:")
print(query)

print("\nSearch results:")

for document, score in results:
    print(f"{score:.4f} - {document}")