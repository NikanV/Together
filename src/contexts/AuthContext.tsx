import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Parse, { isBackendConfigured } from '@/lib/parse'
import type { TogetherUser } from '@/types/models'

interface AuthContextValue {
  user: Parse.User | null
  profile: TogetherUser | null
  isLoading: boolean
  isBackendConfigured: boolean
  signUp: (
    username: string,
    email: string,
    password: string,
    profile?: { displayName?: string; bio?: string }
  ) => Promise<void>
  logIn: (usernameOrEmail: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  updateProfile: (displayName: string, username: string, bio: string) => Promise<void>
  updateAvatar: (file: File) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Parse.User | null>(null)
  const [profile, setProfile] = useState<TogetherUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if (isBackendConfigured) {
        const current = Parse.User.current()
        setUser(current ?? null)

        if (current) {
          try {
            const fresh = await Parse.Cloud.run('getMyProfile')
            setProfile(fresh)
          } catch (err) {
            console.error('Failed to load fresh profile', err)
            setProfile({
              objectId: current.id!,
              username: current.get('username'),
              displayName: current.get('displayName') || '',
              bio: current.get('bio') || '',
              avatarUrl: current.get('avatarUrl') || undefined,
            })
          }
        }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  async function signUp(
    username: string,
    email: string,
    password: string,
    profileInput?: { displayName?: string; bio?: string }
  ) {
    const newUser = new Parse.User()
    newUser.set('username', username)
    newUser.set('email', email)
    newUser.set('password', password)
    if (profileInput?.displayName) newUser.set('displayName', profileInput.displayName)
    if (profileInput?.bio) newUser.set('bio', profileInput.bio)
    const result = await newUser.signUp()
    setUser(result)
    setProfile({
      objectId: result.id!,
      username: result.get('username'),
      displayName: result.get('displayName') || '',
      bio: result.get('bio') || '',
      avatarUrl: result.get('avatarUrl') || undefined,
    })
  }

  async function logIn(usernameOrEmail: string, password: string) {
    const result = await Parse.User.logIn(usernameOrEmail, password)
    setUser(result)
    try {
      const fresh = await Parse.Cloud.run('getMyProfile')
      setProfile(fresh)
    } catch (err) {
      console.error('Failed to load fresh profile', err)
      setProfile({
        objectId: result.id!,
        username: result.get('username'),
        displayName: result.get('displayName') || '',
        bio: result.get('bio') || '',
        avatarUrl: result.get('avatarUrl') || undefined,
      })
    }
  }

  async function logOut() {
    await Parse.User.logOut()
    setUser(null)
    setProfile(null)
  }

  async function updateProfile(displayName: string, username: string, bio: string) {
    const result = await Parse.Cloud.run('updateProfile', { displayName, username, bio })

    setProfile({
      objectId: result.objectId,
      username: result.username,
      displayName: result.displayName,
      bio: result.bio,
      avatarUrl: result.avatarUrl ?? undefined,
    })

    const currentUser = Parse.User.current()
    if (currentUser) {
      currentUser.set('displayName', result.displayName)
      currentUser.set('username', result.username)
      currentUser.set('bio', result.bio)
    }
  }

  async function updateAvatar(file: File) {
    const parseFile = new Parse.File(file.name, file)
    await parseFile.save()

    const result = await Parse.Cloud.run('updateAvatar', { avatarFile: parseFile })

    setProfile((prev) => (prev ? { ...prev, avatarUrl: result.avatarUrl ?? undefined } : prev))

    const currentUser = Parse.User.current()
    if (currentUser) currentUser.set('avatarUrl', result.avatarUrl)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isBackendConfigured,
        signUp,
        logIn,
        logOut,
        updateProfile,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}