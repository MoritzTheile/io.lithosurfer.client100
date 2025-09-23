import { http } from '../../lib/http'
import { setStoredToken, clearStoredToken } from '../../lib/config'
import type { JWTToken, LoginVM, UserDTO } from './types'

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

