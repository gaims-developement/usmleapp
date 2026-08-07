import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Stethoscope } from 'lucide-react'
import { siteConfig } from '@/data/site'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

const heroChecks = ['Verified elective rotations', 'USMLE resources', 'Mentorship & planning']

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_10%,rgba(20,184,166,0.14),transparent_60%),radial-gradient(40%_40%_at_15%_20%,rgba(99,102,241,0.10),transparent_60%)]"
      />
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p
            variants={item}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700"
          >
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
            Built for international medical graduates
          </motion.p>

          <motion.h1
            variants={item}
            className="text-balance font-display text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl"
          >
            Your Gateway to{' '}
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              U.S. Clinical Electives
            </span>{' '}
            &amp; Residency
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-600"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink to="#explore" size="lg">
              Explore Electives
              <ArrowRight className="size-5" aria-hidden />
            </ButtonLink>
            <ButtonLink to="/login" variant="white" size="lg">
              Login
            </ButtonLink>
          </motion.div>

          <motion.ul variants={item} className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {heroChecks.map((check) => (
              <li key={check} className="flex items-center gap-2 text-sm font-medium text-ink-700">
                <CheckCircle2 className="size-4.5 text-brand-600" aria-hidden />
                {check}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative hidden lg:block"
        >
          <motion.div
            variants={item}
            className="glass relative rounded-3xl border border-white/60 p-6 shadow-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">My Applications</p>
                <p className="mt-1 text-xs text-ink-500">Elective rotations · Spring cycle</p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                On track
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <ProgressBar label="Profile completion" value={80} color="bg-brand-500" />
              <ProgressBar label="Documents uploaded" value={64} color="bg-accent-500" />
              <ProgressBar label="Applications submitted" value={42} color="bg-sky-500" />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-ink-900 p-4 text-white">
              <div>
                <p className="text-xs text-ink-400">Applications in progress</p>
                <p className="mt-1 font-display text-2xl font-bold">5 rotations</p>
              </div>
              <div className="flex gap-1.5" aria-hidden>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className={`size-2.5 rounded-full ${i < 5 ? 'bg-brand-400' : 'bg-ink-700'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="glass absolute -bottom-8 -left-8 flex items-center gap-4 rounded-2xl border border-white/60 px-5 py-4 shadow-soft"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-accent-100 text-accent-700">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900">Elective confirmed</p>
              <p className="text-xs text-ink-500">Internal Medicine · Boston, MA</p>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="glass absolute -right-6 -top-6 flex items-center gap-3 rounded-2xl border border-white/60 px-4 py-3 shadow-soft"
          >
            <span className="grid size-10 place-items-center rounded-full bg-brand-100 text-brand-700">
              <Stethoscope className="size-4" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-ink-900">
              LoR <span className="text-brand-700">received</span> this month
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  color: string
}

function ProgressBar({ label, value, color }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{label}</span>
        <span className="font-semibold text-ink-900">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-ink-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}
