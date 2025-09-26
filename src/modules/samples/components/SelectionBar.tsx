import React from 'react'
import { useSampleSelection } from '../features/selection'

export default function SelectionBar() {
  const { selectedIds, clear } = useSampleSelection()
  const count = selectedIds.size
  if (count === 0) return null
  return (
    <div className="rounded-md border bg-white px-3 py-2 text-sm flex items-center justify-between">
      <div>
        <span className="font-medium">{count.toLocaleString()}</span> selected
      </div>
      <button
        type="button"
        className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
        onClick={clear}
      >
        Clear selection
      </button>
    </div>
  )
}


