import { useState } from 'react'
import { HowItWorks } from '../components/HowItWorks.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { IconMoon, IconSun } from '../components/Icons.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useNotes } from '../context/NotesContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { USING_BACKEND } from '../api/index.js'
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, USER } from '../config.js'
import { initialsOf } from '../utils/format.js'

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { notes } = useNotes()
  const { notify } = useToast()
  const [resetting, setResetting] = useState(false)

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'semantic-notes-export.json'
    link.click()
    URL.revokeObjectURL(url)
    notify('Notes exported as JSON.')
  }

  const resetWorkspace = () => {
    localStorage.removeItem('semantic-notes:notes')
    localStorage.removeItem('semantic-notes:history')
    localStorage.removeItem('semantic-notes:search-count')
    window.location.assign('/')
  }

  return (
    <div className="stack gap-5" style={{ maxWidth: 760 }}>
      <header className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Workspace preferences and data.</p>
        </div>
      </header>

      <section className="card">
        <div className="setting-row">
          <div className="row gap-3">
            <span className="avatar">{initialsOf(USER.name)}</span>
            <span className="stack">
              <span style={{ fontWeight: 600 }}>{USER.name}</span>
              <span className="text-sm subtle">{USER.plan}</span>
            </span>
          </div>
          <span className="tag">Sign-in coming later</span>
        </div>

        <div className="setting-row">
          <div className="stack gap-1">
            <span style={{ fontWeight: 600 }}>Appearance</span>
            <span className="text-sm muted">Choose how the interface looks.</span>
          </div>
          <div className="theme-toggle" style={{ width: 180 }}>
            <button type="button" onClick={() => setTheme('light')} aria-pressed={theme === 'light'}>
              <IconSun size={14} />
              Light
            </button>
            <button type="button" onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}>
              <IconMoon size={14} />
              Dark
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="setting-row">
          <div className="stack gap-1">
            <span style={{ fontWeight: 600 }}>Embedding model</span>
            <span className="text-sm muted">
              Used to turn every note into a vector.
            </span>
          </div>
          <span className="tag tag-accent">{EMBEDDING_MODEL}</span>
        </div>

        <div className="setting-row">
          <div className="stack gap-1">
            <span style={{ fontWeight: 600 }}>Vector dimensions</span>
            <span className="text-sm muted">Length of each note&rsquo;s embedding.</span>
          </div>
          <span className="tag">{EMBEDDING_DIMENSIONS}</span>
        </div>

        <div className="setting-row">
          <div className="stack gap-1">
            <span style={{ fontWeight: 600 }}>Data source</span>
            <span className="text-sm muted">
              {USING_BACKEND
                ? 'Notes and search come from the FastAPI backend.'
                : 'Running on browser storage with approximate similarity. Set VITE_USE_BACKEND=true to use FastAPI and ChromaDB.'}
            </span>
          </div>
          <span className={`tag ${USING_BACKEND ? 'tag-success' : ''}`}>
            {USING_BACKEND ? 'FastAPI + ChromaDB' : 'Local preview'}
          </span>
        </div>
      </section>

      <section className="card">
        <div className="setting-row">
          <div className="stack gap-1">
            <span style={{ fontWeight: 600 }}>Export notes</span>
            <span className="text-sm muted">Download all {notes.length} notes as JSON.</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={exportNotes}>
            Export
          </button>
        </div>

        <div className="setting-row">
          <div className="stack gap-1">
            <span style={{ fontWeight: 600 }}>Reset workspace</span>
            <span className="text-sm muted">
              Clears local notes and restores the sample set.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setResetting(true)}
            disabled={USING_BACKEND}
          >
            Reset
          </button>
        </div>
      </section>

      <HowItWorks />

      {resetting && (
        <ConfirmDialog
          title="Reset this workspace?"
          message="Every note stored in this browser will be removed and the sample notes restored."
          confirmLabel="Reset workspace"
          onCancel={() => setResetting(false)}
          onConfirm={resetWorkspace}
        />
      )}
    </div>
  )
}
