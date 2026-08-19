import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcrypt'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// Canonical roles, permissions, and role-permission grants.
// These mirror the frontend constants in src/permissions/permissions.ts and
// src/roles/roles.ts and are required for registration (ROLE_NOT_FOUND) and
// for `authenticate` to resolve a user's role from the database.
// ---------------------------------------------------------------------------

const roleDefinitions = [
  { name: 'SUPER_ADMIN', description: 'Platform administrator' },
  { name: 'ADMIN', description: 'Operations administrator' },
  { name: 'STUDENT', description: 'Applicant student' },
  { name: 'REVIEWER', description: 'Application reviewer' },
  { name: 'HOSPITAL', description: 'Hospital coordinator' },
  { name: 'DOCTOR', description: 'Clinical mentor' },
]

const permissionDefinitions = [
  { key: 'users.read', label: 'Read users' },
  { key: 'users.create', label: 'Create users' },
  { key: 'users.update', label: 'Update users' },
  { key: 'users.delete', label: 'Delete users' },
  { key: 'roles.manage', label: 'Manage roles' },
  { key: 'applications.review', label: 'Review applications' },
  { key: 'applications.manage', label: 'Manage applications' },
  { key: 'applications.view', label: 'View applications' },
  { key: 'documents.verify', label: 'Verify documents' },
  { key: 'programs.manage', label: 'Manage programs' },
  { key: 'hospitals.manage', label: 'Manage hospitals' },
  { key: 'doctors.manage', label: 'Manage doctors' },
  { key: 'students.manage', label: 'Manage students' },
  { key: 'announcements.manage', label: 'Manage announcements' },
  { key: 'cms.manage', label: 'Manage CMS' },
  { key: 'analytics.view', label: 'View analytics' },
  { key: 'settings.manage', label: 'Manage settings' },
  { key: 'payments.view', label: 'View payments' },
  { key: 'payments.manage', label: 'Manage payments' },
]

const defaultRolePermissions = {
  SUPER_ADMIN: permissionDefinitions.map(permission => permission.key),
  ADMIN: [
    'users.read',
    'users.create',
    'users.update',
    'applications.manage',
    'applications.view',
    'programs.manage',
    'hospitals.manage',
    'doctors.manage',
    'students.manage',
    'announcements.manage',
    'analytics.view',
    'settings.manage',
    'payments.view',
    'payments.manage',
  ],
  STUDENT: ['applications.view', 'applications.manage', 'payments.view'],
  REVIEWER: ['applications.review', 'applications.view', 'documents.verify'],
  HOSPITAL: ['applications.view', 'programs.manage', 'doctors.manage', 'students.manage'],
  DOCTOR: ['applications.view', 'students.manage', 'documents.verify'],
}

// ---------------------------------------------------------------------------
// Demo environment (isDemo = true).
//
// Demo accounts live in a fully separate environment from real users:
//   - every demo account is isDemo = true and carries a real role + profile
//   - real users are isDemo = false and only ever see isDemo = false data
//
// The password below is the established demo convention. These are throwaway
// dev/test accounts and are only surfaced through the devmode login page,
// which is gated behind the ENABLE_DEVMODE environment variable.
// ---------------------------------------------------------------------------

const DEMO_PASSWORD = 'DemoPass@2024!'

const DEMO_EMAIL = {
  ADMIN: 'admin@demo.com',
  HOSPITAL: 'hospital@demo.com',
  DOCTOR: 'doctor@demo.com',
  REVIEWER: 'reviewer@demo.com',
  STUDENT: 'student@demo.com',
}

// Emails used by the previous seed generation. Only ever removed when the
// account is still isDemo = true (a real user's account is never touched).
const LEGACY_DEMO_EMAILS = [
  'admin@imgprep.com',
  'ops@imgprep.com',
  'student@imgprep.com',
  'reviewer@imgprep.com',
  'doctor@imgprep.com',
  'hospital@imgprep.com',
]

