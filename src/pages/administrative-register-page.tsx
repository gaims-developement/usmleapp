import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, ClipboardCheck, ShieldCheck, Stethoscope } from 'lucide-react'
import { siteConfig } from '@/data/site'
import { Container } from '@/components/ui/container'
import { setAdminRegistrationGate } from '@/lib/adminRegistrationGate'

const options = [
  {
    type: 'hospital' as const,
    label: 'Hospital',
    description: 'Register a hospital account',
    icon: Building2,
    to: '/register/hospital',
    tone: 'sky',
  },
  {
    type: 'doctor' as const,
    label: 'Doctor / Mentor',
    description: 'Register as a doctor',
    icon: Stethoscope,
    to: '/register/doctor',
    tone: 'brand',
  },
  {
    type: 'reviewer' as const,
    label: 'Reviewer',
    description: 'Register as a reviewer',
    icon: ClipboardCheck,
    to: '/register/reviewer',
    tone: 'violet',
  },
]

const toneClasses: Record<string, string> = {
  sky: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400 hover:bg-sky-100',
  brand: 'border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-400 hover:bg-brand-100',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400 hover:bg-violet-100',
}

const iconBg: Record<string, string> = {
  sky: 'bg-sky-100 text-sky-600',
  brand: 'bg-brand-100 text-brand-600',
  violet: 'bg-violet-100 text-violet-600',
}

export function AdministrativeRegisterPage() {
  const navigate = useNavigate()

  useEffect(() => {
    setAdminRegistrationGate()
  }, [])

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-brand-50/60 to-white px-4 py-24 md:min-h-0 md:items-start md:py-10">
      <Container className="max-w-lg md:max-w-3xl">
        <div className="mb-8 text-center md:mb-4">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink-800 text-white shadow-glow">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">
            Administrative Registration
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Select the account type you want to register for {siteConfig.name}.
          </p>
        </div>

        <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          {options.map(opt => {
            const Icon = opt.icon
            return (
              <Link
                key={opt.type}
                to={opt.to}
                className={`flex items-center gap-4 rounded-2xl border-2 p-5 transition-all ${toneClasses[opt.tone]}`}
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${iconBg[opt.tone]}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink-900">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{opt.description}</p>
                </div>
                <span className="text-xs font-semibold text-ink-400">→</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50/50 p-5 text-center">
          <p className="text-xs text-ink-500">
            All registrations are subject to approval before the account becomes active.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/register')}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to student sign-up
        </button>
      </Container>
    </section>
  )
}
