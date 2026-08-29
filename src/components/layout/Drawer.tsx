import { useNavigate, NavLink } from 'react-router-dom'
import { X, LayoutDashboard, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/friends', label: 'Groups', icon: Users },
]

export function Drawer({ isOpen, onClose }: DrawerProps) {
  const { logOut, isBackendConfigured } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    onClose()
    if (isBackendConfigured) await logOut()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-ink/40 transition-opacity',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-ink/15 bg-cream transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/15 p-4">
          <span className="text-lg font-extrabold uppercase tracking-tighter text-ink">
            Together<span className="text-accent">.</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="cursor-pointer text-ink/50 hover:text-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col p-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors',
                  isActive ? 'bg-ink text-cream' : 'text-ink/70 hover:bg-ink/5'
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="mt-2 flex cursor-pointer items-center gap-3 border-t border-ink/10 px-3 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink/50 hover:text-accent"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </nav>
      </aside>
    </>
  )
}