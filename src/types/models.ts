export interface TogetherUser {
  objectId: string
  username: string
  email?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined'

export interface Friendship {
  objectId: string
  requesterId: string
  recipientId: string
  status: FriendshipStatus
}

export type VerificationType = 'self_check' | 'proof_approval'

export interface Routine {
  objectId: string
  name: string
  description?: string
  createdById: string
  verificationType: VerificationType
  memberIds: string[]
  currentStreak: number
  lastStreakDate?: string
  createdAt: string
}

export type StreakEntryStatus = 'completed' | 'pending_approval' | 'approved' | 'rejected'

export interface StreakEntry {
  objectId: string
  routineId: string
  userId: string
  date: string
  status: StreakEntryStatus
  proofUrl?: string
  proofNote?: string
  approvedBy?: string[]
}