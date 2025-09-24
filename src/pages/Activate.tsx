import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { activateAccount } from '../features/auth/api'

export default function Activate() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'pending'>('pending')
  const [message, setMessage] = useState('Activating your account...')
  const didRunRef = useRef(false)
  const key = searchParams.get('key') || ''

  useEffect(() => {
    if (didRunRef.current) return
    didRunRef.current = true
    if (!key) {
      setStatus('error')
      setMessage('Invalid Activation Link')
      return
    }
    ;(async () => {
      try {
        await activateAccount(key)
        setStatus('success')
        setMessage('Your account has been activated')
      } catch (err) {
        setStatus('error')
        setMessage('Invalid Activation Link (Already activated?)')
      }
    })()
  }, [])

  function onOk() {
    navigate('/login', { replace: true })
  }

  const color = status === 'success' ? 'text-green-700 bg-green-50 border-green-300' : status === 'error' ? 'text-red-700 bg-red-50 border-red-300' : 'text-gray-700 bg-gray-50 border-gray-300'

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Account Activation</h1>
      <div className={`rounded-md border p-4 ${color}`}>{message}</div>
      <div>
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={onOk}
          disabled={status === 'pending'}
        >
          OK
        </button>
      </div>
    </div>
  )
}


