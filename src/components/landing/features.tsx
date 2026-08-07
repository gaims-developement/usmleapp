import { features } from '@/data/site'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'
import { SectionHeading } from '@/components/ui/section-heading'

export function Features() {
  return (
    <section id="features" className="bg-white py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Beyond Electives"
            title="Everything you need beyond electives"
            description="Supporting tools that keep your preparation organized—so your journey stays on track from application to exam day."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 4) * 0.06}>
              <div className="group h-full rounded-2xl border border-ink-200 bg-ink-50/60 p-6 transition-all duration-300 hover:border-accent-300 hover:bg-white hover:shadow-soft">
                <span className="grid size-11 place-items-center rounded-xl bg-white text-accent-700 shadow-soft transition-colors group-hover:bg-accent-600 group-hover:text-white">
                  <feature.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-ink-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
