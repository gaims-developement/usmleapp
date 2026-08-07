import { useMemo } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Search,
  Stethoscope,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  MobileAccountButton,
  NotificationCenter,
  TopbarSearch,
  UserMenu,
} from '@/components/layout/topbar'

export interface AppNavItem {
  to: string
  label: string
  icon: LucideIcon
  section?: string
  end?: boolean
}

const studentNav: AppNavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/electives', label: 'Browse Electives', icon: Search },
  { to: '/applications', label: 'My Applications', icon: ClipboardList },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
]

export function AppLayout({ nav = studentNav }: { nav?: AppNavItem[] }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const many = nav.length > 5

  const groups = useMemo(() => {
    const map = new Map<string, AppNavItem[]>()
    for (const item of nav) {
      const key = item.section ?? ''
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return [...map.entries()]
  }, [nav])

  async function handleSignOut() {
    await logout()
    navigate('/')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IMG'

  return (
    <div className="min-h-screen bg-ink-50">
      <aside
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col lg:border-r lg:border-ink-200 lg:bg-white',
          many ? 'lg:w-72' : 'lg:w-64',
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
            <Stethoscope className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight text-ink-900">IMG Prep</p>
            <p className="text-xs text-ink-500">Residency Hub</p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {groups.map(([section, items]) => (
            <div key={section}>
              {section && (
                <p className="px-4 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  {section}
                </p>
              )}
              <div className="space-y-1">
                {items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-800'
                          : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                      )
                    }
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink-100 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-600 font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
              <p className="truncate text-xs text-ink-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-4.5" aria-hidden />
            </button>
          </div>
        </div>
      </aside>

      <div className={cn(many ? 'sticky top-0 z-20' : '')}>
        <header
          className={cn(
            'flex items-center justify-between border-b border-ink-200 bg-white/90 px-4 py-3 backdrop-blur',
            !many && 'sticky top-0 z-20',
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white">
              <Stethoscope className="size-4.5" aria-hidden />
            </span>
            <span className="font-display text-base font-bold text-ink-900">IMG Prep</span>
          </div>
          {many ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <TopbarSearch nav={nav} />
              <NotificationCenter />
              <div className="hidden sm:block">
                <UserMenu nav={nav} />
              </div>
              <div className="sm:hidden">
                <MobileAccountButton nav={nav} />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-4.5" aria-hidden />
            </button>
          )}
        </header>
        {many && (
          <nav className="border-b border-ink-200 bg-white/95 backdrop-blur lg:hidden">
            <div className="flex gap-1.5 overflow-x-auto px-3 py-2">
              {nav.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>

      <main className={cn(many ? 'lg:pl-72' : 'lg:pl-64')}>
        <div
          className={cn(
            'mx-auto w-full px-4 py-8 sm:px-6 lg:px-10',
            many ? 'max-w-7xl pb-24 lg:pb-12' : 'max-w-6xl pb-28 lg:pb-10',
          )}
        >
          <Outlet />
        </div>
      </main>

      {!many && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="grid grid-cols-4">
            {nav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-3 text-[11px] font-semibold',
                    isActive ? 'text-brand-700' : 'text-ink-500',
                  )
                }
              >
                <item.icon className="size-5" aria-hidden />
                {item.label.split(' ')[0]}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
