/**
 * Returns a user's avatar if they've set one, otherwise a deterministic
 * placeholder generated from their username so the UI never shows a
 * broken image before real avatar uploads exist.
 */
export function getAvatarUrl(username: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl
  return `https://api.dicebear.com/10.x/identicon/svg?seed=${encodeURIComponent(username)}`
}