const mockElectives = [
  { id: 'im-beth-israel', specialty: 'Internal Medicine', hospital: 'Mount Sinai Beth Israel', city: 'New York', state: 'NY', fee: 1200, rating: 4.8, spots: 6, duration: '4, 8, 12 weeks', description: 'Hands-on inpatient ward rotations with an experienced teaching service.', eligibility: 'Clinical-year students and recent graduates', slug: 'im-beth-israel' },
  { id: 'gs-mgh', specialty: 'General Surgery', hospital: 'Mass General Brigham Affiliate', city: 'Boston', state: 'MA', fee: 1500, rating: 4.7, spots: 4, duration: '4, 8 weeks', description: 'Operating room exposure and surgical floor management at a top-tier academic center.', eligibility: 'Clinical-year students and recent graduates', slug: 'gs-mgh' },
  { id: 'peds-lurie', specialty: 'Pediatrics', hospital: 'Lurie Children’s Hospital', city: 'Chicago', state: 'IL', fee: 1100, rating: 4.9, spots: 5, duration: '4, 8 weeks', description: 'General pediatric ward rotations including newborn nursery and subspecialty consults.', eligibility: 'Clinical-year students and recent graduates', slug: 'peds-lurie' },
  { id: 'psych-northwestern', specialty: 'Psychiatry', hospital: 'Northwestern Memorial Hospital', city: 'Chicago', state: 'IL', fee: 1000, rating: 4.6, spots: 5, duration: '4, 8 weeks', description: 'Inpatient psychiatry rotation covering mood disorders, psychosis, and consult-liaison psychiatry.', eligibility: 'Clinical-year students and recent graduates', slug: 'psych-northwestern' },
  { id: 'fm-baylor', specialty: 'Family Medicine', hospital: 'Baylor St. Luke’s Medical Center', city: 'Houston', state: 'TX', fee: 950, rating: 4.5, spots: 8, duration: '4, 8, 12 weeks', description: 'Community-oriented family medicine rotation blending outpatient clinic and inpatient coverage.', eligibility: 'Open to all clinical-year students and graduates', slug: 'fm-baylor' },
  { id: 'em-jackson', specialty: 'Emergency Medicine', hospital: 'Jackson Memorial Hospital', city: 'Miami', state: 'FL', fee: 1300, rating: 4.7, spots: 6, duration: '4, 8 weeks', description: 'Fast-paced Level I trauma center rotation. Manage undifferentiated patients.', eligibility: 'Clinical-year students and recent graduates', slug: 'em-jackson' },
  { id: 'rad-ucla', specialty: 'Radiology', hospital: 'UCLA Medical Center Affiliate', city: 'Los Angeles', state: 'CA', fee: 1400, rating: 4.8, spots: 4, duration: '4, 8 weeks', description: 'Diagnostic radiology observership with hands-on interpretation sessions.', eligibility: 'Clinical-year students and recent graduates', slug: 'rad-ucla' },
  { id: 'neuro-emory', specialty: 'Neurology', hospital: 'Emory University Hospital', city: 'Atlanta', state: 'GA', fee: 1100, rating: 4.6, spots: 4, duration: '4, 8 weeks', description: 'Comprehensive neurology rotation covering stroke, epilepsy, and neuromuscular disease.', eligibility: 'Clinical-year students and recent graduates', slug: 'neuro-emory' },
  { id: 'obgyn-jefferson', specialty: 'Obstetrics & Gynecology', hospital: 'Thomas Jefferson University Hospital', city: 'Philadelphia', state: 'PA', fee: 1250, rating: 4.7, spots: 5, duration: '4, 8 weeks', description: 'Obstetrics and gynecology rotation including labor and delivery.', eligibility: 'Clinical-year students and recent graduates', slug: 'obgyn-jefferson' },
  { id: 'cardio-cleveland', specialty: 'Internal Medicine – Cardiology', hospital: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', fee: 1600, rating: 4.9, spots: 3, duration: '4 weeks', description: 'Specialized cardiology elective at a world-renowned center.', eligibility: 'Clinical-year students and graduates with Step 1 complete', slug: 'cardio-cleveland' },
  { id: 'fm-sf-general', specialty: 'Family Medicine', hospital: 'Zuckerberg San Francisco General', city: 'San Francisco', state: 'CA', fee: 1050, rating: 4.6, spots: 6, duration: '4, 8 weeks', description: 'Safety-net hospital family medicine rotation with rich outpatient teaching clinics.', eligibility: 'Open to all clinical-year students and graduates', slug: 'fm-sf-general' },
  { id: 'peds-childrens-national', specialty: 'Pediatrics', hospital: 'Children’s National Hospital', city: 'Washington', state: 'DC', fee: 1200, rating: 4.8, spots: 4, duration: '4, 8 weeks', description: 'Academic pediatric rotation at a leading children’s hospital.', eligibility: 'Clinical-year students and recent graduates', slug: 'peds-childrens-national' }
]

async function seedDefaultMetadata() {
  console.log('Seeding metadata: roles & permissions...')
  for (const roleDefinition of roleDefinitions) {
    await prisma.role.upsert({
      where: { name: roleDefinition.name },
      create: roleDefinition,
      update: roleDefinition,
    })
  }

  const createdPermissions = []
  for (const permissionDefinition of permissionDefinitions) {
    const permission = await prisma.permission.upsert({
      where: { key: permissionDefinition.key },
      create: permissionDefinition,
      update: permissionDefinition,
    })
    createdPermissions.push(permission)
  }

  const roleRecords = await prisma.role.findMany({ include: { rolePermissions: true } })
  for (const role of roleRecords) {
    const allowedPermissions = (defaultRolePermissions as any)[role.name]
    if (!allowedPermissions) continue

    const permissionIds = createdPermissions
      .filter(permission => allowedPermissions.includes(permission.key))
      .map(permission => permission.id)

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({ roleId: role.id, permissionId })),
      })
    }
  }

  console.log('Seeding forum categories...')
  const forumCategories = [
    { name: 'General Discussion', slug: 'general', description: 'General topics about IMG life and medical career', sortOrder: 0 },
    { name: 'USMLE', slug: 'usmile', description: 'USMLE exam preparation, scores, and strategies', sortOrder: 1 },
    { name: 'Residency', slug: 'residency', description: 'Residency application, matching, and career planning', sortOrder: 2 },
    { name: 'Clinical Questions', slug: 'clinical-questions', description: 'Clinical knowledge questions and case discussions', sortOrder: 3 },
    { name: 'Electives & Rotations', slug: 'electives-rotations', description: 'Clinical elective rotations and experiences', sortOrder: 4 },
    { name: 'Hospital Reviews', slug: 'hospital-reviews', description: 'Reviews and feedback on hospitals and programs', sortOrder: 5 },
    { name: 'Research', slug: 'research', description: 'Research opportunities, publications, and academic projects', sortOrder: 6 },
    { name: 'IMG Life', slug: 'img-life', description: 'Life as an International Medical Graduate', sortOrder: 7 },
    { name: 'Career', slug: 'career', description: 'Career guidance and professional development', sortOrder: 8 },
    { name: 'Resources', slug: 'resources', description: 'Study materials, books, and useful resources', sortOrder: 9 },
  ]

  for (const category of forumCategories) {
    await prisma.forumCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name, description: category.description, sortOrder: category.sortOrder },
    })
  }

  console.log('Seeding default CMS pages & templates...')
  await prisma.cmsPage.upsert({
    where: { slug: 'homepage' },
    update: {},
    create: {
      slug: 'homepage',
      title: 'Homepage',
      content: '<h1>Welcome to USMLEApp</h1><p>Start your residency journey securely.</p>',
      published: true,
    },
  })

  await prisma.messageTemplate.createMany({
    data: [
      { label: 'Application Submitted', text: 'Your application has been received and is under review.', category: 'student' },
      { label: 'Document Reminder', text: 'Please upload any outstanding documents.', category: 'student' },
    ],
    skipDuplicates: true,
  })

  // Seed default PlatformSettings
  const currentSettings = await prisma.platformSetting.findFirst()
  if (!currentSettings) {
    await prisma.platformSetting.create({
      data: {
        siteName: 'USMLEApp',
        supportEmail: 'support@imgprep.com',
        enableDemoData: true,
      },
    })
  }
}

