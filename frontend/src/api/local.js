/**
 * Browser-local implementation of the same interface as `httpApi`.
 *
 * Notes live in localStorage and search runs through the approximate
 * similarity in `similarity.js`, so the whole interface is usable before the
 * FastAPI backend exists. Latency is simulated so loading and skeleton states
 * are actually exercised during development.
 */

import { SEED_NOTES } from './seed.js'
import { buildIdf, cosineSimilarity, embed } from './similarity.js'

const STORAGE_KEY = 'semantic-notes:notes'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTES))
      return [...SEED_NOTES]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return [...SEED_NOTES]
  }
}

function write(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // A full or unavailable storage quota should not break the session.
  }
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `n${Date.now()}${Math.random().toString(16).slice(2)}`

export const localApi = {
  async listNotes() {
    await delay(320)
    return read()
  },

  async createNote(note) {
    await delay(650) // Roughly the cost of generating an embedding.
    const now = new Date().toISOString()
    const created = {
      id: newId(),
      title: note.title.trim(),
      content: note.content.trim(),
      collection: note.collection?.trim() || 'Uncategorised',
      tags: note.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }
    write([created, ...read()])
    return created
  },

  async updateNote(id, patch) {
    await delay(550)
    const notes = read()
    const index = notes.findIndex((n) => n.id === id)
    if (index === -1) throw new Error('Note not found')

    const updated = {
      ...notes[index],
      ...patch,
      collection: patch.collection?.trim() || notes[index].collection,
      updatedAt: new Date().toISOString(),
    }
    notes[index] = updated
    write(notes)
    return updated
  },

  async deleteNote(id) {
    await delay(260)
    write(read().filter((n) => n.id !== id))
  },

  async related(id, limit = 3) {
    await delay(400)

    const notes = read()
    const source = notes.find((n) => n.id === id)
    if (!source) return []

    const asText = (n) => `${n.title} ${n.content} ${n.tags.join(' ')}`
    const sourceVector = embed(asText(source))

    return notes
      .filter((n) => n.id !== id)
      .map((note) => ({ note, score: cosineSimilarity(sourceVector, embed(asText(note))) }))
      .filter((r) => r.score > 0.03)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  },

  async search({ query, limit = 5, threshold = 0 }) {
    await delay(700) // Embedding the query, then querying the vector store.

    const notes = read()
    if (!query.trim() || notes.length === 0) return []

    const corpus = notes.map((n) => `${n.title} ${n.content} ${n.tags.join(' ')}`)
    const idf = buildIdf([...corpus, query])
    const queryVector = embed(query)

    return notes
      .map((note, i) => {
        // The title carries more signal than the body, so weight it up.
        const titleScore = cosineSimilarity(queryVector, embed(note.title), idf)
        const bodyScore = cosineSimilarity(queryVector, embed(corpus[i]), idf)
        return { note, score: Math.min(1, bodyScore * 0.75 + titleScore * 0.45) }
      })
      .filter((r) => r.score >= Math.max(threshold, 0.02))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  },
}
