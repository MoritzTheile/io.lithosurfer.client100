import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStoredToken } from './lib/config'
import SidebarNav from './components/SidebarNav'

export default function Layout({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollYRef = useRef(0)
  const isAuthenticated = typeof window !== 'undefined' && Boolean(getStoredToken())

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY || 0
      const last = lastScrollYRef.current
      // Hide on scroll down, show on scroll up
      if (current > last) setHeaderHidden(true)
      else if (current < last) setHeaderHidden(false)
      lastScrollYRef.current = current <= 0 ? 0 : current
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar (overlay) */}
      <aside className={`sm:hidden fixed inset-0 z-40 ${sidebarOpen ? '' : 'pointer-events-none'}`} aria-hidden={!sidebarOpen}>
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 bg-white border-r border-gray-200 w-64 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-16 flex items-center px-4">
            <span className="font-semibold text-lg truncate">LithoSurfer </span>
          </div>
          <nav className="px-2 space-y-1">
            <SidebarNav isAuthenticated={isAuthenticated} onItemClick={() => setSidebarOpen(false)} />
          </nav>
        </div>
      </aside>

      {/* Sidebar (desktop) */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-200 ease-in-out ${sidebarOpen ? 'w-64 hidden sm:block' : 'hidden sm:hidden'}`}
      >
        <div className="h-16 flex items-center px-4">
          <span className="font-semibold text-lg truncate">{sidebarOpen ? 'LithoSurfer' : 'LS'}</span>
        </div>
        <nav className="px-2 space-y-1">
          <SidebarNav isAuthenticated={isAuthenticated} onItemClick={() => setSidebarOpen(false)} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 transition-transform duration-200 ${headerHidden ? '-translate-y-full' : 'translate-y-0'}`}>
          <button
            className="sm:hidden inline-flex items-center justify-center rounded-md border bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            className="hidden sm:inline-flex items-center justify-center rounded-md border bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            aria-expanded={sidebarOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="font-semibold">
            LithoSurfer
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}


