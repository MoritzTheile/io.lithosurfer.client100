import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getSamplesWithLocations, getSamplesCount, getSamplesGeoFeatureCollection, type SampleRecord, type GeoJSONFeatureCollection } from './api'
import { useSampleFilter } from './sampleFilter'


type SamplesQueryData = { rows: SampleRecord[]; totalCount: number }

export function useSamplesQuery() {
  const { page, size, debouncedSearchText, createdByIdEquals, lithoRegion, debouncedBboxMinLat, debouncedBboxMaxLat, debouncedBboxMinLon, debouncedBboxMaxLon } = useSampleFilter()

  const q = useQuery<{ items: SampleRecord[]; totalCount: number }, Error, SamplesQueryData>({
    queryKey: ['samples', page, size, debouncedSearchText, createdByIdEquals, lithoRegion, debouncedBboxMinLat, debouncedBboxMaxLat, debouncedBboxMinLon, debouncedBboxMaxLon],
    queryFn: () =>
      getSamplesWithLocations(page, size, {
        allowedAccess: 'VIEWABLE',
        nameContains: debouncedSearchText || undefined,
        createdByIdEquals,
        lithoRegionEquals: lithoRegion || undefined,
        minLat: debouncedBboxMinLat,
        maxLat: debouncedBboxMaxLat,
        minLon: debouncedBboxMinLon,
        maxLon: debouncedBboxMaxLon,
      }),
    placeholderData: keepPreviousData,
    select: (res): SamplesQueryData => ({ rows: res.items, totalCount: res.totalCount }),
  })
  return q
}


export function useSamplesCountQuery() {
  const { debouncedSearchText, allowedAccess, createdByIdEquals, lithoRegion, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon } = useSampleFilter()
  return useQuery<number>({
    queryKey: ['samples-count', debouncedSearchText, allowedAccess, createdByIdEquals, lithoRegion, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon],
    queryFn: () =>
      getSamplesCount({
        nameContains: debouncedSearchText || undefined,
        allowedAccess,
        createdByIdEquals,
        lithoRegionEquals: lithoRegion || undefined,
        minLat: bboxMinLat,
        maxLat: bboxMaxLat,
        minLon: bboxMinLon,
        maxLon: bboxMaxLon,
      }),
  })
}

export function useSamplesGeoFeatureCollectionQuery(enabled: boolean) {
  const { debouncedSearchText, allowedAccess, createdByIdEquals, lithoRegion, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon } = useSampleFilter()
  return useQuery<GeoJSONFeatureCollection>({
    queryKey: ['samples-geo', debouncedSearchText, allowedAccess, createdByIdEquals, lithoRegion, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon],
    queryFn: () =>
      getSamplesGeoFeatureCollection({
        nameContains: debouncedSearchText || undefined,
        allowedAccess,
        createdByIdEquals,
        lithoRegionEquals: lithoRegion || undefined,
        minLat: bboxMinLat,
        maxLat: bboxMaxLat,
        minLon: bboxMinLon,
        maxLon: bboxMaxLon,
      }),
    enabled,
  })
}

