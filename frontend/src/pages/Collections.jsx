import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState.jsx'
import { Repeat, Skeleton } from '../components/Skeleton.jsx'
import { IconCollections, IconPlus } from '../components/Icons.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { formatRelative } from '../utils/format.js'

export function Collections() {
  const { collections, notes, loading } = useNotes()

  return (
    <div className="stack gap-5">
      <header className="page-head">
        <div>
          <h1 className="page-title">Collections</h1>
          <p className="page-sub">
            Group related notes so a subject stays together as it grows.
          </p>
        </div>

        <Link to="/notes/new" className="btn btn-primary">
          <IconPlus size={17} />
          Create Note
        </Link>
      </header>

      {loading ? (
        <div className="collection-grid">
          <Repeat count={5}>
            {(i) => (
              <div key={i} className="card collection-card">
                <Skeleton width={40} height={40} radius={12} />
                <div className="stack gap-2">
                  <Skeleton width="60%" height={15} />
                  <Skeleton width="40%" height={11} />
                </div>
              </div>
            )}
          </Repeat>
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={IconCollections}
          title="No collections yet"
          description="Collections appear automatically once you assign one while creating a note."
          actionLabel="+ Create Note"
          actionTo="/notes/new"
        />
      ) : (
        <div className="collection-grid">
          {collections.map((collection) => (
            <Link
              key={collection.name}
              to={`/notes?collection=${encodeURIComponent(collection.name)}`}
              className="card card-link collection-card"
            >
              <span className="collection-swatch">
                <IconCollections size={20} />
              </span>

              <div className="stack gap-1">
                <h3 style={{ fontSize: 15 }}>{collection.name}</h3>
                <span className="text-sm muted">
                  {collection.count} {collection.count === 1 ? 'note' : 'notes'}
                </span>
              </div>

              <span className="text-xs subtle" style={{ marginTop: 'auto' }}>
                Updated {formatRelative(collection.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && notes.length > 0 && (
        <p className="text-sm subtle">
          Collections are derived from your notes — assign one while writing and it
          appears here automatically.
        </p>
      )}
    </div>
  )
}
