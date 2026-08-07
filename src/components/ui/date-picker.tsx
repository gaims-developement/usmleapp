import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

interface DatePickerProps {
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const d = value ? parseLocal(value) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const d = value ? parseLocal(value) : new Date()
    setView(new Date(d.getFullYear(), d.getMonth(), 1))
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const year = view.getFullYear()
  const month = view.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selected = value ? parseLocal(value) : null
  const years = Array.from({ length: today.getFullYear() - 1949 }, (_, i) => today.getFullYear() - i)

  const prevMonth = () => setView(new Date(year, month - 1, 1))
  const nextMonth = () => setView(new Date(year, month + 1, 1))

  function handleSelect(day: number) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(iso)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2.5 rounded-xl border bg-white px-4 py-3 text-left text-[15px] outline-none transition-colors',
          open ? 'border-brand-500 ring-2 ring-brand-100' : 'border-ink-200 hover:border-brand-400',
        )}
      >
        <CalendarDays className="size-4.5 shrink-0 text-ink-400" />
        <span className={cn('truncate', value ? 'text-ink-900' : 'text-ink-400')}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-[19rem] rounded-2xl border border-ink-200 bg-white p-4 shadow-lift">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="text-center">
              <div className="font-semibold text-ink-900">
                {MONTHS[month]} {year}
              </div>
              <select
                value={year}
                onChange={e => setView(new Date(Number(e.target.value), month, 1))}
                aria-label="Select year"
                className="mt-1 cursor-pointer rounded-lg border border-ink-200 bg-white px-2 py-0.5 text-xs font-medium text-ink-700 outline-none transition-colors hover:border-brand-400 focus:border-brand-500"
              >
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map(w => (
              <span key={w} className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {w}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`empty-${i}`} />
              const date = new Date(year, month, day)
              const isDisabled = date > today
              const isSelected = selected !== null && date.getTime() === selected.getTime()
              const isToday = date.getTime() === today.getTime()
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'grid size-9 cursor-pointer place-items-center rounded-full text-sm transition-colors',
                    isSelected
                      ? 'bg-brand-600 font-semibold text-white'
                      : isDisabled
                        ? 'cursor-not-allowed text-ink-300'
                        : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700',
                    isToday && !isSelected && 'font-semibold text-brand-700 ring-1 ring-brand-300',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function parseLocal(iso: string) {
  return new Date(iso + 'T00:00:00')
}

function formatDisplay(iso: string) {
  return parseLocal(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
