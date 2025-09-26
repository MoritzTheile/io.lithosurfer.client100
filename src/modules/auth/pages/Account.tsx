import { useAccount, useLogout } from '../features/useAuth'
import { API_BASE_URL } from '../../../lib/config'

export default function Account() {
  const { data, isLoading, isError, error } = useAccount()
  const logout = useLogout()

  if (isLoading) {
    return <div>Loading account...</div>
  }
  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Account</h1>
        <div className="text-red-600 text-sm">{(error as Error).message}</div>
        <button className="rounded-md border px-3 py-2" onClick={logout}>Logout</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold flex-1">Account</h1>
        <button className="rounded-md border px-3 py-2" onClick={logout}>Logout</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="font-medium">Profile details</div>
          {data?.imageUrl ? (
            <div className="mt-3">
              <img
                src={data.imageUrl.startsWith('http') ? data.imageUrl : `${API_BASE_URL}${data.imageUrl}`}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border"
              />
            </div>
          ) : null}
          <div className="text-sm text-gray-600">Login: {data?.login}</div>
          <div className="text-sm text-gray-600">Name: {data?.firstName} {data?.lastName}</div>
          <div className="text-sm text-gray-600">Email: {data?.email}</div>
          <div className="text-sm text-gray-600">Activated: {String(data?.activated)}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">Recent activity</div>
      </div>
    </div>
  )
}


