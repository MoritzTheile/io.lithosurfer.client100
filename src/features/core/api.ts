import { httpWithResponse } from '../../lib/http'

export type SampleWithLocation = Record<string, unknown>

export async function getSamplesWithLocations(page: number = 0, size: number = 20, allowedAccess?: 'VIEWABLE' | 'WRITEABLE' | 'PREVIEWABLE') {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (allowedAccess) params.set('allowedAccess', allowedAccess)
  const { data, response } = await httpWithResponse<SampleWithLocation[]>(`/api/core/sample-with-locations?${params.toString()}`, { method: 'GET' })
  const totalCount = Number(response.headers.get('X-Total-Count') || '0')
  return { items: data, totalCount }
}


