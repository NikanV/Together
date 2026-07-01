import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { user, isLoading, isBackendConfigured } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    )
  }

  // Back4App isn't connected yet — let the app through so the flow can be
  // clicked through with sample data. Remove this once auth is live.
  if (!isBackendConfigured) {
    return <Outlet />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
