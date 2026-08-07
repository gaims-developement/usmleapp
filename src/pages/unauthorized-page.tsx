import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldX } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { roleDashboardPath } from '@/roles/roles'

export function UnauthorizedPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-red-50/60 to-white px-4">
      <Container className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-100 text-red-600">
          <ShieldX className="size-8" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">403 · Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          You don&apos;t have permission to view this page. Your account is{' '}
          <span className="font-semibold text-ink-900">{user?.role.replace('_', ' ')}</span>, which
          is not authorized for this section.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLinkHome label="Back to my dashboard" to={user ? roleDashboardPath(user.role) : '/'} />
          <Button variant="outline" onClick={handleLogout}>
            Sign in as a different role
          </Button>
        </div>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to website
        </Link>
      </Container>
    </section>
  )
}

function ButtonLinkHome({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700"
    >
      {label}
    </Link>
  )
}
