import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function LoginPage() {
  const { logIn, isBackendConfigured } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isBackendConfigured) {
      setError('Backend not connected yet — add your Back4App keys to .env to enable login.')
      return
    }

    setIsSubmitting(true)
    try {
      await logIn(identifier, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      {error && (
        <div className="border-l-2 border-rose-600 bg-rose-50 p-3 font-mono text-xs text-rose-800" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="login-username">Username</Label>
          <Input
            id="login-username"
            type="text"
            placeholder="clara"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
          {isSubmitting ? (
            <span
              aria-hidden="true"
              className="mr-2 inline-block h-4 w-4 animate-spin border-2 border-white border-t-transparent"
            />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          Sign In
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/signup"
          className="font-mono text-xs uppercase tracking-wider text-ink/60 transition-colors hover:text-accent"
        >
          Sign Up instead
        </Link>
      </div>
    </AuthLayout>
  )
}