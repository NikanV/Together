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
          'inline-flex cursor-pointer items-center justify-center rounded-none px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all disabled:pointer-events-none disabled:opacity-50',
          variant === 'primary' && 'bg-ink text-cream hover:bg-accent',
          variant === 'secondary' &&
            'border border-ink/25 bg-transparent text-ink hover:border-accent hover:text-accent',
          variant === 'ghost' && 'text-ink/60 hover:text-accent',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'