import { Fragment, useState } from 'react'
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from '../config.js'
import {
  IconChevronDown,
  IconChevronRight,
  IconDatabase,
  IconNotes,
  IconSearch,
  IconSparkle,
  IconText,
  IconVector,
} from './Icons.jsx'

const STEPS = [
  { icon: IconText, name: 'Your query', note: 'Written in plain language' },
  { icon: IconSparkle, name: 'Sentence Transformer', note: EMBEDDING_MODEL },
  { icon: IconVector, name: 'Embedding vector', note: `${EMBEDDING_DIMENSIONS} dimensions` },
  { icon: IconDatabase, name: 'Vector database', note: 'ChromaDB collection' },
  { icon: IconSearch, name: 'Similarity search', note: 'Nearest vectors first' },
  { icon: IconNotes, name: 'Relevant notes', note: 'Ranked by meaning' },
]

/** Optional detail — collapsed by default so the technical layer stays out of the way. */
export function HowItWorks() {
  const [open, setOpen] = useState(false)

  return (
    <section className="card how-it-works">
      <button
        type="button"
        className="how-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="stat-icon" style={{ width: 30, height: 30 }}>
          <IconSparkle size={16} />
        </span>
        <span className="stack">
          <span style={{ fontWeight: 600, fontSize: 14 }}>How it works</span>
          <span className="text-xs subtle">
            What happens between your question and the results
          </span>
        </span>
        <span className="spacer" />
        <span className="muted row">
          {open ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
        </span>
      </button>

      {open && (
        <div className="how-body">
          <div className="pipeline">
            {STEPS.map(({ icon: Icon, name, note }, i) => (
              <Fragment key={name}>
                <div className="pipeline-step">
                  <span className="step-icon">
                    <Icon size={18} />
                  </span>
                  <span className="step-name">{name}</span>
                  <span className="step-note">{note}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="pipeline-arrow" aria-hidden="true">
                    <IconChevronRight size={16} />
                  </span>
                )}
              </Fragment>
            ))}
          </div>

          <p className="text-sm muted" style={{ marginTop: 20 }}>
            Every note is converted into a list of numbers that represents its
            meaning. Your question is converted the same way, and the notes whose
            numbers sit closest to it come back first. That is why a search for
            &ldquo;how do I revise for the exam&rdquo; can find a note that never
            uses the word <em>revise</em>.
          </p>
        </div>
      )}
    </section>
  )
}
