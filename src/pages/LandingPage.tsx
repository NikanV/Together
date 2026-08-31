import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Together</h1>
      <p className="max-w-md text-slate-600">
        Start routines with your friends, keep each other accountable, and build
        streaks by completing tasks together — every day.
      </p>
      <div className="flex gap-3">
        <Link to="/signup">
          <Button>Get started</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Log in</Button>
        </Link>
      </div>
    </div>
  )
}
