import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { useDocuments, useElective, useSubmitApplication } from '@/lib/queries'
import { PageLoader } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/components/electives/elective-card'
import { cn } from '@/lib/utils'

const STEPS = ['Review', 'Rotation details', 'Documents & submit']

export function ApplyPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: elective, isPending } = useElective(id)
  const { data: documents } = useDocuments()
  const submit = useSubmitApplication()

  const [step, setStep] = useState(0)
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false)
  const [startDate, setStartDate] = useState(params.get('start') ?? '')
  const [duration, setDuration] = useState<number | null>(null)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])

  const availableDocs = useMemo(
    () => (documents ?? []).filter(d => d.status === 'uploaded' || d.status === 'expiring'),
    [documents],
  )

  if (isPending) return <PageLoader label="Preparing application…" />

  if (!elective) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink-900">Elective not found</p>
        <Link to="/electives" className="mt-2 inline-block text-sm font-semibold text-brand-700">
          Back to browse electives
        </Link>
      </div>
    )
  }

  const program = elective

  const beginIfEmpty = () => {
    if (!startDate) setStartDate(program.startDates[0])
    if (!duration) setDuration(program.durationWeeks[0])
  }

  const missingRequired = program.requirements.filter(r => !availableDocs.some(d => d.name === r))
  const canProceedToDocs = eligibilityConfirmed && startDate && duration !== null

  const docsSelected = selectedDocs.filter(n => availableDocs.some(d => d.name === n))
  const canSubmit = docsSelected.length > 0

  async function handleSubmit() {
    if (!canSubmit) return
    const app = await submit.mutateAsync({
      electiveId: program.id,
      startDate,
      durationWeeks: duration!,
      documentsIncluded: docsSelected,
    })
    navigate('/applications', { state: { justApplied: app.id } })
  }

  function toggleDoc(name: string) {
    setSelectedDocs(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name],
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to={`/electives/${elective.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to {elective.specialty}
      </Link>

      <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <h1 className="font-display text-xl font-bold text-ink-900">Apply — {elective.specialty}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="size-4 text-ink-400" aria-hidden />
            {elective.hospital}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-ink-400" aria-hidden />
            {elective.city}, {elective.state}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-ink-800">
            <DollarSign className="size-4 text-ink-400" aria-hidden />
            ${elective.fee.toLocaleString()}
          </span>
        </p>
      </div>

      <div>
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
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-3" />
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft"
      >
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Confirm your eligibility</h2>
              <p className="mt-1 text-sm text-ink-600">
                This rotation requires you to meet the program&apos;s eligibility and document
                requirements.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-200 bg-ink-50/50 p-5 text-sm">
              <p className="font-semibold text-ink-800">{elective.eligibility}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-600">
                Duration options: {elective.durationWeeks.join(' / ')} weeks · Fee: $
                {elective.fee.toLocaleString()} · Application deadline:{' '}
                {formatDate(elective.applicationDeadline)}
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-200 p-5 transition-colors hover:border-brand-300">
              <input
                type="checkbox"
                checked={eligibilityConfirmed}
                onChange={e => setEligibilityConfirmed(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-semibold text-ink-900">
                  I meet the eligibility requirements
                </span>
                <span className="mt-0.5 block text-xs text-ink-600">
                  Providing inaccurate information may result in your application being withdrawn.
                </span>
              </span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Choose your rotation</h2>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-900">Start date</label>
              <select
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-white"
              >
                {elective.startDates.map(d => (
                  <option key={d} value={d}>
                    {formatDate(d)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-900">Duration</label>
              <div className="flex flex-wrap gap-2">
                {elective.durationWeeks.map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setDuration(w)}
                    className={cn(
                      'rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                      duration === w
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-ink-300 bg-white text-ink-700 hover:border-brand-400',
                    )}
                  >
                    {w} weeks
                  </button>
                ))}
              </div>
            </div>
            {duration !== null && (
              <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
                Total program fee: <span className="font-bold">${(elective.fee).toLocaleString()}</span>
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Attach documents</h2>
              <p className="mt-1 text-sm text-ink-600">
                Select from your uploaded documents. You can add more from the Documents page first.
              </p>
            </div>

            {missingRequired.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">Missing required documents</p>
                <p className="mt-1 text-xs">{missingRequired.join(', ')}</p>
                <Link to="/documents" className="mt-2 inline-block text-xs font-bold text-amber-900 underline">
                  Upload these documents
                </Link>
              </div>
            )}

            <div className="space-y-2">
              {availableDocs.map(doc => (
                <label
                  key={doc.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 px-4 py-3 transition-colors hover:border-brand-300"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.name)}
                    onChange={() => toggleDoc(doc.name)}
                    className="size-4.5 shrink-0 accent-brand-600"
                  />
                  <FileText className="size-4 shrink-0 text-ink-400" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{doc.name}</span>
                    <span className="block truncate text-xs text-ink-500">{doc.fileName}</span>
                  </span>
                </label>
              ))}
              {availableDocs.length === 0 && (
                <p className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-500">
                  You haven&apos;t uploaded any documents yet.{' '}
                  <Link to="/documents" className="font-semibold text-brand-700">
                    Go to Documents
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={step === 0}
            onClick={() => setStep(s => s - 1)}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
          {step < 2 ? (
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={step === 0 ? !eligibilityConfirmed : !canProceedToDocs}
              onClick={() => {
                if (step === 1) beginIfEmpty()
                setStep(s => s + 1)
              }}
            >
              Continue <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={!canSubmit || submit.isPending}
              onClick={handleSubmit}
            >
              {submit.isPending ? 'Submitting…' : 'Submit application'}
            </Button>
          )}
        </div>
        {step === 2 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="size-3.5 text-brand-600" aria-hidden />
            Your application is sent directly to the program coordinator.
          </p>
        )}
      </motion.div>
    </div>
  )
}
