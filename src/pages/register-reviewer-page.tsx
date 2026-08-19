import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  Clock,
  GraduationCap,
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

export function RegisterReviewerPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    hospitalCode: '',
    specialty: '',
    department: '',
    timezone: '',
    title: '',
    institution: '',
    phone: '',
    yearsOfExperience: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lookup, setLookup] = useState<HospitalCodeLookup | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const { registerReviewer } = useAuth()
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
      await registerReviewer({
        name: form.name,
        email: form.email,
        password: form.password,
        hospitalCode: form.hospitalCode,
        specialty: form.specialty || undefined,
        department: form.department || undefined,
        timezone: form.timezone || undefined,
        title: form.title || undefined,
        institution: form.institution || undefined,
        phone: form.phone || undefined,
        yearsOfExperience: form.yearsOfExperience
          ? Number(form.yearsOfExperience)
          : undefined,
      })
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
            <ClipboardCheck className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">
            Reviewer Registration
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Create your {siteConfig.name} reviewer account.
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
              placeholder="you@reviewer.org"
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

            <div className="space-y-1.5 md:col-span-2">
              <AuthField
                label="Hospital code"
                type="text"
                placeholder="e.g. HOSP-7K4P92"
                hint="Unique registration code provided by your partner hospital."
                icon={<IdCard className="size-4.5 text-ink-400" aria-hidden />}
                value={form.hospitalCode}
                onChange={v => update('hospitalCode', v.toUpperCase())}
              />
              {lookupLoading && (
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Spinner className="size-4" /> Verifying hospital code...
                </div>
              )}
              {lookup && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 flex items-start gap-2">
                  <BadgeCheck className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-950">{lookup.hospitalName}</p>
                    <p className="text-emerald-700 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" />
                      {[lookup.city, lookup.state, lookup.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {lookupError && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <Search className="size-3" /> {lookupError}
                </p>
              )}
            </div>

            <AuthField
              label="Specialty (optional)"
              type="text"
              placeholder="e.g. Pediatrics"
              icon={<Stethoscope className="size-4.5 text-ink-400" aria-hidden />}
              value={form.specialty}
              onChange={v => update('specialty', v)}
              grid
            />
            <AuthField
              label="Department (optional)"
              type="text"
              placeholder="e.g. Pediatric Education"
              icon={<Building2 className="size-4.5 text-ink-400" aria-hidden />}
              value={form.department}
              onChange={v => update('department', v)}
              grid
            />
            <AuthField
              label="Title (optional)"
              type="text"
              placeholder="e.g. Associate Professor"
              icon={<GraduationCap className="size-4.5 text-ink-400" aria-hidden />}
              value={form.title}
              onChange={v => update('title', v)}
              grid
            />
            <AuthField
              label="Years of experience"
              type="number"
              placeholder="e.g. 10"
              icon={<Clock className="size-4.5 text-ink-400" aria-hidden />}
              value={form.yearsOfExperience}
              onChange={v => update('yearsOfExperience', v)}
              grid
            />
            <AuthField
              label="Institution (optional)"
              type="text"
              placeholder="e.g. Boston University School of Medicine"
              icon={<Building2 className="size-4.5 text-ink-400" aria-hidden />}
              value={form.institution}
              onChange={v => update('institution', v)}
              className="md:col-span-2"
            />
            <AuthField
              label="Phone (optional)"
              type="tel"
              placeholder="+1-555-0300"
              icon={<Phone className="size-4.5 text-ink-400" aria-hidden />}
              value={form.phone}
              onChange={v => update('phone', v)}
              grid
            />
            <AuthField
              label="Timezone (optional)"
              type="text"
              placeholder="e.g. EST"
              icon={<Clock className="size-4.5 text-ink-400" aria-hidden />}
              value={form.timezone}
              onChange={v => update('timezone', v)}
              grid
            />

            {submitError && (
              <p className="text-xs font-medium text-rose-600 md:col-span-2">{submitError}</p>
            )}

            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4" /> Creating reviewer account...
                  </span>
                ) : (
                  'Create Reviewer Account'
                )}
              </Button>

              <div className="mt-6 flex items-center justify-between text-xs text-ink-500">
                <Link
                  to="/register/administrative"
                  className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
                >
                  <ArrowLeft className="size-3.5" aria-hidden /> Back to account type selection
                </Link>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </section>
  )
}
