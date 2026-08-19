import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

export function AccountPendingPage() {
  const { user, logout } = useAuth()

  const role = user?.role
  const profileStatus =
    role === 'HOSPITAL' ? user?.hospital?.status :
    role === 'DOCTOR' ? user?.doctor?.status :
    role === 'REVIEWER' ? user?.reviewer?.status :
    null

  const isHospitalPending = role === 'HOSPITAL' && profileStatus === 'pending'
  const isDoctorPending = role === 'DOCTOR' && profileStatus === 'pending'
  const isReviewerPending = role === 'REVIEWER' && profileStatus === 'pending'

  let title = 'Account Under Review'
  let description = 'Your account registration has been submitted and is currently being reviewed. You will be notified once your registration has been approved.'

  if (isHospitalPending) {
    title = 'Hospital Registration Under Review'
    description = 'Your hospital registration has been submitted and is currently being reviewed by the IMG Prep administration. You will be notified once your registration has been approved.'
  } else if (isDoctorPending) {
    title = 'Account Awaiting Hospital Approval'
    description = 'Your doctor account has been created and is pending approval from your associated hospital. You will be notified once the hospital reviews your registration.'
  } else if (isReviewerPending) {
    title = 'Account Awaiting Hospital Approval'
    description = 'Your reviewer account has been created and is pending approval from your associated hospital. You will be notified once the hospital reviews your registration.'
  }

  return (
    <section className="flex min-h-screen items-center bg-gradient-to-b from-brand-50/60 to-white px-4 py-24">
      <Container className="max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-600">
            <Clock className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">{title}</h1>
          <p className="mt-2 text-sm text-ink-600">{description}</p>
        </div>

        <div className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-amber-800">Status: Review Pending</p>
                <p className="mt-1 text-xs text-amber-700">
                  {user?.createdAt && `Registered: ${new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-ink-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink-800">Check your notifications</p>
                <p className="mt-1 text-xs text-ink-500">
                  You will receive a notification once your account has been reviewed.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/announcements"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
            >
              View announcements
            </Link>
            <Button variant="outline" size="sm" onClick={() => logout()} className="w-full">
              Log out
            </Button>
          </div>
        </div>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to website
        </Link>
      </Container>
    </section>
  )
}
