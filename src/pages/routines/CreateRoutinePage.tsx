import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Check, Image as ImageIcon, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { getAvatarUrl } from '@/lib/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { getFriends } from '@/services/friendsService'
import { createRoutine } from '@/services/routineService'
import { type VerificationType } from '@/types/models'

export default function CreateRoutinePage() {
  const navigate = useNavigate()
  const { isBackendConfigured } = useAuth()
  const [name, setName] = useState('')
  const [verificationType, setVerificationType] = useState<VerificationType>('self_check')
  const [invited, setInvited] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
    enabled: isBackendConfigured,
  })

  const createMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: (routine) => navigate(`/routines/${routine.objectId}`),
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not create the routine.'),
  })

  function toggleFriend(id: string) {
    setInvited((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isBackendConfigured) {
      setError('Backend not connected yet — add your Back4App keys to .env to create a routine.')
      return
    }
    if (invited.length === 0) {
      setError('A crew routine needs at least one other person to keep you honest.')
      return
    }

    createMutation.mutate({ name, verificationType, memberIds: invited })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-ink">Launch a Together Routine</h1>
        <p className="mt-1 text-sm text-ink/60">Keep your crew's streak alive by doing this task daily.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="border-l-2 border-rose-600 bg-rose-50 p-3 font-mono text-xs text-rose-800" role="alert">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="routine-name">Routine Title</Label>
            <Input
              id="routine-name"
              placeholder="Morning Run, Book Club, Meditate 10m"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* <div>
            <Label htmlFor="routine-description">Description / Promise</Label>
            <Textarea
              id="routine-description"
              placeholder="What exactly are you committing to, and how often?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div> */}

          <div>
            <Label>Verification System</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setVerificationType('self_check')}
                className={cn(
                  'flex flex-col items-start border p-4 text-left transition-all',
                  verificationType === 'self_check' ? 'border-ink bg-ink/5' : 'border-ink/15 hover:border-ink/30'
                )}
              >
                <div
                  className={cn(
                    'mb-2.5 border p-1.5',
                    verificationType === 'self_check' ? 'border-ink bg-ink text-cream' : 'border-ink/20 text-ink/50'
                  )}
                >
                  <Check className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-ink">Simple Check-in</h4>
                <p className="mt-1 text-[11px] text-ink/50">
                  Honesty-based. Tap a button to log completion — fast, no proof required.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVerificationType('proof_approval')}
                className={cn(
                  'flex flex-col items-start border p-4 text-left transition-all',
                  verificationType === 'proof_approval' ? 'border-ink bg-ink/5' : 'border-ink/15 hover:border-ink/30'
                )}
              >
                <div
                  className={cn(
                    'mb-2.5 border p-1.5',
                    verificationType === 'proof_approval' ? 'border-ink bg-ink text-cream' : 'border-ink/20 text-ink/50'
                  )}
                >
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-ink">Photo Proof</h4>
                <p className="mt-1 text-[11px] text-ink/50">
                  Stricter. Upload a photo — crew members approve it before the streak counts.
                </p>
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Invite Crew</Label>
              <span className="font-mono text-[10px] uppercase text-accent">{invited.length} selected</span>
            </div>
            <div className="max-h-44 space-y-1 overflow-y-auto border border-ink/10 bg-cream/30 p-2">
              {friends.map((friend) => {
                const isSelected = invited.includes(friend.objectId)
                return (
                  <button
                    key={friend.objectId}
                    type="button"
                    onClick={() => toggleFriend(friend.objectId)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between border p-2 text-left transition-colors',
                      isSelected ? 'border-ink/20 bg-white' : 'border-transparent hover:bg-white/60'
                    )}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={getAvatarUrl(friend.username, friend.avatarUrl)}
                        alt={friend.username}
                        className="h-7 w-7 border border-ink/15 object-cover"
                      />
                      <span className="font-mono text-xs text-ink">@{friend.username}</span>
                    </div>
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center border',
                        isSelected ? 'border-ink bg-ink text-cream' : 'border-ink/20'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                )
              })}
              {friends.length === 0 && (
                <p className="py-8 text-center text-xs text-ink/40">
                  You need crew members to start a streak — add a friend first.
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            <Users className="mr-2 h-3.5 w-3.5" />
            {createMutation.isPending ? 'Creating…' : 'Start Routine'}
          </Button>
        </form>
      </Card>
    </div>
  )
}