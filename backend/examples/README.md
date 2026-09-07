# Learning scripts

Standalone scripts from working through the roadmap: they print results
rather than assert anything, and several load the embedding model or touch
the real vector store.

They are kept out of `backend/tests/` on purpose — pytest collects by
filename, so living there meant every CI run executed them.

Run one directly:

    python examples/chroma_demo.py

The automated suite is in `backend/tests/`.
