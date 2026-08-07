import { ArrowRight, GraduationCap } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'

export function MatchCta() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-700 px-8 py-16 text-center shadow-lift sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_-10%,rgba(255,255,255,0.25),transparent_70%)]"
            />
            <span
              aria-hidden
              className="absolute -left-10 -top-10 size-48 rounded-full border border-white/10"
            />
            <span
              aria-hidden
              className="absolute -bottom-16 -right-10 size-64 rounded-full border border-white/10"
            />

            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <GraduationCap className="size-7" aria-hidden />
              </span>
              <h2 className="mt-6 text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Begin Your Residency Journey?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
                Browse verified clinical electives and take the next step toward matching into your
                dream residency.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <ButtonLink to="#explore" size="lg" variant="white" className="group">
                  Explore Electives
                  <ArrowRight
                    className="size-5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </ButtonLink>
                <ButtonLink
                  to="/login"
                  size="lg"
                  variant="ghost"
                  className="border border-white/30 text-white hover:border-white/60 hover:bg-white/10 hover:text-white"
                >
                  Login
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
