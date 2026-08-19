import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Globe,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react'
import { siteConfig } from '@/data/site'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Spinner } from '@/components/ui/spinner'
import { AuthField } from '@/pages/signup-page'

export function RegisterHospitalPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    city: '',
    state: '',
    country: 'USA',
    address: '',
    website: '',
    phone: '',
    description: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { registerHospital } = useAuth()
  const navigate = useNavigate()

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await registerHospital(form)
      navigate('/account/pending', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-brand-50/60 to-white px-4 py-24 md:min-h-0 md:items-start md:py-10">
      <Container className="max-w-lg md:max-w-5xl">
        <div className="mb-8 text-center md:mb-4">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <Building2 className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">
            Hospital Registration
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Register your hospital with {siteConfig.name}.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft md:p-8"
        >
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500 md:col-span-2">
              Account details
            </h2>
            <AuthField
              label="Your name"
              type="text"
              placeholder="e.g. Alex Coordinator"
              icon={<UserRound className="size-4.5 text-ink-400" aria-hidden />}
              value={form.name}
              onChange={v => update('name', v)}
              grid
            />
            <AuthField
              label="Email address"
              type="email"
              placeholder="you@hospital.org"
              icon={<Mail className="size-4.5 text-ink-400" aria-hidden />}
              value={form.email}
              onChange={v => update('email', v)}
              grid
            />
            <AuthField
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              icon={<Lock className="size-4.5 text-ink-400" aria-hidden />}
              minLength={8}
              value={form.password}
              onChange={v => update('password', v)}
              className="md:col-span-2"
            />

            <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink-500 md:col-span-2 md:mt-2">
              Hospital details
            </h2>
            <AuthField
              label="Hospital name"
              type="text"
              placeholder="e.g. St. Mary's Medical Center"
              icon={<Landmark className="size-4.5 text-ink-400" aria-hidden />}
              value={form.organizationName}
              onChange={v => update('organizationName', v)}
              className="md:col-span-2"
            />
            <AuthField
              label="City"
              type="text"
              placeholder="e.g. Boston"
              icon={<MapPin className="size-4.5 text-ink-400" aria-hidden />}
              value={form.city}
              onChange={v => update('city', v)}
              grid
            />
            <AuthField
              label="State"
              type="text"
              placeholder="e.g. MA"
              icon={<MapPin className="size-4.5 text-ink-400" aria-hidden />}
              value={form.state}
              onChange={v => update('state', v)}
              grid
            />
            <AuthField
              label="Address"
              type="text"
              placeholder="Street address (optional)"
              icon={<MapPin className="size-4.5 text-ink-400" aria-hidden />}
              value={form.address}
              onChange={v => update('address', v)}
              className="md:col-span-2"
            />
            <AuthField
              label="Website"
              type="url"
              placeholder="https://hospital.org"
              icon={<Globe className="size-4.5 text-ink-400" aria-hidden />}
              value={form.website}
              onChange={v => update('website', v)}
              grid
            />
            <AuthField
              label="Phone"
              type="tel"
              placeholder="+1-555-0100"
              icon={<Phone className="size-4.5 text-ink-400" aria-hidden />}
              value={form.phone}
              onChange={v => update('phone', v)}
              grid
            />

            <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink-500 md:col-span-2 md:mt-2">
              Coordinator contact (optional)
            </h2>
            <AuthField
              label="Coordinator name"
              type="text"
              placeholder="e.g. Alex Coordinator"
              icon={<UserRound className="size-4.5 text-ink-400" aria-hidden />}
              value={form.coordinatorName}
              onChange={v => update('coordinatorName', v)}
              grid
            />
            <AuthField
              label="Coordinator email"
              type="email"
              placeholder="coordinator@hospital.org"
              icon={<Mail className="size-4.5 text-ink-400" aria-hidden />}
              value={form.coordinatorEmail}
              onChange={v => update('coordinatorEmail', v)}
              grid
            />
            <AuthField
              label="Coordinator phone"
              type="tel"
              placeholder="+1-555-0111"
              icon={<Phone className="size-4.5 text-ink-400" aria-hidden />}
              value={form.coordinatorPhone}
              onChange={v => update('coordinatorPhone', v)}
              className="md:col-span-2"
            />

            {submitError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                {submitError}
              </p>
            )}

            <div className="md:col-span-2">
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Register hospital'}
              </Button>

              <p className="mt-6 text-center text-sm text-ink-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </form>

        {submitting && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center text-sm font-medium text-brand-800">
            <Spinner className="size-5" />
            Setting up your hospital…
          </div>
        )}

        <Link
          to="/register/administrative"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to account type selection
        </Link>
      </Container>
    </section>
  )
}
