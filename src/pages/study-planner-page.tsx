import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Flag,
  ListChecks,
  Plus,
  RotateCcw,
  Timer,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'

type TaskStatus = 'todo' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'
type ImportantDateType = 'exam' | 'deadline' | 'rotation' | 'personal'

interface PlannerTask {
  id: string
  title: string
  date: string
  priority: TaskPriority
  status: TaskStatus
}

interface ImportantDate {
  id: string
  title: string
  date: string
  type: ImportantDateType
  note: string
}

const today = new Date().toISOString().slice(0, 10)

const initialTasks: PlannerTask[] = [
  { id: 'task-1', title: 'Finish 40 UWorld cardiology questions', date: today, priority: 'high', status: 'todo' },
  { id: 'task-2', title: 'Review incorrects from yesterday', date: today, priority: 'medium', status: 'todo' },
  { id: 'task-3', title: 'Upload updated CV draft', date: offsetDate(1), priority: 'medium', status: 'todo' },
  { id: 'task-4', title: 'Read ethics notes', date: offsetDate(2), priority: 'low', status: 'done' },
]

const initialDates: ImportantDate[] = [
  { id: 'date-1', title: 'Step 2 CK self-assessment', date: offsetDate(3), type: 'exam', note: 'NBME form review after completion.' },
  { id: 'date-2', title: 'Elective application deadline', date: offsetDate(6), type: 'deadline', note: 'Submit documents before 6 PM.' },
]

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

