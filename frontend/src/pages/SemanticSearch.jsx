import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState.jsx'
import { HowItWorks } from '../components/HowItWorks.jsx'
import { ResultCard } from '../components/ResultCard.jsx'
import { Repeat, ResultCardSkeleton } from '../components/Skeleton.jsx'
import { IconSearch, IconSparkle } from '../components/Icons.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const SUGGESTIONS = [
  'How do I prepare for my AI exam?',
  'Where are note vectors stored?',
  'What makes two sentences similar?',
  'How does retrieval improve an LLM answer?',
]

/** Shown in sequence so the two stages of a query are visible to the user. */
const STAGES = ['Understanding your query…', 'Searching your knowledge…']

export function SemanticSearch() {
  const { search, history } = useNotes()
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [limit, setLimit] = useState(5)
  const [threshold, setThreshold] = useState(0)
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [stage, setStage] = useState(0)
  const [lastQuery, setLastQuery] = useState('')

  const inputRef = useRef(null)
  // Tracks the newest request so a slow earlier one cannot overwrite it.
  const requestId = useRef(0)

  const runSearch = useCallback(
    async (rawQuery, overrides = {}) => {
      const trimmed = rawQuery.trim()
      if (!trimmed) return

      const id = ++requestId.current
      setSearching(true)
      setStage(0)
      setLastQuery(trimmed)

      const stageTimer = setTimeout(() => setStage(1), 450)

      try {
        const found = await search({
          query: trimmed,
          limit,
          threshold,
          ...overrides,
        })
        if (id === requestId.current) setResults(found)
      } catch (err) {
        if (id === requestId.current) {
          setResults([])
          notify(err.message || 'Search failed', 'error')
        }
      } finally {
        clearTimeout(stageTimer)
        if (id === requestId.current) setSearching(false)
      }
    },
    [search, limit, threshold, notify]
  )

  // A ?q= in the URL runs immediately, so links from the dashboard work.
  useEffect(() => {
    const initial = params.get('q')
    if (initial) {
      setQuery(initial)
      runSearch(initial)
    } else {
      inputRef.current?.focus()
    }
    // Intentionally runs once: later searches are driven by the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = (event) => {
    event.preventDefault()
    if (!query.trim()) return
    setParams({ q: query.trim() }, { replace: true })
    runSearch(query)
  }

  const pickSuggestion = (suggestion) => {
    setQuery(suggestion)
    setParams({ q: suggestion }, { replace: true })
    runSearch(suggestion)
  }

  return (
    <div className="stack gap-6">
      <header className="search-hero">
        <h1>Search your knowledge</h1>
        <p>Ask a question naturally and find notes based on meaning.</p>
      </header>

      <section>
        <form onSubmit={onSubmit} role="search">
          <label htmlFor="semantic-query" className="sr-only">
            Search query
          </label>
          <div className="searchbar searchbar-lg">
            <span className="muted row">
              <IconSearch size={20} />
            </span>
            <input
              ref={inputRef}
              id="semantic-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. How do I prepare for my AI exam?"
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={searching || !query.trim()}
            >
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>

          <div className="search-controls">
            <div className="control">
              <label htmlFor="result-count">Results</label>
              <select
                id="result-count"
                className="select"
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
              >
                {[3, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="control">
              <label htmlFor="threshold">Minimum similarity</label>
              <input
                id="threshold"
                type="range"
                min="0"
                max="0.7"
                step="0.05"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
              <span style={{ minWidth: 34, fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(threshold * 100)}%
              </span>
            </div>

            <span className="spacer" />

            {results !== null && !searching && (
              <span className="text-sm subtle">
                {results.length} {results.length === 1 ? 'result' : 'results'} for
                &ldquo;{lastQuery}&rdquo;
              </span>
            )}
          </div>
        </form>

        {results === null && !searching && (
          <div className="suggestions">
            {(history.length ? history : SUGGESTIONS).slice(0, 4).map((item) => (
              <button
                key={item}
                type="button"
                className="suggestion"
                onClick={() => pickSuggestion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </section>

      {searching && (
        <section className="stack gap-3">
          <div className="card search-status">
            <span className="spinner" />
            {STAGES[stage]}
          </div>
          <div className="stack gap-3">
            <Repeat count={3}>{(i) => <ResultCardSkeleton key={i} />}</Repeat>
          </div>
        </section>
      )}

      {!searching && results !== null && results.length > 0 && (
        <section className="stack gap-3">
          {results.map((result, index) => (
            <ResultCard
              key={result.note.id}
              result={result}
              rank={index + 1}
              query={lastQuery}
            />
          ))}
        </section>
      )}

      {!searching && results !== null && results.length === 0 && (
        <EmptyState
          icon={IconSearch}
          title="No matching notes found"
          description="Try describing your idea differently. Semantic search understands meaning, not just keywords."
          actionLabel="Lower the similarity threshold"
          onAction={() => {
            setThreshold(0)
            runSearch(lastQuery, { threshold: 0 })
          }}
        />
      )}

      {!searching && results === null && (
        <section className="card empty">
          <span className="empty-icon">
            <IconSparkle size={24} />
          </span>
          <h3>Ask anything about your notes</h3>
          <p>
            Semantic search compares the meaning of your question with the
            meaning of every note, so you do not have to remember exact wording.
          </p>
        </section>
      )}

      <HowItWorks />
    </div>
  )
}
