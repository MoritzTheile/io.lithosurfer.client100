export const API_BASE_URL = 'https://app.lithodat.com'

export const ACCESS_TOKEN_STORAGE_KEY = 'ls_access_token'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ??
    sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  )
}

export function setStoredToken(token: string, remember: boolean = true) {
  if (typeof window === 'undefined') return
  try {
    if (remember) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
      sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    }
  } catch {}
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {}
}

