import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'

export default function SignupPage() {
  const { signUp, isBackendConfigured } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isBackendConfigured) {
      setError('Backend not connected yet — add your Back4App keys to .env to enable sign up.')
      return
    }

    setIsSubmitting(true)
    try {
      await signUp(username, email, password, { displayName: name, bio })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign up.')
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
          <Label htmlFor="signup-name">Full Name</Label>
          <Input id="signup-name" type="text" placeholder="Clara Key" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>

        <div>
          <Label htmlFor="signup-email">Email Address</Label>
          <Input id="signup-email" type="email" placeholder="clara@together.app" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>

        <div>
          <Label htmlFor="signup-username">Username</Label>
          <Input id="signup-username" type="text" placeholder="clara" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </div>

        <div>
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
        </div>

        <div>
          <Label htmlFor="signup-bio">Short Bio (Optional)</Label>
          <Textarea id="signup-bio" placeholder="Let's build habits together!" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} />
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
          {isSubmitting ? (
            <span aria-hidden="true" className="mr-2 inline-block h-4 w-4 animate-spin border-2 border-white border-t-transparent" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Create Account
        </Button>
      </form>

      <div className="text-center">
        <Link to="/login" className="font-mono text-xs uppercase tracking-wider text-ink/60 transition-colors hover:text-accent">
          Log In instead
        </Link>
      </div>
    </AuthLayout>
  )
}