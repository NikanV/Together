export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatReadableDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}