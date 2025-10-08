import { http, httpWithResponse } from '../../../lib/http'

export type SampleRecord = Record<string, unknown>

export type SampleCriteria = {
  nameContains?: string,
  allowedAccess?: 'VIEWABLE' | 'WRITEABLE' | 'PREVIEWABLE',
  createdByIdEquals?: string,
  lithoRegionEquals?: string,
  // Optional bounding box
  minLat?: number,
  maxLat?: number,
  minLon?: number,
  maxLon?: number,
}

export async function getSamplesWithLocations(page: number = 0, size: number = 20, paramsInput?: SampleCriteria) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (paramsInput?.allowedAccess) params.set('allowedAccess', paramsInput.allowedAccess)
  if (paramsInput?.nameContains) params.set('name.contains', paramsInput.nameContains)
  if (paramsInput?.createdByIdEquals) params.set('createdById.equals', paramsInput.createdByIdEquals)
  if (paramsInput?.lithoRegionEquals) params.set('locationCriteria.lithoRegion.equals', paramsInput.lithoRegionEquals)
  if (paramsInput?.minLat !== undefined) params.set('locationCriteria.lat.greaterOrEqualThan', String(paramsInput.minLat))
  if (paramsInput?.maxLat !== undefined) params.set('locationCriteria.lat.lessOrEqualThan', String(paramsInput.maxLat))
  if (paramsInput?.minLon !== undefined) params.set('locationCriteria.lon.greaterOrEqualThan', String(paramsInput.minLon))
  if (paramsInput?.maxLon !== undefined) params.set('locationCriteria.lon.lessOrEqualThan', String(paramsInput.maxLon))
  const { data, response } = await httpWithResponse<SampleRecord[]>(`/api/core/sample-with-locations?${params.toString()}`, { method: 'GET' })
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
  if (paramsInput?.lithoRegionEquals) params.set('locationCriteria.lithoRegion.equals', paramsInput.lithoRegionEquals)
  if (paramsInput?.minLat !== undefined) params.set('locationCriteria.lat.greaterOrEqualThan', String(paramsInput.minLat))
  if (paramsInput?.maxLat !== undefined) params.set('locationCriteria.lat.lessOrEqualThan', String(paramsInput.maxLat))
  if (paramsInput?.minLon !== undefined) params.set('locationCriteria.lon.greaterOrEqualThan', String(paramsInput.minLon))
  if (paramsInput?.maxLon !== undefined) params.set('locationCriteria.lon.lessOrEqualThan', String(paramsInput.maxLon))
  const query = params.toString()
  const path = query
    ? `/api/core/sample-with-locations/findGeoFeatureCollection?${query}`
    : '/api/core/sample-with-locations/findGeoFeatureCollection'
  return http<GeoJSONFeatureCollection>(path, { method: 'GET' })
}

export async function getSampleWithLocationById(id: string) {
  return http<SampleRecord>(`/api/core/sample-with-locations/${encodeURIComponent(id)}`, { method: 'GET' })
}

export async function getSamplesCount(paramsInput?: SampleCriteria): Promise<number> {
  const params = new URLSearchParams()
  if (paramsInput?.nameContains) params.set('name.contains', paramsInput.nameContains)
  if (paramsInput?.allowedAccess) params.set('allowedAccess', paramsInput.allowedAccess)
  if (paramsInput?.createdByIdEquals) params.set('createdById.equals', paramsInput.createdByIdEquals)
  if (paramsInput?.lithoRegionEquals) params.set('locationCriteria.lithoRegion.equals', paramsInput.lithoRegionEquals)
  if (paramsInput?.minLat !== undefined) params.set('locationCriteria.lat.greaterOrEqualThan', String(paramsInput.minLat))
  if (paramsInput?.maxLat !== undefined) params.set('locationCriteria.lat.lessOrEqualThan', String(paramsInput.maxLat))
  if (paramsInput?.minLon !== undefined) params.set('locationCriteria.lon.greaterOrEqualThan', String(paramsInput.minLon))
  if (paramsInput?.maxLon !== undefined) params.set('locationCriteria.lon.lessOrEqualThan', String(paramsInput.maxLon))
  const query = params.toString()
  const path = query
    ? `/api/core/sample-with-locations/count?${query}`
    : '/api/core/sample-with-locations/count'
  return http<number>(path, { method: 'GET' })
}

// (moved LithoUser API to features/auth/api.ts)


