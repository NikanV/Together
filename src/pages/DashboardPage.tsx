import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Sample data so the page is navigable before Back4App is connected.
// Replace with a TanStack Query hook reading the Routine class once it exists.
const mockRoutines = [
  { id: '1', name: 'Morning run', streak: 12, members: 3, verificationType: 'self_check' as const },
  { id: '2', name: 'No sugar challenge', streak: 5, members: 4, verificationType: 'proof_approval' as const },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Your routines</h1>
        <Link to="/routines/new">
          <Button>New routine</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mockRoutines.map((routine) => (
          <Link key={routine.id} to={`/routines/${routine.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-slate-900">{routine.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {routine.members} members ·{' '}
                {routine.verificationType === 'self_check' ? 'Self check-in' : 'Proof required'}
              </p>
              <p className="mt-3 text-2xl font-bold text-indigo-600">🔥 {routine.streak} day streak</p>
            </Card>
          </Link>
        ))}
      </div>
      <p className="text-xs text-slate-400">Showing sample data until Back4App is connected.</p>
    </div>
  )
}
