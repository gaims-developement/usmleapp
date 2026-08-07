import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  Info,
  LogOut,
  Search,
  TriangleAlert,
  User,
  UserCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AppNavItem } from '@/components/layout/app-layout'
import { Avatar } from '@/components/ui/avatar'
import { Popover } from '@/components/ui/popover'
import { useAuth } from '@/hooks/useAuth'
import { useMarkNotificationsRead, useNotifications } from '@/lib/adminQueries'
import {
  useMarkReviewerNotificationsRead,
  useReviewerNotifications,
} from '@/lib/reviewerQueries'
import {
  useHospitalNotifications,
  useMarkHospitalNotificationsRead,
} from '@/lib/hospitalQueries'
import {
  useDoctorNotifications,
  useMarkDoctorNotificationsRead,
} from '@/lib/doctorQueries'
import { cn } from '@/lib/utils'
import type { NotificationTone } from '@/mocks/admin/ops'
import type { HospitalNotification } from '@/mocks/hospital/notifications'
import type { DoctorNotification } from '@/mocks/doctor/notifications'

const toneIcon: Record<NotificationTone, { icon: LucideIcon; className: string }> = {
  success: { icon: Check, className: 'bg-brand-50 text-brand-600' },
  warning: { icon: TriangleAlert, className: 'bg-amber-50 text-amber-600' },
  info: { icon: Info, className: 'bg-sky-50 text-sky-600' },
  critical: { icon: CircleAlert, className: 'bg-red-50 text-red-600' },
}

const hospitalTone: Record<HospitalNotification['type'], NotificationTone> = {
  application: 'info',
  scheduled: 'success',
  program: 'warning',
  announcement: 'info',
  system: 'critical',
}

const doctorTone: Record<DoctorNotification['type'], NotificationTone> = {
  student: 'info',
  logbook: 'warning',
  evaluation: 'warning',
  certificate: 'success',
  lor: 'success',
  system: 'critical',
}

export function TopbarSearch({ nav }: { nav: AppNavItem[] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return nav.slice(0, 6)
    return nav.filter(i => i.label.toLowerCase().includes(q) || (i.section ?? '').toLowerCase().includes(q))
  }, [nav, query])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function go(to: string) {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
    navigate(to)
  }

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
        aria-hidden
      />
      <input
        ref={inputRef}
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' && matches.length > 0) go(matches[0].to)
        }}
        placeholder="Search…"
        aria-label="Search the dashboard"
        className="h-10 w-64 rounded-full border border-ink-300 bg-white/70 pl-10 pr-4 text-sm text-ink-800 placeholder:text-ink-400 transition-all focus:w-72 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-200 bg-white p-2 shadow-lift">
          <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-400">
            {query.trim() ? 'Matching pages' : 'Quick links'}
          </p>
          {matches.length === 0 ? (
            <p className="px-3 py-4 text-sm text-ink-500">No pages match “{query}”.</p>
          ) : (
            matches.map(item => (
              <button
                key={item.to}
                type="button"
                onClick={() => go(item.to)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink-50"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-800">{item.label}</span>
                  <span className="block text-xs text-ink-500">{item.section}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-ink-300" aria-hidden />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function NotificationCenter() {
  const { user } = useAuth()
  const isReviewer = user?.role === 'REVIEWER'
  const isHospital = user?.role === 'HOSPITAL'
  const isDoctor = user?.role === 'DOCTOR'
  const adminNotifications = useNotifications()
  const reviewerNotifications = useReviewerNotifications()
  const hospitalNotifications = useHospitalNotifications()
  const doctorNotifications = useDoctorNotifications()
  const markAdminRead = useMarkNotificationsRead()
  const markReviewerRead = useMarkReviewerNotificationsRead()
  const markHospitalRead = useMarkHospitalNotificationsRead()
  const markDoctorRead = useMarkDoctorNotificationsRead()

  const source = isReviewer
    ? reviewerNotifications
    : isHospital
      ? hospitalNotifications
      : isDoctor
        ? doctorNotifications
        : adminNotifications
  const markRead = isReviewer
    ? markReviewerRead
    : isHospital
      ? markHospitalRead
      : isDoctor
        ? markDoctorRead
        : markAdminRead
  const unread = (source.data ?? []).filter(n => !n.read).length

  const items = (source.data ?? []).map(n => {
    if ('body' in n) {
      return { id: n.id, read: n.read, title: n.title, body: n.body, time: n.time, icon: toneIcon[n.tone] }
    }
    const tone =
      doctorTone[n.type as keyof typeof doctorTone] ??
      hospitalTone[n.type as keyof typeof hospitalTone] ??
      'info'
    return { id: n.id, read: n.read, title: n.title, body: n.message, time: n.time, icon: toneIcon[tone] }
  })

  return (
    <Popover
      align="right"
      panelClassName="w-[22rem]"
      trigger={
        <span className="relative grid size-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900">
          <Bell className="size-4.5" aria-hidden />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unread}
            </span>
          )}
        </span>
      }
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <p className="font-display text-sm font-bold text-ink-900">Notifications</p>
        <button
          type="button"
          onClick={() => markRead.mutate()}
          className="cursor-pointer text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {source.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-500">You're all caught up.</p>
        ) : (
          items.map(n => (
            <div
              key={n.id}
              className={cn(
                'flex gap-3 border-b border-ink-100/70 px-4 py-3 last:border-0',
                !n.read && 'bg-brand-50/40',
              )}
            >
              <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg', n.icon.className)}>
                <n.icon.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm text-ink-800', !n.read && 'font-semibold')}>{n.title}</p>
                <p className="truncate text-xs text-ink-500">{n.body}</p>
                <p className="mt-0.5 text-[11px] text-ink-400">{n.time}</p>
              </div>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-hidden />}
            </div>
          ))
        )}
      </div>
    </Popover>
  )
}

export function UserMenu({ nav }: { nav: AppNavItem[] }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const profile = nav.find(i => i.label === 'Profile')

  async function handleSignOut() {
    await logout()
    navigate('/')
  }

  return (
    <Popover
      align="right"
      panelClassName="w-64"
      closeOnSelect
      trigger={
        <span className="flex items-center gap-2">
          <Avatar name={user?.name ?? 'IMG'} />
          <ChevronDown className="hidden size-4 text-ink-400 sm:block" aria-hidden />
        </span>
      }
    >
      <div className="border-b border-ink-100 px-4 py-3">
        <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
        <p className="truncate text-xs text-ink-500">{user?.email}</p>
        <span className="mt-2 inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-700">
          {user?.role}
        </span>
      </div>
      <div className="p-1.5">
        {profile && (
          <button
            type="button"
            onClick={() => navigate(profile.to)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <User className="size-4 text-ink-400" aria-hidden />
            View profile
          </button>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </Popover>
  )
}

export function MobileAccountButton({ nav }: { nav: AppNavItem[] }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const profile = nav.find(i => i.label === 'Profile')

  return (
    <Popover
      align="right"
      panelClassName="w-64"
      closeOnSelect
      trigger={<UserCircle2 className="size-6 text-ink-600" aria-hidden />}
    >
      <div className="border-b border-ink-100 px-4 py-3">
        <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
        <p className="truncate text-xs text-ink-500">{user?.email}</p>
      </div>
      <div className="p-1.5">
        {profile && (
          <button
            type="button"
            onClick={() => navigate(profile.to)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            <User className="size-4 text-ink-400" aria-hidden />
            View profile
          </button>
        )}
        <button
          type="button"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </Popover>
  )
}
