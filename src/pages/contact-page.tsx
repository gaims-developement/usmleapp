import { useState } from 'react'
import type { FormEvent } from 'react'
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react'
import { siteConfig } from '@/data/site'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Reveal } from '@/components/ui/motion'
import { SectionHeading } from '@/components/ui/section-heading'

const contactCards = [
  {
    title: 'Email us',
    detail: siteConfig.email,
    icon: Mail,
  },
  {
    title: 'WhatsApp / Phone',
    detail: '+1 (555) 010-2030',
    icon: Phone,
  },
  {
    title: 'Community',
    detail: 'Join our study groups on the platform',
    icon: MessageSquare,
  },
  {
    title: 'Based in',
    detail: 'Remote — supporting IMGs in 60+ countries',
    icon: MapPin,
  },
]

export function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="py-24 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title="We are here to help"
            description="Questions about USMLE, the platform, or mentorship? Send us a message and we will get back to you within 48 hours."
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="grid gap-4">
              {contactCards.map((card) => (
                <div
                  key={card.title}
                  className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <card.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{card.title}</p>
                    <p className="text-sm text-ink-600">{card.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" type="text" placeholder="Your name" />
                <Field label="Email address" type="email" placeholder="you@example.com" />
                <div className="sm:col-span-2">
                  <Field label="Subject" type="text" placeholder="What is this about?" />
                </div>
              </div>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-medium text-ink-800">Message</span>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help…"
                  className="w-full resize-none rounded-2xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </label>
              <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
                {sent ? 'Message sent (demo)' : 'Send Message'}
              </Button>
              {sent && (
                <p className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                  Thanks for reaching out! This is a UI placeholder — the contact form will be wired
                  to the backend in the next milestone.
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

interface FieldProps {
  label: string
  type: string
  placeholder: string
}

function Field({ label, type, placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-800">{label}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-2xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
      />
    </label>
  )
}
