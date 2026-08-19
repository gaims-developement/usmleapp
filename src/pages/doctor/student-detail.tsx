import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Award,
  CalendarDays,
  CheckCircle2,
  FileSignature,
  MessageSquareText,
  Stethoscope,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, attendanceStatusMeta, evaluationStatusMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import {
  useDoctorStudentDetail,
  useEvaluations,
  useLogbookEntries,
  useSendDoctorMessageToStudent,
} from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'

export function DoctorStudentDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const detail = useDoctorStudentDetail(id)
  const evaluations = useEvaluations()
  const logbook = useLogbookEntries()
  const send = useSendDoctorMessageToStudent()
  const toast = useToast()
  const [messageOpen, setMessageOpen] = useState(false)
  const [message, setMessage] = useState('')

  const studentEval = useMemo(
    () => (evaluations.data ?? []).find(e => e.studentId === id),
    [evaluations.data, id],
  )
  const studentLogbook = useMemo(
    () => (logbook.data ?? []).filter(e => e.studentId === id),
    [logbook.data, id],
  )

  if (detail.isLoading || evaluations.isLoading || logbook.isLoading) {
    return <PageLoader label="Loading student profile…" />
  }

  const student = detail.data
  if (!student) return <p className="text-sm text-ink-500">Student not found.</p>
  const studentName = student.name

  const pendingCount = studentLogbook.filter(e => e.status === 'pending').length
  const approvedCount = studentLogbook.filter(e => e.status === 'approved').length

  function handleSend() {
    if (!message.trim()) {
      toast.error('Empty message', 'Type a message before sending.')
      return
    }
    send.mutate(
      { studentId: id, text: message.trim() },
      {
        onSuccess: () => {
          toast.success('Message sent', `Your message to ${studentName} was sent.`)
          setMessage('')
          setMessageOpen(false)
        },
        onError: () => toast.error('Could not send message'),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title={student.name}
        subtitle={`${student.country} · ${student.medicalSchool} · Class of ${student.graduationYear}`}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setMessageOpen(true)}>
              <MessageSquareText className="size-4" aria-hidden />
              Message
            </Button>
            <Button size="sm" onClick={() => navigate('/dashboard/doctor/evaluations')}>
              <Stethoscope className="size-4" aria-hidden />
              Evaluate
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <Avatar name={student.name} className="size-14 text-lg" />
              <div>
                <p className="font-display text-lg font-bold text-ink-900">{student.name}</p>
                <p className="text-sm text-ink-500">{student.department} · {student.medicalSchool}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge
                    label={evaluationStatusMeta(studentEval?.status ?? 'draft').label}
                    tone={evaluationStatusMeta(studentEval?.status ?? 'draft').tone}
                  />
                  <StatusBadge
                    label={student.rotationStart && student.rotationStart > new Date().toISOString().slice(0, 10) ? 'Starting soon' : 'In rotation'}
                    tone={student.rotationStart && student.rotationStart > new Date().toISOString().slice(0, 10) ? 'amber' : 'brand'}
                  />
                </div>
              </div>
            </div>
            <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">USMLE progress</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-800">{student.usmleProgress}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Research experience</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-800">{student.researchExperience}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Clinical experience</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-800">{student.clinicalExperience}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">Rotation window</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-800">
                  {formatDate(student.rotationStart)} → {formatDate(student.rotationEnd)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-ink-900">Rotation progress</h3>
                <p className="text-sm text-ink-500">Stage {student.progressCount} of 6 completed</p>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(student.progressCount / 6) * 100} className="w-28" />
                <span className="text-xs font-bold text-ink-700">{Math.round((student.progressCount / 6) * 100)}%</span>
              </div>
            </div>
            <ol className="mt-5 space-y-3">
              {student.progress.map(item => (
                <li key={item.stage} className="flex items-center gap-3">
                  {item.status === 'completed' ? (
                    <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white">
                      <CheckCircle2 className="size-4" aria-hidden />
                    </span>
                  ) : item.status === 'in_progress' ? (
                    <span className="grid size-6 place-items-center rounded-full border-2 border-amber-500 bg-white">
                      <span className="size-2 rounded-full bg-amber-500" aria-hidden />
                    </span>
                  ) : (
                    <span className="grid size-6 place-items-center rounded-full border-2 border-ink-200 bg-white">
                      <span className="size-2 rounded-full bg-ink-200" aria-hidden />
                    </span>
                  )}
                  <p
                    className={
                      item.status === 'completed'
                        ? 'text-sm font-semibold text-ink-900'
                        : item.status === 'in_progress'
                          ? 'text-sm font-semibold text-amber-700'
                          : 'text-sm text-ink-400'
                    }
                  >
                    {item.stage}
                  </p>
                  {item.status === 'in_progress' && (
                    <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      In progress
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-ink-900">Attendance</h3>
                <p className="text-sm text-ink-500">Weekly records over the past 8 weeks</p>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={student.attendancePercentage} className="w-24" />
                <span className="text-xs font-bold text-ink-700">{student.attendancePercentage}%</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {student.attendance.map(record => (
                <div key={record.week} className="rounded-2xl border border-ink-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Week {record.week}</p>
                  <div className="mt-1.5">
                    <StatusBadge
                      label={attendanceStatusMeta(record.status).label}
                      tone={attendanceStatusMeta(record.status).tone}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Quick links</h3>
            <div className="mt-4 space-y-2">
              <Link
                to="/dashboard/doctor/logbooks"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <Stethoscope className="size-4.5 text-brand-600" aria-hidden />
                Review logbook
              </Link>
              <Link
                to="/dashboard/doctor/evaluations"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <FileSignature className="size-4.5 text-violet-600" aria-hidden />
                Write a LoR
              </Link>
              <Link
                to="/dashboard/doctor/certificates"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <Award className="size-4.5 text-amber-600" aria-hidden />
                Manage certificate
              </Link>
              <Link
                to="/dashboard/doctor/schedule"
                className="flex items-center gap-3 rounded-2xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                <CalendarDays className="size-4.5 text-sky-600" aria-hidden />
                View schedule
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5 shadow-soft">
            <h3 className="font-display text-sm font-bold text-ink-900">Logbook summary</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-ink-100 p-3 text-center">
                <p className="font-display text-2xl font-bold text-ink-900">{studentLogbook.length}</p>
                <p className="mt-1 text-xs text-ink-500">Total entries</p>
              </div>
              <div className="rounded-2xl border border-ink-100 p-3 text-center">
                <p className="font-display text-2xl font-bold text-brand-600">{approvedCount}</p>
                <p className="mt-1 text-xs text-ink-500">Approved</p>
              </div>
              <div className="rounded-2xl border border-ink-100 p-3 text-center">
                <p className="font-display text-2xl font-bold text-amber-600">{pendingCount}</p>
                <p className="mt-1 text-xs text-ink-500">Pending</p>
              </div>
              <div className="rounded-2xl border border-ink-100 p-3 text-center">
                <p className="font-display text-2xl font-bold text-sky-600">{student.attendancePercentage}%</p>
                <p className="mt-1 text-xs text-ink-500">Attendance</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <Modal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title={`Message ${student.name}`}
        description="Send a message directly to this student."
      >
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          placeholder="Type your message…"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setMessageOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend} disabled={send.isPending}>
            {send.isPending ? 'Sending…' : 'Send message'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
