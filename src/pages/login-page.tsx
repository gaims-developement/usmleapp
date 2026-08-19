import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Mail, ShieldCheck, Stethoscope } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { AuthField } from '@/pages/signup-page'
import { roleDashboardPath } from '@/roles/roles'


export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const result = await login({ email, password })
      const { role } = result.user
      const profileStatus =
        role === 'HOSPITAL' ? result.user.hospital?.status :
        role === 'DOCTOR' ? result.user.doctor?.status :
        role === 'REVIEWER' ? result.user.reviewer?.status :
        null

      if (profileStatus === 'pending') {
        navigate('/account/pending', { replace: true })
      } else {
        navigate(roleDashboardPath(role), { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-accent-50/60 to-white px-4 py-24 md:min-h-0 md:items-start md:py-10">
      <Container className="max-w-md md:max-w-lg">
        <div className="mb-8 text-center md:mb-4">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-600 text-white shadow-lift">
            <Stethoscope className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-600">Log in to continue your residency journey.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft md:p-8"
        >
          <AuthField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="size-4.5 text-ink-400" aria-hidden />}
            value={email}
            onChange={setEmail}
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

          <div className="mt-6 flex items-center gap-3 text-xs text-ink-400">
            <span className="h-px flex-1 bg-ink-200" />
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3.5" aria-hidden />
              Role-based access enabled
            </span>
            <span className="h-px flex-1 bg-ink-200" />
          </div>

          <p className="mt-6 text-center text-sm text-ink-600">
            New to IMG Prep?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
              Create an account
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
