import React from 'react'
import { type SampleRecord } from '../features/api'
import { useSamplesQuery } from '../features/useSamplesQuery'
import { useSampleFilter } from '../features/sampleFilter'
import { useSampleSelection } from '../features/selection'

type Row = any

export default function SamplesList() {
  const { setPage, setSize, page, size } = useSampleFilter()
  const { data, isLoading, isError, error } = useSamplesQuery()
  const { selectedIds, toggle, selectMany, deselectMany } = useSampleSelection()
  const rows = (data?.rows ?? []) as any[]
  const totalCount = data?.totalCount ?? 0
  const rowIds = (rows ?? []).map((row: any, idx: number) => String(row?.sampleDTO?.id ?? row?.id ?? idx))
  const allSelected = rowIds.length > 0 && rowIds.every((id: string) => selectedIds.has(id))
  const someSelected = rowIds.some((id: string) => selectedIds.has(id)) && !allSelected
  const headerCbRef = React.useRef<HTMLInputElement | null>(null)
  React.useEffect(() => {
    if (headerCbRef.current) headerCbRef.current.indeterminate = someSelected
  }, [someSelected, allSelected])
  const fmt = (n: number | null | undefined) => (typeof n === 'number' ? n.toFixed(5) : '')
  if (isLoading) return <div>Loading samples...</div>
  if (isError) return <div className="text-sm text-red-600">{(error as Error).message}</div>
  return (
    <div className="rounded-lg border bg-white overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-3 py-2 border-b w-8">
              <input
                aria-label="Select all on page"
                ref={headerCbRef}
                type="checkbox"
                className="h-4 w-4"
                checked={allSelected}
                onChange={(e) => {
                  e.stopPropagation()
                  if (allSelected) deselectMany(rowIds)
                  else selectMany(rowIds)
                }}
              />
            </th>
            <th className="text-left px-3 py-2 border-b">ID</th>
            <th className="text-left px-3 py-2 border-b">Name</th>
            <th className="text-left px-3 py-2 border-b">Latitude</th>
            <th className="text-left px-3 py-2 border-b">Longitude</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((row: any, idx: number) => {
            const id = row?.sampleDTO?.id ?? row?.id ?? idx
            const name = row?.sampleDTO?.name ?? row?.shortName ?? ''
            const lat = row?.locationDTO?.lat
            const lon = row?.locationDTO?.lon
            return (
              <tr
                key={id}
                className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  window.history.pushState({}, '', `/samples/${id}`)
                  const navEvt = new PopStateEvent('popstate')
                  dispatchEvent(navEvt)
                }}
              >
                <td className="px-3 py-2 border-b w-8">
                  <input
                    aria-label={`Select sample ${id}`}
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedIds.has(String(id))}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggle(String(id))
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-2 border-b text-blue-600 underline">{id}</td>
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
        totalCount={totalCount}
        onPageChange={setPage}
        onSizeChange={setSize}
      />
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


