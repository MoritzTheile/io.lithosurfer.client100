import { useQuery } from '@tanstack/react-query'
import { getSamplesWithLocations } from '../features/core/api'

export default function Samples() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['samples', 0],
    queryFn: () => getSamplesWithLocations(0, 20, 'VIEWABLE'),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Samples</h1>
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
              {(data ?? []).map((row: any, idx: number) => {
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
        </div>
      )}
    </div>
  )
}


