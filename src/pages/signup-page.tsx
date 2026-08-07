import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lock,
  Mail,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { electives, siteConfig, usLocations } from '@/data/site'
import { privacySections, termsSections } from '@/data/legal'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Spinner } from '@/components/ui/spinner'
import { LegalAgreementModal } from '@/components/ui/legal-agreement-modal'
import { DatePicker } from '@/components/ui/date-picker'
import { ChipSelect } from '@/components/ui/chip-select'
import { cn } from '@/lib/utils'

type LegalDoc = 'terms' | 'privacy'

interface AgreementState {
  terms: boolean
  privacy: boolean
}

const electiveOptions = electives.map(e => e.specialty)

export function SignupPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [agreements, setAgreements] = useState<AgreementState>({ terms: false, privacy: false })
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dob: null as string | null,
    college: '',
    electives: [] as string[],
    locations: [] as string[],
  })

  const allAgreed = agreements.terms && agreements.privacy
  const stepTwoComplete =
    form.dob !== null &&
    form.college.trim().length > 0 &&
    form.electives.length > 0 &&
    form.locations.length > 0

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleIn(list: string[], value: string) {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (step === 1) {
      if (!allAgreed) return
      setStep(2)
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      college: form.college,
      dob: form.dob ?? undefined,
      electives: form.electives,
      locations: form.locations,
    }

    if (import.meta.env.DEV) {
      console.info('[signup] payload', JSON.stringify(payload, null, 2))
    }

    try {
      await signUp(payload)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  function handleAgree(doc: LegalDoc) {
    setAgreements(prev => ({ ...prev, [doc]: true }))
  }

  const openDoc = legalDoc === 'terms' ? termsSections : privacySections

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-brand-50/60 to-white px-4 py-24">
      <Container className="max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <Stethoscope className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">
            {step === 1 ? 'Create your account' : 'Tell us about yourself'}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {step === 1
              ? `Join ${siteConfig.name} and start your residency journey today.`
              : 'Help us match you with the right electives and locations.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft"
        >
          <StepIndicator step={step} />

          {step === 1 ? (
            <>
              <AuthField
                label="Full name"
                type="text"
                placeholder="e.g. Jane Doe"
                hint="Please don't add prefixes like Dr., Mr., Mrs., or Ms."
                icon={<UserRound className="size-4.5 text-ink-400" aria-hidden />}
                value={form.name}
                onChange={v => update('name', v)}
              />
              <AuthField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="size-4.5 text-ink-400" aria-hidden />}
                value={form.email}
                onChange={v => update('email', v)}
              />
              <AuthField
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                icon={<Lock className="size-4.5 text-ink-400" aria-hidden />}
                minLength={8}
                value={form.password}
                onChange={v => update('password', v)}
              />

              <div className="mt-6 rounded-2xl border border-ink-200 bg-ink-50/50 p-5">
                <h3 className="text-sm font-semibold text-ink-900">Legal agreement</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">
                  Read and accept both documents to continue. Each opens in a popup — please scroll
                  to the end and confirm your agreement.
                </p>
                <div className="mt-4 space-y-3">
                  <ConsentRow
                    label="Terms and Conditions"
                    accepted={agreements.terms}
                    onOpen={() => setLegalDoc('terms')}
                  />
                  <ConsentRow
                    label="Privacy Policy"
                    accepted={agreements.privacy}
                    onOpen={() => setLegalDoc('privacy')}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-6 w-full" disabled={!allAgreed}>
                Continue
              </Button>
              {!allAgreed && (
                <p className="mt-3 text-center text-xs text-ink-500">
                  Please read and accept the Terms and Conditions and Privacy Policy above to
                  continue.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-800">Date of birth</label>
                  <DatePicker value={form.dob} onChange={v => update('dob', v)} />
                </div>

                <AuthField
                  label="College name"
                  type="text"
                  placeholder="e.g. All India Institute of Medical Sciences"
                  icon={<GraduationCap className="size-4.5 text-ink-400" aria-hidden />}
                  value={form.college}
                  onChange={v => update('college', v)}
                />

                <ChipSelect
                  label="Preferred electives"
                  hint="Select all that apply"
                  options={electiveOptions}
                  selected={form.electives}
                  onToggle={v => update('electives', toggleIn(form.electives, v))}
                />

                <ChipSelect
                  label="Preferred locations in the USA"
                  hint="Select all that apply"
                  options={usLocations}
                  selected={form.locations}
                  onToggle={v => update('locations', toggleIn(form.locations, v))}
                />
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1" disabled={!stepTwoComplete || submitting}>
                  {submitting ? 'Creating account…' : 'Create Account'}
                </Button>
              </div>
              {!stepTwoComplete && (
                <p className="mt-3 text-center text-xs text-ink-500">
                  Complete your date of birth, college, and at least one elective and location to
                  continue.
                </p>
              )}
            </>
          )}

          {submitError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-ink-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Log in
            </Link>
          </p>
        </form>

        {submitting && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center text-sm font-medium text-brand-800">
            <Spinner className="size-5" />
            Setting up your account…
          </div>
        )}

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to website
        </Link>
      </Container>

      <LegalAgreementModal
        open={legalDoc !== null}
        onClose={() => setLegalDoc(null)}
        onAgree={() => legalDoc && handleAgree(legalDoc)}
        title={legalDoc === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
        subtitle="IMG Prep – Clinical Electives & Residency Platform"
        sections={openDoc}
      />
    </section>
  )
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex items-center gap-1.5 text-sm font-semibold',
            step === 1 ? 'text-brand-700' : 'text-ink-400',
          )}
        >
          <span
            className={cn(
              'grid size-5 place-items-center rounded-full text-xs font-bold',
              step >= 1 ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-600',
            )}
          >
            1
          </span>
          Account
        </span>
        <span className="h-px flex-1 bg-ink-200" />
        <span
          className={cn(
            'flex items-center gap-1.5 text-sm font-semibold',
            step === 2 ? 'text-brand-700' : 'text-ink-400',
          )}
        >
          <span
            className={cn(
              'grid size-5 place-items-center rounded-full text-xs font-bold',
              step >= 2 ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-600',
            )}
          >
            2
          </span>
          Your details
        </span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn(
            'h-full rounded-full bg-brand-600 transition-all duration-500',
            step === 1 ? 'w-1/2' : 'w-full',
          )}
        />
      </div>
    </div>
  )
}

interface ConsentRowProps {
  label: string
  accepted: boolean
  onOpen: () => void
}

function ConsentRow({ label, accepted, onOpen }: ConsentRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition-colors',
        accepted ? 'border-brand-300' : 'border-ink-200',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-ink-800">
        <FileText
          className={cn('size-4 shrink-0', accepted ? 'text-brand-600' : 'text-ink-400')}
          aria-hidden
        />
        <span className="truncate">{label}</span>
      </span>
      {accepted ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700">
          <CheckCircle2 className="size-4" aria-hidden />
          Accepted
        </span>
      ) : (
        <Button size="sm" variant="outline" onClick={onOpen} className="shrink-0">
          View &amp; Accept
        </Button>
      )}
    </div>
  )
}

interface AuthFieldProps {
  label: string
  type: string
  placeholder: string
  hint?: string
  icon: ReactNode
  value?: string
  onChange?: (value: string) => void
  minLength?: number
}

export function AuthField({ label, type, placeholder, hint, icon, value, onChange, minLength }: AuthFieldProps) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
        <input
          type={type}
          required
          minLength={minLength}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className="w-full rounded-2xl border border-ink-200 bg-ink-50/50 py-3 pl-11 pr-4 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
        />
      </span>
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  )
}
