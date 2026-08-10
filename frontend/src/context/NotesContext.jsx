import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../api/index.js'
import { SEED_QUERIES } from '../api/seed.js'

const NotesContext = createContext(null)

const HISTORY_KEY = 'semantic-notes:history'
const SEARCH_COUNT_KEY = 'semantic-notes:search-count'
const MAX_HISTORY = 6

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return SEED_QUERIES
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : SEED_QUERIES
  } catch {
    return SEED_QUERIES
  }
}

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState(readHistory)
  const [searchCount, setSearchCount] = useState(
    () => Number(localStorage.getItem(SEARCH_COUNT_KEY)) || 0
  )

  useEffect(() => {
    let cancelled = false

    api
      .listNotes()
      .then((data) => {
        if (!cancelled) setNotes(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load notes')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem(SEARCH_COUNT_KEY, String(searchCount))
  }, [searchCount])

  const createNote = useCallback(async (draft) => {
    const created = await api.createNote(draft)
    setNotes((current) => [created, ...current])
    return created
  }, [])

  const updateNote = useCallback(async (id, patch) => {
    const updated = await api.updateNote(id, patch)
    setNotes((current) => current.map((n) => (n.id === id ? updated : n)))
    return updated
  }, [])

  const deleteNote = useCallback(async (id) => {
    await api.deleteNote(id)
    setNotes((current) => current.filter((n) => n.id !== id))
  }, [])

  const search = useCallback(async (params) => {
    const results = await api.search(params)
    const query = params.query.trim()

    if (query) {
      setSearchCount((count) => count + 1)
      setHistory((current) =>
        [query, ...current.filter((q) => q !== query)].slice(0, MAX_HISTORY)
      )
    }

    return results
  }, [])

  const getNote = useCallback((id) => notes.find((n) => n.id === id), [notes])

  /** Semantically nearest notes to an existing one. */
  const getRelated = useCallback((id, limit = 3) => api.related(id, limit), [])

  /** Collections are derived from the notes rather than stored separately. */
  const collections = useMemo(() => {
    const grouped = new Map()

    for (const note of notes) {
      const name = note.collection || 'Uncategorised'
      const entry = grouped.get(name) ?? { name, count: 0, updatedAt: note.updatedAt }
      entry.count += 1
      if (note.updatedAt > entry.updatedAt) entry.updatedAt = note.updatedAt
      grouped.set(name, entry)
    }

    return [...grouped.values()].sort((a, b) => b.count - a.count)
  }, [notes])

  const value = useMemo(
    () => ({
      notes,
      collections,
      loading,
      error,
      history,
      searchCount,
      createNote,
      updateNote,
      deleteNote,
      search,
      getNote,
      getRelated,
    }),
    [
      notes,
      collections,
      loading,
      error,
      history,
      searchCount,
      createNote,
      updateNote,
      deleteNote,
      search,
      getNote,
      getRelated,
    ]
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) throw new Error('useNotes must be used inside NotesProvider')
  return context
}