// ---------------------------------------------------------------------------
// Real Super Admin (isDemo = false)
//
// This is a REAL account and is intentionally separate from the demo
// environment. Its credentials come from the environment (never from the
// frontend). In production the password MUST be provided explicitly.
// ---------------------------------------------------------------------------
async function seedSuperAdmin() {
  const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
  if (!role) {
    throw new Error('SUPER_ADMIN role missing from database')
  }

  const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@imgprep.com').toLowerCase()
  const explicitPassword = process.env.SUPER_ADMIN_PASSWORD

  if (process.env.NODE_ENV === 'production' && !explicitPassword) {
    throw new Error(
      'SUPER_ADMIN_PASSWORD must be set via the environment when seeding in production.',
    )
  }

  // Dev-only default so a fresh local checkout is immediately usable. Always
  // override via SUPER_ADMIN_PASSWORD outside of local development.
  const passwordHash = await bcrypt.hash(explicitPassword || 'Admin@123', 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      roleId: role.id,
      isDemo: false,
      onboarded: true,
      name: 'Super Administrator',
    },
    create: {
      name: 'Super Administrator',
      email,
      passwordHash,
      roleId: role.id,
      onboarded: true,
      isDemo: false,
      emailVerifiedAt: new Date(),
    },
  })

  if (!explicitPassword) {
    console.warn(
      `Super admin "${email}" seeded with the default local password. ` +
        'Set SUPER_ADMIN_PASSWORD via the environment in any non-local deployment.',
    )
  }

  return user
}

