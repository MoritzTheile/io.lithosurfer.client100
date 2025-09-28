import React, { PropsWithChildren, useEffect } from 'react'

type LargeModalProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  rightActions?: React.ReactNode
}>

export default function LargeModal({ isOpen, onClose, title, rightActions, children }: LargeModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 z-10 bg-white overflow-auto">
        <div className="sticky top-0 flex items-center justify-between border-b px-4 py-3 bg-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {rightActions}
            <button className="rounded-md border px-3 py-1 text-sm bg-white hover:bg-gray-50" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}


