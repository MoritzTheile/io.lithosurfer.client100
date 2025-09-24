import { useQuery } from '@tanstack/react-query'
import { getSamplesWithLocations } from '../features/core/api'
import { useState, useEffect } from 'react'

export default function Samples() {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(id)
  }, [query])
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['samples', page, size, debouncedQuery],
    queryFn: () => getSamplesWithLocations(page, size, 'VIEWABLE', debouncedQuery || undefined),
    keepPreviousData: true,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Samples</h1>
      <div className="flex items-center gap-2">
        <input
          className="rounded-md border px-3 py-2 w-full max-w-xs"
          placeholder="Search name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
        />
      </div>
      {isLoading ? (
        <div>Loading samples...</div>
      ) : isError ? (
        <div className="text-sm text-red-600">{(error as Error).message}</div>
      ) : (
        <div className="rounded-lg border bg-white overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 border-b">ID</th>
                <th className="text-left px-3 py-2 border-b">Name</th>
                <th className="text-left px-3 py-2 border-b">Latitude</th>
                <th className="text-left px-3 py-2 border-b">Longitude</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((row: any, idx: number) => {
                const id = row?.sampleDTO?.id ?? row?.id ?? idx
                const name = row?.sampleDTO?.name ?? row?.shortName ?? ''
                const lat = row?.locationDTO?.lat
                const lon = row?.locationDTO?.lon
                const fmt = (n: number | null | undefined) =>
                  typeof n === 'number' ? n.toFixed(5) : ''
                return (
                  <tr key={id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 border-b">{id}</td>
                    <td className="px-3 py-2 border-b">{name}</td>
                    <td className="px-3 py-2 border-b">{fmt(lat)}</td>
                    <td className="px-3 py-2 border-b">{fmt(lon)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Pager
            page={page}
            size={size}
            totalCount={data?.totalCount ?? 0}
            onPageChange={setPage}
            onSizeChange={(v) => {
              setSize(v)
              setPage(0)
            }}
          />
        </div>
      )}
    </div>
  )
}

function Pager({ page, size, totalCount, onPageChange, onSizeChange }: { page: number, size: number, totalCount: number, onPageChange: (p: number) => void, onSizeChange: (s: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / size))
  const canPrev = page > 0
  const canNext = page + 1 < totalPages
  return (
    <div className="flex items-center justify-between p-3 border-t bg-gray-50">
      <div className="text-xs text-gray-600">{totalCount ? `Total: ${totalCount.toLocaleString()} samples` : 'Total: unknown'}</div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(0)}
          disabled={!canPrev}
        >
          « First
        </button>
        <button
          className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
        >
          ‹ Prev
        </button>
        <div className="text-sm">
          Page {page + 1} of {totalPages}
        </div>
        <button
          className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
        >
          Next ›
        </button>
        <button
          className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canNext}
        >
          Last »
        </button>
        <select
          className="ml-2 rounded-md border px-2 py-1 text-sm"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>{n}/page</option>
          ))}
        </select>
      </div>
    </div>
  )
}


