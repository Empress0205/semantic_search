import { Link } from 'react-router-dom'
import { bestSnippet, tokenize } from '../api/similarity.js'
import { formatDate } from '../utils/format.js'
import { IconChevronRight } from './Icons.jsx'

/** Highlights query words inside the snippet without using dangerouslySetInnerHTML. */
function highlight(text, query) {
  const terms = new Set(tokenize(query))
  if (terms.size === 0) return text

  return text.split(/(\s+)/).map((chunk, i) => {
    const bare = chunk.toLowerCase().replace(/[^a-z0-9]/g, '')
    const isMatch = bare.length > 2 && [...terms].some((t) => bare.startsWith(t.slice(0, 4)))
    return isMatch ? <mark key={i}>{chunk}</mark> : chunk
  })
}

export function ResultCard({ result, rank, query }) {
  const { note, score } = result
  const percent = Math.round(score * 100)
  const isBest = rank === 1

  return (
    <article className={`card result-card${isBest ? ' is-best' : ''}`}>
      <span className="result-rank" aria-hidden="true">
        {rank}
      </span>

      <div className="result-body">
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <h3 className="result-title">{note.title}</h3>
          {isBest && <span className="tag tag-success">Best match</span>}
        </div>

        <p className="snippet">{highlight(bestSnippet(note.content, query), query)}</p>

        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="tag tag-accent">{note.collection}</span>
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
          <span className="text-xs subtle" style={{ marginLeft: 4 }}>
            {formatDate(note.createdAt)}
          </span>
        </div>

        <Link
          to={`/notes/${note.id}`}
          className="row gap-1 text-sm"
          style={{ color: 'var(--accent)', fontWeight: 550 }}
        >
          Open note
          <IconChevronRight size={14} />
        </Link>
      </div>

      <div className="score">
        <span className="score-value">{percent}%</span>
        <span className="text-xs subtle">relevance</span>
        <span
          className="score-bar"
          role="img"
          aria-label={`Relevance ${percent} percent`}
        >
          <span className="score-fill" style={{ width: `${Math.max(percent, 3)}%` }} />
        </span>
      </div>
    </article>
  )
}
