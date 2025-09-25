import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getSamplesWithLocations, type SampleWithLocation } from '../features/core/api'
import { useSampleFilter } from '../features/core/sampleFilter'

type SamplesResult = { items: SampleWithLocation[]; totalCount: number }

export default function Samples() {
  const { page, size, searchText, debouncedSearchText, setPage, setSize, setSearchText } = useSampleFilter()
  const { data, isLoading, isError, error } = useQuery<SamplesResult>({
    queryKey: ['samples', page, size, debouncedSearchText],
    queryFn: () => getSamplesWithLocations(page, size, { allowedAccess: 'VIEWABLE', nameContains: debouncedSearchText || undefined }),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Samples</h1>
      <div className="flex items-center gap-2">
        <input
          className="rounded-md border px-3 py-2 w-full max-w-xs"
          placeholder="Search name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
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
            onSizeChange={setSize}
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


