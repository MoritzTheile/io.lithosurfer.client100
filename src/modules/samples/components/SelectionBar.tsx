import React from 'react'
import { useSampleSelection } from '../features/selection'

export default function SelectionBar() {
  const { selectedIds, clear } = useSampleSelection()
  const count = selectedIds.size
  if (count === 0) return null
  return (
    <div className="rounded-md border bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-3 py-2 text-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
          {count}
        </span>
        <span className="text-emerald-800">selected</span>
      </div>
      <button
        type="button"
        className="rounded-md border px-3 py-1 text-sm bg-white text-emerald-700 hover:bg-emerald-50"
        onClick={clear}
      >
        Clear selection
      </button>
    </div>
  )
}


