import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-none border border-ink/25 bg-cream/50 px-4 py-2.5 font-sans text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-accent',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'