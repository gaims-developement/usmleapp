import { Link } from 'react-router-dom'
import { Mail, Stethoscope } from 'lucide-react'
import { siteConfig } from '@/data/site'
import { Container } from '@/components/ui/container'

const quickLinks = [
  { label: 'Electives', href: '#explore' },
  { label: 'Why Us', href: '#why' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '/contact' },
]

const resourceLinks = [
  { label: 'Elective Rotations', href: '#explore' },
  { label: 'USMLE Resources', href: '#features' },
  { label: 'Mentorship', href: '#why' },
  { label: 'Residency Match', href: '#electives' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

const socialIcons: { label: string; href: string; svg: React.ReactNode }[] = [
  {
    label: 'Instagram',
    href: siteConfig.socials.instagram,
    svg: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: siteConfig.socials.twitter,
    svg: (
      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: siteConfig.socials.youtube,
    svg: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: siteConfig.socials.linkedin,
    svg: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1.5" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5" aria-label="IMG Prep home">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
                <Stethoscope className="size-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-ink-900">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600">
              Your gateway to verified U.S. clinical electives, USMLE preparation, and mentorship—
              built for international medical graduates on the path to residency.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialIcons.map(({ label, href, svg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-6 sm:flex-row">
          <p className="text-sm text-ink-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-2 text-sm text-ink-600 transition-colors hover:text-brand-700"
          >
            <Mail className="size-4" />
            {siteConfig.email}
          </a>
        </div>
      </Container>
    </footer>
  )
}

interface FooterColumnProps {
  title: string
  links: { label: string; href: string }[]
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-900">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="text-sm text-ink-600 transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
