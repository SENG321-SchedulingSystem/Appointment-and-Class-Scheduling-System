// Small outline icons used in the Figma design.

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true }

export function CalendarIcon({ className = 'h-7 w-7' }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
      <rect x="7" y="14" width="2" height="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function UsersIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" strokeLinecap="round" />
      <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.8.8 3 2.6 3.5 5.2" strokeLinecap="round" />
    </svg>
  )
}

export function LinkIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...base} className={className}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" strokeLinecap="round" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" strokeLinecap="round" />
    </svg>
  )
}

export function LogoutIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" strokeLinecap="round" />
    </svg>
  )
}