async function removeLegacyDemoAccounts() {
  const users = await prisma.user.findMany({
    where: { email: { in: LEGACY_DEMO_EMAILS }, isDemo: true },
    select: { id: true },
  })
  if (users.length === 0) return

  const ids = users.map(u => u.id)
  await prisma.announcement.deleteMany({ where: { authorId: { in: ids } } })
  await prisma.user.deleteMany({ where: { id: { in: ids } } })
  console.log(`Removed ${ids.length} legacy demo account(s) from the previous seed generation.`)
}

async function seedDemoUsers(passwordHash: string) {
  console.log('Seeding demo accounts...')

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  const hospitalRole = await prisma.role.findUnique({ where: { name: 'HOSPITAL' } })
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } })
  const reviewerRole = await prisma.role.findUnique({ where: { name: 'REVIEWER' } })
  const doctorRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } })

  if (!adminRole || !hospitalRole || !studentRole || !reviewerRole || !doctorRole) {
    throw new Error('Required roles missing from database')
  }

  // ADMIN demo
  const admin = await prisma.user.upsert({
    where: { email: DEMO_EMAIL.ADMIN },
    update: {
      roleId: adminRole.id,
      isDemo: true,
      onboarded: true,
      name: 'Alex Admin',
    },
    create: {
      name: 'Alex Admin',
      email: DEMO_EMAIL.ADMIN,
      passwordHash,
      roleId: adminRole.id,
      onboarded: true,
      isDemo: true,
      emailVerifiedAt: new Date(),
    },
  })

  // HOSPITAL demo (profile + org data are filled in seedDemoHospital)
  const hospital = await prisma.user.upsert({
    where: { email: DEMO_EMAIL.HOSPITAL },
    update: {
      roleId: hospitalRole.id,
      isDemo: true,
      onboarded: true,
      name: 'St. Mary’s Medical Center',
    },
    create: {
      name: 'St. Mary’s Medical Center',
      email: DEMO_EMAIL.HOSPITAL,
      passwordHash,
      roleId: hospitalRole.id,
      onboarded: true,
      isDemo: true,
      emailVerifiedAt: new Date(),
    },
  })

  // DOCTOR demo (hospital/department association is filled in seedDemoHospital)
  const doctor = await prisma.user.upsert({
    where: { email: DEMO_EMAIL.DOCTOR },
    update: {
      roleId: doctorRole.id,
      isDemo: true,
      onboarded: true,
      name: 'Dr. Michael Mentor',
    },
    create: {
      name: 'Dr. Michael Mentor',
      email: DEMO_EMAIL.DOCTOR,
      passwordHash,
      roleId: doctorRole.id,
      onboarded: true,
      isDemo: true,
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.doctorProfile.upsert({
    where: { userId: doctor.id },
    update: {},
    create: {
      userId: doctor.id,
      specialty: 'Internal Medicine',
      email: DEMO_EMAIL.DOCTOR,
      phone: '+1-555-0200',
      status: 'active',
    },
  })

  // REVIEWER demo
  const reviewer = await prisma.user.upsert({
    where: { email: DEMO_EMAIL.REVIEWER },
    update: {
      roleId: reviewerRole.id,
      isDemo: true,
      onboarded: true,
      name: 'Rita Reviewer',
    },
    create: {
      name: 'Rita Reviewer',
      email: DEMO_EMAIL.REVIEWER,
      passwordHash,
      roleId: reviewerRole.id,
      onboarded: true,
      isDemo: true,
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.reviewerProfile.upsert({
    where: { userId: reviewer.id },
    update: {},
    create: {
      userId: reviewer.id,
      specialty: 'Pediatrics',
      department: 'Pediatric Education',
      timezone: 'America/New_York',
      title: 'Senior Reviewer',
      institution: 'St. Mary’s Medical Center',
      yearsOfExperience: 12,
    },
  })

  // STUDENT demo
  const student = await prisma.user.upsert({
    where: { email: DEMO_EMAIL.STUDENT },
    update: {
      roleId: studentRole.id,
      isDemo: true,
      onboarded: true,
      name: 'Student Demo',
    },
    create: {
      name: 'Student Demo',
      email: DEMO_EMAIL.STUDENT,
      passwordHash,
      roleId: studentRole.id,
      onboarded: true,
      isDemo: true,
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      college: 'AFMC India',
      graduationYear: 2027,
      visaStatus: 'F-1 (pending)',
      earliestStart: new Date('2027-01-01T00:00:00.000Z'),
      durationPreference: 4,
      travelReady: true,
    },
  })

  await prisma.announcement.create({
    data: {
      authorId: admin.id,
      title: 'New residency cycle opening',
      body: 'Applications for the next clinical cycle are now open.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      audiences: { create: [{ roleName: 'STUDENT' }] },
    },
  }).catch(() => {})
}

async function seedDemoHospital() {
  console.log('Seeding demo hospital, departments, doctors and elective programs...')

  const hospitalUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.HOSPITAL },
    include: { hospitalProfile: true },
  })
  if (!hospitalUser) throw new Error('Demo hospital user not found')

  let hospitalProfile = hospitalUser.hospitalProfile
  if (!hospitalProfile) {
    hospitalProfile = await prisma.hospitalProfile.create({
      data: {
        userId: hospitalUser.id,
        name: 'St. Mary’s Medical Center',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        email: DEMO_EMAIL.HOSPITAL,
        phone: '+1-555-0100',
        coordinatorName: 'Alex Coordinator',
        coordinatorEmail: 'coordinator@stmarys.org',
        description:
          'A teaching medical center hosting clinical elective rotations for international medical graduates.',
        website: 'https://stmarys.example.org',
        tier: 'Community teaching hospital',
        status: 'active',
      },
    })
  }

  // Departments
  const demoDepartments = ['Internal Medicine', 'Pediatrics', 'General Surgery', 'Family Medicine']
  const departmentIds = new Map<string, string>()
  for (const deptName of demoDepartments) {
    const dept = await prisma.department.upsert({
      where: { hospitalId_name: { hospitalId: hospitalProfile.id, name: deptName } },
      update: {},
      create: { hospitalId: hospitalProfile.id, name: deptName },
    })
    departmentIds.set(deptName, dept.id)
  }

  // Hospital registration code (used to onboard real + demo doctors)
  await prisma.hospitalRegistrationCode.upsert({
    where: { code: 'HOSP-DEMO01' },
    update: { isActive: true, hospitalId: hospitalProfile.id },
    create: {
      hospitalId: hospitalProfile.id,
      code: 'HOSP-DEMO01',
      isActive: true,
    },
  })

  // Demo doctor linked to the demo hospital + Internal Medicine department
  const doctorUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.DOCTOR },
    include: { doctorProfile: true },
  })
  if (doctorUser?.doctorProfile) {
    await prisma.doctorProfile.update({
      where: { id: doctorUser.doctorProfile.id },
      data: {
        hospitalId: hospitalProfile.id,
        departmentId: departmentIds.get('Internal Medicine') ?? null,
        title: 'Attending Physician',
        licenseNumber: 'MA-887766',
        status: 'active',
      },
    })
  }

  // Elective programs owned by the demo hospital
  for (const mockEl of mockElectives) {
    const existingProg = await prisma.program.findFirst({ where: { slug: mockEl.slug } })
    if (!existingProg) {
      await prisma.program.create({
        data: {
          id: mockEl.id,
          hospitalId: hospitalProfile.id,
          creatorId: hospitalUser.id,
          title: mockEl.specialty + ' Rotation',
          department: 'Medicine',
          specialty: mockEl.specialty,
          duration: mockEl.duration,
          fee: mockEl.fee,
          seats: mockEl.spots,
          filledSeats: 0,
          deadline: new Date('2026-12-31T23:59:59.000Z'),
          startDate: new Date('2027-01-01T00:00:00.000Z'),
          description: mockEl.description,
          eligibility: mockEl.eligibility,
          status: 'ACTIVE',
          slug: mockEl.slug,
        },
      })
    }
  }
}

