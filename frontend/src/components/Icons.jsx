/** Inline stroke icons — no icon-font or external dependency. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Icon({ size = 18, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...base}
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconLogo = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="2.4" />
    <circle cx="5" cy="6.5" r="1.8" />
    <circle cx="19" cy="6.5" r="1.8" />
    <circle cx="5" cy="17.5" r="1.8" />
    <circle cx="19" cy="17.5" r="1.8" />
    <path d="M6.6 7.6 10 10.6M17.4 7.6 14 10.6M6.6 16.4 10 13.4M17.4 16.4 14 13.4" />
  </Icon>
)

export const IconDashboard = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
  </Icon>
)

export const IconNotes = (p) => (
  <Icon {...p}>
    <path d="M5 3.5h9.5L19 8v12.5H5z" />
    <path d="M14 3.5V8h5M8.5 12.5h7M8.5 16.5h4.5" />
  </Icon>
)

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Icon>
)

export const IconCollections = (p) => (
  <Icon {...p}>
    <path d="M3 7.5a2 2 0 0 1 2-2h4l2 2.2h8a2 2 0 0 1 2 2v8.8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Icon>
)

export const IconSettings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.3 8.2l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.9 4.3V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.2 1z" />
  </Icon>
)

export const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Icon>
)

export const IconSparkle = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 13.8 9 19 10.8 13.8 12.6 12 18 10.2 12.6 5 10.8 10.2 9z" />
    <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </Icon>
)

export const IconLayers = (p) => (
  <Icon {...p}>
    <path d="m12 3.5 8.5 4.3-8.5 4.3-8.5-4.3z" />
    <path d="m3.5 12.5 8.5 4.3 8.5-4.3M3.5 16.8l8.5 4.2 8.5-4.2" />
  </Icon>
)

export const IconTrend = (p) => (
  <Icon {...p}>
    <path d="M3.5 16.5 9 11l4 4 7.5-7.5" />
    <path d="M15.5 7.5h5v5" />
  </Icon>
)

export const IconClock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.2l3.2 1.9" />
  </Icon>
)

export const IconEdit = (p) => (
  <Icon {...p}>
    <path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L9 18l-4 1 1-4z" />
  </Icon>
)

export const IconTrash = (p) => (
  <Icon {...p}>
    <path d="M4.5 6.5h15M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
    <path d="M6.5 6.5 7.4 20a1.3 1.3 0 0 0 1.3 1.2h6.6a1.3 1.3 0 0 0 1.3-1.2l.9-13.5" />
    <path d="M10.5 10.5v6.5M13.5 10.5v6.5" />
  </Icon>
)

export const IconSun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Icon>
)

export const IconMoon = (p) => (
  <Icon {...p}>
    <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2" />
  </Icon>
)

export const IconMenu = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const IconClose = (p) => (
  <Icon {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Icon>
)

export const IconChevronDown = (p) => (
  <Icon {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
)

export const IconChevronRight = (p) => (
  <Icon {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Icon>
)

export const IconArrowLeft = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
)

export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const IconAlert = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5M12 16h.01" />
  </Icon>
)

export const IconDatabase = (p) => (
  <Icon {...p}>
    <ellipse cx="12" cy="6" rx="7.5" ry="3" />
    <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
    <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
  </Icon>
)

export const IconVector = (p) => (
  <Icon {...p}>
    <path d="M4 20 20 4" />
    <circle cx="4.5" cy="19.5" r="2" />
    <circle cx="19.5" cy="4.5" r="2" />
    <path d="M4.5 12.5h6M12.5 4.5v6" />
  </Icon>
)

export const IconUser = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
  </Icon>
)

export const IconText = (p) => (
  <Icon {...p}>
    <path d="M5 6.5h14M5 12h14M5 17.5h9" />
  </Icon>
)
