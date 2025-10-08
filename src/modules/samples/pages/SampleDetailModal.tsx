import { useLocation, useNavigate, useParams } from 'react-router-dom'
import React from 'react'

type AnyRecord = Record<string, any>

function isPlainObject(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function Section({ title, data }: { title?: string, data: AnyRecord }) {
  const entries = Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '')
  if (entries.length === 0) return null
  return (
    <div className="rounded-lg border bg-white">
      {title ? <div className="px-4 py-2 border-b font-medium text-sm bg-gray-50">{title}</div> : null}
      <dl className="divide-y">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-4 px-4 py-2">
            <dt className="text-sm text-gray-600 break-all">{k}</dt>
            <dd className="col-span-2 text-sm break-words">
              {isPlainObject(v) ? (
                <Section data={v} />
              ) : Array.isArray(v) ? (
                <div className="space-y-1">
                  {v.filter((x) => x !== null && x !== undefined && x !== '').map((x, idx) => (
                    <div key={idx} className="break-words">{String(x)}</div>
                  ))}
                </div>
              ) : (
                <span>{String(v)}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function SampleDetail() {
  const { id } = useParams()
  const { state } = useLocation() as { state?: { sample?: AnyRecord, featureProperties?: AnyRecord } }
  const navigate = useNavigate()
  const [showRawJson, setShowRawJson] = React.useState(false)

  const payload = state?.sample || state?.featureProperties

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => navigate(-1)}>Back</button>
        <h1 className="text-2xl font-semibold">Sample {id}</h1>
        {payload ? (
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setShowRawJson((v) => !v)}
          >
            {showRawJson ? 'Hide raw json' : 'Show raw json'}
          </button>
        ) : null}
      </div>
      {payload ? (
        showRawJson ? (
          <div className="rounded-lg border bg-white">
            <div className="px-4 py-2 border-b font-medium text-sm bg-gray-50">Raw JSON</div>
            <pre className="p-4 text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(payload, null, 2)}</pre>
          </div>
        ) : (
          <div className="text-sm text-gray-600">Click "Show raw json" to view the payload.</div>
        )
      ) : (
        <div className="text-sm text-gray-600">No detail data was provided from the previous page.</div>
      )}
    </div>
  )
}


