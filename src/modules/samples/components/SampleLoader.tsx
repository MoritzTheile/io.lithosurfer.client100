import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSampleWithLocationById, type SampleRecord } from '../features/api'

type LoaderProps = {
  id?: string
  children: (sample: SampleRecord) => React.ReactNode
}

export default function SampleLoader({ id, children }: LoaderProps) {
  const enabled = typeof id === 'string' && id.length > 0
  const { data, isLoading, isError, error } = useQuery<SampleRecord>({
    queryKey: ['sample', id],
    queryFn: () => getSampleWithLocationById(id as string),
    enabled,
  })

  if (!enabled) {
    return <div className="text-sm text-red-600">No sample id provided.</div>
  }
  if (isLoading) return <div>Loading sample…</div>
  if (isError) return <div className="text-sm text-red-600">{(error as Error).message}</div>
  if (!data) return null

  return <>{children(data)}</>
}


