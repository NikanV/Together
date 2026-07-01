import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/friends', label: 'Friends' },
  { to: '/profile', label: 'Profile' },
]

export function Navbar() {
  const { logOut, isBackendConfigured } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    if (isBackendConfigured) await logOut()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold text-indigo-600">Together</span>
        <nav className="flex items-center gap-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-slate-600 hover:text-indigo-600',
                  isActive && 'text-indigo-600'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </nav>
      </div>
    </header>
  )
}
