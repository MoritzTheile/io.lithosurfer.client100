import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { requestPasswordReset } from '../features/api'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const mutation = useMutation({
    mutationFn: async () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      await requestPasswordReset(origin, email)
    },
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutation.mutateAsync()
    } catch (err) {}
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Reset Password</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Sending...' : 'Reset Password'}
        </button>
        {mutation.isError ? (
          <div className="text-sm text-red-600">{(mutation.error as Error).message}</div>
        ) : null}
        {mutation.isSuccess ? (
          <div className="text-sm text-green-700">If an account exists for this email, a reset link has been sent.</div>
        ) : null}
      </form>
    </div>
  )
}


