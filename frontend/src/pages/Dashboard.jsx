import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState.jsx'
import { HowItWorks } from '../components/HowItWorks.jsx'
import { NoteCardSkeleton, Repeat, StatCardSkeleton } from '../components/Skeleton.jsx'
import { StatCard } from '../components/StatCard.jsx'
import {
  IconClock,
  IconCollections,
  IconLayers,
  IconNotes,
  IconPlus,
  IconSearch,
  IconTrend,
  IconVector,
} from '../components/Icons.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { EMBEDDING_DIMENSIONS, USER } from '../config.js'
import { formatRelative, greetingFor } from '../utils/format.js'

export function Dashboard() {
  const { notes, collections, loading, history, searchCount } = useNotes()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const runSearch = (event) => {
    event.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const recent = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)

  return (
    <div className="stack gap-6">
      <header className="page-head">
        <div>
          <h1 className="greeting">
            {greetingFor()}, {USER.name} <span aria-hidden="true">👋</span>
          </h1>
          <p className="page-sub">Capture your ideas and find them by meaning.</p>
        </div>

        <Link to="/notes/new" className="btn btn-primary">
          <IconPlus size={17} />
          Create Note
        </Link>
      </header>

      <div className="stat-grid">
        {loading ? (
          <Repeat count={4}>{(i) => <StatCardSkeleton key={i} />}</Repeat>
        ) : (
          <>
            <StatCard icon={IconNotes} label="Total Notes" value={notes.length} />
            <StatCard icon={IconCollections} label="Collections" value={collections.length} />
            <StatCard icon={IconTrend} label="Searches" value={searchCount} />
            <StatCard
              icon={IconLayers}
              label="Embeddings"
              value={notes.length}
              hint={`${EMBEDDING_DIMENSIONS} dimensions each`}
            />
          </>
        )}
      </div>

      <form onSubmit={runSearch} role="search">
        <label htmlFor="dash-search" className="sr-only">
          Search your notes
        </label>
        <div className="searchbar searchbar-lg">
          <span className="muted row">
            <IconSearch size={20} />
          </span>
          <input
            id="dash-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your notes…"
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary" disabled={!query.trim()}>
            Search
          </button>
        </div>
      </form>

      <div className="dash-columns">
        <section>
          <div className="section-head">
            <h2>Recent Notes</h2>
            <Link to="/notes" className="text-sm" style={{ color: 'var(--accent)', fontWeight: 550 }}>
              View all
            </Link>
          </div>

          {loading ? (
            <div className="note-grid">
              <Repeat count={4}>{(i) => <NoteCardSkeleton key={i} />}</Repeat>
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={IconNotes}
              title="No notes yet"
              description="Create your first note and start building your semantic knowledge base."
              actionLabel="+ Create Note"
              actionTo="/notes/new"
            />
          ) : (
            <div className="note-grid">
              {recent.map((note) => (
                <Link key={note.id} to={`/notes/${note.id}`} className="card card-link note-card">
                  <h3 className="note-card-title">{note.title}</h3>
                  <p className="note-card-body clamp-2">{note.content}</p>
                  <div className="note-card-foot">
                    <span className="tag tag-accent">{note.collection}</span>
                    <span className="text-xs subtle" style={{ marginLeft: 'auto' }}>
                      {formatRelative(note.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="stack gap-5">
          <section className="card card-pad">
            <div className="section-head">
              <h2 style={{ fontSize: 15 }}>Recent searches</h2>
            </div>

            {history.length === 0 ? (
              <p className="text-sm subtle">Your recent queries will appear here.</p>
            ) : (
              <div className="stack" style={{ margin: '0 -8px' }}>
                {history.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="recent-query"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(item)}`)}
                  >
                    <IconClock size={15} />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="card card-pad stack gap-3">
            <span className="stat-icon">
              <IconVector size={18} />
            </span>
            <h2 style={{ fontSize: 15 }}>Write naturally. Search by meaning.</h2>
            <p className="text-sm muted">
              Ask a question the way you would ask a person. Semantic search
              matches ideas, not just words.
            </p>
            <Link to="/search" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
              Try semantic search
            </Link>
          </section>
        </aside>
      </div>

      <HowItWorks />
    </div>
  )
}
