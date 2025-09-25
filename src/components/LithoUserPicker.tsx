import React, { useEffect, useRef, useState } from 'react'
import { getLithoUsers, type LithoUser } from '../features/core/api'

type Props = {
  value?: string
  onChange: (userId: string | undefined) => void
}

export default function LithoUserPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [results, setResults] = useState<LithoUser[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const list = await getLithoUsers({ search: debounced || undefined, page: 0, size: 50 })
      if (!cancelled) setResults(list)
    })().catch(() => setResults([]))
    return () => {
      cancelled = true
    }
  }, [debounced])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const selected = results.find(u => u.id === value)

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        className="rounded-md border px-3 py-2 w-full"
        placeholder="Created By (search user)"
        value={selected ? (selected.name || `${selected.firstName || ''} ${selected.lastName || ''}`.trim() || selected.login || selected.email || selected.id) : query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          onChange(undefined)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-white shadow">
          {results.map(user => {
            const label = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.login || user.email || user.id
            return (
              <button
                type="button"
                key={user.id}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  onChange(user.id)
                  setQuery(label)
                  setOpen(false)
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}


