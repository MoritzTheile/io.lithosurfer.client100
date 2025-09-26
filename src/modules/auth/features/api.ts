import { http } from '../../../lib/http'
import { setStoredToken, clearStoredToken } from '../../../lib/config'
import type { JWTToken, LoginVM, UserDTO, RegisterVM } from './types'

export async function login(loginVM: LoginVM): Promise<JWTToken> {
  const token = await http<JWTToken>('/api/authenticate', {
    method: 'POST',
    body: JSON.stringify(loginVM),
  })
  setStoredToken(token.id_token, Boolean(loginVM.rememberMe))
  return token
}

export function logout() {
  clearStoredToken()
}

export async function getAccount(): Promise<UserDTO> {
  return http<UserDTO>('/api/account', { method: 'GET' })
}

export async function register(origin: string, payload: RegisterVM): Promise<void> {
  await http<void>('/api/register', {
    method: 'POST',
    headers: { Origin: origin },
    body: JSON.stringify(payload),
  })
}

export async function activateAccount(key: string): Promise<void> {
  const params = new URLSearchParams({ key })
  await http<void>(`/api/activate?${params.toString()}`, { method: 'GET' })
}

export async function requestPasswordReset(origin: string, email: string): Promise<void> {
  await http<void>('/api/account/reset-password/init', {
    method: 'POST',
    headers: { Origin: origin },
    body: JSON.stringify(email),
  })
}

export async function finishPasswordReset(key: string, newPassword: string): Promise<void> {
  await http<void>('/api/account/reset-password/finish', {
    method: 'POST',
    body: JSON.stringify({ key, newPassword }),
  })
}

// Management (LithoUser)
export type LithoUser = { id: string; name?: string; login?: string; firstName?: string; lastName?: string; email?: string }

export async function getLithoUsers(params?: { search?: string, page?: number, size?: number }): Promise<LithoUser[]> {
  const p = new URLSearchParams()
  if (params?.search) p.set('search', params.search)
  if (params?.page !== undefined) p.set('page', String(params.page))
  if (params?.size !== undefined) p.set('size', String(params.size))
  const query = p.toString()
  const path = query ? `/api/management/litho-users?${query}` : '/api/management/litho-users'
  return http<LithoUser[]>(path, { method: 'GET' })
}

