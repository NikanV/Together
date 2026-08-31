import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, UserCircle } from 'lucide-react'
import { Drawer } from '@/components/layout/Drawer'

export function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink/15 bg-cream">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer text-ink hover:text-accent"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/dashboard" aria-label="Go to dashboard" className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60 transition-colors hover:text-accent">
            Together Streaks
          </Link>

          <Link to="/profile" aria-label="Profile and settings" className="text-ink hover:text-accent">
            <UserCircle className="h-6 w-6" />
          </Link>
        </div>
      </header>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}