import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Parse, { isBackendConfigured } from '@/lib/parse'

interface AuthContextValue {
  user: Parse.User | null
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
  updateProfile: (
    displayName: string,
    username: string,
    bio: string
  ) => Promise<void>
  updateAvatar: (file: File) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Parse.User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isBackendConfigured) {
      setUser(Parse.User.current() ?? null)
    }
    setIsLoading(false)
  }, [])

  async function signUp(
    username: string,
    email: string,
    password: string,
    profile?: { displayName?: string; bio?: string }
  ) {
    const newUser = new Parse.User()
    newUser.set('username', username)
    newUser.set('email', email)
    newUser.set('password', password)
    if (profile?.displayName) newUser.set('displayName', profile.displayName)
    if (profile?.bio) newUser.set('bio', profile.bio)
    const result = await newUser.signUp()
    setUser(result)
  }

  async function logIn(usernameOrEmail: string, password: string) {
    const result = await Parse.User.logIn(usernameOrEmail, password)
    setUser(result)
  }

  async function logOut() {
    await Parse.User.logOut()
    setUser(null)
  }

  
  async function updateProfile(displayName: string, username: string, bio: string) {
    const result = await Parse.Cloud.run('updateProfile', {displayName, username, bio,})

    const currentUser = Parse.User.current()

    if (!currentUser) return

    currentUser.set('displayName', result.displayName)
    currentUser.set('username', result.username)
    currentUser.set('bio', result.bio)
    setUser(currentUser)
  }

  async function updateAvatar(file: File) {
    const parseFile = new Parse.File(file.name, file)

    await parseFile.save()
    
    const result = await Parse.Cloud.run('updateAvatar', {avatarFile: parseFile,})
    const currentUser = Parse.User.current()

    if (!currentUser) return

    currentUser.set('avatarUrl', result.avatarUrl)
    setUser(currentUser)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isBackendConfigured, signUp, logIn, logOut, updateProfile, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}