import React from 'react'

const paths = {
  grid: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
  database: 'M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2zm0 0v6c0 1.1 3.6 2 8 2s8-.9 8-2V6m-16 6v6c0 1.1 3.6 2 8 2s8-.9 8-2v-6',
  shield: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4',
  check: 'M20 6L9 17l-5-5',
  users: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m9-10a4 4 0 100-8 4 4 0 000 8zm7 2a4 4 0 000-8m4 16v-2a4 4 0 00-3-3.87',
  alert: 'M10.3 3.7L2.5 17a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.7a2 2 0 00-3.4 0zM12 9v4m0 4h.01',
  chart: 'M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-9',
  calendar: 'M5 4h14a2 2 0 012 2v13H3V6a2 2 0 012-2zm-2 5h18M8 2v4m8-4v4',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zm6-2l4 4',
  bell: 'M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  arrow: 'M5 12h14m-6-6l6 6-6 6',
  plus: 'M12 5v14m-7-7h14',
  chevron: 'M9 18l6-6-6-6',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M5 21h14',
  menu: 'M4 6h16M4 12h16M4 18h16',
}

export default function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || paths.grid} />
    </svg>
  )
}
