import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'

export default function ProfilePage() {
  const { user, isBackendConfigured } = useAuth()

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      <Card>
        {isBackendConfigured && user ? (
          <>
            <p className="text-sm text-slate-500">Username</p>
            <p className="mb-3 font-medium text-slate-900">{user.get('username')}</p>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{user.get('email')}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Connect Back4App to see your real profile here.
          </p>
        )}
      </Card>
    </div>
  )
}
