import React from 'react'

type IconProps = { className?: string }

export function TableIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75zm2.75-.25a.25.25 0 0 0-.25.25v2.75h13V6.75a.25.25 0 0 0-.25-.25H5.75zM18.5 11H5.5v6.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V11zM8 12.5h2v3H8v-3zm-2 0H4.5v3H6v-3zm6 0h-2v3h2v-3zm2 0h2v3h-2v-3z"/>
    </svg>
  )
}

export function MapIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.5 3.5 4 5.75v14.5l5.5-2.25 5 2.25 5.5-2.25V3.5l-5.5 2.25-5-2.25zM10 5.73v10.8l-4 1.64V7.37l4-1.64zm2 .97 4 1.8v10.8l-4-1.8V6.7z"/>
    </svg>
  )
}


