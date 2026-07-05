import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Flame,
  Plus,
  Sparkles,
  CheckCircle,
  ClipboardCheck,
  ShieldAlert,
  Calendar,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAvatarUrl } from '@/lib/avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { getRoutinesWithTodayStatus, type RoutineWithStatus } from '@/services/routineService'

function getCardStatus(routine: RoutineWithStatus) {
  if (routine.myStatus === 'completed' || routine.myStatus === 'approved') {
    return { text: 'Done', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: CheckCircle }
  }
  if (routine.myStatus === 'pending_approval') {
    return { text: 'Proof Sent', className: 'border-accent/30 bg-accent/5 text-accent', icon: ClipboardCheck }
  }
  if (routine.needsMyApproval) {
    return { text: 'Needs Approval', className: 'border-accent/40 bg-accent/10 text-ink', icon: ShieldAlert }
  }
  return { text: 'Incomplete', className: 'border-ink/10 bg-ink/5 text-ink/50', icon: Calendar }
}

export default function DashboardPage() {
  const { user, logOut, isBackendConfigured } = useAuth()

  const username = isBackendConfigured && user ? (user.get('username') as string) : 'you'
  const displayName =
    (isBackendConfigured && user && (user.get('displayName') as string | undefined)) || username
  const bio = isBackendConfigured && user ? (user.get('bio') as string | undefined) : undefined
  const avatarUrl = isBackendConfigured && user ? (user.get('avatarUrl') as string | undefined) : undefined

  const {
    data: routines = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['routines', 'today-status'],
    queryFn: getRoutinesWithTodayStatus,
    enabled: isBackendConfigured,
  })

  const totalRoutines = routines.length
  const totalStreakPoints = routines.reduce((sum, r) => sum + r.currentStreak, 0)
  const longestStreak = routines.reduce((max, r) => (r.currentStreak > max ? r.currentStreak : max), 0)

  return (
    <div className="space-y-8">
      {/* Profile summary */}
      <div className="flex flex-col gap-4 border border-ink/15 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={getAvatarUrl(username, avatarUrl)}
            alt={displayName}
            className="h-14 w-14 shrink-0 border border-ink/25 bg-white object-cover"
          />
          <div>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-xl font-extrabold tracking-tight text-ink">{displayName}</h2>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                @{username}
              </span>
            </div>
            <p className="mt-1 max-w-xl font-mono text-xs text-ink/60">
              &ldquo;{bio || 'Together we form streaks.'}&rdquo;
            </p>
          </div>
        </div>

        <button
          onClick={() => isBackendConfigured && logOut()}
          className="flex cursor-pointer items-center space-x-2 self-start bg-ink px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream transition-all hover:bg-accent md:self-center"
        >
          <LogOut className="h-3 w-3" />
          <span>Log Out</span>
        </button>
      </div>

      {!isBackendConfigured && (
        <div className="border-l-2 border-accent bg-accent/5 p-3 font-mono text-xs text-ink/70">
          Backend not connected yet — add your Back4App keys to .env to load real routines.
        </div>
      )}
      {isBackendConfigured && isError && (
        <div className="border-l-2 border-rose-600 bg-rose-50 p-3 font-mono text-xs text-rose-800">
          Couldn't load your routines. Check that Routine/StreakEntry exist in Back4App with the right permissions.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex flex-col justify-between border-t-2 border-ink pt-4">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink/50">Active Habits</span>
          <p className="mt-2 font-mono text-3xl font-bold text-ink">
            {totalRoutines < 10 ? `0${totalRoutines}` : totalRoutines}
          </p>
        </div>
        <div className="flex flex-col justify-between border-t-2 border-ink pt-4">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Aggregated Streaks
          </span>
          <p className="mt-2 flex items-center font-mono text-3xl font-bold text-accent">
            {totalStreakPoints < 10 ? `0${totalStreakPoints}` : totalStreakPoints}
            <Flame className="ml-1 h-5 w-5 fill-current text-accent" />
          </p>
        </div>
        <div className="flex flex-col justify-between border-t-2 border-ink pt-4">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink/50">Record Streak</span>
          <p className="mt-2 font-mono text-3xl font-bold text-emerald-600">
            {longestStreak < 10 ? `0${longestStreak}` : longestStreak}{' '}
            <span className="text-xs uppercase tracking-wider text-ink/40">Days</span>
          </p>
        </div>
      </div>

      {/* Routines */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <h3 className="flex items-center space-x-2 font-mono text-xs uppercase tracking-widest text-ink">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Active Habits Together</span>
          </h3>
          <Link to="/routines/new">
            <Button>
              <Plus className="mr-2 h-3 w-3" />
              Start Habit
            </Button>
          </Link>
        </div>

        {isBackendConfigured && isLoading ? (
          <p className="py-12 text-center font-mono text-xs uppercase tracking-widest text-ink/40">
            Loading routines…
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => {
              const status = getCardStatus(routine)
              const StatusIcon = status.icon
              const isDone = status.text === 'Done'

              return (
                <Link
                  key={routine.objectId}
                  to={`/routines/${routine.objectId}`}
                  className={cn(
                    'flex h-64 flex-col justify-between border border-t-4 border-ink/15 bg-white p-6 transition-all',
                    isDone ? 'border-t-emerald-600 bg-emerald-50/20' : 'border-t-ink hover:border-t-accent'
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="border border-ink/10 bg-ink/5 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink/60">
                        {routine.category}
                      </span>
                      <div className="flex items-center space-x-1 font-mono text-xs font-bold text-accent">
                        <Flame className="h-4 w-4 fill-current" />
                        <span>{routine.currentStreak}D</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="line-clamp-1 text-sm font-bold uppercase tracking-tight text-ink">
                        {routine.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/60">
                        {routine.members.length} crew members
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-4">
                    <div className="flex -space-x-1.5">
                      {routine.members.slice(0, 3).map((m) => (
                        <img
                          key={m.objectId}
                          src={getAvatarUrl(m.username, m.avatarUrl)}
                          alt={m.username}
                          title={m.username}
                          className="h-7 w-7 border border-ink/25 bg-cream object-cover"
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider',
                        status.className
                      )}
                    >
                      <StatusIcon className="mr-1 h-3 w-3 shrink-0" />
                      {status.text}
                    </span>
                  </div>
                </Link>
              )
            })}

            {routines.length === 0 && (
              <div className="col-span-full border border-ink/15 bg-white py-16 text-center">
                <Flame className="mx-auto mb-3 h-10 w-10 text-ink/20" />
                <p className="font-mono text-sm font-bold uppercase tracking-wider text-ink/70">No habits launched</p>
                <p className="mx-auto mt-1 max-w-sm font-mono text-xs text-ink/50">
                  Streaks are built together — start your first habit and invite your crew.
                </p>
                <Link to="/routines/new">
                  <Button className="mt-6">Launch Routine</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}