import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  ScanSearch,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { useRegisterDoctor, useRegisterHospital, useRegisterReviewer, useValidateHospitalCode } from '@/lib/partnerQueries'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { PartnerType } from '@/services/partnerService'
import { cn } from '@/lib/utils'

const roleOptions: {
  type: PartnerType
  title: string
  description: string
  icon: typeof Building2
}[] = [
  {
    type: 'hospital',
    title: 'Hospital',
    description: 'Register your hospital to host clinical electives and observerships for IMGs.',
    icon: Building2,
  },
  {
    type: 'doctor',
    title: 'Doctor / Mentor',
    description: 'Join your hospital as a clinical mentor and supervisor for rotating students.',
    icon: Stethoscope,
  },
  {
    type: 'reviewer',
    title: 'Reviewer',
    description: 'Help review student applications, documents, and clinical evaluations.',
    icon: ClipboardCheck,
  },
]

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'India',
  'Pakistan',
  'Nigeria',
  'Egypt',
  'United Arab Emirates',
  'Saudi Arabia',
  'Philippines',
  'Brazil',
  'Mexico',
  'Germany',
  'Australia',
  'Other',
]

const departmentOptions = [
  'Internal Medicine',
  'General Surgery',
  'Pediatrics',
  'Cardiology',
  'Neurology',
  'Psychiatry',
  'Emergency Medicine',
  'Family Medicine',
  'Obstetrics & Gynecology',
  'Radiology',
  'Anesthesiology',
  'Dermatology',
]

const designationOptions = [
  'Attending Physician',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Fellow',
  'Resident',
]

const accreditationOptions = [
  'ACGME Accredited',
  'ACGME-I Accredited',
  'Joint Commission',
  'AAMC Visiting Student Program',
  'ECFMG Sponsor',
  'State Board Approved',
]

export function PartnerRegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<PartnerType | null>(null)

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950 px-4 py-24">
      <Container className="max-w-2xl">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Partner registration</h1>
          <p className="mt-2 text-sm text-ink-300">
            Hospitals, doctors, and reviewers join IMG Prep through this verified portal. Every
            application is reviewed before activation.
          </p>
        </div>

        {!role ? (
          <div className="rounded-3xl border border-ink-700 bg-ink-900/60 p-8 shadow-lift backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
              Choose your account type
            </p>
            <div className="mt-4 space-y-3">
              {roleOptions.map(option => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setRole(option.type)}
                  className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-ink-700 bg-white/5 p-5 text-left transition-colors hover:border-brand-400 hover:bg-white/10"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-600/20 text-brand-400">
                    <option.icon className="size-6" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold text-white">{option.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-300">{option.description}</span>
                  </span>
                  <span className="text-brand-400 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
                    →
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-ink-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
                Log in
              </Link>
            </p>
          </div>
        ) : (
          <PartnerForm
            key={role}
            type={role}
            onBack={() => setRole(null)}
            onDone={request => navigate('/partner-register/success', { replace: true, state: { requestId: request.id } })}
          />
        )}

        <Link
          to="/"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium text-ink-400 hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to website
        </Link>
      </Container>
    </section>
  )
}

function PartnerForm({
  type,
  onBack,
  onDone,
}: {
  type: PartnerType
  onBack: () => void
  onDone: (request: { id: string }) => void
}) {
  return type === 'hospital' ? (
    <HospitalForm onBack={onBack} onDone={onDone} />
  ) : type === 'doctor' ? (
    <DoctorForm onBack={onBack} onDone={onDone} />
  ) : (
    <ReviewerForm onBack={onBack} onDone={onDone} />
  )
}

