import { Link, useNavigate } from 'react-router-dom'
import { formatRelative } from '../utils/format.js'
import { IconEdit, IconTrash } from './Icons.jsx'

export function NoteCard({ note, onDelete }) {
  const navigate = useNavigate()

  return (
    <article className="card card-link note-card">
      <Link to={`/notes/${note.id}`} className="stack gap-3">
        <h3 className="note-card-title">{note.title}</h3>
        <p className="note-card-body clamp-3">{note.content}</p>
      </Link>

      <div className="note-card-foot">
        <span className="tag tag-accent">{note.collection}</span>
        {note.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
        {note.tags.length > 2 && <span className="tag">+{note.tags.length - 2}</span>}

        <div className="card-actions">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => navigate(`/notes/${note.id}/edit`)}
            aria-label={`Edit ${note.title}`}
            title="Edit"
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => onDelete(note)}
            aria-label={`Delete ${note.title}`}
            title="Delete"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      <span className="text-xs subtle">Created {formatRelative(note.createdAt)}</span>
    </article>
  )
}
