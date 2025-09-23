import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../features/auth/useAuth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const navigate = useNavigate()
  const loginMutation = useLogin()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await loginMutation.mutateAsync({ username, password, rememberMe })
      navigate('/account')
    } catch (err) {
      // handled by UI state
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Remember me
        </label>
        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
        {loginMutation.isError ? (
          <div className="text-sm text-red-600">{(loginMutation.error as Error).message}</div>
        ) : null}
      </form>
    </div>
  )
}


