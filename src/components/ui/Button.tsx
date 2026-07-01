import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700',
          variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
          variant === 'ghost' && 'text-slate-700 hover:bg-slate-100',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
