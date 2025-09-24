import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { register as registerApi } from '../features/auth/api'

export default function Register() {
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (password !== password2) {
        throw new Error('Passwords do not match')
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      await registerApi(origin, { login, email, password, langKey: 'en' })
    },
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutation.mutateAsync()
      setLogin('')
      setEmail('')
      setPassword('')
      setPassword2('')
      alert('Registration successful. Please check your email to activate your account.')
    } catch (err) {
      // shown below
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Confirm password"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Registering...' : 'Register'}
        </button>
        {mutation.isError ? (
          <div className="text-sm text-red-600">{(mutation.error as Error).message}</div>
        ) : null}
        {mutation.isSuccess ? (
          <div className="text-sm text-green-700">Registration successful. Check your email to activate your account.</div>
        ) : null}
      </form>
    </div>
  )
}


