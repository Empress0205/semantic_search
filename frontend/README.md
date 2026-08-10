# Semantic Notes — Frontend

React interface for the Semantic Notes project. Implements Phase 6 of the
roadmap: create notes, browse them, and search them by meaning.

## Running it

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

`.env.local` sets `VITE_USE_BACKEND=true`, so the app talks to the FastAPI
service. Start that first (`uvicorn app.main:app --reload` from the project
root) or the notes list will fail to load.

## Running without a backend

Set `VITE_USE_BACKEND=false` in `frontend/.env.local`. Notes then live in
browser localStorage and search uses an approximate local similarity function,
which is useful for working on the interface alone.

## How it talks to the backend

Requests go to `/api/*`, which the Vite dev server proxies to
`http://127.0.0.1:8000`. Point somewhere else with `VITE_API_BASE_URL`.

| Method | Path                      | Purpose            |
| ------ | ------------------------- | ------------------ |
| GET    | `/documents`              | List notes         |
| POST   | `/documents`              | Create a note      |
| PUT    | `/documents/{id}`         | Update a note      |
| DELETE | `/documents/{id}`         | Delete a note      |
| POST   | `/search`                 | Semantic search    |
| GET    | `/documents/{id}/related` | Similar notes      |

`POST /search` takes `{ query, n_results, threshold }`. Responses are read
leniently: a result may carry `score`, `similarity`, or a raw ChromaDB
`distance` (converted to a similarity automatically), and a note may use
`content`, `document`, or `text` for its body.

Only `src/api/http.js` needs changing if the real API ends up shaped
differently.

## Layout

```
src/
├── api/
│   ├── index.js       Picks the data source from VITE_USE_BACKEND
│   ├── http.js        FastAPI adapter
│   ├── local.js       localStorage adapter (same interface)
│   ├── similarity.js  Stand-in for the Sentence Transformer
│   └── seed.js        Sample notes
├── components/        Layout, sidebar, cards, skeletons, dialogs, icons
├── context/           Notes store, theme, toasts
├── pages/             Dashboard, MyNotes, NoteEditor, NoteDetails,
│                      SemanticSearch, Collections, Settings
├── styles/            tokens.css (design tokens) + global.css + app.css
└── config.js          User, default collections, model constants
```

## Notes on the local similarity

`src/api/similarity.js` is **not** a real embedding model. It tokenises text,
expands terms through a small concept map so related words overlap, weights
them by inverse document frequency, and compares with cosine similarity. That
is enough to develop and demonstrate the interface, but it does not generalise
the way `all-MiniLM-L6-v2` does — switching `VITE_USE_BACKEND` to `true`
replaces it entirely.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build
```
