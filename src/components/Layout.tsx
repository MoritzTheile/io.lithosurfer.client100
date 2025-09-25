import { PropsWithChildren, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getStoredToken } from '../lib/config'

export default function Layout({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isAuthenticated = typeof window !== 'undefined' && Boolean(getStoredToken())

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
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/samples"
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  Samples
                </NavLink>
                <NavLink
                  to="/map"
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  Map
                </NavLink>
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  Account
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Sidebar (desktop) */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-200 ease-in-out w-64 hidden sm:block`}
      >
        <div className="h-16 flex items-center px-4">
          <span className="font-semibold text-lg truncate">{sidebarOpen ? 'LithoSurfer' : 'LS'}</span>
        </div>
        <nav className="px-2 space-y-1">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/samples"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Samples
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
            </>
          ) : (
            <>
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
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
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


