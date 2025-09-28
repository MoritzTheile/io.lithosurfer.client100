import { useSampleFilter } from '../features/sampleFilter'
import SampleFilterBar from '../components/SampleFilterBar'
import SamplesMap from '../components/SamplesMap'
import SamplesList from '../components/SamplesList'
import SelectionBar from '../components/SelectionBar'
import { useEffect, useState } from 'react'
import { MapIcon, TableIcon } from '../../../lib/icons'
import { useSamplesQuery } from '../features/useSamplesQuery'
import { getSampleWithLocationById } from '../features/api'

export default function Samples() {

  const [mode, setMode] = useState<'table' | 'map'>('map')

  const { data, isLoading, isError, error } = useSamplesQuery()
  
  const totalCount = data?.totalCount ?? 0

  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailData, setDetailData] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (!detailId) return
    let cancelled = false
    setDetailLoading(true)
    getSampleWithLocationById(detailId)
      .then((d) => { if (!cancelled) setDetailData(d) })
      .finally(() => { if (!cancelled) setDetailLoading(false) })
    return () => { cancelled = true }
  }, [detailId])

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
        <SamplesMap isVisible={mode === 'map'} onOpenDetail={(id) => setDetailId(id)} />
      </div>
      <div className={mode === 'table' ? '' : 'hidden'}>
        <SamplesList />
      </div>
      {detailId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setDetailId(null); setDetailData(null) }} />
          <div className="absolute inset-0 z-10 bg-white overflow-auto">
            <div className="sticky top-0 flex items-center justify-between border-b px-4 py-3 bg-white">
              <h2 className="text-lg font-semibold">Sample {detailId}</h2>
              <div className="flex items-center gap-2">
                {detailLoading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400/30 border-t-gray-600" />}
                <button className="rounded-md border px-3 py-1 text-sm bg-white hover:bg-gray-50" onClick={() => { setDetailId(null); setDetailData(null) }}>Close</button>
              </div>
            </div>
            <div className="p-4">
              {detailData ? (
                <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(detailData, null, 2)}</pre>
              ) : (
                <div className="text-sm text-gray-600">{detailLoading ? 'Loading…' : 'No details found.'}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
