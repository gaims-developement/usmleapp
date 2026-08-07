import {
  BadgeCheck,
  BookOpen,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { Avatar } from '@/components/ui/avatar'
import { useDoctorProfile } from '@/lib/doctorQueries'

export function DoctorProfilePage() {
  const profile = useDoctorProfile()

  if (profile.isLoading) return <PageLoader label="Loading your profile…" />

  const p = profile.data

  if (!p) return <p className="text-sm text-ink-500">Profile not found.</p>

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Your mentor information as shown to hospital administration."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
            <BadgeCheck className="size-4" aria-hidden />
            Verified mentor
          </span>
        }
      />

      <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar name={p.name} className="size-20 text-2xl" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold text-ink-900">{p.name}</h2>
            <p className="text-sm text-ink-600">{p.title} · {p.specialty}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <Building2 className="size-4 text-ink-400" aria-hidden />
              {p.hospital}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
            {p.averageStudentRating} student rating
          </div>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-ink-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500">
              <Mail className="size-4.5" aria-hidden />
            </span>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Email</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-800">{p.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500">
              <Phone className="size-4.5" aria-hidden />
            </span>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Phone</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-800">{p.phone}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500">
              <GraduationCap className="size-4.5" aria-hidden />
            </span>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Medical degree</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-800">{p.medicalDegree}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500">
              <BadgeCheck className="size-4.5" aria-hidden />
            </span>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">License</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-800">{p.licenseNumber}</dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Stethoscope className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-display text-2xl font-bold text-ink-900">{p.yearsOfExperience}</p>
          <p className="mt-1 text-sm text-ink-500">Years of experience</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <Users className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-display text-2xl font-bold text-ink-900">{p.studentsSupervised}</p>
          <p className="mt-1 text-sm text-ink-500">Students supervised</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <BookOpen className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-display text-2xl font-bold text-ink-900">{p.completedEvaluations}</p>
          <p className="mt-1 text-sm text-ink-500">Evaluations completed</p>
        </div>
        <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Star className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-display text-2xl font-bold text-ink-900">{p.averageStudentRating}</p>
          <p className="mt-1 text-sm text-ink-500">Average student rating</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
        <h3 className="font-display text-base font-bold text-ink-900">Departments & specialization</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-800">{p.department}</span>
          <span className="rounded-full bg-ink-100 px-3.5 py-1.5 text-sm font-semibold text-ink-700">{p.specialty}</span>
        </div>
      </div>
    </div>
  )
}
