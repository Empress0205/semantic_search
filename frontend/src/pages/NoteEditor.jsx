import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { IconArrowLeft, IconChevronDown, IconChevronRight } from '../components/Icons.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { DEFAULT_COLLECTIONS, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from '../config.js'
import { parseTags, wordCount } from '../utils/format.js'
import { tokenize } from '../api/similarity.js'

const EMPTY = { title: '', content: '', collection: '', tags: '' }

export function NoteEditor({ mode = 'create' }) {
  const isEdit = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()
  const { notes, collections, loading, createNote, updateNote } = useNotes()
  const { notify } = useToast()

  const [draft, setDraft] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loadedId, setLoadedId] = useState(null)

  const existing = isEdit ? notes.find((note) => note.id === id) : null

  // Notes arrive asynchronously, so fill the form once the note is available.
  useEffect(() => {
    if (existing && loadedId !== existing.id) {
      setDraft({
        title: existing.title,
        content: existing.content,
        collection: existing.collection,
        tags: existing.tags.join(', '),
      })
      setLoadedId(existing.id)
    }
  }, [existing, loadedId])

  const collectionOptions = useMemo(() => {
    const names = new Set([...DEFAULT_COLLECTIONS, ...collections.map((c) => c.name)])
    return [...names].sort()
  }, [collections])

  const set = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!draft.title.trim()) next.title = 'Give the note a title.'
    if (draft.content.trim().length < 10) {
      next.content = 'Write at least a sentence — embeddings need something to work with.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!validate() || saving) return

    setSaving(true)
    const payload = {
      title: draft.title.trim(),
      content: draft.content.trim(),
      collection: draft.collection.trim() || 'Uncategorised',
      tags: parseTags(draft.tags),
    }

    try {
      if (isEdit) {
        await updateNote(id, payload)
        notify('Note updated and re-embedded successfully.')
        navigate(`/notes/${id}`)
      } else {
        const created = await createNote(payload)
        notify('Note saved and embedded successfully.')
        navigate(`/notes/${created.id}`)
      }
    } catch (err) {
      notify(err.message || 'Could not save the note', 'error')
      setSaving(false)
    }
  }

  if (isEdit && !existing && !loading) {
    return (
      <div className="card empty">
        <h3>Note not found</h3>
        <p>This note may have been deleted.</p>
        <Link to="/notes" className="btn btn-secondary" style={{ marginTop: 8 }}>
          Back to My Notes
        </Link>
      </div>
    )
  }

  const words = wordCount(draft.content)
  const tokens = tokenize(draft.content).length

  return (
    <div className="stack gap-5" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div>
        <Link to={isEdit ? `/notes/${id}` : '/notes'} className="back-link">
          <IconArrowLeft size={15} />
          {isEdit ? 'Back to note' : 'Back to My Notes'}
        </Link>

        <h1 className="page-title">{isEdit ? 'Edit note' : 'Create note'}</h1>
        <p className="page-sub">
          {isEdit
            ? 'Saving regenerates the embedding so search stays accurate.'
            : 'Write it the way you would explain it. Search will handle the wording later.'}
        </p>
      </div>

      <form className="card card-pad stack gap-5" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label className="label" htmlFor="note-title">
            Note title
          </label>
          <input
            id="note-title"
            className="input"
            value={draft.title}
            onChange={set('title')}
            placeholder="e.g. How text embeddings work"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <span id="title-error" className="hint" style={{ color: 'var(--danger)' }}>
              {errors.title}
            </span>
          )}
        </div>

        <div className="field">
          <label className="label" htmlFor="note-content">
            Note content
          </label>
          <textarea
            id="note-content"
            className="textarea"
            rows={12}
            value={draft.content}
            onChange={set('content')}
            placeholder="Write your note…"
            aria-invalid={Boolean(errors.content)}
            aria-describedby={errors.content ? 'content-error' : 'content-hint'}
          />
          {errors.content ? (
            <span id="content-error" className="hint" style={{ color: 'var(--danger)' }}>
              {errors.content}
            </span>
          ) : (
            <span id="content-hint" className="hint">
              {words} {words === 1 ? 'word' : 'words'}
            </span>
          )}
        </div>

        <div className="row gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="field" style={{ flex: '1 1 240px' }}>
            <label className="label" htmlFor="note-collection">
              Collection <span className="subtle">(optional)</span>
            </label>
            <input
              id="note-collection"
              className="input"
              list="collection-options"
              value={draft.collection}
              onChange={set('collection')}
              placeholder="Choose or type a new one"
            />
            <datalist id="collection-options">
              {collectionOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="field" style={{ flex: '1 1 240px' }}>
            <label className="label" htmlFor="note-tags">
              Tags <span className="subtle">(optional)</span>
            </label>
            <input
              id="note-tags"
              className="input"
              value={draft.tags}
              onChange={set('tags')}
              placeholder="embeddings, revision, python"
            />
            <span className="hint">Separate tags with commas.</span>
          </div>
        </div>

        {parseTags(draft.tags).length > 0 && (
          <div className="tag-row">
            {parseTags(draft.tags).map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <hr className="divider" />

        <div className="stack gap-3">
          <button
            type="button"
            className="row gap-2 text-sm muted"
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
            onClick={() => setShowAdvanced((value) => !value)}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? <IconChevronDown size={15} /> : <IconChevronRight size={15} />}
            Advanced information
          </button>

          {showAdvanced && (
            <div className="stack gap-2 text-sm muted" style={{ paddingLeft: 23 }}>
              <span>
                Model: <strong>{EMBEDDING_MODEL}</strong> · {EMBEDDING_DIMENSIONS} dimensions
              </span>
              <span>
                Indexed terms in this note: <strong>{tokens}</strong>
              </span>
              <span>
                Title, content and tags are embedded together, so a tag can pull a
                note into results even when the body never mentions it.
              </span>
            </div>
          )}
        </div>

        <div className="row gap-3" style={{ justifyContent: 'flex-end' }}>
          <Link to={isEdit ? `/notes/${id}` : '/notes'} className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Embedding…
              </>
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Save Note'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
