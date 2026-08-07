import { useState } from 'react'
import type { FormEvent } from 'react'
import { BriefcaseMedical, CalendarDays, GraduationCap, Save, School, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/lib/studentQueries'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'

const visaOptions = ['F-1 student visa', 'J-1 exchange visa', 'H-1B visa', 'No visa yet', 'Other']
const graduationYears = Array.from({ length: 12 }, (_, i) => 2019 + i)

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function StudentProfilePage() {
  const { user } = useAuth()
  const toast = useToast()
  const updateProfile = useUpdateProfile()

  const [name, setName] = useState(user?.name ?? '')
  const [college, setCollege] = useState(user?.college ?? '')
  const [dob, setDob] = useState(user?.dob ?? '')
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear ?? '')
  const [visaStatus, setVisaStatus] = useState(user?.visaStatus ?? '')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        college: college.trim(),
        dob: dob || undefined,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        visaStatus: visaStatus || undefined,
      })
      toast.success('Profile updated', 'Your changes have been saved.')
    } catch (err) {
      toast.error('Could not update profile', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const preferences = [
    { icon: BriefcaseMedical, label: 'Goals', value: user.goals?.join(', ') },
    { icon: GraduationCap, label: 'Preferred electives', value: user.electives?.join(', ') },
    { icon: CalendarDays, label: 'Preferred locations', value: user.locations?.join(', ') },
    { icon: CalendarDays, label: 'Earliest start', value: user.earliestStart ? formatDate(user.earliestStart) : undefined },
    { icon: CalendarDays, label: 'Preferred duration', value: user.durationPreference ? `${user.durationPreference} weeks` : undefined },
    { icon: CalendarDays, label: 'Travel readiness', value: user.travelReady === undefined ? undefined : user.travelReady ? 'Ready to travel anytime' : 'Need 2+ months notice' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Review and update your personal information." />

      <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-accent-600 text-xl font-bold text-white">
            {(user.name ?? 'IMG').slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-ink-900">{user.name}</h2>
              <StatusBadge label="Student" tone="brand" />
            </div>
            <p className="mt-0.5 text-sm text-ink-600">{user.email}</p>
          </div>
          <div className="ml-auto text-right text-xs text-ink-500">
            <p>Member since {formatDate(user.createdAt)}</p>
            <p className="mt-1 font-mono text-[11px] text-ink-400">ID {user.id}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            <UserCircle className="size-5 text-brand-600" aria-hidden />
            Basic information
          </h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="profile-college">Medical school</Label>
              <Input
                id="profile-college"
                value={college}
                onChange={e => setCollege(e.target.value)}
                placeholder="e.g. Osmania Medical College"
              />
            </div>
            <div>
              <Label htmlFor="profile-dob">Date of birth</Label>
              <Input id="profile-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="profile-grad">Expected graduation year</Label>
              <Select
                id="profile-grad"
                value={graduationYear}
                onChange={e => setGraduationYear(e.target.value)}
              >
                <option value="">Select year</option>
                {graduationYears.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="profile-visa">Current visa status</Label>
              <Select id="profile-visa" value={visaStatus} onChange={e => setVisaStatus(e.target.value)}>
                <option value="">Select visa status</option>
                {visaOptions.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            <School className="size-5 text-brand-600" aria-hidden />
            Journey preferences
          </h3>
          <p className="mt-1 text-sm text-ink-600">
            These come from your onboarding answers and help shape elective recommendations.
          </p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {preferences
              .filter(p => p.value)
              .map(p => (
                <div key={p.label} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/50 px-4 py-3">
                  <p.icon className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">{p.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink-800">{p.value}</dd>
                  </div>
                </div>
              ))}
            {preferences.every(p => !p.value) && (
              <p className="text-sm text-ink-500 sm:col-span-2">
                No preferences saved yet — you can complete these during onboarding.
              </p>
            )}
          </dl>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="size-4" aria-hidden />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
