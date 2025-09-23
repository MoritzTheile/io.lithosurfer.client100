import { API_BASE_URL, ACCESS_TOKEN_STORAGE_KEY } from './config'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function getAuthHeader() {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function http<T>(path: string, options: RequestInit & { method?: HttpMethod } = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  }

  const isRelative = path.startsWith('/')
  const url = import.meta.env.DEV && isRelative ? path : `${API_BASE_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }
  return undefined as unknown as T
}

