import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}