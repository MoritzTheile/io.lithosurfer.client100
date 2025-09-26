import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { finishPasswordReset } from '../features/api'

export default function ResetPasswordFinish() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string>('')
  const keyRef = useRef<string>('')

  useEffect(() => {
    keyRef.current = searchParams.get('key') || ''
  }, [searchParams])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== password2) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }
    try {
      await finishPasswordReset(keyRef.current, password)
      setStatus('success')
      setMessage('Your password has been reset. You can now log in.')
    } catch (err) {
      setStatus('error')
      setMessage('Invalid or expired reset link')
    }
  }

  function onOk() {
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Set New Password</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Confirm new password"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Save password</button>
      </form>
      {status === 'error' ? (
        <div className="text-sm text-red-600">{message}</div>
      ) : null}
      {status === 'success' ? (
        <div className="space-y-2">
          <div className="text-sm text-green-700">{message}</div>
          <button className="rounded-md border px-3 py-2" onClick={onOk}>OK</button>
        </div>
      ) : null}
    </div>
  )
}


