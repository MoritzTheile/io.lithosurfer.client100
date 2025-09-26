import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../features/useAuth'
import { ACCESS_TOKEN_STORAGE_KEY } from '../../../lib/config'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const loginMutation = useLogin()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await loginMutation.mutateAsync({ username, password, rememberMe })
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.assign('/samples'), 0)
      } else {
        setTimeout(() => navigate('/samples'), 0)
      }
    } catch (err) {
      // handled by UI state
    }
  }

  // If already authenticated, redirect to account
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    if (token) {
      return <div className="mx-auto max-w-md">Redirecting...</div>
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form className="space-y-3" onSubmit={onSubmit} autoComplete="on">
        <label htmlFor="username" className="sr-only">Username</label>
        <input
          id="username"
          name="username"
          className="w-full rounded-md border px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <div className="relative">
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            className="w-full rounded-md border px-3 py-2 pr-10"
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Remember me
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
        {loginMutation.isError ? (
          <ErrorDisplay error={loginMutation.error as any} />
        ) : null}
      </form>
      <div className="text-sm">
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => navigate('/reset-password')}
        >
          Forgot password?
        </button>
      </div>
    </div>
  )
}

function ErrorDisplay({ error }: { error: any }) {
  const [open, setOpen] = useState(false)
  const responseData = error?.responseData
  const detail = responseData?.detail
  const hideInline = detail === 'Bad credentials'
  const message = (error as Error)?.message
  const formatted = responseData ? JSON.stringify(responseData, null, 2) : ''

  if (hideInline && formatted) {
    return (
      <div className="text-sm text-red-600">
        <div className="flex items-center gap-2">
          <span>Authentication failed</span>
          <button
            type="button"
            className="rounded border px-2 py-0.5 text-xs text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="auth-error-details"
          >
            {open ? 'Hide details' : 'Show details'}
          </button>
        </div>
        {open ? (
          <pre id="auth-error-details" className="mt-2 whitespace-pre p-2 rounded-md border bg-white text-[12px] font-mono max-h-48 overflow-auto">
{formatted}
          </pre>
        ) : null}
      </div>
    )
  }
  return <div className="text-sm text-red-600">{message}</div>
}


