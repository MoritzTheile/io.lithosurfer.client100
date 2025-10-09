import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type LargeModalProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  rightActions?: React.ReactNode
}>

export default function LargeModal({ isOpen, onClose, title, rightActions, children }: LargeModalProps) {
  const pushedRef = useRef(false)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (pushedRef.current) {
          try { window.history.back() } catch { onClose() }
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [isOpen])

  // Push a history state on open and close on browser back
  useEffect(() => {
    if (!isOpen) return
    if (!pushedRef.current) {
      try { window.history.pushState({ modal: true }, '') } catch {}
      pushedRef.current = true
    }
    const onPop = () => {
      onClose()
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      pushedRef.current = false
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => {
          if (pushedRef.current) {
            try { window.history.back() } catch { onClose() }
          } else {
            onClose()
          }
        }}
      />
      <div className="fixed inset-0 z-10 bg-white overflow-auto">
        <div className="sticky top-0 flex items-center justify-between border-b px-4 py-3 bg-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {rightActions}
            <button
              className="rounded-md border px-3 py-1 text-sm bg-white hover:bg-gray-50"
              onClick={() => {
                if (pushedRef.current) {
                  try { window.history.back() } catch { onClose() }
                } else {
                  onClose()
                }
              }}
            >Close</button>
          </div>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  , document.body)
}


