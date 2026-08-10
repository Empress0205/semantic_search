import { Link } from 'react-router-dom'
import { IconSearch } from '../components/Icons.jsx'

export function NotFound() {
  return (
    <div className="card empty">
      <span className="empty-icon">
        <IconSearch size={24} />
      </span>
      <h3>Page not found</h3>
      <p>That link does not lead anywhere in your workspace.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>
        Back to Dashboard
      </Link>
    </div>
  )
}
