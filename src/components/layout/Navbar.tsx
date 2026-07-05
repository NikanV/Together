import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAvatarUrl } from '@/lib/avatar'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/friends', label: 'Crew', icon: Users },
]

export function Navbar() {
  const { user, logOut, isBackendConfigured } = useAuth()
  const navigate = useNavigate()

  const username = isBackendConfigured && user ? (user.get('username') as string) : 'you'
  const displayName =
    (isBackendConfigured && user && (user.get('displayName') as string | undefined)) || username
  const avatarUrl = isBackendConfigured && user ? (user.get('avatarUrl') as string | undefined) : undefined

  async function handleLogout() {
    if (isBackendConfigured) await logOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-baseline gap-4">
          <h1 className="text-3xl font-extrabold uppercase leading-[0.85] tracking-tighter text-ink sm:text-4xl">
            Together
            <br />
            <span className="text-accent">Streaks</span>
          </h1>
          <div className="hidden font-mono text-[10px] uppercase tracking-widest text-ink/50 md:block">
            Crew System &bull; Active
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-4 sm:w-auto sm:justify-end">
          <nav className="flex border border-ink/10 bg-ink/5 p-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    'flex cursor-pointer items-center space-x-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all',
                    isActive ? 'bg-ink text-cream' : 'text-ink/60 hover:text-ink'
                  )
                }
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-3 border border-ink/10 bg-white/40 p-1.5 pr-3">
            <img
              src={getAvatarUrl(username, avatarUrl)}
              alt={displayName}
              className="h-9 w-9 border border-ink/20 bg-white object-cover"
            />
            <div className="text-left">
              <p className="text-xs font-bold leading-none text-ink">{displayName}</p>
              <span className="font-mono text-[9px] text-ink/50">@{username}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="ml-2 cursor-pointer text-ink/40 transition-colors hover:text-accent"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}