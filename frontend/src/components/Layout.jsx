import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { IconLogo, IconMenu, IconPlus } from './Icons.jsx'

export function Layout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer on navigation and scroll the new page to the top.
  useEffect(() => {
    setNavOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  return (
    <div className="app-shell">
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />

      <div
        className={`scrim${navOpen ? ' show' : ''}`}
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            aria-controls="sidebar"
          >
            <IconMenu size={20} />
          </button>

          <Link to="/" className="row gap-2">
            <span className="brand-mark" style={{ width: 28, height: 28 }}>
              <IconLogo size={16} />
            </span>
            <span className="brand-name">Semantic Notes</span>
          </Link>

          <span className="spacer" />

          <Link to="/notes/new" className="btn btn-primary btn-icon" aria-label="Create note">
            <IconPlus size={18} />
          </Link>
        </header>

        <div className="main-inner">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
