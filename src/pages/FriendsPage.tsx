import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Sample data — replace with a Parse.Query against Friendship + _User.
const mockFriends = [
  { id: '1', username: 'sara' },
  { id: '2', username: 'max' },
  { id: '3', username: 'lea' },
]

export default function FriendsPage() {
  const [query, setQuery] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Friends</h1>

      <Card>
        <h2 className="mb-3 font-medium text-slate-900">Find friends</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search by username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="secondary">Search</Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Wire this up to a Parse.Query on _User once Back4App is connected.
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 font-medium text-slate-900">Your friends</h2>
        <ul className="divide-y divide-slate-100">
          {mockFriends.map((friend) => (
            <li key={friend.id} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-700">@{friend.username}</span>
              <Button variant="ghost">Invite to routine</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
