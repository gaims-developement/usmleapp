import { ArrowRight } from 'lucide-react'
import { electiveFacts } from '@/data/site'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'
import { SectionHeading } from '@/components/ui/section-heading'

export function WhatAreClinicalElectives() {
  return (
    <section id="electives" className="bg-white py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Clinical Electives"
            title="What Are Clinical Electives?"
            description="A beginner-friendly look at why U.S. clinical experience is the key that unlocks residency for international medical graduates."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {electiveFacts.map((fact, i) => (
            <Reveal key={fact.title} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-3xl border border-ink-200 bg-ink-50 p-7 transition-shadow hover:shadow-soft">
                <span className="font-display text-sm font-bold text-brand-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">{fact.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{fact.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-accent-700 px-8 py-10 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(255,255,255,0.18),transparent_70%)]"
            />
            <p className="relative text-pretty text-lg font-medium leading-relaxed text-white sm:text-xl">
              Electives → U.S. Letters of Recommendation → A stronger ERAS application → Your
              residency Match.
            </p>
            <a
              href="#explore"
              className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-100 transition-colors hover:text-white"
            >
              Explore verified rotations
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
