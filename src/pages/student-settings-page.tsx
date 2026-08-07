import { useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, Eye, KeyRound, Save, ShieldAlert } from 'lucide-react'
import type { StudentNotificationPrefs } from '@/services/studentService'
import { useStudentSettings, useUpdateStudentSettings } from '@/lib/studentQueries'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const notificationOptions: { key: keyof StudentNotificationPrefs; label: string; description: string }[] = [
  {
    key: 'applicationUpdates',
    label: 'Application updates',
    description: 'Get notified when a program reviews or responds to your applications.',
  },
  {
    key: 'announcements',
    label: 'Announcements',
    description: 'Platform news, new features, and upcoming events from the IMG Prep team.',
  },
  {
    key: 'deadlineReminders',
    label: 'Deadline reminders',
    description: 'Reminders before elective deadlines and document expirations.',
  },
  {
    key: 'marketing',
    label: 'Tips & promotions',
    description: 'Occasional tips, resources, and offers relevant to your journey.',
  },
]

export function StudentSettingsPage() {
  const toast = useToast()
  const { data, isPending } = useStudentSettings()
  const updateSettings = useUpdateStudentSettings()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [updating, setUpdating] = useState(false)

  if (isPending) return <PageLoader label="Loading settings…" />
  if (!data) return null

  const settings = data

  async function handleNotificationToggle(
    key: keyof StudentNotificationPrefs,
    checked: boolean,
  ) {
    await updateSettings.mutateAsync({
      notifications: { ...settings.notifications, [key]: checked },
    })
  }

  async function handlePrivacyToggle(checked: boolean) {
    await updateSettings.mutateAsync({ privacy: { showProfile: checked } })
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault()
    setUpdating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      toast.info('Password management is coming soon', 'You will be able to change your password in a future update.')
      setCurrentPassword('')
      setNewPassword('')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage notifications, privacy, and security." />

      <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <Bell className="size-5 text-brand-600" aria-hidden />
          Notifications
        </h3>
        <div className="mt-5 divide-y divide-ink-100">
          {notificationOptions.map(option => (
            <div key={option.key} className="py-4 first:pt-0 last:pb-0">
              <Toggle
                checked={settings.notifications[option.key]}
                onChange={checked => void handleNotificationToggle(option.key, checked)}
                label={option.label}
                description={option.description}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <Eye className="size-5 text-brand-600" aria-hidden />
          Privacy
        </h3>
        <div className="mt-5">
          <Toggle
            checked={settings.privacy.showProfile}
            onChange={checked => void handlePrivacyToggle(checked)}
            label="Make my profile visible to programs"
            description="Allow hospitals and mentors to view your profile and application progress."
          />
        </div>
      </section>

      <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <KeyRound className="size-5 text-brand-600" aria-hidden />
          Security
        </h3>
        <form onSubmit={handlePasswordChange} className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="outline" disabled={updating || !currentPassword || !newPassword}>
              <Save className="size-4" aria-hidden />
              {updating ? 'Saving…' : 'Update password'}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-red-800">
          <ShieldAlert className="size-5" aria-hidden />
          Danger zone
        </h3>
        <p className="mt-1 text-sm text-red-700">
          Deleting your account removes your profile and application history. This action cannot be undone.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-red-300 text-red-700 hover:border-red-400 hover:bg-red-100"
          onClick={() =>
            window.confirm('Delete your account? This cannot be undone.') &&
            toast.info('Account deletion is disabled in this demo')
          }
        >
          Delete account
        </Button>
      </section>
    </div>
  )
}

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
