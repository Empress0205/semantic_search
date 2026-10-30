# Learning Journey

How this project was built, phase by phase, and what each phase was meant to teach.

## Development Roadmap

### Phase 1 — Understanding Embeddings

Start with a simple Python script that converts sentences into vectors.

We will experiment with:

* Generating embeddings
* Checking vector dimensions
* Comparing different sentences
* Measuring semantic similarity

### Phase 2 — Semantic Similarity

Test whether sentences with similar meanings produce similar embeddings.

Example:

```text
"I love learning artificial intelligence."

"I enjoy studying AI."
```

These should have relatively similar embeddings.

While:

```text
"I love learning artificial intelligence."

"The weather is very cold today."
```

should be less similar.

### Phase 3 — ChromaDB

Introduce a vector database.

```text
Document
   ↓
Embedding
   ↓
ChromaDB
```

We will learn how to:

* Create collections
* Store documents
* Store embeddings
* Add metadata
* Query similar documents

### Phase 4 — Semantic Search

Build the actual search functionality.

```text
User Query
    ↓
Generate Embedding
    ↓
Search ChromaDB
    ↓
Find Similar Documents
    ↓
Return Results
```

### Phase 5 — FastAPI

Expose the functionality through an API.

Planned endpoints:

```text
POST /documents
GET  /documents
POST /search
```

### Phase 6 — Simple User Interface

Create a small interface where users can:

* Add notes
* Search notes
* View similar results
* See similarity scores

### Phase 7 — RAG Extension

Once semantic search is understood, extend the project into a simple **Retrieval-Augmented Generation (RAG)** system.

```text
Documents
    ↓
Chunking
    ↓
Embeddings
    ↓
ChromaDB
    ↓
Semantic Search
    ↓
Relevant Context
    ↓
LLM
    ↓
Generated Answer
```

## 🧠 Learning Objectives

By completing this project, I should be able to explain:

1. What an embedding is
2. Why text needs to be converted into vectors
3. What a vector represents
4. What Sentence Transformers does
5. How semantic similarity works
6. What a vector database is
7. How ChromaDB performs similarity search
8. The difference between keyword search and semantic search
9. How embeddings are used in RAG systems

## 📌 Current Status

**Project status:** 🚧 In Development

Phases 1–6 are working end to end: notes are embedded with Sentence
Transformers, stored in ChromaDB, served through FastAPI, and searched by
meaning from the React interface.

Current focus:

> Phase 7 — extending semantic search into a RAG system (chunking, retrieved
> context, and an LLM answer).

## 🔮 Future Improvements

Possible extensions include:

* PDF document upload
* Automatic document chunking
* Multiple embedding models
* Filtering by metadata
* Hybrid keyword + semantic search
* RAG chatbot
* Authentication
* Web-based dashboard
* Embedding visualization
* Evaluation of search quality

---

### Learning Philosophy

This project is intentionally being built **step by step**.

Instead of immediately using a complete RAG framework, we will first understand what happens underneath:

```text
Text
 ↓
Embedding
 ↓
Vector
 ↓
Similarity
 ↓
Vector Database
 ↓
Semantic Search
 ↓
RAG
```

The objective is not just to make the application work, but to understand **why each component is needed and how the components work together**.