function HospitalForm({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: (request: { id: string }) => void
}) {
  const register = useRegisterHospital()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    coordinatorName: '',
    coordinatorEmail: '',
    phone: '',
    country: '',
    address: '',
    website: '',
    description: '',
    logoFileName: '',
  })
  const [departments, setDepartments] = useState<string[]>([])
  const [accreditation, setAccreditation] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const complete =
    form.name && form.email && form.password && form.coordinatorName && form.coordinatorEmail &&
    form.phone && form.country && form.address && form.description && departments.length > 0

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!agreed) return
    try {
      const request = await register.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        coordinatorName: form.coordinatorName,
        coordinatorEmail: form.coordinatorEmail,
        phone: form.phone,
        country: form.country,
        address: form.address,
        website: form.website,
        departments,
        accreditation,
        description: form.description,
        logoFileName: form.logoFileName || undefined,
      })
      onDone(request)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-ink-700 bg-ink-900/60 p-8 shadow-lift backdrop-blur"
    >
      <FormHeader
        icon={<Building2 className="size-5" aria-hidden />}
        title="Hospital registration"
        subtitle="We\u2019ll issue a unique hospital code once your application is approved."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Hospital name">
          <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. St. Mary's University Hospital" />
        </Field>
        <Field label="Hospital email">
          <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="electives@hospital.org" />
        </Field>
        <Field label="Password">
          <Input type="password" minLength={8} value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (415) 555-0100" />
        </Field>
        <Field label="Country">
          <Select value={form.country} onChange={e => update('country', e.target.value)}>
            <option value="">Select country</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://www.hospital.org" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Coordinator name">
            <Input value={form.coordinatorName} onChange={e => update('coordinatorName', e.target.value)} placeholder="Primary contact name" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Coordinator email">
            <Input type="email" value={form.coordinatorEmail} onChange={e => update('coordinatorEmail', e.target.value)} placeholder="coordinator@hospital.org" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Address">
            <Textarea rows={2} value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street, City, State/Province, ZIP" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <ChipGroup
            label="Departments"
            hint="Select all departments hosting electives"
            options={departmentOptions}
            selected={departments}
            onToggle={v => setDepartments(prev => toggle(prev, v))}
          />
        </div>
        <div className="sm:col-span-2">
          <ChipGroup
            label="Accreditations"
            hint="Select all that apply"
            options={accreditationOptions}
            selected={accreditation}
            onToggle={v => setAccreditation(prev => toggle(prev, v))}
          />
        </div>
        <div className="sm:col-span-2">
          <Field label="Hospital logo" optional>
            <Input
              type="file"
              accept="image/*"
              onChange={e => update('logoFileName', e.target.files?.[0]?.name ?? '')}
            />
            {form.logoFileName && (
              <p className="mt-2 text-xs text-ink-400">Selected: {form.logoFileName}</p>
            )}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Hospital description">
            <Textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Brief description of your hospital and elective program" />
          </Field>
        </div>
      </div>

      <AgreementCheck agreed={agreed} onChange={setAgreed} />

      {error && <ErrorBanner message={error} />}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={!complete || !agreed || register.isPending}>
          {register.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {register.isPending ? 'Submitting…' : 'Submit for approval'}
        </Button>
      </div>
      {!complete && <p className="mt-3 text-center text-xs text-ink-400">Complete all required fields to continue.</p>}
    </form>
  )
}

function DoctorForm({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: (request: { id: string }) => void
}) {
  const register = useRegisterDoctor()
  const validate = useValidateHospitalCode()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    department: '',
    designation: '',
    licenseNumber: '',
    yearsExperience: '',
    hospitalCode: '',
    avatarFileName: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookup, setLookup] = useState<{ valid: boolean; name?: string; error?: string } | null>(null)
  const [checkedCode, setCheckedCode] = useState('')

  const complete =
    form.fullName && form.email && form.password && form.phone && form.specialty &&
    form.department && form.designation && form.licenseNumber && form.yearsExperience &&
    lookup?.valid

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleVerifyCode() {
    setError(null)
    setLookup(null)
    try {
      const result = await validate.mutateAsync(form.hospitalCode)
      if (result.valid && result.hospital) {
        setLookup({ valid: true, name: result.hospital.name })
        setCheckedCode(form.hospitalCode.trim().toUpperCase())
      } else {
        setLookup({ valid: false, error: result.error ?? 'Invalid hospital code.' })
      }
    } catch {
      setLookup({ valid: false, error: 'Could not validate this hospital code. Try again.' })
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!agreed || !lookup?.valid) return
    try {
      const request = await register.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        specialty: form.specialty,
        department: form.department,
        designation: form.designation,
        licenseNumber: form.licenseNumber,
        yearsExperience: Number(form.yearsExperience),
        hospitalCode: checkedCode,
        avatarFileName: form.avatarFileName || undefined,
      })
      onDone(request)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-ink-700 bg-ink-900/60 p-8 shadow-lift backdrop-blur"
    >
      <FormHeader
        icon={<Stethoscope className="size-5" aria-hidden />}
        title="Doctor / Mentor registration"
        subtitle="You\u2019ll be linked to your hospital automatically using its unique code."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full name">
            <Input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Dr. Jane Smith" />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@hospital.org" />
        </Field>
        <Field label="Password">
          <Input type="password" minLength={8} value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (415) 555-0100" />
        </Field>
        <Field label="Specialty">
          <Input value={form.specialty} onChange={e => update('specialty', e.target.value)} placeholder="e.g. General Internal Medicine" />
        </Field>
        <Field label="Department">
          <Select value={form.department} onChange={e => update('department', e.target.value)}>
            <option value="">Select department</option>
            {departmentOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Designation">
          <Select value={form.designation} onChange={e => update('designation', e.target.value)}>
            <option value="">Select designation</option>
            {designationOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Medical license number">
          <Input value={form.licenseNumber} onChange={e => update('licenseNumber', e.target.value)} placeholder="e.g. MD-CA-12345" />
        </Field>
        <Field label="Years of experience">
          <Input type="number" min={1} max={50} value={form.yearsExperience} onChange={e => update('yearsExperience', e.target.value)} placeholder="e.g. 8" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Profile picture" optional>
            <Input
              type="file"
              accept="image/*"
              onChange={e => update('avatarFileName', e.target.files?.[0]?.name ?? '')}
            />
            {form.avatarFileName && (
              <p className="mt-2 text-xs text-ink-400">Selected: {form.avatarFileName}</p>
            )}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Hospital code" hint="Enter the unique code shared by your hospital coordinator.">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
                <Input
                  value={form.hospitalCode}
                  onChange={e => {
                    update('hospitalCode', e.target.value.toUpperCase())
                    setLookup(null)
                  }}
                  placeholder="IMGH-1001"
                  className="pl-10 font-mono uppercase"
                  disabled={Boolean(lookup?.valid)}
                />
              </div>
              {!lookup?.valid && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleVerifyCode()}
                  disabled={!form.hospitalCode || validate.isPending}
                >
                  {validate.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  Verify
                </Button>
              )}
            </div>
            {lookup?.valid && lookup.name ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="size-4" aria-hidden />
                {lookup.name} — verified and linked.
              </p>
            ) : lookup?.error ? (
              <p className="mt-2 text-sm text-red-400">{lookup.error}</p>
            ) : null}
          </Field>
        </div>
      </div>

      <AgreementCheck agreed={agreed} onChange={setAgreed} />

      {error && <ErrorBanner message={error} />}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={!complete || !agreed || register.isPending}>
          {register.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {register.isPending ? 'Submitting…' : 'Submit for approval'}
        </Button>
      </div>
      {!complete && <p className="mt-3 text-center text-xs text-ink-400">Verify your hospital code and complete all fields to continue.</p>}
    </form>
  )
}

