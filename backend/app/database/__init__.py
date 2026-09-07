def __init__(self):
    self.client = chromadb.PersistentClient(
        path="./data/chroma"
    )

    self.collection = self.client.get_or_create_collection(
        name="notes"
    )

    print("Collection metadata:", self.collection.metadata)

    self.embedding_service = EmbeddingService()