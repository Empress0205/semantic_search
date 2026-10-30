# Semantic Notes Search

[![Tests](https://github.com/Empress0205/semantic_search/actions/workflows/tests.yml/badge.svg)](https://github.com/Empress0205/semantic_search/actions/workflows/tests.yml)

A note-taking app where you search by **meaning, not keywords**. Each note is turned into a vector embedding with Sentence Transformers and stored in ChromaDB. With the sample notes loaded, a query like *"how do LLMs answer questions using my documents"* surfaces the note *"Retrieval-Augmented Generation"*, even though the wording barely overlaps.

## Features

- Create, edit and delete notes; each note is embedded automatically
- Natural-language semantic search with a 0–1 relevance score and an adjustable threshold
- "Related notes" for any note, found by vector similarity
- React interface that can run against the FastAPI backend or entirely in the browser
- Offline test suite (no model download) running in GitHub Actions

## Architecture

```text
React UI ──► FastAPI ──► Sentence Transformer ──► embedding
                │                                    │
                └──────────── ChromaDB ◄─────────────┘
                     (cosine similarity search)
```

## Tech stack

Python 3.11 · FastAPI · Sentence Transformers · ChromaDB · React · Vite · pytest · GitHub Actions

## Project structure

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

## Running the application

Two processes: the API and the interface.

**Backend**

```bash
python -m venv env
source env/bin/activate         # Windows: env\Scripts\activate
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

## Roadmap

Phases 1–6 (embeddings → similarity → ChromaDB → search → API → UI) are complete. Next: extending search into a RAG system (chunking, retrieved context and an LLM-generated answer). See [docs/LEARNING_JOURNEY.md](docs/LEARNING_JOURNEY.md) for how the project was built step by step.
