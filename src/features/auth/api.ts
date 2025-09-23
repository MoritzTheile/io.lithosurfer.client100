import { http } from '../../lib/http'
import { ACCESS_TOKEN_STORAGE_KEY } from '../../lib/config'
import type { JWTToken, LoginVM, UserDTO } from './types'

export async function login(loginVM: LoginVM): Promise<JWTToken> {
  const token = await http<JWTToken>('/api/authenticate', {
    method: 'POST',
    body: JSON.stringify(loginVM),
  })
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token.id_token)
  return token
}

export function logout() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

export async function getAccount(): Promise<UserDTO> {
  return http<UserDTO>('/api/account', { method: 'GET' })
}

