import { useState } from 'react'
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Home,
  MailCheck,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import type { ApprovalRequest } from '@/services/partnerService'
import { useLastRegistration } from '@/lib/partnerQueries'
import { PageLoader } from '@/components/ui/spinner'
import { ButtonLink } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'

const roleMeta: Record<ApprovalRequest['type'], { label: string; icon: typeof Building2 }> = {
  hospital: { label: 'Hospital', icon: Building2 },
  doctor: { label: 'Doctor / Mentor', icon: Stethoscope },
  reviewer: { label: 'Reviewer', icon: ClipboardCheck },
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PartnerPendingPage() {
  const { data: request, isPending } = useLastRegistration()
  const [copied, setCopied] = useState(false)

  if (isPending) return <PageLoader label="Checking your registration…" />

  if (!request) {
    return (
      <section className="flex min-h-screen items-center bg-gradient-to-b from-ink-900 to-ink-950 px-4 py-24">
        <div className="mx-auto w-full max-w-lg text-center">
          <div className="rounded-3xl border border-ink-700 bg-ink-900/60 p-8 text-ink-300 shadow-lift">
            <h1 className="font-display text-xl font-bold text-white">No pending registration found</h1>
            <p className="mt-2 text-sm">
              Submit a partner application first to see its approval status here.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <ButtonLink to="/partner-register" variant="secondary">
                Start partner registration
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const meta = roleMeta[request.type]

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-ink-900 to-ink-950 px-4 py-24">
      <div className="mx-auto w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-ink-700 bg-ink-900/60 shadow-lift backdrop-blur">
          <div className="bg-brand-600/15 px-8 pb-6 pt-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-white">Application submitted</h1>
            <p className="mt-2 text-sm text-ink-300">
              Your <span className="font-semibold text-white">{meta.label}</span> registration is awaiting review.
            </p>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center justify-between rounded-2xl border border-ink-700 bg-white/5 px-4 py-3">
              <span className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-600/20 text-brand-400">
                  <meta.icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{request.name}</span>
                  <span className="block text-xs text-ink-400">{request.email}</span>
                </span>
              </span>
              <StatusBadge label="Pending approval" tone="amber" />
            </div>

            {request.hospitalCode && (
              <div className="mt-4 rounded-2xl border border-brand-500/30 bg-brand-600/10 px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-300">
                  {request.type === 'doctor' ? 'Linked hospital code' : 'Your hospital code'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-lg bg-ink-900 px-3 py-1.5 font-mono text-lg font-bold tracking-widest text-white">
                    {request.hospitalCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyCode(request.hospitalCode!)}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                      copied
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-ink-700 bg-white/5 text-ink-200 hover:border-brand-500 hover:text-brand-300',
                    )}
                  >
                    <Copy className="size-3.5" aria-hidden />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {request.type === 'hospital' && (
                  <p className="mt-2 text-xs text-ink-400">
                    Share this code with your doctors so they can register under your hospital.
                  </p>
                )}
                {request.type === 'doctor' && request.hospitalName && (
                  <p className="mt-2 text-xs text-ink-400">
                    Linked to <span className="font-semibold text-white">{request.hospitalName}</span>.
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 space-y-3">
              <Step
                icon={CalendarDays}
                title={`Submitted ${formatDate(request.submittedAt)}`}
                description="Our team will review your application in the order it was received."
              />
              <Step
                icon={MailCheck}
                title="Decision by email"
                description="You\u2019ll receive an email when your account is approved, rejected, or needs more information."
              />
              <Step
                icon={ShieldCheck}
                title="Account activated"
                description="Once approved, you can log in and access your dashboard immediately."
              />
            </div>

            <div className="mt-6 flex gap-3">
              <ButtonLink to="/" variant="secondary" className="flex-1">
                <Home className="size-4" aria-hidden />
                Back to home
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Step({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CalendarDays
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-brand-400">
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-ink-400">{description}</p>
      </div>
    </div>
  )
}
