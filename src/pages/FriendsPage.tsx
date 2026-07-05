import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, UserPlus, Check, X, Users, Clock } from 'lucide-react'
import { getAvatarUrl } from '@/lib/avatar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import * as friendsService from '@/services/friendsService'

export default function FriendsPage() {
  const { isBackendConfigured } = useAuth()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce so search doesn't fire a query on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timeout)
  }, [query])

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsService.getFriends,
    enabled: isBackendConfigured,
  })
  const { data: pendingInbound = [] } = useQuery({
    queryKey: ['friends', 'pending-inbound'],
    queryFn: friendsService.getPendingRequests,
    enabled: isBackendConfigured,
  })
  const { data: sentOutbound = [] } = useQuery({
    queryKey: ['friends', 'sent-outbound'],
    queryFn: friendsService.getSentRequests,
    enabled: isBackendConfigured,
  })
  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ['friends', 'search', debouncedQuery],
    queryFn: () => friendsService.searchUsers(debouncedQuery),
    enabled: isBackendConfigured && debouncedQuery.length > 0,
  })

  function getFriendState(userId: string): 'friend' | 'pending_outbound' | 'pending_inbound' | 'none' {
    if (friends.some((f) => f.objectId === userId)) return 'friend'
    if (sentOutbound.some((r) => r.recipient.objectId === userId)) return 'pending_outbound'
    if (pendingInbound.some((r) => r.requester.objectId === userId)) return 'pending_inbound'
    return 'none'
  }

  function invalidateFriends() {
    queryClient.invalidateQueries({ queryKey: ['friends'] })
  }

  const sendRequest = useMutation({
    mutationFn: friendsService.sendFriendRequest,
    onSuccess: invalidateFriends,
  })

  const respond = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'declined' }) =>
      friendsService.respondToFriendRequest(id, status),
    onSuccess: invalidateFriends,
  })

  return (
    <div className="space-y-6">
      {!isBackendConfigured && (
        <div className="border-l-2 border-accent bg-accent/5 p-3 font-mono text-xs text-ink/70">
          Backend not connected yet — add your Back4App keys to .env to search and manage your crew.
        </div>
      )}

      <Card className="space-y-4">
        <h3 className="flex items-center space-x-2 font-mono text-xs uppercase tracking-widest text-ink">
          <Search className="h-4 w-4 text-accent" />
          <span>Find &amp; Invite Crew</span>
        </h3>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <Input
            placeholder="Search by name or @username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
          {searchResults.map((u) => {
            const state = getFriendState(u.objectId)
            return (
              <div key={u.objectId} className="flex items-center justify-between border border-ink/10 bg-cream/40 p-3.5">
                <div className="flex items-center space-x-3">
                  <img
                    src={getAvatarUrl(u.username, u.avatarUrl)}
                    alt={u.displayName || u.username}
                    className="h-10 w-10 border border-ink/15 bg-white object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-ink">{u.displayName || u.username}</h4>
                    <p className="font-mono text-xs text-ink/40">@{u.username}</p>
                  </div>
                </div>
                {state === 'none' && (
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-[10px]"
                    onClick={() => sendRequest.mutate(u.objectId)}
                    disabled={sendRequest.isPending}
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Add
                  </Button>
                )}
                {state === 'pending_outbound' && (
                  <span className="inline-flex items-center px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    Sent
                  </span>
                )}
                {state === 'friend' && (
                  <span className="inline-flex items-center px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-600">
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Crew
                  </span>
                )}
                {state === 'pending_inbound' && (
                  <span className="inline-flex items-center px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/50">
                    Check invites
                  </span>
                )}
              </div>
            )
          })}
          {debouncedQuery && !isSearching && searchResults.length === 0 && (
            <p className="col-span-2 py-6 text-center text-sm text-ink/40">
              No users found matching &ldquo;{debouncedQuery}&rdquo;
            </p>
          )}
        </div>
        <p className="font-mono text-[10px] text-ink/40">
          Needs Find permission on _User in Back4App — see the security note in friendsService.ts.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-1">
          <h3 className="flex items-center space-x-2 border-b border-ink/10 pb-3 font-mono text-xs uppercase tracking-widest text-ink">
            <Clock className="h-4 w-4 text-accent" />
            <span>Crew Invites</span>
            {pendingInbound.length > 0 && (
              <span className="bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold text-cream">
                {pendingInbound.length}
              </span>
            )}
          </h3>

          <div className="space-y-3">
            {pendingInbound.map((req) => (
              <div key={req.objectId} className="space-y-3 border border-ink/10 bg-cream/40 p-3">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={getAvatarUrl(req.requester.username, req.requester.avatarUrl)}
                    alt={req.requester.displayName || req.requester.username}
                    className="h-9 w-9 border border-ink/15 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-bold text-ink">
                      {req.requester.displayName || req.requester.username}
                    </h4>
                    <p className="truncate font-mono text-[10px] text-ink/40">@{req.requester.username}</p>
                  </div>
                </div>
                {req.requester.bio && (
                  <p className="border border-ink/10 bg-white p-2 font-mono text-[11px] italic text-ink/60">
                    &ldquo;{req.requester.bio}&rdquo;
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => respond.mutate({ id: req.objectId, status: 'accepted' })}
                    disabled={respond.isPending}
                    className="flex flex-1 cursor-pointer items-center justify-center space-x-1 bg-ink py-1.5 font-mono text-[11px] font-bold text-cream hover:bg-accent disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => respond.mutate({ id: req.objectId, status: 'declined' })}
                    disabled={respond.isPending}
                    className="flex flex-1 cursor-pointer items-center justify-center space-x-1 border border-ink/20 py-1.5 font-mono text-[11px] font-bold text-ink/60 hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    <span>Ignore</span>
                  </button>
                </div>
              </div>
            ))}
            {pendingInbound.length === 0 && (
              <p className="py-8 text-center text-xs text-ink/40">No incoming crew invites.</p>
            )}
          </div>
        </Card>

        <Card className="space-y-4 lg:col-span-2">
          <h3 className="flex items-center space-x-2 border-b border-ink/10 pb-3 font-mono text-xs uppercase tracking-widest text-ink">
            <Users className="h-4 w-4 text-accent" />
            <span>Your Crew</span>
            <span className="font-mono text-xs font-normal text-ink/40">({friends.length})</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {friends.map((friend) => (
              <div key={friend.objectId} className="flex items-start space-x-3 border border-ink/10 bg-cream/30 p-3.5">
                <img
                  src={getAvatarUrl(friend.username, friend.avatarUrl)}
                  alt={friend.displayName || friend.username}
                  className="h-11 w-11 shrink-0 border border-ink/15 bg-white object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-ink">{friend.displayName || friend.username}</h4>
                  <p className="truncate font-mono text-[11px] text-ink/40">@{friend.username}</p>
                  {friend.bio && <p className="mt-1 line-clamp-2 text-xs italic text-ink/60">&ldquo;{friend.bio}&rdquo;</p>}
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <p className="col-span-2 py-12 text-center text-sm text-ink/40">
                No crew members yet — search above to find people to add.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}