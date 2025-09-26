import { NavLink } from 'react-router-dom'

type Props = {
  isAuthenticated: boolean
  onItemClick?: () => void
}

export default function SidebarNav({ isAuthenticated, onItemClick }: Props) {
  return (
    <>
      {isAuthenticated ? (
        <>
          <NavLink
            to="/samples"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={onItemClick}
          >
            Samples
          </NavLink>

          <NavLink
            to="/account"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              }`
            }
            onClick={onItemClick}
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
            onClick={onItemClick}
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
            onClick={onItemClick}
          >
            Register
          </NavLink>
        </>
      )}
    </>
  )
}


