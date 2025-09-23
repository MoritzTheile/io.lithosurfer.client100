import { PropsWithChildren, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getStoredToken } from '../lib/config'

export default function Layout({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isAuthenticated = typeof window !== 'undefined' && Boolean(getStoredToken())

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-200 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-16'
        } hidden sm:block`}
      >
        <div className="h-16 flex items-center px-4">
          <span className="font-semibold text-lg truncate">{sidebarOpen ? 'LithoSurfer' : 'LS'}</span>
        </div>
        <nav className="px-2 space-y-1">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Account
              </NavLink>
              <NavLink
                to="/map"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Map
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
          <button
            className="sm:inline-flex inline-flex items-center justify-center rounded-md border bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? 'Collapse' : 'Expand'}
          </button>
          <Link to="/" className="font-semibold">
            LithoSurfer
          </Link>
          <div className="ml-auto text-sm text-gray-500">v0.0.0</div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}


