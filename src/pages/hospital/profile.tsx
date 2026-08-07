import { useEffect, useState } from 'react'
import { Building2, GraduationCap, Mail, MapPin, Phone, Save, Shield, User, Globe } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageLoader } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import {
  useHospitalApplications,
  useHospitalProfile,
  useHospitalPrograms,
} from '@/lib/hospitalQueries'

export function HospitalProfilePage() {
  const profile = useHospitalProfile()
  const programs = useHospitalPrograms()
  const applications = useHospitalApplications()
  const toast = useToast()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.name)
      setAddress(profile.data.address)
      setPhone(profile.data.phone)
      setEmail(profile.data.email)
      setWebsite(profile.data.website)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data?.name])

  if (profile.isLoading) return <PageLoader label="Loading hospital profile…" />

  const p = profile.data!

  const saveProfile = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error('Missing fields', 'Name, phone, and email are required.')
      return
    }
    toast.success('Profile updated', 'Your hospital details have been saved.')
  }

  return (
    <div>
      <PageHeader
        title="Hospital Profile"
        subtitle="Your public elective program details and account information."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <Building2 className="size-4.5 text-brand-600" aria-hidden />
              <h2 className="font-display text-base font-bold text-ink-900">Hospital details</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="h-name">Hospital name</Label>
                <Input id="h-name" value={name} onChange={e => setName(e.target.value)} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="h-address">Street address</Label>
                <Input id="h-address" value={address} onChange={e => setAddress(e.target.value)} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-ink-600">
                  <MapPin className="mr-1 inline size-4 align-[-3px]" aria-hidden />
                  {p.city}, {p.country}
                </p>
              </div>
              <div>
                <Label htmlFor="h-phone">Phone</Label>
                <Input id="h-phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="h-email">Email</Label>
                <Input id="h-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="h-website">Website</Label>
                <Input id="h-website" value={website} onChange={e => setWebsite(e.target.value)} className="mt-2" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button size="sm" onClick={saveProfile}>
                <Save className="size-4" aria-hidden />
                Save changes
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <Shield className="size-4.5 text-sky-600" aria-hidden />
              <h2 className="font-display text-base font-bold text-ink-900">Account & security</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="pw-current">Current password</Label>
                <Input id="pw-current" type="password" className="mt-2" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pw-new">New password</Label>
                  <Input id="pw-new" type="password" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="pw-confirm">Confirm new password</Label>
                  <Input id="pw-confirm" type="password" className="mt-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.success('Password changed', 'Use your new password next time you sign in.')
                  }
                >
                  Update password
                </Button>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Electives coordinator</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2 text-ink-800">
                <User className="size-4 shrink-0 text-ink-400" aria-hidden />
                {p.coordinator.name}
              </p>
              <p className="flex items-center gap-2 text-ink-800">
                <Mail className="size-4 shrink-0 text-ink-400" aria-hidden />
                {p.coordinator.email}
              </p>
              <p className="flex items-center gap-2 text-ink-800">
                <Phone className="size-4 shrink-0 text-ink-400" aria-hidden />
                {p.coordinator.phone}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Hospital stats</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
                <span className="text-sm text-ink-600">Beds</span>
                <span className="font-display text-lg font-bold text-ink-900">{p.beds}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
                <span className="text-sm text-ink-600">Staff</span>
                <span className="font-display text-lg font-bold text-ink-900">{p.staffCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
                <span className="text-sm text-ink-600">Published programs</span>
                <span className="font-display text-lg font-bold text-ink-900">
                  {(programs.data ?? []).filter(pr => pr.status === 'published').length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
                <span className="text-sm text-ink-600">Applications received</span>
                <span className="font-display text-lg font-bold text-ink-900">{applications.data?.length ?? 0}</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4.5 text-violet-600" aria-hidden />
              <h3 className="font-display text-sm font-bold text-ink-900">Accreditations</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.accreditation.map(a => (
                <span key={a} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  {a}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4 text-sm text-ink-600">
              <Globe className="size-4 text-ink-400" aria-hidden />
              {p.website}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
