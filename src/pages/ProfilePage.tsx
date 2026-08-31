import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { useRef, useState } from 'react'

export default function ProfilePage() {
  const { user, isBackendConfigured, updateProfile, updateAvatar, } = useAuth()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isBackendConfigured || !user) {
    return (
      <div className="mx-auto w-full max-w-md">
        <Card>
          <p className="text-sm text-ink/50">
            Connect Back4App to see your profile here.
          </p>
        </Card>
      </div>
    )
  }

  const currentDisplayName = user.get('displayName') || ''

  const currentUsername = user.get('username') || ''

  const currentBio = user.get('bio') || ''

  const avatarUrl = user.get('avatarUrl') || ''

  function startEditing() {
    setDisplayName(currentDisplayName)
    setUsername(currentUsername)
    setBio(currentBio)
    setError('')
    setEditing(true)
  }

  async function handleSave() {
    setError('')
    setSaving(true)

    try {
      await updateProfile(
        displayName,
        username,
        bio
      )

      setEditing(false)
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to update profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar must be smaller than 5 MB.')
      return
    }

    setError('')
    setUploadingAvatar(true)

    try {
      await updateAvatar(file)
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to upload avatar.'
      )
    } finally {
      setUploadingAvatar(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
    <h1 className="text-2xl font-semibold text-ink">
      Profile
    </h1>

    <Card>
      <div className="flex flex-col">

      {/* Avatar + identity */}
      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-ink/10 text-3xl font-semibold text-ink">
              {(
                currentDisplayName ||
                currentUsername ||
                '?'
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-accent text-white shadow-md transition hover:scale-105 disabled:opacity-50"
            aria-label="Change profile picture"
          >
            {uploadingAvatar ? '…' : '✎'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Name + username */}
        <div className="min-w-0 text-left">
          <h2 className="truncate text-xl font-semibold text-ink">
            {currentDisplayName || currentUsername}
          </h2>

          <p className="mt-1 truncate text-sm text-ink/50">
            @{currentUsername}
          </p>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-5 border-t border-ink/10 pt-5">
        <p className="text-sm leading-relaxed text-ink/70">
          {currentBio || 'No bio yet.'}
        </p>
      </div>

        {/* Edit button */}
        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="mt-5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-ink/5"
          >
            Edit profile
          </button>
        ) : (
          <div className="mt-5 w-full space-y-4 text-left">

            <div>
              <label className="mb-1 block text-sm text-ink/50">
                Display name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                maxLength={50}
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-base text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-ink/50">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                maxLength={30}
                autoCapitalize="none"
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-3 text-base text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-ink/50">
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                maxLength={300}
                rows={4}
                className="w-full resize-none rounded-xl border border-ink/10 bg-white px-3 py-3 text-base text-ink outline-none focus:border-accent"
              />

              <p className="mt-1 text-right text-xs text-ink/40">
                {bio.length}/300
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setError('')
                }}
                disabled={saving}
                className="flex-1 rounded-xl border border-ink/10 px-4 py-3 text-sm font-medium text-ink"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  </div>
  )
}
