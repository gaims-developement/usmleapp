import { motion } from 'framer-motion'
import { applicationSteps, electives } from '@/data/site'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'
import { SectionHeading } from '@/components/ui/section-heading'

export function ExploreElectives() {
  return (
    <section id="explore" className="bg-white py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Explore Elective Rotations"
            title="Verified rotations across the specialties"
            description="Browse real, vetted clinical rotations at U.S. hospitals—with eligibility, deadlines, and the application process shown upfront."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {electives.map((elective, i) => (
            <Reveal key={elective.specialty} delay={(i % 3) * 0.06}>
              <article className="group flex h-full flex-col rounded-3xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <elective.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-base font-semibold text-ink-900">
                    {elective.specialty}
                  </h3>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <h3 className="text-center font-display text-2xl font-bold text-ink-900">
            Your application, step by step
          </h3>
        </Reveal>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {applicationSteps.map((step, i) => (
            <Reveal key={step.title} delay={(i % 3) * 0.08}>
              <li className="relative">
                <div className="flex items-center gap-4">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                    className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 font-display text-lg font-bold text-white shadow-glow"
                  >
                    {i + 1}
                  </motion.span>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-ink-900">
                      {step.title}
                    </h4>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.description}</p>
                  </div>
                </div>
                {i < applicationSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-6 top-14 hidden h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-gradient-to-b from-brand-300 to-transparent sm:block"
                  />
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  )
}
