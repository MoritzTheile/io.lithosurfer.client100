import React from 'react'
import { useSampleFilter } from '../features/sampleFilter'
import { LithoUserPicker } from '../../auth'

export default function SampleFilterBar() {
  const { searchText, setSearchText, createdByIdEquals, setCreatedByIdEquals, clearFilters } = useSampleFilter()
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border">
      <input
        className="rounded-md border px-3 py-2 w-full max-w-xs focus:ring-2 focus:ring-indigo-400"
        placeholder="Search name..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <LithoUserPicker value={createdByIdEquals} onChange={setCreatedByIdEquals} />
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm bg-white hover:bg-indigo-50 text-indigo-700"
        onClick={clearFilters}
      >
        Clear
      </button>
    </div>
  )
}


