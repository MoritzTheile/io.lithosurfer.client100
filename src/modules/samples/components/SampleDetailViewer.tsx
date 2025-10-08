import React from 'react'
import type { SampleRecord } from '../features/api'

export default function SampleDetailViewer({ sample }: { sample: SampleRecord }) {
  const [showRawJson, setShowRawJson] = React.useState(false)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Details</h2>
        <button
          className="rounded-md border px-3 py-1 text-sm"
          onClick={() => setShowRawJson((v) => !v)}
        >
          {showRawJson ? 'Hide raw json' : 'Show raw json'}
        </button>
      </div>
      {showRawJson ? (
        <div className="rounded-lg border bg-white">
          <div className="px-4 py-2 border-b font-medium text-sm bg-gray-50">Raw JSON</div>
          <pre className="p-4 text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(sample, null, 2)}</pre>
        </div>
      ) : (
        <div className="text-sm text-gray-600">Click "Show raw json" to view the payload.</div>
      )}
    </div>
  )
}