function ReviewerForm({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: (request: { id: string }) => void
}) {
  const register = useRegisterReviewer()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    department: '',
    qualifications: '',
    experienceYears: '',
    reviewerId: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const complete =
    form.fullName && form.email && form.password && form.phone && form.country &&
    form.department && form.qualifications && form.experienceYears

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!agreed) return
    try {
      const request = await register.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
        department: form.department,
        qualifications: form.qualifications,
        experienceYears: Number(form.experienceYears),
        reviewerId: form.reviewerId || undefined,
      })
      onDone(request)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-ink-700 bg-ink-900/60 p-8 shadow-lift backdrop-blur"
    >
      <FormHeader
        icon={<ClipboardCheck className="size-5" aria-hidden />}
        title="Reviewer registration"
        subtitle="Reviewers help verify documents and evaluate applications for IMG students."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full name">
            <Input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Dr. Jane Smith" />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <Input type="password" minLength={8} value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (555) 010-0100" />
        </Field>
        <Field label="Country">
          <Select value={form.country} onChange={e => update('country', e.target.value)}>
            <option value="">Select country</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Department">
          <Select value={form.department} onChange={e => update('department', e.target.value)}>
            <option value="">Select department</option>
            {departmentOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Years of experience">
          <Input type="number" min={1} max={60} value={form.experienceYears} onChange={e => update('experienceYears', e.target.value)} placeholder="e.g. 10" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Qualifications">
            <Textarea rows={2} value={form.qualifications} onChange={e => update('qualifications', e.target.value)} placeholder="Degrees, certifications, and relevant experience" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Reviewer ID" optional>
            <Input value={form.reviewerId} onChange={e => update('reviewerId', e.target.value)} placeholder="Provided by IMG Prep (optional)" />
          </Field>
        </div>
      </div>

      <AgreementCheck agreed={agreed} onChange={setAgreed} />

      {error && <ErrorBanner message={error} />}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={!complete || !agreed || register.isPending}>
          {register.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {register.isPending ? 'Submitting…' : 'Submit for approval'}
        </Button>
      </div>
      {!complete && <p className="mt-3 text-center text-xs text-ink-400">Complete all required fields to continue.</p>}
    </form>
  )
}

function FormHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-white">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-600/20 text-brand-400">{icon}</span>
        {title}
      </h2>
      <p className="mt-1.5 text-sm text-ink-300">{subtitle}</p>
    </div>
  )
}

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string
  hint?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink-200">
          {label}
          {optional && <span className="ml-1 text-xs font-normal text-ink-500">(optional)</span>}
        </span>
        {hint && <span className="text-[11px] text-ink-500">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function ChipGroup({
  label,
  hint,
  options,
  selected,
  onToggle,
}: {
  label: string
  hint?: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <Label className="text-ink-200">{label}</Label>
      {hint && <p className="-mt-1 mb-2 text-[11px] text-ink-500">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-brand-500 bg-brand-600/20 text-brand-300'
                  : 'border-ink-700 bg-white/5 text-ink-300 hover:border-ink-500',
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AgreementCheck({ agreed, onChange }: { agreed: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-6 flex items-start gap-3 rounded-2xl border border-ink-700 bg-white/5 p-4 text-sm text-ink-300">
      <input
        type="checkbox"
        checked={agreed}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 size-4 cursor-pointer accent-brand-600"
      />
      <span>
        I confirm the information provided is accurate, and I agree to the{' '}
        <Link to="/terms" className="font-semibold text-brand-400 hover:text-brand-300">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="font-semibold text-brand-400 hover:text-brand-300">
          Privacy Policy
        </Link>
        . I understand my account will be activated after review and approval.
      </span>
    </label>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </p>
  )
}
