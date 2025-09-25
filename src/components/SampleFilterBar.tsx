import React from 'react'
import { useSampleFilter } from '../features/core/sampleFilter'

export default function SampleFilterBar() {
  const { searchText, setSearchText } = useSampleFilter()
  return (
    <div className="flex items-center gap-2">
      <input
        className="rounded-md border px-3 py-2 w-full max-w-xs"
        placeholder="Search name..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </div>
  )
}


