export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelative(iso) {
  if (!iso) return '—'

  const then = new Date(iso).getTime()
  const minutes = Math.round((Date.now() - then) / 60000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`

  return formatDate(iso)
}

export function greetingFor(date = new Date()) {
  const hour = date.getHours()
  // The small hours count as night rather than morning — midnight is hour 0,
  // so a plain `hour < 12` greets anyone working late with "Good morning".
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  if (hour < 22) return 'Good evening'
  return 'Good night'
}

/** Milliseconds until the greeting would next change. */
export function msUntilNextGreeting(date = new Date()) {
  const boundaries = [5, 12, 18, 22, 24]
  const next = boundaries.find((hour) => hour > date.getHours())

  const at = new Date(date)
  at.setHours(next, 0, 0, 0)
  return at.getTime() - date.getTime()
}

export function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function parseTags(input) {
  return [
    ...new Set(
      input
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    ),
  ]
}