async function seedDemoReviewerWorkflow() {
  console.log('Seeding demo reviewer invitation code...')
  await prisma.reviewerInvitationCode.upsert({
    where: { code: 'REV-DEMO01' },
    update: { isActive: true },
    create: {
      code: 'REV-DEMO01',
      isActive: true,
    },
  })
}

async function seedDemoApplications() {
  console.log('Seeding demo applications...')
  const studentUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.STUDENT },
    include: { studentProfile: true },
  })
  if (!studentUser?.studentProfile) return

  const studentProfileId = studentUser.studentProfile.id

  const reviewerUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.REVIEWER },
    include: { reviewerProfile: true },
  })
  const reviewerProfileId = reviewerUser?.reviewerProfile?.id ?? null

  const doctorUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.DOCTOR },
    include: { doctorProfile: true },
  })
  const doctorProfileId = doctorUser?.doctorProfile?.id ?? null

  const demoApps = [
    { id: 'app-1001', programId: 'im-beth-israel', status: 'SUBMITTED', startDate: new Date('2026-10-05'), assignReviewer: false, assignDoctor: false },
    { id: 'app-1002', programId: 'gs-mgh', status: 'UNDER_REVIEW', startDate: new Date('2027-01-11'), assignReviewer: true, assignDoctor: false },
    { id: 'app-1003', programId: 'peds-lurie', status: 'ACCEPTED', startDate: new Date('2027-04-05'), assignReviewer: true, assignDoctor: true },
  ]

  for (const app of demoApps) {
    const data = {
      studentProfileId,
      reviewerProfileId: app.assignReviewer ? reviewerProfileId : null,
      doctorProfileId: app.assignDoctor ? doctorProfileId : null,
      programId: app.programId,
      status: app.status as 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED',
      startDate: app.startDate,
      durationWeeks: 4,
      submittedAt: new Date(),
      documents: {
        create: [
          { name: 'Passport', verification: 'VERIFIED' as const },
          { name: 'CV / Resume', verification: 'VERIFIED' as const },
        ],
      },
    }

    const exists = await prisma.application.findUnique({ where: { id: app.id } })
    if (!exists) {
      await prisma.application.create({ data: data as any })
    } else {
      await prisma.application.update({
        where: { id: app.id },
        data: {
          reviewerProfileId: app.assignReviewer ? reviewerProfileId : exists.reviewerProfileId,
          doctorProfileId: app.assignDoctor ? doctorProfileId : exists.doctorProfileId,
        },
      })
    }

    // A completed review on the accepted application so the reviewer profile has history.
    if (app.id === 'app-1003' && reviewerProfileId) {
      const existingReview = await prisma.applicationReview.findFirst({
        where: { applicationId: app.id, reviewerProfileId },
      })
      if (!existingReview) {
        await prisma.applicationReview.create({
          data: {
            applicationId: app.id,
            reviewerProfileId,
            recommendation: 'APPROVE',
            reviewerNotes: 'Strong clinical background, all documents verified.',
            reviewMinutes: 25,
          },
        })
      }
    }
  }
}

