import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FlaskConical, Lock, Mail, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDevMode } from '@/hooks/useDevMode'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { PageLoader } from '@/components/ui/spinner'
import { AuthField } from '@/pages/signup-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { roleById, roleDashboardPath } from '@/roles/roles'
import { DEMO_LOGIN_BY_ROLE, DEMO_ROLE_IDS } from '@/mock/users'
import type { RoleId } from '@/types/rbac'
import { cn } from '@/lib/utils'

export function DevModePage() {
  const devMode = useDevMode()

  if (devMode === 'loading') {
    return <PageLoader label="Checking development mode…" />
  }

  if (devMode === 'disabled') {
    return <NotFoundPage />
  }

  return <DevModeForm />
}

function DevModeForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function selectRole(role: Exclude<RoleId, 'SUPER_ADMIN'>) {
    setSelectedRole(role)
    setEmail(DEMO_LOGIN_BY_ROLE[role].email)
    setPassword(DEMO_LOGIN_BY_ROLE[role].password)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const result = await login({ email, password })
      navigate(roleDashboardPath(result.user.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-amber-50/60 to-white px-4 py-24">
      <Container className="max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-500 text-white shadow-lift">
            <FlaskConical className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Development login</h1>
          <p className="mt-2 text-sm text-ink-600">
            Sign in with a seeded demo account to test role-specific experiences.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">
            <ShieldAlert className="size-4" aria-hidden />
            Development environment
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
            This page exposes seeded demo accounts for development and testing only. Normal users
            should use the production login.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft"
        >
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ROLE_IDS.map(role => {
              const meta = roleById(role)
              const active = selectedRole === role
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => selectRole(role)}
                  className={cn(
                    'cursor-pointer rounded-xl border px-2 py-2.5 text-center transition-colors',
                    active
                      ? 'border-accent-500 bg-accent-50 text-accent-800'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-accent-300',
                  )}
                >
                  <span className="block text-[11px] font-bold leading-tight">{meta.name}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-ink-400">{meta.id}</span>
                </button>
              )
            })}
          </div>

          <AuthField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="size-4.5 text-ink-400" aria-hidden />}
            value={email}
            onChange={v => {
              setEmail(v)
              setSelectedRole(null)
            }}
          />
          <AuthField
            label="Password"
            type="password"
            placeholder="Your password"
            icon={<Lock className="size-4.5 text-ink-400" aria-hidden />}
            value={password}
            onChange={setPassword}
          />

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            variant="secondary"
            disabled={submitting}
          >
            {submitting ? 'Logging in…' : 'Log In'}
          </Button>

          <p className="mt-6 text-center text-sm text-ink-600">
            Looking for the real login?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Go to production login
            </Link>
          </p>
        </form>

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
