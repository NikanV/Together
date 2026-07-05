// SECURITY NOTE on searchUsers: by default Back4App often locks down "Find"
// on _User for privacy, since a public find query would let any logged-in
// client page through every user's full record. Before this works you'll
// need to either (a) enable Find on _User in Class-Level Permissions —
// understand that this exposes every field on _User to any authenticated
// client unless you also configure per-field protection — or (b), the
// safer route, move this query into a Parse Cloud Code function that only
// returns the safe fields (username, displayName, avatarUrl) and call that
// via Parse.Cloud.run('searchUsers', { query }) instead.

import Parse from '@/lib/parse'
import { toTogetherUser } from '@/services/parseHelpers'
import type { Friendship, TogetherUser } from '@/types/models'

function requireCurrentUser(): Parse.User {
  const user = Parse.User.current()
  if (!user) throw new Error('You need to be logged in.')
  return user
}

function toFriendship(obj: Parse.Object): Friendship {
  return {
    objectId: obj.id!,
    requesterId: obj.get('requester')?.id ?? '',
    recipientId: obj.get('recipient')?.id ?? '',
    status: obj.get('status'),
  }
}

export async function searchUsers(queryText: string): Promise<TogetherUser[]> {
  const currentUser = requireCurrentUser()
  const trimmed = queryText.trim()
  if (!trimmed) return []

  const byUsername = new Parse.Query(Parse.User)
  byUsername.matches('username', trimmed, 'i')

  const byDisplayName = new Parse.Query(Parse.User)
  byDisplayName.matches('displayName', trimmed, 'i')

  const query = Parse.Query.or(byUsername, byDisplayName)
  query.notEqualTo('objectId', currentUser.id)
  query.limit(20)

  const results = await query.find()
  return results.map(toTogetherUser)
}

export async function getFriends(): Promise<TogetherUser[]> {
  const currentUser = requireCurrentUser()

  const asRequester = new Parse.Query('Friendship')
  asRequester.equalTo('requester', currentUser)
  asRequester.equalTo('status', 'accepted')

  const asRecipient = new Parse.Query('Friendship')
  asRecipient.equalTo('recipient', currentUser)
  asRecipient.equalTo('status', 'accepted')

  const query = Parse.Query.or(asRequester, asRecipient)
  query.include(['requester', 'recipient'])
  const results = await query.find()

  return results.map((f) => {
    const requester = f.get('requester') as Parse.Object
    const recipient = f.get('recipient') as Parse.Object
    const other = requester.id === currentUser.id ? recipient : requester
    return toTogetherUser(other)
  })
}

export async function getPendingRequests(): Promise<(Friendship & { requester: TogetherUser })[]> {
  const currentUser = requireCurrentUser()

  const query = new Parse.Query('Friendship')
  query.equalTo('recipient', currentUser)
  query.equalTo('status', 'pending')
  query.include('requester')
  query.descending('createdAt')
  const results = await query.find()

  return results.map((f) => ({
    ...toFriendship(f),
    requester: toTogetherUser(f.get('requester')),
  }))
}

export async function getSentRequests(): Promise<(Friendship & { recipient: TogetherUser })[]> {
  const currentUser = requireCurrentUser()

  const query = new Parse.Query('Friendship')
  query.equalTo('requester', currentUser)
  query.equalTo('status', 'pending')
  query.include('recipient')
  query.descending('createdAt')
  const results = await query.find()

  return results.map((f) => ({
    ...toFriendship(f),
    recipient: toTogetherUser(f.get('recipient')),
  }))
}

export async function sendFriendRequest(userId: string): Promise<Friendship> {
  const currentUser = requireCurrentUser()

  const FriendshipClass = Parse.Object.extend('Friendship')
  const friendship = new FriendshipClass()
  friendship.set('requester', currentUser)
  friendship.set('recipient', Parse.User.createWithoutData(userId))
  friendship.set('status', 'pending')

  const saved = await friendship.save()
  return toFriendship(saved)
}

export async function respondToFriendRequest(
  friendshipId: string,
  status: 'accepted' | 'declined'
): Promise<Friendship> {
  const friendship = await new Parse.Query('Friendship').get(friendshipId)
  friendship.set('status', status)
  const saved = await friendship.save()
  return toFriendship(saved)
}