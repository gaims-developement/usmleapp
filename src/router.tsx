import { createBrowserRouter } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'
import { AppLayout, type AppNavItem } from '@/components/layout/app-layout'
import { adminNav, superAdminNav } from '@/components/layout/admin-nav'
import { reviewerNav } from '@/components/layout/reviewer-nav'
import { hospitalNav } from '@/components/layout/hospital-nav'
import { doctorNav } from '@/components/layout/doctor-nav'
import { studentNav } from '@/components/layout/student-nav'
import { RequireAuth } from '@/guards/RequireAuth'
import { RequireOnboarding } from '@/guards/RequireOnboarding'
import { RequireRole } from '@/guards/RequireRole'
import { RequireStudent } from '@/guards/RequireStudent'
import { DashboardRoute, RoleDashboardRoute } from '@/guards/RoleDashboardRoute'
import { LandingPage } from '@/pages/landing-page'
import { LoginPage } from '@/pages/login-page'
import { DevModePage } from '@/pages/devmode-page'
import { SignupPage } from '@/pages/signup-page'
import { PartnerRegisterPage } from '@/pages/partner-register-page'
import { PartnerPendingPage } from '@/pages/partner-pending-page'
import { ContactPage } from '@/pages/contact-page'
import { PrivacyPage } from '@/pages/privacy-page'
import { TermsPage } from '@/pages/terms-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { UnauthorizedPage } from '@/pages/unauthorized-page'
import { OnboardingPage } from '@/pages/onboarding-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { BrowseElectivesPage } from '@/pages/browse-electives-page'
import { ElectiveDetailsPage } from '@/pages/elective-details-page'
import { ApplyPage } from '@/pages/apply-page'
import { ApplicationsPage } from '@/pages/applications-page'
import { ApplicationTrackerPage } from '@/pages/application-tracker-page'
import { DocumentsPage } from '@/pages/documents-page'
import { StudyPlannerPage } from '@/pages/study-planner-page'
import { AnnouncementsPage } from '@/pages/announcements-page'
import { StudentProfilePage } from '@/pages/student-profile-page'
import { StudentSettingsPage } from '@/pages/student-settings-page'
import { SuperAdminOverviewPage } from '@/pages/super-admin/overview'
import { SuperAdminAnalyticsPage } from '@/pages/super-admin/analytics'
import { SuperAdminUsersPage } from '@/pages/super-admin/users'
import { SuperAdminApplicationsPage } from '@/pages/super-admin/applications'
import { SuperAdminHospitalsPage } from '@/pages/super-admin/hospitals'
import { SuperAdminDoctorsPage } from '@/pages/super-admin/doctors'
import { SuperAdminReviewersPage } from '@/pages/super-admin/reviewers'
import { SuperAdminProgramsPage } from '@/pages/super-admin/programs'
import { SuperAdminDocumentsPage } from '@/pages/super-admin/documents'
import { SuperAdminPaymentsPage } from '@/pages/super-admin/payments'
import { SuperAdminAnnouncementsPage } from '@/pages/super-admin/announcements'
import { SuperAdminCmsPage } from '@/pages/super-admin/cms'
import { SuperAdminRolesPage } from '@/pages/super-admin/roles'
import { SuperAdminAuditLogsPage } from '@/pages/super-admin/audit-logs'
import { SuperAdminSupportPage } from '@/pages/super-admin/support'
import { SuperAdminSettingsPage } from '@/pages/super-admin/settings'
import { AdminOverviewPage } from '@/pages/admin/overview'
import { AdminApplicationsPage } from '@/pages/admin/applications'
import { AdminStudentsPage } from '@/pages/admin/students'
import { AdminHospitalsPage } from '@/pages/admin/hospitals'
import { AdminDoctorsPage } from '@/pages/admin/doctors'
import { AdminReviewersPage } from '@/pages/admin/reviewers'
import { AdminProgramsPage } from '@/pages/admin/programs'
import { AdminAnnouncementsPage } from '@/pages/admin/announcements'
import { AdminSupportPage } from '@/pages/admin/support'
import { AdminReportsPage } from '@/pages/admin/reports'
import { AdminProfilePage } from '@/pages/admin/profile'
import { DemoDataPage } from '@/pages/admin/demo-data'
import { ReviewerOverviewPage } from '@/pages/reviewer/overview'
import { ReviewerApplicationsPage } from '@/pages/reviewer/applications'
import { ReviewerApplicationDetailPage } from '@/pages/reviewer/application-detail'
import { ReviewerPendingPage } from '@/pages/reviewer/pending'
import { ReviewerApprovedPage } from '@/pages/reviewer/approved'
import { ReviewerRejectedPage } from '@/pages/reviewer/rejected'
import { ReviewerDocumentsPage } from '@/pages/reviewer/documents'
import { ReviewerMessagesPage } from '@/pages/reviewer/messages'
import { ReviewerProfilePage } from '@/pages/reviewer/profile'
import { HospitalOverviewPage } from '@/pages/hospital/overview'
import { HospitalApplicationsPage } from '@/pages/hospital/applications'
import { HospitalApplicationDetailPage } from '@/pages/hospital/application-detail'
import { HospitalProgramsPage } from '@/pages/hospital/programs'
import { HospitalProgramDetailPage } from '@/pages/hospital/program-detail'
import { HospitalRotationsPage } from '@/pages/hospital/rotations'
import { HospitalDoctorsPage } from '@/pages/hospital/doctors'
import { HospitalStudentsPage } from '@/pages/hospital/students'
import { HospitalCalendarPage } from '@/pages/hospital/calendar'
import { HospitalAnnouncementsPage } from '@/pages/hospital/announcements'
import { HospitalProfilePage } from '@/pages/hospital/profile'
import { DoctorOverviewPage } from '@/pages/doctor/overview'
import { DoctorStudentsPage } from '@/pages/doctor/students'
import { DoctorStudentDetailPage } from '@/pages/doctor/student-detail'
import { DoctorRotationsPage } from '@/pages/doctor/rotations'
import { DoctorSchedulePage } from '@/pages/doctor/schedule'
import { DoctorLogbooksPage } from '@/pages/doctor/logbooks'
import { DoctorEvaluationsPage } from '@/pages/doctor/evaluations'
import { DoctorLettersPage } from '@/pages/doctor/letters'
import { DoctorCertificatesPage } from '@/pages/doctor/certificates'
import { DoctorMessagesPage } from '@/pages/doctor/messages'
import { DoctorProfilePage } from '@/pages/doctor/profile'

