import React from 'react'
import { useSampleFilter } from '../features/sampleFilter'
import { LithoUserPicker } from '../../auth'
import RegionSelector from './RegionSelector'


export default function SampleFilterBar() {
  const { searchText, setSearchText, createdByIdEquals, setCreatedByIdEquals, clearFilters, bboxMinLon, bboxMinLat, bboxMaxLon, bboxMaxLat, clearBbox } = useSampleFilter()
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border">
      <input
        className="rounded-md border px-3 py-2 w-full max-w-xs focus:ring-2 focus:ring-indigo-400"
        placeholder="Search name..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      {/* <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-700 bg-white/70 rounded border px-2 py-1">
        <span className="font-medium">BBox:</span>
        <span title="minLon">{bboxMinLon?.toFixed(4) ?? '-'}</span>,
        <span title="minLat">{bboxMinLat?.toFixed(4) ?? '-'}</span>
        <span className="px-1">to</span>
        <span title="maxLon">{bboxMaxLon?.toFixed(4) ?? '-'}</span>,
        <span title="maxLat">{bboxMaxLat?.toFixed(4) ?? '-'}</span>
        <button type="button" className="ml-2 rounded px-1 py-0.5 border hover:bg-gray-50" onClick={clearBbox} title="Clear map bounds filter">×</button>
      </div> */}
      <LithoUserPicker value={createdByIdEquals} onChange={setCreatedByIdEquals} />
      <RegionSelector />
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


