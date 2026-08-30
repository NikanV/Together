import Parse from '@/lib/parse'
import type {
  StreakEntry,
  StreakEntryStatus,
  TogetherUser,
  VerificationType,
} from '@/types/models'

export interface RoutineWithDetails {
  objectId: string
  name: string
  description?: string
  verificationType: VerificationType
  currentStreak: number
  createdAt: string
  createdBy: TogetherUser
  members: TogetherUser[]
}

export interface RoutineWithStatus
  extends RoutineWithDetails {
  myStatus:
    | StreakEntryStatus
    | 'none'

  needsMyApproval: boolean
}

export interface PendingApproval {
  streakEntryId: string
  user: TogetherUser
  note?: string
  proofUrl?: string
  date: string
}

function requireCurrentUser(): Parse.User {
  const user = Parse.User.current()

  if (!user) {
    throw new Error(
      'You need to be logged in.'
    )
  }

  return user
}


// ============================================================
// ROUTINES
// ============================================================

export async function getRoutines(): Promise<RoutineWithDetails[]> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'getRoutines'
  )
}


export async function getRoutinesWithTodayStatus(): Promise<RoutineWithStatus[]> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'getRoutinesWithTodayStatus'
  )
}


export async function getRoutine(routineId: string): Promise<RoutineWithDetails> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'getRoutine',
    {
      routineId,
    }
  )
}


// ============================================================
// COMPLETIONS
// ============================================================

export async function getCompletionsForDate(routineId: string, date: string): Promise<StreakEntry[]> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'getCompletionsForDate',
    {
      routineId,
      date,
    }
  )
}


export async function getCompletionsInRange(routineId: string, dates: string[]): Promise<StreakEntry[]> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'getCompletionsInRange',
    {
      routineId,
      dates,
    }
  )
}


// ============================================================
// APPROVALS / ACTIVITY
// ============================================================

export async function getPendingApprovals(routineId: string): Promise<PendingApproval[]> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'getPendingApprovals',
    {
      routineId,
    }
  )
}


// ============================================================
// CREATE ROUTINE
// ============================================================

export async function createRoutine(input: {
  name: string
  description?: string
  verificationType: VerificationType
  memberIds: string[]
}): Promise<RoutineWithDetails> {

  requireCurrentUser()

  return await Parse.Cloud.run(
    'createRoutine',
    input
  )
}


// ============================================================
// CHECK IN
// ============================================================

export async function checkInSelf(routineId: string): Promise<StreakEntry> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'checkInSelf',
    {
      routineId,
    }
  )
}


// ============================================================
// SUBMIT PROOF
// ============================================================

export async function submitProof(routineId: string, proofFile: File, note?: string): Promise<StreakEntry> {
  requireCurrentUser()

  const parseFile = new Parse.File(
    proofFile.name,
    proofFile
  )

  await parseFile.save()

  return await Parse.Cloud.run(
    'submitProof',
    {
      routineId,
      proofFile: parseFile,
      note,
    }
  )
}


// ============================================================
// APPROVE PROOF
// ============================================================

export async function approveProof(streakEntryId: string): Promise<StreakEntry> {
  requireCurrentUser()

  return await Parse.Cloud.run(
    'approveProof',
    {
      streakEntryId,
    }
  )
}