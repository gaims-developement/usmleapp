import { reasons } from '@/data/site'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'
import { SectionHeading } from '@/components/ui/section-heading'

export function WhyChooseImgPrep() {
  return (
    <section id="why" className="relative overflow-hidden py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(20,184,166,0.08),transparent_70%)]"
      />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Why IMG Prep"
            title="Why Choose IMG Prep?"
            description="We solve the harder problem—helping you secure U.S. clinical experience and navigate the path to residency, with study tools that support the journey."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <Reveal key={reason.title} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-3xl border border-ink-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <reason.icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{reason.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
