import { ShieldCheck } from 'lucide-react'
import { privacySections } from '@/data/legal'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'
import { LegalSectionCard } from '@/components/legal-section-card'

export function PrivacyPage() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container className="max-w-3xl">
        <Reveal>
          <div className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <ShieldCheck className="size-7" aria-hidden />
            </span>
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 font-display text-lg font-semibold text-ink-800">
              IMG Prep – USMLE Preparation Platform
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-ink-500">
              <span>Effective Date: August 6, 2026</span>
              <span>Last Updated: August 6, 2026</span>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 space-y-8">
          {privacySections.map((section, i) => (
            <Reveal key={section.title} delay={(i % 3) * 0.05}>
              <LegalSectionCard section={section} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
