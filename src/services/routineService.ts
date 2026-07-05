import Parse from '@/lib/parse'
import { getTodayDateString } from '@/lib/date'
import { toTogetherUser } from '@/services/parseHelpers'
import type {
  ActivityLogEntry,
  RoutineCategory,
  StreakEntry,
  StreakEntryStatus,
  TogetherUser,
  VerificationType,
} from '@/types/models'

export interface RoutineWithDetails {
  objectId: string
  name: string
  description?: string
  category: RoutineCategory
  verificationType: VerificationType
  currentStreak: number
  createdAt: string
  createdBy: TogetherUser
  members: TogetherUser[]
}

export interface RoutineWithStatus extends RoutineWithDetails {
  myStatus: StreakEntryStatus | 'none'
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
  if (!user) throw new Error('You need to be logged in.')
  return user
}

function routinePointer(routineId: string) {
  return Parse.Object.extend('Routine').createWithoutData(routineId)
}

function toRoutineWithDetails(obj: Parse.Object): RoutineWithDetails {
  const members = (obj.get('members') ?? []) as Parse.Object[]
  return {
    objectId: obj.id!,
    name: obj.get('name'),
    description: obj.get('description'),
    category: obj.get('category'),
    verificationType: obj.get('verificationType'),
    currentStreak: obj.get('currentStreak') ?? 0,
    createdAt: obj.createdAt?.toISOString() ?? '',
    createdBy: toTogetherUser(obj.get('createdBy')),
    members: members.map(toTogetherUser),
  }
}

function toStreakEntry(obj: Parse.Object): StreakEntry {
  const proofFile = obj.get('proofFile') as Parse.File | undefined
  const approvedBy = (obj.get('approvedBy') ?? []) as Parse.Object[]
  return {
    objectId: obj.id!,
    routineId: obj.get('routine')?.id ?? '',
    userId: obj.get('user')?.id ?? '',
    date: obj.get('date'),
    status: obj.get('status'),
    proofUrl: proofFile?.url(),
    proofNote: obj.get('proofNote'),
    approvedBy: approvedBy.map((p) => p.id!),
  }
}

async function logActivity(routineId: string, detail: string, user?: Parse.User) {
  try {
    const ActivityLog = Parse.Object.extend('ActivityLog')
    const log = new ActivityLog()
    log.set('routine', routinePointer(routineId))
    if (user) log.set('user', user)
    log.set('detail', detail)
    await log.save()
  } catch (err) {
    // Best-effort — a logging failure shouldn't block the user's action.
    console.error('Failed to write activity log', err)
  }
}

/**
 * Client-side approximation of streak advancement: if every member of the
 * routine has a completed/approved entry for today and the streak hasn't
 * already been bumped today, increment it.
 *
 * This runs on whichever client happens to complete the routine last, which
 * is fine for a few friends checking in casually, but it isn't race-safe or
 * tamper-proof (a malicious client could call this directly). Once this
 * matters, move it into a Parse Cloud Code `afterSave` trigger on
 * StreakEntry instead — same logic, but authoritative and atomic.
 */
async function maybeAdvanceStreak(routineId: string) {
  const routine = await new Parse.Query('Routine').get(routineId)
  const today = getTodayDateString()
  if (routine.get('lastStreakDate') === today) return

  const members = (routine.get('members') ?? []) as Parse.Object[]
  const entries = await new Parse.Query('StreakEntry')
    .equalTo('routine', routinePointer(routineId))
    .equalTo('date', today)
    .find()

  const allDone = members.every((member) =>
    entries.some((e) => {
      const status = e.get('status') as StreakEntryStatus
      return e.get('user')?.id === member.id && (status === 'completed' || status === 'approved')
    })
  )

  if (allDone) {
    routine.increment('currentStreak')
    routine.set('lastStreakDate', today)
    await routine.save()
    await logActivity(routineId, `Streak advanced to ${routine.get('currentStreak')} days — everyone checked in`)
  }
}

export async function getRoutines(): Promise<RoutineWithDetails[]> {
  const currentUser = requireCurrentUser()
  const query = new Parse.Query('Routine')
  query.equalTo('members', currentUser)
  query.include(['createdBy', 'members'])
  query.descending('createdAt')
  const results = await query.find()
  return results.map(toRoutineWithDetails)
}

export async function getRoutinesWithTodayStatus(): Promise<RoutineWithStatus[]> {
  const currentUser = requireCurrentUser()
  const routines = await getRoutines()
  if (routines.length === 0) return []

  const today = getTodayDateString()
  const pointers = routines.map((r) => routinePointer(r.objectId))
  const entries = await new Parse.Query('StreakEntry')
    .containedIn('routine', pointers)
    .equalTo('date', today)
    .find()

  return routines.map((routine) => {
    const routineEntries = entries.filter((e) => e.get('routine')?.id === routine.objectId)
    const myEntry = routineEntries.find((e) => e.get('user')?.id === currentUser.id)
    const myStatus = (myEntry?.get('status') as StreakEntryStatus | undefined) ?? 'none'

    const needsMyApproval =
      routine.verificationType === 'proof_approval' &&
      routineEntries.some((e) => {
        if (e.get('user')?.id === currentUser.id) return false
        if (e.get('status') !== 'pending_approval') return false
        const approvedBy = (e.get('approvedBy') ?? []) as Parse.Object[]
        return !approvedBy.some((p) => p.id === currentUser.id)
      })

    return { ...routine, myStatus, needsMyApproval }
  })
}

export async function getRoutine(routineId: string): Promise<RoutineWithDetails> {
  const query = new Parse.Query('Routine')
  query.include(['createdBy', 'members'])
  const obj = await query.get(routineId)
  return toRoutineWithDetails(obj)
}

