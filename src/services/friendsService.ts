import Parse from '@/lib/parse'
import type { Friendship, TogetherUser } from '@/types/models'

function requireCurrentUser(): Parse.User {
  const user = Parse.User.current()
  if (!user) throw new Error('You need to be logged in.')
  return user
}

export async function searchUsers(queryText: string): Promise<TogetherUser[]> {
  requireCurrentUser()

  const query = queryText.trim()
  if (!query || query.length < 2) {
    return []
  }

  return await Parse.Cloud.run('searchUsers', {
    query,
  })
}

export async function getFriends(): Promise<TogetherUser[]> {
  requireCurrentUser()

  return await Parse.Cloud.run('getFriends')
}

export async function getPendingRequests(): Promise<(Friendship & {requester: TogetherUser})[]> {
  requireCurrentUser()

  return await Parse.Cloud.run('getPendingRequests')
}

export async function getSentRequests(): Promise<(Friendship & {recipient: TogetherUser})[]> {
  requireCurrentUser()

  return await Parse.Cloud.run('getSentRequests')
}

export async function sendFriendRequest(userId: string): Promise<Friendship> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'sendFriendRequest',
    { userId }
  )
}

export async function respondToFriendRequest(friendshipId: string, status: 'accepted' | 'declined'): Promise<Friendship> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'respondToFriendRequest',
    {
      friendshipId,
      status,
    }
  )
}