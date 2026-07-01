import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Sample data — replace with a Parse.Query('Routine') lookup by routineId,
// plus a query on StreakEntry for today's check-ins.
const mockRoutine = {
  name: 'Morning run',
  streak: 12,
  verificationType: 'self_check' as const,
  members: [
    { id: '1', username: 'you', completedToday: false },
    { id: '2', username: 'sara', completedToday: true },
    { id: '3', username: 'max', completedToday: true },
  ],
}

export default function RoutineDetailPage() {
  const { routineId } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{mockRoutine.name}</h1>
        <p className="text-sm text-slate-500">Routine ID: {routineId}</p>
      </div>

      <Card className="text-center">
        <p className="text-4xl font-bold text-indigo-600">🔥 {mockRoutine.streak}</p>
        <p className="text-sm text-slate-500">day streak — keep it alive today</p>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium text-slate-900">Today's check-ins</h2>
        <ul className="divide-y divide-slate-100">
          {mockRoutine.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-700">@{m.username}</span>
              <span className={m.completedToday ? 'text-green-600' : 'text-slate-400'}>
                {m.completedToday ? 'Done ✓' : 'Pending'}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-slate-100 pt-4">
          {mockRoutine.verificationType === 'self_check' ? (
            <Button className="w-full">Mark today as done</Button>
          ) : (
            <Button className="w-full">Upload proof for today</Button>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {mockRoutine.verificationType === 'self_check'
              ? 'Self check-in — this just writes a StreakEntry once connected.'
              : 'Proof mode — friends approve the upload before the streak counts.'}
          </p>
        </div>
      </Card>
    </div>
  )
}