async function seedDemoDocuments() {
  console.log('Seeding demo documents...')
  const studentUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.STUDENT },
    include: { studentProfile: true },
  })
  if (!studentUser?.studentProfile) return

  const studentProfileId = studentUser.studentProfile.id

  const docs = [
    { name: 'Passport', category: 'Identity', status: 'uploaded', fileName: 'passport_scanned.pdf' },
    { name: 'Immunization Record', category: 'Medical', status: 'uploaded', fileName: 'immunizations.pdf' },
    { name: 'TB Screening / PPD', category: 'Medical', status: 'uploaded', fileName: 'tb_screening.pdf' },
  ]

  for (const doc of docs) {
    const exists = await prisma.studentDocument.findFirst({
      where: { studentProfileId, name: doc.name },
    })
    if (!exists) {
      await prisma.studentDocument.create({
        data: {
          studentProfileId,
          name: doc.name,
          category: doc.category,
          status: doc.status,
          fileName: doc.fileName,
          uploadedAt: new Date(),
        },
      })
    }
  }
}

async function seedDemoPayments() {
  console.log('Seeding demo payments...')
  const studentUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.STUDENT },
    include: { studentProfile: true },
  })
  if (!studentUser || !studentUser.studentProfile) return

  const apps = await prisma.application.findMany({
    where: { studentProfileId: studentUser.studentProfile.id },
  })

  for (const app of apps) {
    const exists = await prisma.payment.findFirst({ where: { applicationId: app.id } })
    if (!exists) {
      await prisma.payment.create({
        data: {
          applicationId: app.id,
          studentId: studentUser.id,
          amount: 1200,
          paymentMethod: 'STRIPE',
          transactionId: `ch_${Math.random().toString(36).substring(7)}`,
          status: 'PAID',
          submittedAt: new Date(),
        },
      })
    }
  }
}

