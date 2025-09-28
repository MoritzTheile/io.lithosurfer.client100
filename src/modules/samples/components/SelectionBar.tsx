import React, { useMemo, useState } from 'react'
import { useSampleSelection } from '../features/selection'
import LargeModal from '../../shared/LargeModal'

export default function SelectionBar() {
  const { selectedIds, clear } = useSampleSelection()
  const [showModal, setShowModal] = useState(false)
  const selectedList = useMemo(() => Array.from(selectedIds).map(String), [selectedIds])
  const count = selectedIds.size
  if (count === 0) return null
  return (
    <div className="rounded-md border bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-3 py-2 text-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 px-2 items-center justify-center rounded-full bg-emerald-600 text-white text-xs tabular-nums">
          {count}
        </span>
        <span className="text-emerald-800">selected</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border px-3 py-1 text-sm bg-white text-emerald-700 hover:bg-emerald-50"
          onClick={() => setShowModal(true)}
        >
          Show data
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1 text-sm bg-white text-emerald-700 hover:bg-emerald-50"
          onClick={clear}
        >
          Clear selection
        </button>
      </div>
      <LargeModal isOpen={showModal} onClose={() => setShowModal(false)} title={<span>Selected IDs ({count})</span>}>
        {selectedList.length > 0 ? (
          <pre className="text-xs whitespace-pre-wrap break-words">{selectedList.join('\n')}</pre>
        ) : (
          <div className="text-sm text-gray-600">No items selected.</div>
        )}
      </LargeModal>
    </div>
  )
}


