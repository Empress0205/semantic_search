import { NavLink } from 'react-router-dom'
import { useNotes } from '../context/NotesContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { USER } from '../config.js'
import { initialsOf } from '../utils/format.js'
import {
  IconCollections,
  IconDashboard,
  IconLogo,
  IconMoon,
  IconNotes,
  IconSearch,
  IconSettings,
  IconSun,
} from './Icons.jsx'

export function Sidebar({ open, onNavigate }) {
  const { notes, collections } = useNotes()
  const { theme, setTheme } = useTheme()

  const items = [
    { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
    { to: '/notes', label: 'My Notes', icon: IconNotes, count: notes.length },
    { to: '/search', label: 'Semantic Search', icon: IconSearch },
    {
      to: '/collections',
      label: 'Collections',
      icon: IconCollections,
      count: collections.length,
    },
    { to: '/settings', label: 'Settings', icon: IconSettings },
  ]

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <IconLogo size={19} />
        </span>
        <span className="stack">
          <span className="brand-name">Semantic Notes</span>
          <span className="brand-sub">Search by meaning</span>
        </span>
      </div>

      <nav className="nav" aria-label="Main">
        <span className="nav-label">Workspace</span>
        {items.map(({ to, label, icon: Icon, end, count }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onNavigate}
          >
            <Icon size={17} />
            {label}
            {count !== undefined && <span className="nav-count">{count}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="theme-toggle" role="group" aria-label="Colour theme">
          <button
            type="button"
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
          >
            <IconSun size={14} />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
          >
            <IconMoon size={14} />
            Dark
          </button>
        </div>

        <div className="profile">
          <span className="avatar">{initialsOf(USER.name)}</span>
          <span className="stack" style={{ minWidth: 0 }}>
            <span className="profile-name">{USER.name}</span>
            <span className="text-xs subtle">{USER.plan}</span>
          </span>
        </div>
      </div>
    </aside>
  )
}
