/**
 * These types describe the Back4App (Parse) classes this app expects.
 * _User is built into Parse; the rest need to be created in your Back4App
 * dashboard (or let Parse auto-create them on first save in dev — but
 * defining them explicitly is safer once you add Class-Level Permissions).
 *
 * Suggested schema:
 *
 * Friendship
 *   requester   Pointer<_User>
 *   recipient   Pointer<_User>
 *   status      String  ('pending' | 'accepted' | 'declined')
 *
 * Routine
 *   name               String
 *   description        String
 *   createdBy          Pointer<_User>
 *   verificationType   String  ('self_check' | 'proof_approval')
 *   members            Array<Pointer<_User>>  (or a Relation if the list gets large)
 *   currentStreak      Number
 *
 * StreakEntry
 *   routine      Pointer<Routine>
 *   user         Pointer<_User>
 *   date         Date
 *   status       String  ('completed' | 'pending_approval' | 'approved' | 'rejected')
 *   proofFile    File     (optional, only for proof_approval routines)
 *   approvedBy   Array<Pointer<_User>>
 */

export interface TogetherUser {
  objectId: string
  username: string
  email?: string
  displayName?: string
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
  approvedBy?: string[]
}
