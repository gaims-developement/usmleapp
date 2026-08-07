import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChipSelectProps {
  label: string
  hint?: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}

export function ChipSelect({ label, hint, options, selected, onToggle }: ChipSelectProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-ink-900">{label}</label>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              aria-pressed={active}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-300 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700',
              )}
            >
              {active && <Check className="size-3.5" />}
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
