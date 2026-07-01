// Once the Routine and StreakEntry classes exist in Back4App, implement
// these with Parse.Query / Parse.Object calls. Kept as typed stubs for now
// so pages can be wired up without waiting on the backend.

import type { Routine, StreakEntry, VerificationType } from '@/types/models'

export async function createRoutine(_input: {
  name: string
  description?: string
  verificationType: VerificationType
  memberIds: string[]
}): Promise<Routine> {
  throw new Error('Not implemented — connect Back4App and implement with Parse.Object.')
}

export async function checkInSelf(_routineId: string): Promise<StreakEntry> {
  throw new Error('Not implemented — connect Back4App and implement with Parse.Object.')
}

export async function submitProof(_routineId: string, _proofFile: File): Promise<StreakEntry> {
  throw new Error(
    'Not implemented — connect Back4App and implement with Parse.File + Parse.Object.'
  )
}

export async function approveProof(_streakEntryId: string): Promise<StreakEntry> {
  throw new Error('Not implemented — connect Back4App and implement with Parse.Object.')
}
