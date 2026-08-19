import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Home, Stethoscope } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { useAuth } from '@/hooks/useAuth'
import { roleDashboardPath } from '@/roles/roles'
import type { RoleId } from '@/types/rbac'

// Only routes that already exist in the router are used here.
const notificationsRouteByRole: Partial<Record<RoleId, string>> = {
  SUPER_ADMIN: '/dashboard/super-admin/announcements',
  ADMIN: '/dashboard/admin/announcements',
  HOSPITAL: '/dashboard/hospital/announcements',
  STUDENT: '/announcements',
}

export function NotFoundPage() {
  const { user } = useAuth()
  const role = user?.role
  const dashboardTo = role ? roleDashboardPath(role) : '/'
  const notificationsTo = role ? notificationsRouteByRole[role] : undefined

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-ink-50 to-white px-4 py-24">
      <Container className="max-w-xl text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-1.5 shadow-soft">
          <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-white">
            <Stethoscope className="size-4" aria-hidden />
          </span>
          <span className="font-display text-sm font-bold text-ink-900">IMG Prep</span>
          <span className="text-xs text-ink-400">Residency Hub</span>
        </div>

        <EcgLine className="mx-auto mt-10 text-brand-400" />

        <p className="mt-8 font-display text-7xl font-bold tracking-tight text-ink-900">404</p>
        <h1 className="mx-auto mt-3 max-w-md font-display text-2xl font-semibold text-ink-900">
          Looks like this page needs a little clinical attention.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-ink-600">
          The page you&apos;re looking for couldn&apos;t be found. It may have been moved, removed,
          or the link may be outdated.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink to={dashboardTo} size="lg">
            <Home className="size-4.5" aria-hidden />
            {role ? 'Back to Dashboard' : 'Back to Home'}
          </ButtonLink>
          {notificationsTo && (
            <ButtonLink to={notificationsTo} variant="outline" size="lg">
              <Bell className="size-4.5" aria-hidden />
              Go to Notifications
            </ButtonLink>
          )}
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to website
        </Link>
      </Container>
    </section>
  )
}

function EcgLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 48" className={className} fill="none" aria-hidden>
      <path
        d="M4 24h46l8 0 6-13 8 28 8-32 8 17h42l8 0 6-12 8 26 8-30 8 16h16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
