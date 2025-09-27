import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getSamplesWithLocations, type SampleRecord } from './api'
import { useSampleFilter } from './sampleFilter'


type SamplesQueryData = { rows: SampleRecord[]; totalCount: number }

export function useSamplesQuery() {
  const { page, size, debouncedSearchText, createdByIdEquals, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon } = useSampleFilter()

  const q = useQuery<{ items: SampleRecord[]; totalCount: number }, Error, SamplesQueryData>({
    queryKey: ['samples', page, size, debouncedSearchText, createdByIdEquals, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon],
    queryFn: () =>
      getSamplesWithLocations(page, size, {
        allowedAccess: 'VIEWABLE',
        nameContains: debouncedSearchText || undefined,
        createdByIdEquals,
        minLat: bboxMinLat,
        maxLat: bboxMaxLat,
        minLon: bboxMinLon,
        maxLon: bboxMaxLon,
      }),
    placeholderData: keepPreviousData,
    select: (res): SamplesQueryData => ({ rows: res.items, totalCount: res.totalCount }),
  })
  return q
}


