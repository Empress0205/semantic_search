# Semantic Notes Search

[![Tests](https://github.com/Empress0205/semantic_search/actions/workflows/tests.yml/badge.svg)](https://github.com/Empress0205/semantic_search/actions/workflows/tests.yml)

A simple project for learning and implementing **text embeddings, semantic search, and vector databases** using Python.

The project allows users to add notes and search them using natural language. Instead of relying only on exact keyword matching, the system uses embeddings to understand the semantic meaning of the text and retrieve similar notes.

## 🎯 Project Goal

The main goal of this project is to understand how **embeddings** work by building a practical application from scratch.

We will gradually build the system and learn:

* What embeddings are
* How text is converted into vectors
* How semantic similarity works
* How to generate embeddings using Sentence Transformers
* How to store embeddings using ChromaDB
* How to perform similarity searches
* How to expose the functionality through a FastAPI backend
* How embeddings can be used as the foundation of a RAG system

## 🏗️ Planned Architecture

```text
                    User
                     │
                     ▼
              Search Query
                     │
                     ▼
          Sentence Transformer
                     │
                     ▼
               Embedding
                     │
                     ▼
                ChromaDB
                     │
              Similarity Search
                     │
                     ▼
             Similar Notes
```

## 🛠️ Technologies

The project will be developed using:

* **Python 3.11**
* **Sentence Transformers** – generating text embeddings
* **ChromaDB** – storing and searching vector embeddings
* **FastAPI** – building the backend API
* **SQLite** – storing document metadata
* **Git & GitHub** – version control

## 📁 Project Structure

```text
semantic-notes/
│
├── backend/
│   ├── app/
│   │   ├── main.py                 FastAPI app and routes
│   │   ├── config.py               Settings, read from backend/.env
│   │   │
│   │   ├── database/
│   │   │   └── chroma_db.py        ChromaDB collection wrapper
│   │   │
│   │   ├── embeddings/
│   │   │   └── embedding_service.py  Sentence Transformer
│   │   │
│   │   ├── documents/
│   │   │   └── document_service.py   Note CRUD + metadata
│   │   │
│   │   └── search/
│   │       └── semantic_search.py    Query -> ranked notes
│   │
│   ├── tests/                      Automated suite (pytest, no model needed)
│   ├── examples/                   Print-only learning scripts
│   │
│   ├── conftest.py                 Puts backend/ on sys.path
│   ├── pytest.ini
│   ├── requirements-dev.txt        pytest, httpx
│   └── .env.example
│
├── frontend/                       React interface (see frontend/README.md)
│
├── scripts/
│   └── seed_notes.py               Load sample notes
│
├── data/
│   └── chroma/                     Vector store (generated, git-ignored)
│
├── .github/workflows/tests.yml     CI: pytest + frontend build
├── .gitignore
├── requirements.txt
└── README.md
```

## ▶️ Running the application

Two processes: the API and the interface.

**Backend**

```bash
env\Scripts\activate            # Windows
pip install -r requirements.txt
python scripts/seed_notes.py    # optional: load 10 sample notes

cd backend                      # uvicorn imports `app`, so start from here
uvicorn app.main:app --reload
```

Seeding writes to the store directly. If the API is already running it keeps
its own view of the database open, so restart it afterwards or searches will
fail with `Nothing found on disk`.

Settings are optional: copy `backend/.env.example` to `backend/.env` to
override any of them. It is read from `backend/`, not the repository root.

The API runs on <http://127.0.0.1:8000>, with interactive documentation at
<http://127.0.0.1:8000/docs>.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The interface runs on <http://localhost:5173> and proxies `/api` to the
backend, so both sides share one origin and no CORS setup is needed.

`frontend/.env.local` controls where the data comes from:

```
VITE_USE_BACKEND=true     # FastAPI + ChromaDB
VITE_USE_BACKEND=false    # browser storage only, no backend required
```

### API endpoints

| Method | Path                       | Purpose                       |
| ------ | -------------------------- | ----------------------------- |
| GET    | `/health`                  | Status, model, note count     |
| GET    | `/documents`               | List notes                    |
| POST   | `/documents`               | Add a note and embed it       |
| GET    | `/documents/{id}`          | Read one note                 |
| PUT    | `/documents/{id}`          | Update and re-embed a note    |
| DELETE | `/documents/{id}`          | Delete a note                 |
| POST   | `/search`                  | Semantic search               |
| GET    | `/documents/{id}/related`  | Semantically similar notes    |

`POST /search` takes `{ query, n_results, threshold }` and returns results
ordered by a `score` from 0 to 1.

### A note on the distance metric

The collection is created with `hnsw:space: cosine`, because ChromaDB's
default is squared L2 — which has no upper bound and so cannot be shown as a
percentage. With cosine, `score = 1 - distance`.

The metric is fixed when the collection is first created. Changing
`DISTANCE_METRIC` in `.env` has no effect on an existing collection; delete
`data/chroma` and let it rebuild.

## 🚀 Development Roadmap

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

## How the frontend should look like
Design a modern, clean, responsive web application called **Semantic Notes** — an AI-powered note-taking and semantic search application.

### Core idea

Users can create and save notes. Each note is converted into an embedding using a Sentence Transformer model and stored in a vector database. Users can then search their notes using natural language, and the application returns the most semantically relevant notes rather than relying only on keyword matching.

### Design style

* Modern SaaS-style interface
* Minimal, professional, and developer-friendly
* Clean white/light background with subtle neutral tones
* Use one primary accent color consistently
* Rounded cards and buttons
* Subtle shadows and borders
* Good spacing and typography
* Responsive design for desktop, tablet, and mobile
* Avoid excessive gradients, unnecessary animations, or visual clutter

### Main layout

Create a left sidebar and main content area.

#### Sidebar

Display:

* Semantic Notes logo/name
* Dashboard
* My Notes
* Semantic Search
* Collections
* Settings

At the bottom:

* User profile/avatar
* User name
* Theme toggle

### Dashboard

The dashboard should provide a quick overview.

Top section:

* Greeting: "Good morning, Zakia 👋"
* Short description: "Capture your ideas and find them by meaning."

Statistics cards:

* Total Notes
* Collections
* Searches
* Embeddings

Main section:

* Large "Search your notes..." search bar
* Recent Notes section
* Recently searched queries
* Quick "Create Note" button

### Create Note page

Provide a clean note editor.

Fields:

* Note title
* Note content
* Optional collection/category
* Tags
* Save Note button

After saving, show a subtle status such as:
"Note saved and embedded successfully."

Do not expose technical embedding details unless the user opens an advanced information section.

### My Notes page

Display notes as cards or a clean list.

Each note should show:

* Title
* Short content preview
* Collection
* Tags
* Created date
* Edit button
* Delete button

Include:

* Search/filter controls
* Sort by newest, oldest, or relevance
* Pagination or infinite scrolling

### Semantic Search page

Make this the most important page visually.

At the top:
Large heading:
"Search your knowledge"

Subtitle:
"Ask a question naturally and find notes based on meaning."

Large search input:
"e.g. How do I prepare for my AI exam?"

Below the search bar:

* Search button
* Number of results selector
* Optional similarity threshold control

Search results should appear as cards.

Each result card should contain:

* Note title
* Relevant content snippet
* Collection
* Tags
* Similarity/relevance score
* Created date
* "Open note" action

Clearly distinguish the best match from lower-ranked matches.

Example:

1. Machine Learning Fundamentals
   "Machine learning models learn patterns from data..."
   Relevance: 87%

2. Deep Learning Notes
   "Deep learning uses neural networks..."
   Relevance: 72%

3. Neural Network Concepts
   "Neural networks are inspired by..."
   Relevance: 68%

### Note details page

When a user opens a note, display:

* Note title
* Full content
* Tags
* Collection
* Created/updated date
* Edit button
* Delete button

Include a small "Related Notes" section at the bottom showing semantically similar notes.

### Collections page

Allow users to organize notes into collections such as:

* AI & Machine Learning
* Software Engineering
* Databases
* Personal Learning
* Projects

Show each collection as a card with:

* Collection name
* Number of notes
* Last updated date

### Empty states

Design helpful empty states.

For example:

"No notes yet"
"Create your first note and start building your semantic knowledge base."

Button:
"+ Create Note"

For search:

"No matching notes found"
"Try describing your idea differently. Semantic search understands meaning, not just keywords."

### Loading states

Include skeleton loaders for:

* Notes
* Search results
* Dashboard statistics

For semantic search, show:
"Understanding your query..."
"Searching your knowledge..."

### Technical/AI information

Include an optional expandable "How it works" section.

Visualize:

User Query
↓
Sentence Transformer
↓
Embedding Vector
↓
Vector Database
↓
Semantic Search
↓
Relevant Notes

Show this in a simple visual diagram so users can understand that the application uses AI embeddings.

### Overall UX

The application should feel like a real production-ready SaaS product rather than a student demo.

Prioritize:

* Easy navigation
* Fast note creation
* Very prominent semantic search
* Clear search results
* Good readability
* Accessible buttons and forms
* Responsive design
* Consistent spacing and typography

The main visual emphasis should communicate:

**"Write naturally. Search by meaning."**

## Testing

The suite runs offline: the services take their store as a constructor
argument, so the tests swap in an in-memory fake instead of ChromaDB and never
load the embedding model.

```bash
pip install -r requirements.txt -r backend/requirements-dev.txt
cd backend
pytest
```

`backend/examples/` holds the earlier print-only learning scripts. They are
kept out of `backend/tests/` because pytest collects by filename, and running
them would load the model and open the real store on every run.

GitHub Actions runs `pytest` and a frontend `npm run build` on every push and
pull request — see `.github/workflows/tests.yml`.
