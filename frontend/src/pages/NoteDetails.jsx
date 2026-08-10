import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { NoteCardSkeleton, Repeat, Skeleton } from '../components/Skeleton.jsx'
import { IconArrowLeft, IconEdit, IconTrash } from '../components/Icons.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatDate, formatRelative, wordCount } from '../utils/format.js'

export function NoteDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notes, loading, deleteNote, getRelated } = useNotes()
  const { notify } = useToast()

  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [related, setRelated] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(true)

  const note = notes.find((item) => item.id === id)

  /** Neighbours of this note in the vector space — the same idea as search,
   *  but the note itself is the query. */
  useEffect(() => {
    if (!note) return

    let cancelled = false
    setLoadingRelated(true)

    getRelated(note.id, 3)
      .then((found) => {
        if (!cancelled) setRelated(found)
      })
      .catch(() => {
        if (!cancelled) setRelated([])
      })
      .finally(() => {
        if (!cancelled) setLoadingRelated(false)
      })

    return () => {
      cancelled = true
    }
    // `notes` is excluded deliberately: only a change of note should refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id, note?.updatedAt, getRelated])

  const remove = async () => {
    setDeleting(true)
    try {
      await deleteNote(note.id)
      notify('Note deleted.')
      navigate('/notes')
    } catch (err) {
      notify(err.message || 'Could not delete the note', 'error')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="card note-detail stack gap-4">
        <Skeleton width="55%" height={26} />
        <Skeleton width="35%" height={12} />
        <div className="stack gap-3" style={{ marginTop: 12 }}>
          <Skeleton height={12} />
          <Skeleton height={12} />
          <Skeleton width="85%" height={12} />
          <Skeleton width="92%" height={12} />
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="card empty">
        <h3>Note not found</h3>
        <p>This note may have been deleted, or the link is out of date.</p>
        <Link to="/notes" className="btn btn-secondary" style={{ marginTop: 8 }}>
          Back to My Notes
        </Link>
      </div>
    )
  }

  return (
    <div className="stack gap-5">
      <div>
        <Link to="/notes" className="back-link">
          <IconArrowLeft size={15} />
          Back to My Notes
        </Link>

        <article className="card note-detail">
          <div className="page-head" style={{ marginBottom: 16 }}>
            <div className="stack gap-3">
              <h1 className="page-title">{note.title}</h1>
              <div className="meta-row">
                <span>Created {formatDate(note.createdAt)}</span>
                <span>·</span>
                <span>Updated {formatRelative(note.updatedAt)}</span>
                <span>·</span>
                <span>{wordCount(note.content)} words</span>
              </div>
            </div>

            <div className="row gap-2">
              <Link to={`/notes/${note.id}/edit`} className="btn btn-secondary">
                <IconEdit size={16} />
                Edit
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setConfirming(true)}
              >
                <IconTrash size={16} />
                Delete
              </button>
            </div>
          </div>

          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to={`/notes?collection=${encodeURIComponent(note.collection)}`}>
              <span className="tag tag-accent">{note.collection}</span>
            </Link>
            {note.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>

          <div className="note-detail-content">{note.content}</div>
        </article>
      </div>

      <section>
        <div className="section-head">
          <h2>Related Notes</h2>
          <span className="text-sm subtle">Found by meaning, not by tag</span>
        </div>

        {loadingRelated ? (
          <div className="note-grid">
            <Repeat count={3}>{(i) => <NoteCardSkeleton key={i} />}</Repeat>
          </div>
        ) : related.length === 0 ? (
          <div className="card card-pad">
            <p className="text-sm muted">
              Nothing else in your workspace sits close to this note yet. Add more
              notes on the subject and they will appear here.
            </p>
          </div>
        ) : (
          <div className="note-grid">
            {related.map(({ note: item, score }) => (
              <Link
                key={item.id}
                to={`/notes/${item.id}`}
                className="card card-link note-card"
              >
                <div className="row gap-3" style={{ justifyContent: 'space-between' }}>
                  <h3 className="note-card-title">{item.title}</h3>
                  <span className="tag tag-success">{Math.round(score * 100)}%</span>
                </div>
                <p className="note-card-body clamp-2">{item.content}</p>
                <div className="note-card-foot">
                  <span className="tag tag-accent">{item.collection}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {confirming && (
        <ConfirmDialog
          title="Delete this note?"
          message={`"${note.title}" and its embedding will be removed. This cannot be undone.`}
          busy={deleting}
          onCancel={() => setConfirming(false)}
          onConfirm={remove}
        />
      )}
    </div>
  )
}
