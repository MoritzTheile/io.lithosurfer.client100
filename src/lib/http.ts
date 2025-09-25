import { API_BASE_URL, ACCESS_TOKEN_STORAGE_KEY, getStoredToken } from './config'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function buildHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init)
  headers.set('Content-Type', 'application/json')
  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

export async function http<T>(path: string, options: RequestInit & { method?: HttpMethod } = {}): Promise<T> {
  const headers = buildHeaders(options.headers)

  const isRelative = path.startsWith('/')
  const url = import.meta.env.DEV && isRelative ? path : `${API_BASE_URL}${path}`

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    // Do not auto-redirect on 401; surface the error to the caller/UI.
    let message = ''
    let data: any = undefined
    try {
      data = await response.clone().json()
      const baseMessage = (data && (data.message || data.title || data.error_description || data.error)) || ''
      const detail = data && (data.detail || data.path ? `${data.detail || ''}` : '')
      message = [baseMessage, detail].filter(Boolean).join(' - ')
    } catch {}
    if (!message) {
      message = await response.text().catch(() => '')
    }
    const error: any = new Error(message || `Request failed with status ${response.status}`)
    if (data !== undefined) {
      error.responseData = data
    }
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }
  return undefined as unknown as T
}

export async function httpWithResponse<T>(path: string, options: RequestInit & { method?: HttpMethod } = {}): Promise<{ data: T, response: Response }> {
  const headers = buildHeaders(options.headers)

  const isRelative = path.startsWith('/')
  const url = import.meta.env.DEV && isRelative ? path : `${API_BASE_URL}${path}`

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    let message = ''
    let data: any = undefined
    try {
      data = await response.clone().json()
      const baseMessage = (data && (data.message || data.title || data.error_description || data.error)) || ''
      const detail = data && (data.detail || data.path ? `${data.detail || ''}` : '')
      message = [baseMessage, detail].filter(Boolean).join(' - ')
    } catch {}
    if (!message) {
      message = await response.text().catch(() => '')
    }
    const error: any = new Error(message || `Request failed with status ${response.status}`)
    if (data !== undefined) {
      error.responseData = data
    }
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  let data: any = undefined
  if (contentType.includes('application/json')) {
    data = await response.json()
  }
  return { data: data as T, response }
}

