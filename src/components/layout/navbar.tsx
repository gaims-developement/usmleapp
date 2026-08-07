import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Stethoscope, X } from 'lucide-react'
import { navLinks, siteConfig } from '@/data/site'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass shadow-soft' : 'bg-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between lg:h-20">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
            <Stethoscope className="size-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink-900">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink to="/login" variant="ghost" size="sm">
            Login
          </ButtonLink>
          <ButtonLink to="/register" size="sm">
            Sign Up
          </ButtonLink>
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl text-ink-800 hover:bg-ink-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="glass overflow-hidden border-t border-ink-200/60 lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-ink-800 transition-colors hover:bg-ink-100"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-3 flex flex-col gap-3 border-t border-ink-200/60 pt-4">
                <ButtonLink to="/login" variant="outline" size="md" onClick={() => setOpen(false)}>
                  Login
                </ButtonLink>
                <ButtonLink to="/register" size="md" onClick={() => setOpen(false)}>
                  Sign Up
                </ButtonLink>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