const staffNav: AppNavItem[] = [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/devmode', element: <DevModePage /> },
  { path: '/register', element: <SignupPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/partner-register', element: <PartnerRegisterPage /> },
  { path: '/partner-register/success', element: <PartnerPendingPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/dashboard', element: <DashboardRoute /> },
      { path: '/onboarding', element: <RequireOnboarding />, children: [{ index: true, element: <OnboardingPage /> }] },
      {
        element: <RequireStudent />,
        children: [
          {
            element: <AppLayout nav={studentNav} />,
            children: [
              { path: '/dashboard/student', element: <DashboardPage /> },
              { path: '/electives', element: <BrowseElectivesPage /> },
              { path: '/electives/:id', element: <ElectiveDetailsPage /> },
              { path: '/apply/:id', element: <ApplyPage /> },
              { path: '/applications', element: <ApplicationsPage /> },
              { path: '/applications/:id', element: <ApplicationTrackerPage /> },
              { path: '/documents', element: <DocumentsPage /> },
              { path: '/planner', element: <StudyPlannerPage /> },
              { path: '/resources', element: <StudyPlannerPage /> },
              { path: '/announcements', element: <AnnouncementsPage /> },
              { path: '/profile', element: <StudentProfilePage /> },
              { path: '/settings', element: <StudentSettingsPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole roles={['SUPER_ADMIN']} />,
        children: [
          {
            element: <AppLayout nav={superAdminNav} />,
            children: [
              { path: '/dashboard/super-admin', element: <SuperAdminOverviewPage /> },
              { path: '/dashboard/super-admin/analytics', element: <SuperAdminAnalyticsPage /> },
              { path: '/dashboard/super-admin/users', element: <SuperAdminUsersPage /> },
              { path: '/dashboard/super-admin/applications', element: <SuperAdminApplicationsPage /> },
              { path: '/dashboard/super-admin/hospitals', element: <SuperAdminHospitalsPage /> },
              { path: '/dashboard/super-admin/doctors', element: <SuperAdminDoctorsPage /> },
              { path: '/dashboard/super-admin/reviewers', element: <SuperAdminReviewersPage /> },
              { path: '/dashboard/super-admin/programs', element: <SuperAdminProgramsPage /> },
              { path: '/dashboard/super-admin/documents', element: <SuperAdminDocumentsPage /> },
              { path: '/dashboard/super-admin/payments', element: <SuperAdminPaymentsPage /> },
              { path: '/dashboard/super-admin/announcements', element: <SuperAdminAnnouncementsPage /> },
              { path: '/dashboard/super-admin/cms', element: <SuperAdminCmsPage /> },
              { path: '/dashboard/super-admin/roles', element: <SuperAdminRolesPage /> },
              { path: '/dashboard/super-admin/audit-logs', element: <SuperAdminAuditLogsPage /> },
              { path: '/dashboard/super-admin/support', element: <SuperAdminSupportPage /> },
              { path: '/dashboard/super-admin/demo-data', element: <DemoDataPage /> },
              { path: '/dashboard/super-admin/settings', element: <SuperAdminSettingsPage /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole roles={['ADMIN']} />,
        children: [
          {
            element: <AppLayout nav={adminNav} />,
            children: [
              { path: '/dashboard/admin', element: <AdminOverviewPage /> },
              { path: '/dashboard/admin/applications', element: <AdminApplicationsPage /> },
              { path: '/dashboard/admin/students', element: <AdminStudentsPage /> },
              { path: '/dashboard/admin/hospitals', element: <AdminHospitalsPage /> },
              { path: '/dashboard/admin/doctors', element: <AdminDoctorsPage /> },
              { path: '/dashboard/admin/reviewers', element: <AdminReviewersPage /> },
              { path: '/dashboard/admin/programs', element: <AdminProgramsPage /> },
              { path: '/dashboard/admin/announcements', element: <AdminAnnouncementsPage /> },
              { path: '/dashboard/admin/support', element: <AdminSupportPage /> },
              { path: '/dashboard/admin/reports', element: <AdminReportsPage /> },
              { path: '/dashboard/admin/demo-data', element: <DemoDataPage /> },
              { path: '/dashboard/admin/profile', element: <AdminProfilePage /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole roles={['REVIEWER']} />,
        children: [
          {
            element: <AppLayout nav={reviewerNav} />,
            children: [
              { path: '/dashboard/reviewer', element: <ReviewerOverviewPage /> },
              { path: '/dashboard/reviewer/applications', element: <ReviewerApplicationsPage /> },
              { path: '/dashboard/reviewer/applications/:id', element: <ReviewerApplicationDetailPage /> },
              { path: '/dashboard/reviewer/pending', element: <ReviewerPendingPage /> },
              { path: '/dashboard/reviewer/approved', element: <ReviewerApprovedPage /> },
              { path: '/dashboard/reviewer/rejected', element: <ReviewerRejectedPage /> },
              { path: '/dashboard/reviewer/documents', element: <ReviewerDocumentsPage /> },
              { path: '/dashboard/reviewer/messages', element: <ReviewerMessagesPage /> },
              { path: '/dashboard/reviewer/profile', element: <ReviewerProfilePage /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole roles={['HOSPITAL']} />,
        children: [
          {
            element: <AppLayout nav={hospitalNav} />,
            children: [
              { path: '/dashboard/hospital', element: <HospitalOverviewPage /> },
              { path: '/dashboard/hospital/programs', element: <HospitalProgramsPage /> },
              { path: '/dashboard/hospital/programs/new', element: <HospitalProgramDetailPage /> },
              { path: '/dashboard/hospital/programs/:id', element: <HospitalProgramDetailPage /> },
              { path: '/dashboard/hospital/applications', element: <HospitalApplicationsPage /> },
              { path: '/dashboard/hospital/applications/:id', element: <HospitalApplicationDetailPage /> },
              { path: '/dashboard/hospital/rotations', element: <HospitalRotationsPage /> },
              { path: '/dashboard/hospital/doctors', element: <HospitalDoctorsPage /> },
              { path: '/dashboard/hospital/students', element: <HospitalStudentsPage /> },
              { path: '/dashboard/hospital/calendar', element: <HospitalCalendarPage /> },
              { path: '/dashboard/hospital/announcements', element: <HospitalAnnouncementsPage /> },
              { path: '/dashboard/hospital/profile', element: <HospitalProfilePage /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole roles={['DOCTOR']} />,
        children: [
          {
            element: <AppLayout nav={doctorNav} />,
            children: [
              { path: '/dashboard/doctor', element: <DoctorOverviewPage /> },
              { path: '/dashboard/doctor/students', element: <DoctorStudentsPage /> },
              { path: '/dashboard/doctor/students/:id', element: <DoctorStudentDetailPage /> },
              { path: '/dashboard/doctor/rotations', element: <DoctorRotationsPage /> },
              { path: '/dashboard/doctor/schedule', element: <DoctorSchedulePage /> },
              { path: '/dashboard/doctor/logbooks', element: <DoctorLogbooksPage /> },
              { path: '/dashboard/doctor/evaluations', element: <DoctorEvaluationsPage /> },
              { path: '/dashboard/doctor/letters', element: <DoctorLettersPage /> },
              { path: '/dashboard/doctor/certificates', element: <DoctorCertificatesPage /> },
              { path: '/dashboard/doctor/messages', element: <DoctorMessagesPage /> },
              { path: '/dashboard/doctor/profile', element: <DoctorProfilePage /> },
            ],
          },
        ],
      },
      {
        element: <AppLayout nav={staffNav} />,
        children: [{ path: '/dashboard/:role', element: <RoleDashboardRoute /> }],
      },
    ],
  },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
])
