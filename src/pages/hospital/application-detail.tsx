import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  GraduationCap,
  Hourglass,
  MapPin,
  Repeat,
  Stethoscope,
  User,
  XCircle,
} from 'lucide-react'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, hospitalAppStatusMeta } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import {
  useDecideApplication,
  useHospitalApplication,
  useHospitalDoctors,
  useScheduleApplication,
  useUpdateInternalNotes,
} from '@/lib/hospitalQueries'
import { formatDate } from '@/lib/utils'
import type { HospitalDecision } from '@/services/hospitalService'

type DecisionModal = { decision: HospitalDecision; label: string } | null

export function HospitalApplicationDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const application = useHospitalApplication(id)
  const doctors = useHospitalDoctors()

  const decide = useDecideApplication()
  const schedule = useScheduleApplication()
  const saveNotes = useUpdateInternalNotes()

  const [decisionModal, setDecisionModal] = useState<DecisionModal>(null)
  const [decisionNote, setDecisionNote] = useState('')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDoctor, setScheduleDoctor] = useState('')
  const [scheduleStart, setScheduleStart] = useState('')
  const [scheduleEnd, setScheduleEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(true)

  useEffect(() => {
    const internalNotes = application.data?.internalNotes
    if (internalNotes && notes === '') {
      setNotes(internalNotes)
      setNotesSaved(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.data?.id, application.data?.internalNotes])

  if (application.isLoading) return <PageLoader label="Loading application…" />

  const a = application.data!

  const canDecide = a.status === 'awaiting_decision' || a.status === 'waitlisted'
  const canSchedule = a.status === 'accepted' || a.status === 'waitlisted'

  function openDecision(decision: HospitalDecision, label: string) {
    setDecisionNote('')
    setDecisionModal({ decision, label })
  }

  function confirmDecision() {
    if (!decisionModal) return
    decide.mutate(
      { applicationId: a.id, decision: decisionModal.decision, note: decisionNote },
      {
        onSuccess: () => {
          toast.success('Application updated', `${a.id} marked ${decisionModal!.label}.`)
          setDecisionModal(null)
        },
        onError: () => toast.error('Could not update application'),
      },
    )
  }

  function confirmSchedule() {
    if (!scheduleDoctor || !scheduleStart || !scheduleEnd) {
      toast.error('Incomplete schedule', 'Doctor, start date, and end date are required.')
      return
    }
    if (scheduleEnd <= scheduleStart) {
      toast.error('Invalid dates', 'End date must be after start date.')
      return
    }
    schedule.mutate(
      { applicationId: a.id, doctorId: scheduleDoctor, start: scheduleStart, end: scheduleEnd },
      {
        onSuccess: () => {
          toast.success('Rotation scheduled', `${a.id} assigned to a doctor.`)
          setScheduleOpen(false)
        },
        onError: () => toast.error('Could not schedule rotation'),
      },
    )
  }

  function saveNotesNow() {
    saveNotes.mutate(
      { applicationId: a.id, notes },
      {
        onSuccess: () => {
          setNotesSaved(true)
          toast.success('Notes saved', `${a.id} internal notes updated.`)
        },
        onError: () => toast.error('Could not save notes'),
      },
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/dashboard/hospital/applications')}
        className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to applications
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={a.student.name} className="size-14 text-lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink-900">{a.student.name}</h1>
              <StatusBadge label={hospitalAppStatusMeta(a.status).label} tone={hospitalAppStatusMeta(a.status).tone} />
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {a.id} · {a.program.name} · Applied {formatDate(a.appliedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <User className="size-4.5 text-brand-600" aria-hidden />
              <h2 className="font-display text-base font-bold text-ink-900">Student information</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <MapPin className="size-3.5" aria-hidden /> Country
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{a.student.country}</p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <GraduationCap className="size-3.5" aria-hidden /> Medical school
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{a.student.medicalSchool}</p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Graduation year</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{a.student.graduationYear}</p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Languages</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{a.languages.join(', ')}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <Building2 className="size-4.5 text-sky-600" aria-hidden />
              <h2 className="font-display text-base font-bold text-ink-900">Application summary</h2>
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Program</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">{a.program.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Department</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">{a.program.department}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Specialty</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">{a.program.specialty}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Duration</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">{a.program.duration}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Program fee</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">${a.program.fee.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Reviewed by</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">{a.reviewedBy}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">USMLE progress</dt>
                <dd className="mt-0.5 text-sm text-ink-800">{a.usmleProgress}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Clinical experience</dt>
                <dd className="mt-0.5 text-sm text-ink-800">{a.clinicalExperience}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Research experience</dt>
                <dd className="mt-0.5 text-sm text-ink-800">{a.researchExperience || '—'}</dd>
              </div>
            </dl>
            {a.decisionNote && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Decision note</p>
                <p className="mt-1 text-sm text-amber-900">{a.decisionNote}</p>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-4.5 text-violet-600" aria-hidden />
              <h2 className="font-display text-base font-bold text-ink-900">Rotation details</h2>
            </div>
            {a.status === 'scheduled' || a.status === 'completed' ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <Stethoscope className="size-3.5" aria-hidden /> Assigned doctor
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">{a.doctor?.name ?? '—'}</p>
                  <p className="text-xs text-ink-500">{a.doctor?.specialty ?? ''}</p>
                </div>
                <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <CalendarDays className="size-3.5" aria-hidden /> Start date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">{a.rotationStart ? formatDate(a.rotationStart) : '—'}</p>
                </div>
                <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <Repeat className="size-3.5" aria-hidden /> End date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">{a.rotationEnd ? formatDate(a.rotationEnd) : '—'}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-500">
                {a.status === 'awaiting_decision'
                  ? 'Accept the application to assign a doctor and schedule the rotation.'
                  : 'Schedule the rotation to lock in dates and an assigned doctor.'}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink-900">Internal notes</h2>
              {!notesSaved && <span className="text-xs font-semibold text-amber-600">Unsaved changes</span>}
            </div>
            <Textarea
              value={notes}
              onChange={e => {
                setNotes(e.target.value)
                setNotesSaved(false)
              }}
              rows={4}
              placeholder="Add private notes about this applicant…"
              className="mt-4"
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={saveNotesNow} disabled={notesSaved}>
                Save notes
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="sticky top-24 rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Application actions</h3>
            <div className="mt-4 space-y-2">
              {canDecide && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => openDecision('accepted', 'accepted')}
                  >
                    <BadgeCheck className="size-4" aria-hidden />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => openDecision('waitlisted', 'waitlisted')}
                  >
                    <Hourglass className="size-4" aria-hidden />
                    Waitlist
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full !bg-red-600 hover:!bg-red-700"
                    onClick={() => openDecision('rejected', 'rejected')}
                  >
                    <XCircle className="size-4" aria-hidden />
                    Reject
                  </Button>
                </>
              )}
              {canSchedule && (
                <Button className="w-full" onClick={() => setScheduleOpen(true)}>
                  <CalendarDays className="size-4" aria-hidden />
                  Schedule rotation
                </Button>
              )}
              {(a.status === 'scheduled' || a.status === 'completed') && (
                <Button variant="outline" className="w-full" onClick={() => setScheduleOpen(true)}>
                  <CalendarDays className="size-4" aria-hidden />
                  {a.status === 'scheduled' ? 'Reschedule rotation' : 'View schedule'}
                </Button>
              )}
              {a.status === 'rejected' && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  This application was declined.
                </p>
              )}
            </div>
            <div className="mt-4 border-t border-ink-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Timeline</p>
              <div className="mt-3 space-y-3">
                <div className="flex gap-3">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Reviewed by team</p>
                    <p className="text-xs text-ink-500">{a.reviewedBy} · {formatDate(a.appliedAt)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Forwarded to hospital</p>
                    <p className="text-xs text-ink-500">Approved by review team</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Hospital decision</p>
                    <p className="text-xs text-ink-500">{hospitalAppStatusMeta(a.status).label}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <Modal
        open={decisionModal !== null}
        onClose={() => setDecisionModal(null)}
        title={decisionModal ? `${decisionModal.label.charAt(0).toUpperCase() + decisionModal.label.slice(1)} application` : ''}
        description="Leave an optional note for the internal record."
      >
        <Label htmlFor="decision-note">Decision note</Label>
        <Textarea
          id="decision-note"
          value={decisionNote}
          onChange={e => setDecisionNote(e.target.value)}
          rows={3}
          placeholder="e.g. Seat confirmed for January cohort…"
          className="mt-2"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setDecisionModal(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={confirmDecision} disabled={decide.isPending}>
            {decide.isPending ? 'Working…' : 'Confirm decision'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule rotation"
        description={`Assign a doctor and rotation dates for ${a.id}.`}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="schedule-doctor">Assigned doctor</Label>
            <Select
              id="schedule-doctor"
              value={scheduleDoctor}
              onChange={e => setScheduleDoctor(e.target.value)}
              className="mt-2 w-full"
            >
              <option value="">Select a doctor…</option>
              {(doctors.data ?? [])
                .filter(d => d.status !== 'on_leave')
                .map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty}
                  </option>
                ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="schedule-start">Start date</Label>
              <Input
                id="schedule-start"
                type="date"
                value={scheduleStart}
                onChange={e => setScheduleStart(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="schedule-end">End date</Label>
              <Input
                id="schedule-end"
                type="date"
                value={scheduleEnd}
                onChange={e => setScheduleEnd(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setScheduleOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={confirmSchedule} disabled={schedule.isPending}>
            {schedule.isPending ? 'Scheduling…' : 'Schedule'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
