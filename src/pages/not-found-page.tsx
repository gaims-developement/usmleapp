import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function NotFoundPage() {
  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-ink-50 to-white px-4 py-24">
      <Container className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Compass className="size-8" aria-hidden />
        </span>
        <p className="mt-6 font-display text-6xl font-bold text-ink-900">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">
          You&apos;ve wandered off the roadmap
        </h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-ink-600">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on
          track.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <ButtonLink to="/" size="lg">
            Back to Home
          </ButtonLink>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-ink-700 hover:text-ink-900"
          >
            Contact us
          </Link>
        </div>
      </Container>
    </section>
  )
}
