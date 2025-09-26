import { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ACCESS_TOKEN_STORAGE_KEY } from './config'

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation()
  const hasToken =
    typeof window !== 'undefined' &&
    (localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}