export async function getCompletionsForDate(routineId: string, date: string): Promise<StreakEntry[]> {
  const query = new Parse.Query('StreakEntry')
  query.equalTo('routine', routinePointer(routineId))
  query.equalTo('date', date)
  query.include('user')
  const results = await query.find()
  return results.map(toStreakEntry)
}

export async function getCompletionsInRange(routineId: string, dates: string[]): Promise<StreakEntry[]> {
  const query = new Parse.Query('StreakEntry')
  query.equalTo('routine', routinePointer(routineId))
  query.containedIn('date', dates)
  query.include('user')
  query.limit(1000)
  const results = await query.find()
  return results.map(toStreakEntry)
}

export async function getPendingApprovals(routineId: string): Promise<PendingApproval[]> {
  const currentUser = requireCurrentUser()
  const query = new Parse.Query('StreakEntry')
  query.equalTo('routine', routinePointer(routineId))
  query.equalTo('status', 'pending_approval')
  query.notEqualTo('user', currentUser)
  query.include('user')
  query.descending('createdAt')
  query.limit(30)
  const results = await query.find()

  return results
    .filter((e) => {
      const approvedBy = (e.get('approvedBy') ?? []) as Parse.Object[]
      return !approvedBy.some((p) => p.id === currentUser.id)
    })
    .map((e) => {
      const proofFile = e.get('proofFile') as Parse.File | undefined
      return {
        streakEntryId: e.id!,
        user: toTogetherUser(e.get('user')),
        note: e.get('proofNote'),
        proofUrl: proofFile?.url(),
        date: e.get('date'),
      }
    })
}

export async function getActivityLog(routineId: string): Promise<ActivityLogEntry[]> {
  const query = new Parse.Query('ActivityLog')
  query.equalTo('routine', routinePointer(routineId))
  query.include('user')
  query.descending('createdAt')
  query.limit(50)
  const results = await query.find()

  return results.map((obj) => ({
    objectId: obj.id!,
    routineId,
    username: obj.get('user')?.get('username') ?? null,
    detail: obj.get('detail'),
    createdAt: obj.createdAt?.toISOString() ?? '',
  }))
}

export async function createRoutine(input: {
  name: string
  description?: string
  category: RoutineCategory
  verificationType: VerificationType
  memberIds: string[]
}): Promise<RoutineWithDetails> {
  const currentUser = requireCurrentUser()
  const memberPointers = [
    currentUser,
    ...input.memberIds.map((id) => Parse.User.createWithoutData(id)),
  ]

  const Routine = Parse.Object.extend('Routine')
  const routine = new Routine()
  routine.set('name', input.name)
  routine.set('description', input.description ?? '')
  routine.set('category', input.category)
  routine.set('createdBy', currentUser)
  routine.set('verificationType', input.verificationType)
  routine.set('members', memberPointers)
  routine.set('currentStreak', 0)

  const saved = await routine.save()
  await logActivity(saved.id, `${currentUser.get('username')} launched this routine`, currentUser)
  return getRoutine(saved.id)
}

export async function checkInSelf(routineId: string): Promise<StreakEntry> {
  const currentUser = requireCurrentUser()
  const today = getTodayDateString()

  const existing = await new Parse.Query('StreakEntry')
    .equalTo('routine', routinePointer(routineId))
    .equalTo('user', currentUser)
    .equalTo('date', today)
    .first()
  if (existing) return toStreakEntry(existing)

  const StreakEntryClass = Parse.Object.extend('StreakEntry')
  const entry = new StreakEntryClass()
  entry.set('routine', routinePointer(routineId))
  entry.set('user', currentUser)
  entry.set('date', today)
  entry.set('status', 'completed')
  const saved = await entry.save()

  await logActivity(routineId, `${currentUser.get('username')} checked in for today`, currentUser)
  await maybeAdvanceStreak(routineId)

  return toStreakEntry(saved)
}

export async function submitProof(routineId: string, proofFile: File, note?: string): Promise<StreakEntry> {
  const currentUser = requireCurrentUser()
  const today = getTodayDateString()

  const parseFile = new Parse.File(proofFile.name, proofFile)
  await parseFile.save()

  const StreakEntryClass = Parse.Object.extend('StreakEntry')
  const entry = new StreakEntryClass()
  entry.set('routine', routinePointer(routineId))
  entry.set('user', currentUser)
  entry.set('date', today)
  entry.set('status', 'pending_approval')
  entry.set('proofFile', parseFile)
  if (note) entry.set('proofNote', note)
  const saved = await entry.save()

  await logActivity(routineId, `${currentUser.get('username')} submitted proof for today`, currentUser)

  return toStreakEntry(saved)
}

export async function approveProof(streakEntryId: string): Promise<StreakEntry> {
  const currentUser = requireCurrentUser()
  const entry = await new Parse.Query('StreakEntry').get(streakEntryId)
  const approvedBy = (entry.get('approvedBy') ?? []) as Parse.Object[]

  if (!approvedBy.some((p) => p.id === currentUser.id)) {
    entry.set('approvedBy', [...approvedBy, currentUser])
  }
  // Simplification: one approval marks it approved. If you want a quorum
  // (e.g. a majority of the crew), check approvedBy.length against
  // routine.members.length here instead.
  entry.set('status', 'approved')
  const saved = await entry.save()

  const routineId = entry.get('routine').id
  await logActivity(routineId, `${currentUser.get('username')} approved a proof`, currentUser)
  await maybeAdvanceStreak(routineId)

  return toStreakEntry(saved)
}