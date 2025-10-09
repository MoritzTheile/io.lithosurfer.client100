import { useNavigate, useParams } from 'react-router-dom'
import React from 'react'
import SampleLoader from '../components/SampleLoader'
import SampleDetailViewer from '../components/SampleDetailViewer'

export default function SampleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => navigate(-1)}>Back</button>
      </div>
      <SampleLoader id={id}>
        {(sample) => <SampleDetailViewer sample={sample} />}
      </SampleLoader>
    </div>
  )
}


