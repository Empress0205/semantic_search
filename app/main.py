"""FastAPI service for Semantic Notes (Phase 5 of the roadmap).

    POST   /documents        add a note
    GET    /documents        list notes
    GET    /documents/{id}   read one note
    PUT    /documents/{id}   update a note
    DELETE /documents/{id}   remove a note
    POST   /search           semantic search

Run it with:  uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import (
    ALLOWED_ORIGINS,
    DEFAULT_N_RESULTS,
    DISTANCE_METRIC,
    EMBEDDING_MODEL,
    MAX_N_RESULTS,
)
from app.database.chroma_db import ChromaDBService
from app.documents.document_service import DocumentService
from app.search.semantic_search import SemanticSearch

# Built once at startup and shared. Loading a Sentence Transformer per request
# is the usual reason an embedding API feels slow.
_services = {}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    db = ChromaDBService()
    _services["db"] = db
    _services["documents"] = DocumentService(db)
    _services["search"] = SemanticSearch(db)
    yield
    _services.clear()


app = FastAPI(
    title="Semantic Notes API",
    description="Add notes, embed them, and search them by meaning.",
    version="1.0.0",
    lifespan=lifespan,
)

# Not needed when the Vite dev proxy is used, but required if the frontend
# ever calls this service directly from another origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_documents() -> DocumentService:
    return _services["documents"]


def get_search() -> SemanticSearch:
    return _services["search"]


# --- Schemas -----------------------------------------------------------------


class NoteIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    collection: str | None = Field(default=None, max_length=100)
    tags: list[str] = Field(default_factory=list)


class NoteOut(BaseModel):
    id: str
    title: str
    content: str
    collection: str
    tags: list[str]
    created_at: str | None = None
    updated_at: str | None = None


class SearchResult(NoteOut):
    score: float
    distance: float


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    n_results: int = Field(default=DEFAULT_N_RESULTS, ge=1, le=MAX_N_RESULTS)
    threshold: float = Field(default=0.0, ge=0.0, le=1.0)


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[SearchResult]


# --- Routes ------------------------------------------------------------------


@app.get("/health", tags=["meta"])
def health(documents: DocumentService = Depends(get_documents)):
    return {
        "status": "ok",
        "model": EMBEDDING_MODEL,
        "distance_metric": DISTANCE_METRIC,
        "notes": documents.count(),
    }


@app.get("/documents", response_model=list[NoteOut], tags=["documents"])
def list_documents(documents: DocumentService = Depends(get_documents)):
    return documents.list_notes()


@app.post(
    "/documents",
    response_model=NoteOut,
    status_code=status.HTTP_201_CREATED,
    tags=["documents"],
)
def create_document(
    payload: NoteIn, documents: DocumentService = Depends(get_documents)
):
    return documents.create_note(
        title=payload.title,
        content=payload.content,
        collection=payload.collection,
        tags=payload.tags,
    )


@app.get("/documents/{note_id}", response_model=NoteOut, tags=["documents"])
def read_document(note_id: str, documents: DocumentService = Depends(get_documents)):
    note = documents.get_note(note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@app.put("/documents/{note_id}", response_model=NoteOut, tags=["documents"])
def update_document(
    note_id: str,
    payload: NoteIn,
    documents: DocumentService = Depends(get_documents),
):
    note = documents.update_note(
        note_id,
        title=payload.title,
        content=payload.content,
        collection=payload.collection,
        tags=payload.tags,
    )
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@app.delete(
    "/documents/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["documents"],
)
def delete_document(note_id: str, documents: DocumentService = Depends(get_documents)):
    if not documents.delete_note(note_id):
        raise HTTPException(status_code=404, detail="Note not found")


@app.post("/search", response_model=SearchResponse, tags=["search"])
def search(payload: SearchRequest, engine: SemanticSearch = Depends(get_search)):
    results = engine.search(
        query=payload.query,
        n_results=payload.n_results,
        threshold=payload.threshold,
    )
    return {"query": payload.query, "count": len(results), "results": results}


@app.get(
    "/documents/{note_id}/related",
    response_model=list[SearchResult],
    tags=["search"],
)
def related_documents(
    note_id: str,
    limit: int = 3,
    documents: DocumentService = Depends(get_documents),
    engine: SemanticSearch = Depends(get_search),
):
    if documents.get_note(note_id) is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return engine.related(note_id, n_results=limit)
