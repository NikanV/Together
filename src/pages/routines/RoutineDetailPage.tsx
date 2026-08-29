import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Award, Camera, CheckSquare, FileText, Flame, ThumbsUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getAvatarUrl } from '@/lib/avatar'
import { getTodayDateString, formatReadableDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import * as routineService from '@/services/routineService'

export default function RoutineDetailPage() {
  const { routineId = '' } = useParams()
  const { user, isBackendConfigured } = useAuth()
  const queryClient = useQueryClient()
  const today = getTodayDateString()
  const enabled = isBackendConfigured && Boolean(routineId)

  const [activeTab, setActiveTab] = useState<'status' | 'approvals' | 'history'>('status')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null)
  const [proofNote, setProofNote] = useState('')

  useEffect(() => {
    return () => {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl)
    }
  }, [proofPreviewUrl])

  const { data: routine, isLoading: isLoadingRoutine } = useQuery({
    queryKey: ['routine', routineId],
    queryFn: () => routineService.getRoutine(routineId),
    enabled,
  })

  const { data: todaysEntries = [] } = useQuery({
    queryKey: ['routine', routineId, 'entries', today],
    queryFn: () => routineService.getCompletionsForDate(routineId, today),
    enabled,
  })

  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['routine', routineId, 'approvals'],
    queryFn: () => routineService.getPendingApprovals(routineId),
    enabled,
  })

  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const last7DateStrings = last7Dates.map((d) => d.toISOString().split('T')[0])

  const { data: rangeEntries = [] } = useQuery({
    queryKey: ['routine', routineId, 'range', last7DateStrings.join(',')],
    queryFn: () => routineService.getCompletionsInRange(routineId, last7DateStrings),
    enabled: enabled && activeTab === 'history',
  })

  function invalidateRoutine() {
    // Prefix invalidation — this also covers the entries/approvals/activity/
    // range keys above, since they all start with ['routine', routineId].
    queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    queryClient.invalidateQueries({ queryKey: ['routines'] })
  }

  const checkInMutation = useMutation({
    mutationFn: () => routineService.checkInSelf(routineId),
    onSuccess: invalidateRoutine,
  })

  const submitProofMutation = useMutation({
    mutationFn: () => {
      if (!proofFile) throw new Error('Choose a photo first.')
      return routineService.submitProof(routineId, proofFile, proofNote || undefined)
    },
    onSuccess: () => {
      setProofFile(null)
      setProofPreviewUrl(null)
      setProofNote('')
      invalidateRoutine()
    },
  })

  const approveMutation = useMutation({
    mutationFn: (streakEntryId: string) => routineService.approveProof(streakEntryId),
    onSuccess: invalidateRoutine,
  })

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setProofFile(file)
    setProofPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  function handleProofSubmit(e: FormEvent) {
    e.preventDefault()
    if (!proofFile) return
    submitProofMutation.mutate()
  }

  if (!isBackendConfigured) {
    return (
      <div className="border-l-2 border-accent bg-accent/5 p-4 font-mono text-xs text-ink/70">
        Backend not connected yet — add your Back4App keys to .env to load this routine.
      </div>
    )
  }

  if (isLoadingRoutine) {
    return (
      <p className="py-12 text-center font-mono text-xs uppercase tracking-widest text-ink/40">
        Loading routine…
      </p>
    )
  }

  if (!routine) {
    return <p className="py-12 text-center text-sm text-ink/50">Couldn't find that routine.</p>
  }

  const myEntry = todaysEntries.find((e) => e.userId === user?.id)
  const isCheckedIn = myEntry?.status === 'completed'
  const proofSubmitted = myEntry?.status === 'pending_approval' || myEntry?.status === 'approved'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border border-ink/15 bg-white p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="border border-ink/10 bg-ink/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ink/60">
            {routine.category}
          </span>
          <h1 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-ink">{routine.name}</h1>
          {routine.description && <p className="mt-1 max-w-md text-xs text-ink/60">{routine.description}</p>}
        </div>
        <div className="flex items-center gap-1.5 self-start border border-accent/30 bg-accent/5 px-3 py-1.5">
          <Flame className="h-5 w-5 fill-current text-accent" />
          <div>
            <p className="font-mono text-[9px] font-bold uppercase leading-none text-ink/50">Streak</p>
            <p className="mt-0.5 font-mono text-sm font-black leading-none text-accent">{routine.currentStreak}d</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-ink/10 font-mono text-xs font-bold uppercase tracking-wide text-ink/50">
        {(
          [
            ['status', 'Daily Check-in'],
            ['approvals', `Approve Proofs (${pendingApprovals.length})`],
            ['history', 'History'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'cursor-pointer border-b-2 px-1 py-3 transition-all',
              activeTab === key ? 'border-accent text-ink' : 'border-transparent hover:text-ink'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: status */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <Card>
            <h4 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink/50">
              Today's Habit Tracker &mdash; {formatReadableDate(today)}
            </h4>

            {routine.verificationType === 'self_check' ? (
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-ink">Honesty-based check-in</p>
                  <p className="mt-1 text-xs text-ink/60">Let your crew know you did the habit today.</p>
                </div>
                {isCheckedIn ? (
                  <div className="flex items-center space-x-2 border border-emerald-200 bg-emerald-50 px-4 py-2.5 font-mono text-xs font-bold text-emerald-700">
                    <Check className="h-4 w-4" />
                    <span>Done for today</span>
                  </div>
                ) : (
                  <Button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    {checkInMutation.isPending ? 'Logging…' : 'Mark Completed'}
                  </Button>
                )}
              </div>
            ) : proofSubmitted ? (
              <div className="flex items-start space-x-3 border border-accent/20 bg-accent/5 p-4">
                <div className="bg-ink p-2 text-cream">
                  <Camera className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink">Proof submitted &mdash; waiting on your crew</p>
                  {myEntry?.proofNote && <p className="mt-1 text-xs italic text-ink/60">&ldquo;{myEntry.proofNote}&rdquo;</p>}
                  <span className="mt-3 inline-flex items-center bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-accent">
                    {myEntry?.status === 'approved' ? 'Approved' : 'Pending approval'}
                  </span>
                </div>
                {myEntry?.proofUrl && (
                  <img src={myEntry.proofUrl} alt="Your submitted proof" className="h-16 w-16 border border-ink/15 object-cover" />
                )}
              </div>
            ) : (
              <form onSubmit={handleProofSubmit} className="space-y-4">
                <p className="text-xs text-ink/60">
                  Upload a photo and a short note. Your crew reviews it before the streak counts.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
                      What did you do?
                    </label>
                    <Input
                      placeholder="Read chapter 4, 35 min at the gym…"
                      value={proofNote}
                      onChange={(e) => setProofNote(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
                      Photo proof
                    </label>
                    <div className="flex items-center gap-3">
                      {proofPreviewUrl ? (
                        <img
                          src={proofPreviewUrl}
                          alt="Selected proof preview"
                          className="h-11 w-11 border border-ink/15 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center border border-dashed border-ink/25 text-ink/30">
                          <Camera className="h-4 w-4" />
                        </div>
                      )}
                      <label className="cursor-pointer border border-ink/25 px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-ink/60 hover:border-accent hover:text-accent">
                        Choose file
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
                {submitProofMutation.isError && (
                  <p className="font-mono text-xs text-rose-700">
                    {submitProofMutation.error instanceof Error
                      ? submitProofMutation.error.message
                      : 'Could not submit proof.'}
                  </p>
                )}
                <Button type="submit" disabled={!proofFile || submitProofMutation.isPending} className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  {submitProofMutation.isPending ? 'Uploading…' : 'Submit Photo Proof'}
                </Button>
              </form>
            )}
          </Card>

          <div>
            <h4 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/50">Crew Tracking Checklist</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {routine.members.map((member) => {
                const entry = todaysEntries.find((e) => e.userId === member.objectId)
                const isSelf = member.objectId === user?.id
                return (
                  <div key={member.objectId} className="flex items-center justify-between border border-ink/10 bg-white p-3">
                    <div className="flex min-w-0 items-center space-x-2.5">
                      <img
                        src={getAvatarUrl(member.username, member.avatarUrl)}
                        alt={member.username}
                        className="h-8 w-8 border border-ink/15 object-cover"
                      />
                      <span className="truncate text-xs font-bold text-ink">
                        @{member.username} {isSelf && <span className="font-normal text-ink/40">(you)</span>}
                      </span>
                    </div>
                    {entry?.status === 'approved' || entry?.status === 'completed' ? (
                      <span className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-700">
                        Done
                      </span>
                    ) : entry?.status === 'pending_approval' ? (
                      <span className="border border-accent/30 bg-accent/5 px-2.5 py-1 font-mono text-[10px] font-bold text-accent">
                        Pending
                      </span>
                    ) : (
                      <span className="bg-ink/5 px-2.5 py-1 font-mono text-[10px] font-bold text-ink/40">
                        Not checked in
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Crew proofs waiting for your approval
          </h4>
          {pendingApprovals.map((item) => (
            <Card key={item.streakEntryId} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-1 items-start space-x-3.5">
                <img
                  src={getAvatarUrl(item.user.username, item.user.avatarUrl)}
                  alt={item.user.username}
                  className="h-10 w-10 shrink-0 border border-ink/15 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-sm font-bold text-ink">@{item.user.username}</h5>
                    <span className="bg-ink/5 px-2 py-0.5 font-mono text-[10px] font-bold text-ink/50">{item.date}</span>
                  </div>
                  {item.note && (
                    <div className="mt-3 border border-ink/10 bg-cream/40 p-3">
                      <p className="flex items-center space-x-1 font-mono text-[10px] font-bold uppercase tracking-wide text-ink/40">
                        <FileText className="h-3 w-3" />
                        <span>Proof note</span>
                      </p>
                      <p className="mt-1 text-xs italic text-ink/70">&ldquo;{item.note}&rdquo;</p>
                    </div>
                  )}
                  {item.proofUrl && (
                    <img src={item.proofUrl} alt="Submitted proof" className="mt-3 h-20 w-20 border border-ink/15 object-cover" />
                  )}
                </div>
              </div>
              <button
                onClick={() => approveMutation.mutate(item.streakEntryId)}
                disabled={approveMutation.isPending}
                className="flex shrink-0 cursor-pointer items-center space-x-1.5 bg-ink px-4 py-2 font-mono text-xs font-bold text-cream hover:bg-accent disabled:opacity-50"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>
            </Card>
          ))}
          {pendingApprovals.length === 0 && (
            <p className="py-12 text-center text-xs text-ink/40">No proofs waiting on you right now.</p>
          )}
        </div>
      )}

      {/* Tab: history */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h4 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink/50">Last 7 Days</h4>
            <Card>
              <div className="grid grid-cols-7 gap-2">
                {last7Dates.map((date, i) => {
                  const dateStr = last7DateStrings[i]
                  const isToday = dateStr === today
                  const dayEntries = rangeEntries.filter((e) => e.date === dateStr)
                  const allDone =
                    routine.members.length > 0 &&
                    routine.members.every((member) =>
                      dayEntries.some(
                        (e) => e.userId === member.objectId && (e.status === 'completed' || e.status === 'approved')
                      )
                    )
                  return (
                    <div key={dateStr} className="flex flex-col items-center">
                      <span
                        className={cn(
                          'mb-1.5 font-mono text-[10px] font-bold',
                          isToday ? 'text-accent' : 'text-ink/40'
                        )}
                      >
                        {isToday ? 'Today' : date.getDate()}
                      </span>
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center border',
                          allDone
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-ink/10 bg-ink/5 text-ink/20'
                        )}
                      >
                        {allDone ? (
                          <Flame className="h-5 w-5 fill-current text-emerald-500" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-center text-[10px] text-ink/40">
                A day only lights up once every crew member has checked in on it.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/50">
        <span className="flex items-center space-x-1.5">
          <Award className="h-3.5 w-3.5 text-accent" />
          <span>Created by @{routine.createdBy.username}</span>
        </span>
      </div>
    </div>
  )
}