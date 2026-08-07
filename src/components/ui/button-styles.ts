import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'white'
type Size = 'sm' | 'md' | 'lg'

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-glow hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-accent-600 text-white hover:bg-accent-700 hover:-translate-y-0.5 active:translate-y-0',
  outline:
    'border border-ink-300 bg-white/60 text-ink-800 hover:border-brand-500 hover:text-brand-700',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
  white: 'bg-white text-brand-800 shadow-soft hover:bg-brand-50 hover:-translate-y-0.5',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export function buttonClass(
  variant: Variant = 'primary',
  size: Size = 'md',
  className?: string,
) {
  return cn(baseStyles, variants[variant], sizes[size], className)
}

export type { Variant, Size }
