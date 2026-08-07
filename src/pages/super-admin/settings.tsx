import { useEffect, useState } from 'react'
import { Building2, Globe2, Save, ShieldCheck, Bell } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/ui/spinner'
import { usePlatformSettings } from '@/lib/adminQueries'
import { cn } from '@/lib/utils'

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-ink-800">{label}</p>
        <p className="mt-0.5 text-sm text-ink-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-ink-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  )
}

export function SuperAdminSettingsPage() {
  const settings = usePlatformSettings()

  const [org, setOrg] = useState<{ name: string; contactEmail: string; supportEmail: string; domain: string } | null>(null)
  const [toggles, setToggles] = useState<Record<string, boolean> | null>(null)
  const [security, setSecurity] = useState<{ sessionTimeoutHours: number; passwordMinLength: number; force2fa: boolean } | null>(null)

  useEffect(() => {
    if (!settings.data || org) return
    setOrg({ ...settings.data.organization })
    setToggles(Object.fromEntries(settings.data.toggles.map(t => [t.id, t.value])))
    setSecurity({ ...settings.data.security })
  }, [settings.data, org])

  if (settings.isLoading || !org || !toggles || !security) return <PageLoader label="Loading settings…" />

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Organization details, platform toggles, and security preferences."
        actions={
          <Button size="sm">
            <Save className="size-4" aria-hidden />
            Save changes
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Building2 className="size-4.5" aria-hidden />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">Organization</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600" htmlFor="org-name">
                Organization name
              </label>
              <Input
                id="org-name"
                value={org.name}
                onChange={e => setOrg({ ...org, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600" htmlFor="org-domain">
                Primary domain
              </label>
              <Input
                id="org-domain"
                value={org.domain}
                onChange={e => setOrg({ ...org, domain: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600" htmlFor="org-contact">
                Contact email
              </label>
              <Input
                id="org-contact"
                type="email"
                value={org.contactEmail}
                onChange={e => setOrg({ ...org, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-600" htmlFor="org-support">
                Support email
              </label>
              <Input
                id="org-support"
                type="email"
                value={org.supportEmail}
                onChange={e => setOrg({ ...org, supportEmail: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-50 text-accent-600">
              <Globe2 className="size-4.5" aria-hidden />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">Platform toggles</h2>
          </div>
          <div className="mt-5 space-y-5">
            {settings.data!.toggles.map(t => (
              <Toggle
                key={t.id}
                checked={toggles![t.id]}
                onChange={value => setToggles({ ...toggles!, [t.id]: value })}
                label={t.label}
                description={t.description}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="size-4.5" aria-hidden />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">Security</h2>
          </div>
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-600" htmlFor="sec-timeout">
                  Session timeout (hours)
                </label>
                <Input
                  id="sec-timeout"
                  type="number"
                  value={security!.sessionTimeoutHours}
                  onChange={e =>
                    setSecurity({ ...security!, sessionTimeoutHours: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-600" htmlFor="sec-password">
                  Min password length
                </label>
                <Input
                  id="sec-password"
                  type="number"
                  value={security!.passwordMinLength}
                  onChange={e =>
                    setSecurity({ ...security!, passwordMinLength: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="pt-1">
              <Toggle
                checked={security!.force2fa}
                onChange={value => setSecurity({ ...security!, force2fa: value })}
                label="Require two-factor authentication"
                description="Enforce 2FA for all staff accounts on next sign-in"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Bell className="size-4.5" aria-hidden />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">Notifications</h2>
          </div>
          <div className="mt-5 space-y-5">
            <Toggle
              checked={settings.data!.notifications.digest}
              onChange={() => undefined}
              label="Weekly digest emails"
              description="Send weekly summary emails to staff"
            />
            <Toggle
              checked={settings.data!.notifications.applicationAlerts}
              onChange={() => undefined}
              label="Application alerts"
              description="Notify admins of new applications"
            />
            <Toggle
              checked={settings.data!.notifications.paymentAlerts}
              onChange={() => undefined}
              label="Payment alerts"
              description="Notify on failed and high-value payments"
            />
            <Toggle
              checked={settings.data!.notifications.auditAlerts}
              onChange={() => undefined}
              label="Audit alerts"
              description="Notify on critical security events"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
