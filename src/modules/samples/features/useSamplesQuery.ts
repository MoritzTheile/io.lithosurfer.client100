import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getSamplesWithLocations, type SampleRecord } from './api'
import { useSampleFilter } from './sampleFilter'

type SamplesQueryData = { rows: SampleRecord[]; totalCount: number }

export function useSamplesQuery() {
  const { page, size, debouncedSearchText, createdByIdEquals, setTotalCount } = useSampleFilter()

  const q = useQuery<{ items: SampleRecord[]; totalCount: number }, Error, SamplesQueryData>({
    queryKey: ['samples', page, size, debouncedSearchText, createdByIdEquals],
    queryFn: () =>
      getSamplesWithLocations(page, size, {
        allowedAccess: 'VIEWABLE',
        nameContains: debouncedSearchText || undefined,
        createdByIdEquals,
      }),
    placeholderData: keepPreviousData,
    select: (res): SamplesQueryData => ({ rows: res.items, totalCount: res.totalCount }),
  })

  useEffect(() => {
    if (q.data) setTotalCount(q.data.totalCount)
  }, [q.data?.totalCount, setTotalCount])
  return q
}


