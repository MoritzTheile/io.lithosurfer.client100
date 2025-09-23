import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAccount, login, logout } from './api'
import type { LoginVM, UserDTO } from './types'

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginVM) => login(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['account'] })
    },
  })
}

export function useAccount() {
  return useQuery<UserDTO>({
    queryKey: ['account'],
    queryFn: getAccount,
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return () => {
    logout()
    qc.clear()
  }
}

