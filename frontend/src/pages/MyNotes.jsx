import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { NoteCard } from '../components/NoteCard.jsx'
import { NoteCardSkeleton, Repeat } from '../components/Skeleton.jsx'
import { IconNotes, IconPlus, IconSearch } from '../components/Icons.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { cosineSimilarity, embed } from '../api/similarity.js'

const PAGE_SIZE = 6

export function MyNotes() {
  const { notes, collections, loading, deleteNote } = useNotes()
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()

  const [filter, setFilter] = useState('')
  const [collection, setCollection] = useState(params.get('collection') ?? 'all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const visible = useMemo(() => {
    let list = notes

    if (collection !== 'all') {
      list = list.filter((note) => note.collection === collection)
    }

    const trimmed = filter.trim()
    if (trimmed) {
      // "Relevance" reuses the similarity helper so the ordering matches what
      // the search page would return; the other sorts are plain metadata sorts.
      const queryVector = embed(trimmed)
      const lower = trimmed.toLowerCase()

      list = list
        .map((note) => ({
          note,
          score: cosineSimilarity(
            queryVector,
            embed(`${note.title} ${note.content} ${note.tags.join(' ')}`)
          ),
        }))
        .filter(
          ({ note, score }) =>
            score > 0.02 ||
            note.title.toLowerCase().includes(lower) ||
            note.content.toLowerCase().includes(lower)
        )
        .sort((a, b) => b.score - a.score)
        .map(({ note }) => note)
    }

    if (sort === 'newest') {
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    } else if (sort === 'relevance' && !trimmed) {
      list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }

    return list
  }, [notes, collection, filter, sort])

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageItems = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const changeCollection = (value) => {
    setCollection(value)
    setPage(1)
    setParams(value === 'all' ? {} : { collection: value }, { replace: true })
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteNote(pendingDelete.id)
      notify('Note deleted.')
      setPendingDelete(null)
    } catch (err) {
      notify(err.message || 'Could not delete the note', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="stack gap-5">
      <header className="page-head">
        <div>
          <h1 className="page-title">My Notes</h1>
          <p className="page-sub">
            {loading
              ? 'Loading your knowledge base…'
              : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} across ${
                  collections.length
                } ${collections.length === 1 ? 'collection' : 'collections'}`}
          </p>
        </div>

        <Link to="/notes/new" className="btn btn-primary">
          <IconPlus size={17} />
          Create Note
        </Link>
      </header>

      <div className="toolbar">
        <div className="searchbar">
          <span className="muted row">
            <IconSearch size={17} />
          </span>
          <label htmlFor="note-filter" className="sr-only">
            Filter notes
          </label>
          <input
            id="note-filter"
            type="search"
            value={filter}
            placeholder="Filter notes…"
            autoComplete="off"
            onChange={(event) => {
              setFilter(event.target.value)
              setPage(1)
            }}
          />
        </div>

        <label htmlFor="collection-filter" className="sr-only">
          Collection
        </label>
        <select
          id="collection-filter"
          className="select"
          style={{ width: 'auto' }}
          value={collection}
          onChange={(event) => changeCollection(event.target.value)}
        >
          <option value="all">All collections</option>
          {collections.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} ({item.count})
            </option>
          ))}
        </select>

        <label htmlFor="sort-order" className="sr-only">
          Sort order
        </label>
        <select
          id="sort-order"
          className="select"
          style={{ width: 'auto' }}
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="relevance">Relevance</option>
        </select>
      </div>

      {loading ? (
        <div className="note-grid">
          <Repeat count={6}>{(i) => <NoteCardSkeleton key={i} />}</Repeat>
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={IconNotes}
          title="No notes yet"
          description="Create your first note and start building your semantic knowledge base."
          actionLabel="+ Create Note"
          actionTo="/notes/new"
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="No matching notes found"
          description="Try describing your idea differently. Semantic search understands meaning, not just keywords."
          actionLabel="Clear filters"
          onAction={() => {
            setFilter('')
            changeCollection('all')
          }}
        />
      ) : (
        <>
          <div className="note-grid">
            {pageItems.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={setPendingDelete} />
            ))}
          </div>

          {pageCount > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPage(current - 1)}
                disabled={current === 1}
              >
                Previous
              </button>
              <span className="text-sm muted">
                Page {current} of {pageCount}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPage(current + 1)}
                disabled={current === pageCount}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this note?"
          message={`"${pendingDelete.title}" and its embedding will be removed. This cannot be undone.`}
          busy={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
