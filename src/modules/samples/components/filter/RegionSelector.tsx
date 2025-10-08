import React from 'react'
import { useSampleFilter } from '../../features/sampleFilter'

const lithoRegionOptions = [
  'Africa',
  'Antarctica',
  'Arabian Region & West Asia',
  'Central Asia and Siberia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
  'South and East Asia',
]

export default function RegionSelector() {
  const { lithoRegion, setLithoRegion } = useSampleFilter()
  return (
    <select
      className="rounded-md border px-3 py-2 text-sm bg-white"
      value={lithoRegion || ''}
      onChange={(e) => setLithoRegion(e.target.value || undefined)}
    >
      <option value="">Region...</option>
      {lithoRegionOptions.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}