export function StudyPlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>(initialTasks)
  const [importantDates, setImportantDates] = useState<ImportantDate[]>(initialDates)
  const [selectedDate, setSelectedDate] = useState(today)
  const [monthStart, setMonthStart] = useState(() => startOfMonth(today))
  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [importantTitle, setImportantTitle] = useState('')
  const [importantType, setImportantType] = useState<ImportantDateType>('deadline')
  const [importantNote, setImportantNote] = useState('')
  const [minutes, setMinutes] = useState(25)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  const selectedTasks = tasks.filter(task => task.date === selectedDate)
  const selectedDates = importantDates.filter(item => item.date === selectedDate)
  const completedToday = selectedTasks.filter(task => task.status === 'done').length
  const monthLabel = monthFormatter.format(new Date(`${monthStart}T00:00:00`))

  const calendarDays = useMemo(() => buildCalendarDays(monthStart), [monthStart])

  useEffect(() => {
    if (!running) return
    if (remainingSeconds <= 0) {
      setRunning(false)
      return
    }
    const id = window.setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [remainingSeconds, running])

  function addTask() {
    if (!taskTitle.trim()) return
    setTasks(prev => [
      {
        id: `task-${Date.now()}`,
        title: taskTitle.trim(),
        date: selectedDate,
        priority: taskPriority,
        status: 'todo',
      },
      ...prev,
    ])
    setTaskTitle('')
    setTaskPriority('medium')
  }

  function addImportantDate() {
    if (!importantTitle.trim()) return
    setImportantDates(prev => [
      {
        id: `date-${Date.now()}`,
        title: importantTitle.trim(),
        date: selectedDate,
        type: importantType,
        note: importantNote.trim(),
      },
      ...prev,
    ])
    setImportantTitle('')
    setImportantType('deadline')
    setImportantNote('')
  }

  function toggleTask(id: string) {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task,
      ),
    )
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  function removeImportantDate(id: string) {
    setImportantDates(prev => prev.filter(item => item.id !== id))
  }

  function setPomodoroLength(nextMinutes: number) {
    setMinutes(nextMinutes)
    setRemainingSeconds(nextMinutes * 60)
    setRunning(false)
  }

  function tickPomodoro() {
    setRemainingSeconds(prev => Math.max(0, prev - 60))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Planner"
        subtitle="Plan daily study blocks, track tasks, and keep important exam and application dates in view."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <PlannerStat icon={ListChecks} label="Tasks today" value={selectedTasks.length} />
        <PlannerStat icon={CheckCircle2} label="Completed" value={`${completedToday}/${selectedTasks.length}`} tone="brand" />
        <PlannerStat icon={Flag} label="Important dates" value={selectedDates.length} tone="amber" />
        <PlannerStat icon={Timer} label="Pomodoro" value={`${minutes} min`} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Calendar</h2>
              <p className="mt-1 text-sm text-ink-500">
                Daily tasks and important dates appear on their assigned day.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setMonthStart(addMonths(monthStart, -1))}>
                Previous
              </Button>
              <span className="min-w-36 text-center text-sm font-bold text-ink-800">{monthLabel}</span>
              <Button variant="outline" size="sm" onClick={() => setMonthStart(addMonths(monthStart, 1))}>
                Next
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-ink-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              const dayTasks = tasks.filter(task => task.date === day.date)
              const dayDates = importantDates.filter(item => item.date === day.date)
              const selected = day.date === selectedDate
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    'min-h-24 cursor-pointer rounded-2xl border p-2 text-left transition-colors',
                    day.currentMonth ? 'bg-white' : 'bg-ink-50/70 text-ink-400',
                    selected ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-ink-200 hover:border-brand-300',
                  )}
                >
                  <span className={cn('text-sm font-bold', day.date === today && 'text-brand-700')}>
                    {Number(day.date.slice(-2))}
                  </span>
                  <div className="mt-2 space-y-1">
                    {dayTasks.slice(0, 2).map(task => (
                      <span
                        key={task.id}
                        className={cn(
                          'block truncate rounded-md px-2 py-1 text-[11px] font-semibold',
                          task.status === 'done' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700',
                        )}
                      >
                        {task.title}
                      </span>
                    ))}
                    {dayDates.slice(0, 1).map(item => (
                      <span key={item.id} className="block truncate rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                        {item.title}
                      </span>
                    ))}
                    {dayTasks.length + dayDates.length > 3 && (
                      <span className="block text-[11px] font-semibold text-ink-400">
                        +{dayTasks.length + dayDates.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <PomodoroCard
            minutes={minutes}
            remainingSeconds={remainingSeconds}
            running={running}
            onLengthChange={setPomodoroLength}
            onStartPause={() => setRunning(v => !v)}
            onTick={tickPomodoro}
            onReset={() => {
              setRunning(false)
              setRemainingSeconds(minutes * 60)
            }}
          />

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">
              {dayFormatter.format(new Date(`${selectedDate}T00:00:00`))}
            </h2>
            <p className="mt-1 text-sm text-ink-500">Daily tasks and important dates.</p>

            <div className="mt-5 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Add a daily task..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') addTask()
                  }}
                />
                <Select
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-28"
                  aria-label="Task priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
                <Button type="button" onClick={addTask} aria-label="Add task">
                  <Plus className="size-4" aria-hidden />
                </Button>
              </div>

              <div className="space-y-2">
                {selectedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 rounded-2xl border border-ink-100 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        'grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border',
                        task.status === 'done'
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-ink-300 text-ink-400',
                      )}
                      aria-label="Toggle task"
                    >
                      {task.status === 'done' && <CheckCircle2 className="size-4" aria-hidden />}
                    </button>
                    <span className={cn('min-w-0 flex-1 truncate text-sm font-semibold', task.status === 'done' && 'text-ink-400 line-through')}>
                      {task.title}
                    </span>
                    <StatusBadge label={task.priority} tone={priorityTone(task.priority)} />
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="grid size-8 cursor-pointer place-items-center rounded-xl text-ink-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete task"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                ))}
                {selectedTasks.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-500">
                    No tasks for this day yet.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink-900">Important Dates</h2>
            <div className="mt-4 space-y-3">
              <Input
                value={importantTitle}
                onChange={e => setImportantTitle(e.target.value)}
                placeholder="Add exam, deadline, rotation..."
              />
              <Select value={importantType} onChange={e => setImportantType(e.target.value as ImportantDateType)}>
                <option value="deadline">Deadline</option>
                <option value="exam">Exam</option>
                <option value="rotation">Rotation</option>
                <option value="personal">Personal</option>
              </Select>
              <Textarea
                rows={2}
                value={importantNote}
                onChange={e => setImportantNote(e.target.value)}
                placeholder="Optional note..."
              />
              <Button type="button" className="w-full" onClick={addImportantDate}>
                <Plus className="size-4" aria-hidden />
                Add to selected date
              </Button>
            </div>

            <div className="mt-5 space-y-2">
              {selectedDates.map(item => (
                <div key={item.id} className="rounded-2xl border border-ink-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-900">{item.title}</p>
                      <p className="mt-1 text-xs text-ink-500">{item.note || 'No note added.'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge label={item.type} tone={dateTone(item.type)} />
                      <button
                        type="button"
                        onClick={() => removeImportantDate(item.id)}
                        className="grid size-8 cursor-pointer place-items-center rounded-xl text-ink-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete important date"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {selectedDates.length === 0 && (
                <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-500">
                  No important dates on this day.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function PomodoroCard({
  minutes,
  remainingSeconds,
  running,
  onLengthChange,
  onStartPause,
  onTick,
  onReset,
}: {
  minutes: number
  remainingSeconds: number
  running: boolean
  onLengthChange: (minutes: number) => void
  onStartPause: () => void
  onTick: () => void
  onReset: () => void
}) {
  return (
    <section className="rounded-3xl border border-ink-200 bg-ink-900 p-5 text-white shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Pomodoro Timer</h2>
          <p className="mt-1 text-sm text-ink-300">Focus in timed study blocks.</p>
        </div>
        <Clock3 className="size-6 text-brand-400" aria-hidden />
      </div>
      <div className="my-6 text-center">
        <p className="font-display text-5xl font-bold tracking-normal">{formatTimer(remainingSeconds)}</p>
        <p className="mt-2 text-xs font-semibold uppercase text-ink-400">{running ? 'Focus session running' : 'Ready to study'}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[25, 45, 60].map(option => (
          <button
            key={option}
            type="button"
            onClick={() => onLengthChange(option)}
            className={cn(
              'cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
              minutes === option
                ? 'border-brand-400 bg-brand-600 text-white'
                : 'border-white/10 bg-white/5 text-ink-200 hover:bg-white/10',
            )}
          >
            {option}m
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="button" className="flex-1" onClick={onStartPause}>
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button type="button" variant="secondary" onClick={onTick} disabled={remainingSeconds === 0}>
          -1 min
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} aria-label="Reset timer">
          <RotateCcw className="size-4" aria-hidden />
        </Button>
      </div>
    </section>
  )
}

function PlannerStat({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: typeof ListChecks
  label: string
  value: number | string
  tone?: 'neutral' | 'brand' | 'amber' | 'violet'
}) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-100 text-brand-700',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-700',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-soft">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tones[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-tight text-ink-900">{value}</p>
        <p className="truncate text-xs font-medium text-ink-500">{label}</p>
      </div>
    </div>
  )
}

function priorityTone(priority: TaskPriority) {
  if (priority === 'high') return 'red'
  if (priority === 'medium') return 'amber'
  return 'neutral'
}

function dateTone(type: ImportantDateType) {
  if (type === 'exam') return 'red'
  if (type === 'deadline') return 'amber'
  if (type === 'rotation') return 'violet'
  return 'sky'
}

function formatTimer(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function startOfMonth(date: string) {
  return `${date.slice(0, 7)}-01`
}

function offsetDate(days: number) {
  const next = new Date()
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

function addMonths(date: string, amount: number) {
  const next = new Date(`${date}T00:00:00`)
  next.setMonth(next.getMonth() + amount)
  return next.toISOString().slice(0, 10)
}

function buildCalendarDays(monthStart: string) {
  const first = new Date(`${monthStart}T00:00:00`)
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - first.getDay())
  const month = first.getMonth()

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    const iso = date.toISOString().slice(0, 10)
    return {
      date: iso,
      currentMonth: date.getMonth() === month,
    }
  })
}
