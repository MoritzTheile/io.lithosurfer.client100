import React from 'react'
import { useSampleFilter } from '../features/sampleFilter'
import LithoUserPicker from '../../auth/components/LithoUserPicker'

export default function SampleFilterBar() {
  const { searchText, setSearchText, createdByIdEquals, setCreatedByIdEquals, clearFilters } = useSampleFilter()
  return (
    <div className="flex items-center gap-2">
      <input
        className="rounded-md border px-3 py-2 w-full max-w-xs"
        placeholder="Search name..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <LithoUserPicker value={createdByIdEquals} onChange={setCreatedByIdEquals} />
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        onClick={clearFilters}
      >
        Clear
      </button>
    </div>
  )
}


