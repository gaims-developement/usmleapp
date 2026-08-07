import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import {
  useAdminApplications,
  useAdminDoctors,
  useAdminHospitals,
  useAdminPrograms,
  useAdminReviewers,
  useAdminStudents,
  useReportCatalog,
} from '@/lib/adminQueries'
import { downloadCsv } from '@/lib/csv'
import { formatCurrency } from '@/lib/utils'
import type { ReportCategory } from '@/mocks/admin/ops'

const categories: ReportCategory[] = ['Applications', 'Hospitals', 'Students', 'Doctors', 'Programs', 'Reviewers']

export function AdminReportsPage() {
  const catalog = useReportCatalog()
  const applications = useAdminApplications()
  const hospitals = useAdminHospitals()
  const students = useAdminStudents()
  const doctors = useAdminDoctors()
  const programs = useAdminPrograms()
  const reviewers = useAdminReviewers()
  const toast = useToast()

  const loading =
    catalog.isLoading ||
    applications.isLoading ||
    hospitals.isLoading ||
    students.isLoading ||
    doctors.isLoading ||
    programs.isLoading ||
    reviewers.isLoading

  const grouped = useMemo(() => {
    const map = new Map<ReportCategory, typeof catalog.data>()
    for (const category of categories) {
      map.set(category, (catalog.data ?? []).filter(r => r.category === category))
    }
    return map
  }, [catalog.data])

  if (loading) return <PageLoader label="Preparing reports…" />

  function generate(reportId: string, title: string) {
    let filename = ''
    let rows: Record<string, string | number>[] = []

    switch (reportId) {
      case 'rpt-app-queue':
        filename = 'application-queue.csv'
        rows = (applications.data ?? []).map(a => ({
          id: a.id,
          student: a.student,
          hospital: a.hospital,
          specialty: a.specialty,
          status: a.status,
          priority: a.priority,
          reviewer: a.reviewer,
          amount: formatCurrency(a.amount),
          submittedAt: a.submittedAt,
          flagged: a.flagged ? 'yes' : 'no',
        }))
        break
      case 'rpt-app-approvals':
        filename = 'daily-approvals.csv'
        rows = (applications.data ?? [])
          .filter(a => a.status === 'offered' || a.status === 'confirmed')
          .map(a => ({ id: a.id, student: a.student, hospital: a.hospital, status: a.status, approvedAt: a.submittedAt }))
        break
      case 'rpt-hospital-roster':
        filename = 'hospital-roster.csv'
        rows = (hospitals.data ?? []).map(h => ({
          name: h.name,
          city: h.city,
          state: h.state,
          tier: h.tier,
          programs: h.programs,
          doctors: h.doctors,
          students: h.students,
          rating: h.rating,
          status: h.status,
          joinedAt: h.joinedAt,
        }))
        break
      case 'rpt-hospital-approvals':
        filename = 'hospital-onboarding.csv'
        rows = (hospitals.data ?? []).map(h => ({
          name: h.name,
          city: h.city,
          state: h.state,
          status: h.status,
          joinedAt: h.joinedAt,
        }))
        break
      case 'rpt-student-roster':
        filename = 'student-roster.csv'
        rows = (students.data ?? []).map(s => ({
          name: s.name,
          email: s.email,
          country: s.country,
          school: s.school,
          step1: s.step1,
          step2: s.step2,
          applications: s.applications,
          docsComplete: s.docsComplete,
          docsTotal: s.docsTotal,
          status: s.status,
          joinedAt: s.joinedAt,
        }))
        break
      case 'rpt-student-docs':
        filename = 'student-documents.csv'
        rows = (students.data ?? [])
          .filter(s => s.docsComplete < s.docsTotal || !s.profileComplete)
          .map(s => ({
            name: s.name,
            email: s.email,
            docsComplete: s.docsComplete,
            docsTotal: s.docsTotal,
            missingDocs: s.docsTotal - s.docsComplete,
            profileComplete: s.profileComplete ? 'yes' : 'no',
            status: s.status,
          }))
        break
      case 'rpt-doctor-roster':
        filename = 'doctor-roster.csv'
        rows = (doctors.data ?? []).map(d => ({
          name: d.name,
          specialty: d.specialty,
          hospital: d.hospital,
          students: d.students,
          evaluations: d.evaluations,
          rating: d.rating,
          status: d.status,
          joinedAt: d.joinedAt,
        }))
        break
      case 'rpt-program-listing':
        filename = 'program-listing.csv'
        rows = (programs.data ?? []).map(p => ({
          title: p.title,
          specialty: p.specialty,
          hospital: p.hospital,
          city: p.city,
          duration: p.duration,
          fee: p.fee,
          filled: p.filled,
          capacity: p.capacity,
          status: p.status,
          startDate: p.startDate,
        }))
        break
      case 'rpt-reviewer-load':
        filename = 'reviewer-workload.csv'
        rows = (reviewers.data ?? []).map(r => ({
          name: r.name,
          assigned: r.assigned,
          pending: r.pending,
          completedToday: r.completedToday,
          avgReviewTime: r.avgReviewTime,
          availability: r.availability,
          accuracy: r.accuracy,
          status: r.status,
        }))
        break
    }

    if (!filename || rows.length === 0) {
      toast.error('Report empty', 'No rows matched for this report.')
      return
    }
    downloadCsv(filename, rows)
    toast.success('Report generated', `${title} downloaded (${rows.length} rows).`)
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate operational exports across applications, partners, students, and programs."
      />

      <div className="mt-6 space-y-8">
        {categories.map(category => {
          const reports = grouped.get(category) ?? []
          return (
            <section key={category}>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-ink-500">
                {category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="flex flex-col rounded-3xl border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <report.icon className="size-5" aria-hidden />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
                        {report.category}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-ink-900">{report.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-ink-500">{report.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-fit"
                      onClick={() => generate(report.id, report.title)}
                    >
                      <Download className="size-3.5" aria-hidden />
                      Download CSV
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
