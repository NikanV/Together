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
 *   category           String  ('Fitness' | 'Wellness' | 'Growth' | 'Study' | 'Creative')
 *   createdBy          Pointer<_User>
 *   verificationType   String  ('self_check' | 'proof_approval')
 *   members            Array<Pointer<_User>>  (or a Relation if the list gets large)
 *   currentStreak      Number
 *   lastStreakDate     String  ('YYYY-MM-DD' — the last day the streak was advanced,
 *                                 so a day only ever counts once)
 *
 * StreakEntry
 *   routine      Pointer<Routine>
 *   user         Pointer<_User>
 *   date         String  ('YYYY-MM-DD' — a String, not Parse's Date type, so
 *                           "did they check in today" is an exact-match query
 *                           instead of a timezone-sensitive range query)
 *   status       String  ('completed' | 'pending_approval' | 'approved' | 'rejected')
 *   proofFile    File     (optional, only for proof_approval routines)
 *   proofNote    String   (optional, the "what did you do" text)
 *   approvedBy   Array<Pointer<_User>>
 *
 * ActivityLog
 *   routine   Pointer<Routine>
 *   user      Pointer<_User>  (omit for system-generated entries, e.g. streak milestones)
 *   detail    String
 */

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

export const ROUTINE_CATEGORIES = ['Fitness', 'Wellness', 'Growth', 'Study', 'Creative'] as const
export type RoutineCategory = (typeof ROUTINE_CATEGORIES)[number]

export interface Routine {
  objectId: string
  name: string
  description?: string
  category: RoutineCategory
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

export interface ActivityLogEntry {
  objectId: string
  routineId: string
  username: string | null
  detail: string
  createdAt: string
}