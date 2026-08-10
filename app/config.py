"""Central configuration.

Values can be overridden with environment variables or a .env file, so the
same code runs locally and anywhere else without edits.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


def _get(name: str, default: str) -> str:
    return os.getenv(name, default)


# --- Storage -----------------------------------------------------------------

CHROMA_PATH = str(BASE_DIR / _get("CHROMA_PATH", "data/chroma"))
COLLECTION_NAME = _get("COLLECTION_NAME", "notes")

# --- Embeddings --------------------------------------------------------------

EMBEDDING_MODEL = _get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Cosine is the right metric for sentence-transformer vectors, and it makes the
# distance map cleanly onto a 0-1 relevance score. ChromaDB defaults to squared
# L2, which does not.
#
# The metric is fixed when the collection is created — changing it later has no
# effect on an existing collection, which must be deleted and rebuilt instead.
DISTANCE_METRIC = _get("DISTANCE_METRIC", "cosine")

# --- Search ------------------------------------------------------------------

DEFAULT_N_RESULTS = int(_get("DEFAULT_N_RESULTS", "5"))
MAX_N_RESULTS = int(_get("MAX_N_RESULTS", "50"))

# --- API ---------------------------------------------------------------------

# The Vite dev server proxies /api to this service, so the browser stays on one
# origin. These origins are for the case where the frontend calls it directly.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in _get(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

DEFAULT_COLLECTION = "Uncategorised"
