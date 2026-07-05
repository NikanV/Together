import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { user, isLoading, isBackendConfigured } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream font-mono text-xs uppercase tracking-widest text-ink/50">
        Loading…
      </div>
    )
  }
  
  if (!isBackendConfigured) {
    return <Outlet />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}