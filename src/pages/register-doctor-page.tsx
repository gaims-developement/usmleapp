import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { siteConfig } from '@/data/site'
import { useAuth } from '@/hooks/useAuth'
import { authService, HOSPITAL_CODE_LOOKUP_ERROR_MESSAGES, HOSPITAL_CODE_LOOKUP_GENERIC_ERROR, type HospitalCodeLookup } from '@/services/authService'
import { ApiError } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Spinner } from '@/components/ui/spinner'
import { AuthField } from '@/pages/signup-page'
import { cn } from '@/lib/utils'

export function RegisterDoctorPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    hospitalCode: '',
    departmentName: '',
    specialty: '',
    title: '',
    licenseNumber: '',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lookup, setLookup] = useState<HospitalCodeLookup | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const { registerDoctor } = useAuth()
  const navigate = useNavigate()

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'hospitalCode') {
      setLookup(null)
      setLookupError(null)
    }
  }

  useEffect(() => {
    const code = form.hospitalCode.trim()
    if (code.length < 4) {
      setLookup(null)
      setLookupError(null)
      setLookupLoading(false)
      return
    }
    setLookupLoading(true)
    const timer = setTimeout(async () => {
      try {
        const result = await authService.lookupHospitalCode(code)
        setLookup(result)
        setLookupError(null)
      } catch (err) {
        const message =
          err instanceof ApiError && HOSPITAL_CODE_LOOKUP_ERROR_MESSAGES[err.code]
            ? HOSPITAL_CODE_LOOKUP_ERROR_MESSAGES[err.code]
            : HOSPITAL_CODE_LOOKUP_GENERIC_ERROR
        setLookupError(message)
        setLookup(null)
      } finally {
        setLookupLoading(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [form.hospitalCode])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await registerDoctor(form)
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
            <Stethoscope className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">
            Doctor Registration
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Create your {siteConfig.name} doctor account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft md:p-8"
        >
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            <AuthField
              label="Full name"
              type="text"
              placeholder="e.g. Dr. Jane Smith"
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

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink-800">Hospital code</span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="size-4.5 text-ink-400" aria-hidden />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. HOSP-DEMO01"
                  value={form.hospitalCode}
                  onChange={e => update('hospitalCode', e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50/50 py-3 pl-11 pr-4 font-mono text-sm tracking-wider text-ink-900 uppercase outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
              {lookupLoading && (
                <span className="mt-2 inline-flex items-center gap-2 text-xs text-ink-500">
                  <Spinner className="size-3.5" /> Verifying code…
                </span>
              )}
              {lookupError && !lookupLoading && (
                <span className="mt-2 block text-xs text-red-600">{lookupError}</span>
              )}
              {lookup && (
                <span className="mt-2 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
                  <Building2 className="size-4 shrink-0" aria-hidden />
                  {lookup.hospitalName}
                  {(lookup.city || lookup.state) && (
                    <span className="inline-flex items-center gap-1 text-brand-700">
                      <MapPin className="size-3" aria-hidden />
                      {[lookup.city, lookup.state, lookup.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                  <CheckCircle2 className="size-4 shrink-0 text-brand-600" aria-hidden />
                </span>
              )}
            </label>

            <AuthField
              label="Specialty"
              type="text"
              placeholder="e.g. Cardiology"
              icon={<Stethoscope className="size-4.5 text-ink-400" aria-hidden />}
              value={form.specialty}
              onChange={v => update('specialty', v)}
              grid
            />
            <AuthField
              label="Department (optional)"
              type="text"
              placeholder="e.g. Internal Medicine"
              icon={<Building2 className="size-4.5 text-ink-400" aria-hidden />}
              value={form.departmentName}
              onChange={v => update('departmentName', v)}
              grid
            />
            <AuthField
              label="Title"
              type="text"
              placeholder="e.g. Attending"
              icon={<BadgeCheck className="size-4.5 text-ink-400" aria-hidden />}
              value={form.title}
              onChange={v => update('title', v)}
              grid
            />
            <AuthField
              label="License number (optional)"
              type="text"
              placeholder="e.g. MA-123456"
              icon={<IdCard className="size-4.5 text-ink-400" aria-hidden />}
              value={form.licenseNumber}
              onChange={v => update('licenseNumber', v)}
              grid
            />
            <AuthField
              label="Phone"
              type="tel"
              placeholder="+1-555-0200"
              icon={<Phone className="size-4.5 text-ink-400" aria-hidden />}
              value={form.phone}
              onChange={v => update('phone', v)}
              grid
            />

            {submitError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                {submitError}
              </p>
            )}

            <div className="md:col-span-2">
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Register doctor'}
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
            Linking you to your hospital…
          </div>
        )}

        <Link
          to="/register/administrative"
          className={cn('mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900')}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to account type selection
        </Link>
      </Container>
    </section>
  )
}
