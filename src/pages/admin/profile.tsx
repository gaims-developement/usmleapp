import { useState } from 'react'
import { KeyRound, Save, ShieldCheck, User } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Widget } from '@/components/ui/widget'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge, roleBadgeMeta } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { roleById } from '@/roles/roles'

export function AdminProfilePage() {
  const { user } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('+1 (555) 010-2033')
  const [title, setTitle] = useState('Operations Administrator')
  const [timezone, setTimezone] = useState('America/New_York')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  if (!user) return null
  const role = roleById(user.role)

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
      <PageHeader title="Profile" subtitle="Your admin account details and security settings." />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Widget title="Personal information" subtitle="Shown to team members and partners.">
            <div className="flex items-center gap-4">
              <Avatar name={name} className="size-16 text-lg" />
              <div>
                <p className="font-display text-lg font-bold text-ink-900">{name}</p>
                <p className="text-sm text-ink-500">{title}</p>
                <div className="mt-1.5">
                  <StatusBadge label={roleBadgeMeta(user.role).label} tone={roleBadgeMeta(user.role).tone} />
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pf-name">Full name</Label>
                <Input id="pf-name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pf-email">Email</Label>
                <Input id="pf-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pf-phone">Phone</Label>
                <Input id="pf-phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pf-title">Job title</Label>
                <Input id="pf-title" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pf-tz">Timezone</Label>
                <Select id="pf-tz" value={timezone} onChange={e => setTimezone(e.target.value)}>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="UTC">UTC</option>
                </Select>
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
                <Label htmlFor="pw-current">Current password</Label>
                <Input id="pw-current" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pw-new">New password</Label>
                <Input id="pw-new" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pw-confirm">Confirm new password</Label>
                <Input id="pw-confirm" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
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
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
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
                <dt className="text-ink-500">Member since</dt>
                <dd className="font-semibold text-ink-900">Jan 2026</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Two-factor auth</dt>
                <dd className="font-semibold text-brand-700">Enabled</dd>
              </div>
            </dl>
          </Widget>

          <Widget title="Access">
            <ul className="space-y-2">
              {role.permissions.slice(0, 8).map(permission => (
                <li key={permission} className="flex items-center gap-2 text-sm text-ink-600">
                  <User className="size-3.5 text-ink-400" aria-hidden />
                  {permission.replace(/_/g, ' ').toLowerCase()}
                </li>
              ))}
              {role.permissions.length > 8 && (
                <li className="text-xs text-ink-400">+{role.permissions.length - 8} more</li>
              )}
            </ul>
          </Widget>
        </div>
      </div>
    </div>
  )
}
