import { useSampleFilter } from '../features/sampleFilter'
import SampleFilterBar from '../components/SampleFilterBar'
import SamplesMap from '../components/SamplesMap'
import SamplesList from '../components/SamplesList'
import SelectionBar from '../components/SelectionBar'
import { useState } from 'react'
import { MapIcon, TableIcon } from '../../../lib/icons'
import { useSamplesQuery } from '../features/useSamplesQuery'

export default function Samples() {

  const [mode, setMode] = useState<'table' | 'map'>('map')

  const { data, isLoading, isError, error } = useSamplesQuery()
  
  const totalCount = data?.totalCount ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <span className="inline-flex items-center rounded-full bg-gray-700 text-white text-xs px-2 py-0.5" aria-live="polite" aria-busy="true">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-700 text-white text-xs px-2 py-0.5">
            {totalCount.toLocaleString()}
          </span>
        )}
        <span className="text-lgfont-semibold">Samples</span>
        </div>
      <div className="flex items-center justify-between">
        <SampleFilterBar />
        <div className="flex items-center gap-2" role="tablist" aria-label="View mode">
          <button
            aria-pressed={mode === 'map'}
            title="Map view"
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm ${mode === 'map' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setMode('map')}
          >
            <MapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            aria-pressed={mode === 'table'}
            title="Table view"
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm ${mode === 'table' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setMode('table')}
          >
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>
      <SelectionBar />
      <div className={mode === 'map' ? '' : 'hidden'}>
        <SamplesMap totalCount={totalCount} isVisible={mode === 'map'} />
      </div>
      <div className={mode === 'table' ? '' : 'hidden'}>
        <SamplesList />
      </div>
    </div>
  )
}
