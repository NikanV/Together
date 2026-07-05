import type { TogetherUser } from '@/types/models'

export function toTogetherUser(user: Parse.Object): TogetherUser {
  return {
    objectId: user.id!,
    username: user.get('username'),
    email: user.get('email'),
    displayName: user.get('displayName'),
    bio: user.get('bio'),
    avatarUrl: user.get('avatarUrl'),
  }
}