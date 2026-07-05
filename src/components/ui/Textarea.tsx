import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full resize-none rounded-none border border-ink/25 bg-cream/50 px-4 py-2.5 font-sans text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-accent',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'