async function seedDemoNotifications() {
  console.log('Seeding demo notifications...')
  const studentUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.STUDENT },
  })
  if (!studentUser) return

  const demoNotifs = [
    { title: 'Welcome to the club! 🎉', body: 'Finish your profile to start exploring U.S. clinical rotations.' },
    { title: 'Offer letter received ✉️', body: 'Congratulations, Lurie Children’s Hospital offered you a Pediatric Rotation!' },
  ]

  for (const notif of demoNotifs) {
    const exists = await prisma.notification.findFirst({
      where: { userId: studentUser.id, title: notif.title },
    })
    if (!exists) {
      await prisma.notification.create({
        data: {
          userId: studentUser.id,
          tone: 'SUCCESS',
          title: notif.title,
          body: notif.body,
        },
      })
    }
  }
}

async function seedDemoPlanner() {
  console.log('Seeding demo planner...')
  const studentUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL.STUDENT },
  })
  if (!studentUser) return

  const exists = await prisma.calendarEvent.findFirst({
    where: { createdById: studentUser.id },
  })
  if (!exists) {
    await prisma.calendarEvent.create({
      data: {
        createdById: studentUser.id,
        title: 'Pediatric Clerkship Orientation',
        description: 'First day didactics and ward tour.',
        startAt: new Date('2027-04-05T08:00:00.000Z'),
        endAt: new Date('2027-04-05T12:00:00.000Z'),
        location: 'Lurie Children’s Hospital, Chicago',
      },
    })
  }
}

async function main() {
  await seedDefaultMetadata()
  await seedSuperAdmin()

  const enableDemoData = process.env.ENABLE_DEMO_DATA !== 'false'

  if (enableDemoData) {
    await removeLegacyDemoAccounts()

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
    await seedDemoUsers(passwordHash)
    await seedDemoHospital()
    await seedDemoReviewerWorkflow()
    await seedDemoApplications()
    await seedDemoDocuments()
    await seedDemoPayments()
    await seedDemoNotifications()
    await seedDemoPlanner()
  } else {
    console.log('ENABLE_DEMO_DATA is false. Skipping demo seeding.')
  }

  console.log('Seed completed successfully.')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
