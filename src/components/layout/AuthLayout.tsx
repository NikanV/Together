import { type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 font-sans text-ink sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold uppercase leading-none tracking-tighter text-ink">
            TOGETHER
            <br />
            <span className="text-accent">STREAKS</span>
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink/60">
            Crew System &bull; Routine Together
          </p>
        </div>
        {children}
      </Card>
    </div>
  )
}