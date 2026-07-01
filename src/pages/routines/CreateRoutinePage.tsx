import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { VerificationType } from '@/types/models'

// Sample data — replace with the signed-in user's real friends list.
const mockFriends = [
  { id: '1', username: 'sara' },
  { id: '2', username: 'max' },
  { id: '3', username: 'lea' },
]

export default function CreateRoutinePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [verificationType, setVerificationType] = useState<VerificationType>('self_check')
  const [invited, setInvited] = useState<string[]>([])

  function toggleFriend(id: string) {
    setInvited((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // TODO: replace with routineService.createRoutine() once the Routine
    // class exists in Back4App.
    navigate('/dashboard')
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">New routine</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Routine name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              How should progress be verified?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVerificationType('self_check')}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  verificationType === 'self_check'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Self check-in
              </button>
              <button
                type="button"
                onClick={() => setVerificationType('proof_approval')}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  verificationType === 'proof_approval'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Proof + approval
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Invite friends</p>
            <div className="space-y-1">
              {mockFriends.map((friend) => (
                <label key={friend.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={invited.includes(friend.id)}
                    onChange={() => toggleFriend(friend.id)}
                  />
                  @{friend.username}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create routine
          </Button>
        </form>
      </Card>
    </div>
  )
}
