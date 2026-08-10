import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# Create our embedding function
embedding_function = SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)
client = chromadb.Client()

collection = client.create_collection(
    name="notes",
    embedding_function=embedding_function)


documents = [
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


collection.add(
    documents=documents,
    ids=[str(i) for i in range(len(documents))]
)


results = collection.query(
    query_texts=["How do computers learn from data?"],
    n_results=3,
    include=['documents', 'distances']
)


print("\nSearch results:")

for document in results["documents"][0]:
    print(document)

for document, distance in zip(
    results["documents"][0],
    results["distances"][0]
):
    print(f"{distance:.4f} - {document}")