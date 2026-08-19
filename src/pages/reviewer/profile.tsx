import { useState } from 'react'
import { Clock3, FileCheck2, KeyRound, Save, ShieldCheck, Target, User, Zap } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Widget } from '@/components/ui/widget'
import { Avatar } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, roleBadgeMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { useReviewerApplications, useReviewerProfile } from '@/lib/reviewerQueries'
import { formatMemberSince } from '@/lib/utils'
import { roleById } from '@/roles/roles'

function ProfileStat({ icon: Icon, label, value, tone }: { icon: typeof Clock3; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
      <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
    </div>
  )
}

export function ReviewerProfilePage() {
  const { user } = useAuth()
  const profile = useReviewerProfile()
  const applications = useReviewerApplications()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  if (!user) return null
  const role = roleById(user.role)

  if (profile.isLoading) return <PageLoader label="Loading profile…" />

  const data = profile.data!
  const decided = (applications.data ?? []).filter(a => a.reviewedAt)

  function handleSaveProfile() {
    toast.success('Profile updated', 'Your changes have been saved.')
  }

  function handleChangePassword() {
    if (!currentPw || !newPw) {
      toast.error('Missing fields', 'Enter your current and new password.')
      return
    }
    if (newPw.length < 8) {
      toast.error('Weak password', 'New password must be at least 8 characters.')
      return
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match', 'Confirm your new password.')
      return
    }
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    toast.success('Password changed', 'Use your new password next time you sign in.')
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your reviewer information and review performance." />

      <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={data.name} src={user.avatarUrl} className="size-16 text-lg" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold text-ink-900">{data.name}</p>
            <p className="text-sm text-ink-500">{data.title}</p>
            <p className="mt-0.5 text-xs text-ink-400">{data.department}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={roleBadgeMeta(user.role).label} tone={roleBadgeMeta(user.role).tone} />
            <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
              Member since {formatMemberSince(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ProfileStat icon={FileCheck2} label="Applications Reviewed" value={String(data.applicationsReviewed)} tone="bg-brand-50 text-brand-600" />
        <ProfileStat icon={Clock3} label="Average Review Time" value={data.avgReviewTime} tone="bg-amber-50 text-amber-600" />
        <ProfileStat icon={Target} label="Approval Rate" value={`${data.approvalRate}%`} tone="bg-violet-50 text-violet-600" />
        <ProfileStat icon={Zap} label="On-time Completion" value={`${data.onTimeRate}%`} tone="bg-sky-50 text-sky-600" />
        <ProfileStat icon={ShieldCheck} label="Documents Verified" value={String(data.documentsVerified)} tone="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Widget title="Personal information" subtitle="Shown to applicants and team members.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rv-name">Full name</Label>
                <Input id="rv-name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rv-email">Email</Label>
                <Input id="rv-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="rv-dept">Department</Label>
                <Input id="rv-dept" value={data.department} readOnly />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button size="sm" onClick={handleSaveProfile}>
                <Save className="size-4" aria-hidden />
                Save changes
              </Button>
            </div>
          </Widget>

          <Widget title="Security" subtitle="Update your password.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="rv-pw-current">Current password</Label>
                <Input id="rv-pw-current" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rv-pw-new">New password</Label>
                <Input id="rv-pw-new" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="rv-pw-confirm">Confirm new password</Label>
                <Input id="rv-pw-confirm" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleChangePassword}>
                <KeyRound className="size-4" aria-hidden />
                Update password
              </Button>
            </div>
          </Widget>
        </div>

        <div className="space-y-4">
          <Widget title="Account">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <ShieldCheck className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-ink-900">{role.name}</p>
                <p className="text-xs text-ink-500">{role.permissions.length} permissions</p>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Role</dt>
                <dd className="font-semibold text-ink-900">{role.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Specialties</dt>
                <dd className="max-w-40 text-right font-semibold text-ink-900">
                  {data.specialties.join(', ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Active queue</dt>
                <dd className="font-semibold text-ink-900">{decided.length} decided</dd>
              </div>
            </dl>
          </Widget>

          <Widget title="Access">
            <ul className="space-y-2">
              {role.permissions.map(permission => (
                <li key={permission} className="flex items-center gap-2 text-sm text-ink-600">
                  <User className="size-3.5 text-ink-400" aria-hidden />
                  {permission.replace(/_/g, ' ').toLowerCase()}
                </li>
              ))}
            </ul>
          </Widget>
        </div>
      </div>
    </div>
  )
}
