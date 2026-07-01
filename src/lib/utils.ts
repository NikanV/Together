import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes, letting later classes override earlier
 * conflicting ones (e.g. cn('p-2', condition && 'p-4') resolves cleanly).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
