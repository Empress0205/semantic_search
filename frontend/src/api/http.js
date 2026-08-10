/**
 * Adapter for the FastAPI backend described in the README (Phase 5):
 *
 *   POST /documents
 *   GET  /documents
 *   POST /search
 *
 * Requests go to `/api/*` so Vite's dev proxy forwards them to
 * http://127.0.0.1:8000 without CORS configuration. Override the target with
 * VITE_API_BASE_URL when the backend runs elsewhere.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Request failed (${res.status})`)
  }

  return res.status === 204 ? null : res.json()
}

/**
 * The backend is still taking shape, so field names are read defensively:
 * whichever of the plausible spellings is present wins.
 */
function toNote(raw) {
  return {
    id: String(raw.id ?? raw.document_id ?? crypto.randomUUID()),
    title: raw.title ?? 'Untitled note',
    content: raw.content ?? raw.document ?? raw.text ?? '',
    collection: raw.collection ?? raw.category ?? 'Uncategorised',
    tags: raw.tags ?? raw.metadata?.tags ?? [],
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt:
      raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? new Date().toISOString(),
  }
}

/**
 * ChromaDB returns distances, not similarities. Convert when the backend
 * hands the raw value through, otherwise trust an explicit score.
 */
function toScore(raw) {
  if (typeof raw.score === 'number') return raw.score
  if (typeof raw.similarity === 'number') return raw.similarity
  if (typeof raw.distance === 'number') return 1 / (1 + raw.distance)
  return 0
}

export const httpApi = {
  async listNotes() {
    const data = await request('/documents')
    const items = Array.isArray(data) ? data : data.documents ?? []
    return items.map(toNote)
  },

  async createNote(note) {
    const created = await request('/documents', {
      method: 'POST',
      body: {
        title: note.title,
        content: note.content,
        collection: note.collection,
        tags: note.tags,
      },
    })
    return toNote(created ?? note)
  },

  async updateNote(id, note) {
    const updated = await request(`/documents/${id}`, {
      method: 'PUT',
      body: {
        title: note.title,
        content: note.content,
        collection: note.collection,
        tags: note.tags,
      },
    })
    return toNote(updated ?? { ...note, id })
  },

  async deleteNote(id) {
    await request(`/documents/${id}`, { method: 'DELETE' })
  },

  async related(id, limit = 3) {
    const data = await request(`/documents/${id}/related?limit=${limit}`)
    const items = Array.isArray(data) ? data : data.results ?? []
    return items.map((item) => ({ note: toNote(item), score: toScore(item) }))
  },

  async search({ query, limit = 5, threshold = 0 }) {
    const data = await request('/search', {
      method: 'POST',
      body: { query, n_results: limit, threshold },
    })

    const items = Array.isArray(data) ? data : data.results ?? []
    return items
      .map((item) => ({ note: toNote(item), score: toScore(item) }))
      .filter((r) => r.score >= threshold)
  },
}
