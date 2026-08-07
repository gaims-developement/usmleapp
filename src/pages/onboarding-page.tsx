import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Sparkles, Stethoscope } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCompleteOnboarding } from '@/lib/queries'
import { electiveCities, electiveSpecialties } from '@/mocks/electives'
import { Button } from '@/components/ui/button'
import { ChipSelect } from '@/components/ui/chip-select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const STEPS = ['About you', 'Elective preferences', 'Location preferences', 'Your timeline', 'Review & finish']

const roles = ['Medical student', 'Graduated']
const visaOptions = ['F-1 student visa', 'J-1 exchange visa', 'H-1B visa', 'No visa yet', 'Other']
const goalOptions = ['Letters of Recommendation', 'U.S. clinical experience', 'Audition rotation', 'Specialty exploration']
const travelOptions = ['Ready to travel anytime', 'Need 2+ months notice']
const durationOptions = [4, 8, 12]
const startMonths = ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06']
const graduationYears = Array.from({ length: 12 }, (_, i) => 2019 + i)

interface OnboardingForm {
  role: string
  graduationYear: number | null
  visaStatus: string
  electives: string[]
  goals: string[]
  locations: string[]
  travel: string
  earliestStart: string
  durationPreference: number | null
  docsConfirmed: boolean
}

export function OnboardingPage() {
  const { user, completeOnboarding } = useAuth()
  const finish = useCompleteOnboarding()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<OnboardingForm>({
    role: '',
    graduationYear: null,
    visaStatus: '',
    electives: user?.electives ?? [],
    goals: [],
    locations: user?.locations ?? [],
    travel: '',
    earliestStart: '',
    durationPreference: null,
    docsConfirmed: false,
  })

  const update = (patch: Partial<OnboardingForm>) => setForm(f => ({ ...f, ...patch }))

  function toggleIn(list: string[], value: string) {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
  }

  const valid =
    step === 0
      ? Boolean(form.role && form.graduationYear && form.visaStatus)
      : step === 1
        ? form.electives.length > 0 && form.goals.length > 0
        : step === 2
          ? form.locations.length > 0 && Boolean(form.travel)
          : step === 3
            ? Boolean(form.earliestStart && form.durationPreference)
            : form.docsConfirmed

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      return
    }
    await finish.mutateAsync({
      role: form.role,
      graduationYear: form.graduationYear ?? 0,
      visaStatus: form.visaStatus,
      goals: form.goals,
      electives: form.electives,
      locations: form.locations,
      earliestStart: form.earliestStart,
      durationPreference: form.durationPreference ?? 4,
      travelReady: form.travel === 'Ready to travel anytime',
    })
    completeOnboarding({
      graduationYear: form.graduationYear ?? undefined,
      visaStatus: form.visaStatus,
      goals: form.goals,
      electives: form.electives,
      locations: form.locations,
      earliestStart: form.earliestStart,
      durationPreference: form.durationPreference ?? 4,
      travelReady: form.travel === 'Ready to travel anytime',
    })
    navigate('/dashboard/student', { replace: true })
  }

  return (
    <section className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50/60 to-white px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <Stethoscope className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">
            Let&apos;s personalize your journey
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {STEPS[step]} — step {step + 1} of {STEPS.length}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  'grid size-7 place-items-center rounded-full text-xs font-bold transition-colors',
                  i < step
                    ? 'bg-brand-600 text-white'
                    : i === step
                      ? 'bg-brand-100 text-brand-800 ring-2 ring-brand-500'
                      : 'bg-ink-100 text-ink-400',
                )}
              >
                {i < step ? <CheckCircle2 className="size-4" aria-hidden /> : i + 1}
              </span>
            ))}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4" />
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft"
        >
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-900">What best describes you?</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => update({ role })}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-2xl border p-5 text-sm font-semibold transition-colors',
                        form.role === role
                          ? 'border-brand-500 bg-brand-50 text-brand-800'
                          : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300',
                      )}
                    >
                      <GraduationCap className="size-6" aria-hidden />
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-900">Graduation year</label>
                <select
                  value={form.graduationYear ?? ''}
                  onChange={e => update({ graduationYear: Number(e.target.value) || null })}
                  className="w-full cursor-pointer rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-white"
                >
                  <option value="">Select year</option>
                  {graduationYears.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <ChipSelect
                label="Current visa status"
                hint="Select one"
                options={visaOptions}
                selected={form.visaStatus ? [form.visaStatus] : []}
                onToggle={v => update({ visaStatus: form.visaStatus === v ? '' : v })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <ChipSelect
                label="Preferred electives"
                hint="Select all that apply"
                options={electiveSpecialties}
                selected={form.electives}
                onToggle={v => update({ electives: toggleIn(form.electives, v) })}
              />
              <ChipSelect
                label="What are your goals?"
                hint="Select all that apply"
                options={goalOptions}
                selected={form.goals}
                onToggle={v => update({ goals: toggleIn(form.goals, v) })}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <ChipSelect
                label="Preferred locations in the USA"
                hint="Select all that apply"
                options={electiveCities}
                selected={form.locations}
                onToggle={v => update({ locations: toggleIn(form.locations, v) })}
              />
              <ChipSelect
                label="Travel availability"
                hint="Select one"
                options={travelOptions}
                selected={form.travel ? [form.travel] : []}
                onToggle={v => update({ travel: form.travel === v ? '' : v })}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-900">Earliest start month</label>
                <select
                  value={form.earliestStart}
                  onChange={e => update({ earliestStart: e.target.value })}
                  className="w-full cursor-pointer rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-white"
                >
                  <option value="">Select a month</option>
                  {startMonths.map(m => (
                    <option key={m} value={m}>
                      {formatMonth(m)}
                    </option>
                  ))}
                </select>
              </div>
              <ChipSelect
                label="Preferred rotation length"
                hint="Select one"
                options={durationOptions.map(d => `${d} weeks`)}
                selected={form.durationPreference ? [`${form.durationPreference} weeks`] : []}
                onToggle={v =>
                  update({ durationPreference: form.durationPreference === Number(v.split(' ')[0]) ? null : Number(v.split(' ')[0]) })
                }
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-ink-200 bg-ink-50/50 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                  <Sparkles className="size-4 text-brand-600" aria-hidden /> Your profile summary
                </h3>
                <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <SummaryItem label="Role" value={form.role} />
                  <SummaryItem label="Graduation year" value={form.graduationYear ? String(form.graduationYear) : '—'} />
                  <SummaryItem label="Visa status" value={form.visaStatus} />
                  <SummaryItem label="Earliest start" value={form.earliestStart ? formatMonth(form.earliestStart) : '—'} />
                  <SummaryItem label="Preferred length" value={form.durationPreference ? `${form.durationPreference} weeks` : '—'} />
                  <SummaryItem label="Electives" value={form.electives.join(', ')} />
                  <SummaryItem label="Locations" value={form.locations.join(', ')} />
                  <SummaryItem label="Goals" value={form.goals.join(', ')} />
                </dl>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-300">
                <input
                  type="checkbox"
                  checked={form.docsConfirmed}
                  onChange={e => update({ docsConfirmed: e.target.checked })}
                  className="mt-0.5 size-5 shrink-0 accent-brand-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">
                    I can provide the required documents
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-600">
                    You&apos;ll be able to upload your passport, CV, transcript, immunization record,
                    and more from the Documents section.
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={step === 0}
              onClick={() => setStep(s => Math.max(0, s - 1))}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={!valid || finish.isPending}
              onClick={handleNext}
            >
              {step === STEPS.length - 1 ? (finish.isPending ? 'Finishing…' : 'Finish setup') : 'Continue'}
              {step < STEPS.length - 1 && <ArrowRight className="size-4" aria-hidden />}
            </Button>
          </div>
          {!valid && step < STEPS.length - 1 && (
            <p className="mt-3 text-center text-xs text-ink-500">
              Complete the highlighted selections above to continue.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink-800">{value || '—'}</dd>
    </div>
  )
}

function formatMonth(month: string) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
