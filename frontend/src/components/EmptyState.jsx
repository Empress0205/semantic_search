import { Link } from 'react-router-dom'

export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="card empty">
      {Icon && (
        <span className="empty-icon">
          <Icon size={24} />
        </span>
      )}
      <h3>{title}</h3>
      <p>{description}</p>

      {actionTo && (
        <Link to={actionTo} className="btn btn-primary" style={{ marginTop: 8 }}>
          {actionLabel}
        </Link>
      )}

      {!actionTo && onAction && (
        <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
