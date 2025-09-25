import { http, httpWithResponse } from '../../lib/http'

export type SampleWithLocation = Record<string, unknown>

export type SampleCriteria = { nameContains?: string, allowedAccess?: 'VIEWABLE' | 'WRITEABLE' | 'PREVIEWABLE', createdByIdEquals?: string }

export async function getSamplesWithLocations(page: number = 0, size: number = 20, paramsInput?: SampleCriteria) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (paramsInput?.allowedAccess) params.set('allowedAccess', paramsInput.allowedAccess)
  if (paramsInput?.nameContains) params.set('name.contains', paramsInput.nameContains)
  if (paramsInput?.createdByIdEquals) params.set('createdById.equals', paramsInput.createdByIdEquals)
  const { data, response } = await httpWithResponse<SampleWithLocation[]>(`/api/core/sample-with-locations?${params.toString()}`, { method: 'GET' })
  const totalCount = Number(response.headers.get('X-Total-Count') || '0')
  return { items: data, totalCount }
}

export type GeoJSONFeatureCollection = {
  type: 'FeatureCollection'
  features: any[]
}

export async function getSamplesGeoFeatureCollection(paramsInput?: SampleCriteria) : Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams()
  if (paramsInput?.nameContains) params.set('name.contains', paramsInput.nameContains)
  if (paramsInput?.allowedAccess) params.set('allowedAccess', paramsInput.allowedAccess)
  if (paramsInput?.createdByIdEquals) params.set('createdById.equals', paramsInput.createdByIdEquals)
  const query = params.toString()
  const path = query
    ? `/api/core/sample-with-locations/findGeoFeatureCollection?${query}`
    : '/api/core/sample-with-locations/findGeoFeatureCollection'
  return http<GeoJSONFeatureCollection>(path, { method: 'GET' })
}

// Management (users)
export type LithoUser = { id: string; name?: string; login?: string; firstName?: string; lastName?: string; email?: string }

export async function getLithoUsers(params?: { search?: string, page?: number, size?: number }): Promise<LithoUser[]> {
  const p = new URLSearchParams()
  if (params?.search) p.set('search', params.search)
  if (params?.page !== undefined) p.set('page', String(params.page))
  if (params?.size !== undefined) p.set('size', String(params.size))
  const query = p.toString()
  const path = query ? `/api/management/litho-users?${query}` : '/api/management/litho-users'
  return http<LithoUser[]>(path, { method: 'GET' })
}


