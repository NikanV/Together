import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Flame, CheckCircle, ClipboardCheck, ShieldAlert, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { getRoutinesWithTodayStatus, type RoutineWithStatus } from '@/services/routineService'

function getStatus(routine: RoutineWithStatus) {
  if (routine.myStatus === 'completed' || routine.myStatus === 'approved') {
    return { icon: CheckCircle, className: 'text-emerald-600' }
  }
  if (routine.myStatus === 'pending_approval') {
    return { icon: ClipboardCheck, className: 'text-accent' }
  }
  if (routine.needsMyApproval) {
    return { icon: ShieldAlert, className: 'text-accent' }
  }
  return { icon: Calendar, className: 'text-ink/25' }
}

export default function DashboardPage() {
  const { isBackendConfigured } = useAuth()

  const {
    data: routines = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['routines', 'today-status'],
    queryFn: getRoutinesWithTodayStatus,
    enabled: isBackendConfigured,
  })

  return (
    <div>
      {!isBackendConfigured && (
        <div className="mb-4 border-l-2 border-accent bg-accent/5 p-3 font-mono text-xs text-ink/70">
          Backend not connected yet — add your Back4App keys to .env to load real streaks.
        </div>
      )}
      {isBackendConfigured && isError && (
        <div className="mb-4 border-l-2 border-rose-600 bg-rose-50 p-3 font-mono text-xs text-rose-800">
          Couldn't load your streaks.
        </div>
      )}

      {isBackendConfigured && isLoading ? (
        <p className="py-16 text-center font-mono text-xs uppercase tracking-widest text-ink/40">
          Loading streaks…
        </p>
      ) : (
        <ul className="space-y-3 pb-24">
          {routines.map((routine) => {
            const status = getStatus(routine)
            const StatusIcon = status.icon
            return (
              <li key={routine.objectId}>
                <Link
                  to={`/routines/${routine.objectId}`}
                  className="flex items-center justify-between border border-ink/15 bg-white px-5 py-4 transition-colors hover:border-accent"
                >
                  <p className="truncate pr-4 text-base font-bold text-ink">{routine.name}</p>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="flex items-center gap-1 font-mono text-sm font-bold text-accent">
                      <Flame className="h-4 w-4 fill-current" />
                      {routine.currentStreak}
                    </span>
                    <StatusIcon className={cn('h-5 w-5', status.className)} />
                  </div>
                </Link>
              </li>
            )
          })}

          {routines.length === 0 && (
            <li className="border border-ink/15 bg-white py-16 text-center">
              <Flame className="mx-auto mb-3 h-10 w-10 text-ink/20" />
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-ink/70">No streaks yet</p>
              <p className="mx-auto mt-1 max-w-xs font-mono text-xs text-ink/50">
                Tap the + button to start your first one with your group.
              </p>
            </li>
          )}
        </ul>
      )}

      <Link
        to="/routines/new"
        aria-label="New streak"
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream shadow-lg transition-colors hover:bg-accent"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}