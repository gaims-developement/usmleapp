import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

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

async function seedRealSuperAdmin(passwordHash: string) {
  console.log('Seeding real Super Admin account...')
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN role not configured')
  }
  await prisma.user.upsert({
    where: { email: 'superadmin@imgprep.com' },
    update: {
      isDemo: false,
    },
    create: {
      name: 'Super Admin Production',
      email: 'superadmin@imgprep.com',
      passwordHash,
      roleId: superAdminRole.id,
      onboarded: true,
      isDemo: false,
    },
  })
}

async function seedDemoUsers(passwordHash: string) {
  console.log('Seeding demo accounts...')
  
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } })
  const reviewerRole = await prisma.role.findUnique({ where: { name: 'REVIEWER' } })
  const doctorRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } })

  if (!superAdminRole || !adminRole || !studentRole || !reviewerRole || !doctorRole) {
    throw new Error('Required roles missing from database')
  }

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@imgprep.com' },
    update: {
      isDemo: true,
    },
    create: {
      name: 'Super Administrator (Demo)',
      email: 'admin@imgprep.com',
      passwordHash,
      roleId: superAdminRole.id,
      onboarded: true,
      isDemo: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'ops@imgprep.com' },
    update: {
      isDemo: true,
    },
    create: {
      name: 'Alex Admin (Demo)',
      email: 'ops@imgprep.com',
      passwordHash,
      roleId: adminRole.id,
      onboarded: true,
      isDemo: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'student@imgprep.com' },
    update: {
      isDemo: true,
    },
    create: {
      name: 'Student Demo',
      email: 'student@imgprep.com',
      passwordHash,
      roleId: studentRole.id,
      onboarded: true,
      isDemo: true,
      studentProfile: { create: { college: 'AFMC India', graduationYear: 2027 } },
    },
  })

  await prisma.user.upsert({
    where: { email: 'reviewer@imgprep.com' },
    update: {
      isDemo: true,
    },
    create: {
      name: 'Rita Reviewer',
      email: 'reviewer@imgprep.com',
      passwordHash,
      roleId: reviewerRole.id,
      onboarded: true,
      isDemo: true,
      reviewerProfile: { create: { specialty: 'Pediatrics', department: 'Pediatric Education' } },
    },
  })

  await prisma.user.upsert({
    where: { email: 'doctor@imgprep.com' },
    update: {
      isDemo: true,
    },
    create: {
      name: 'Dr. Michael Mentor',
      email: 'doctor@imgprep.com',
      passwordHash,
      roleId: doctorRole.id,
      onboarded: true,
      isDemo: true,
      doctorProfile: {
        create: {
          specialty: 'Internal Medicine',
          email: 'doctor@imgprep.com',
          phone: '+1-555-0200',
          status: 'active',
        },
      },
    },
  })

  await prisma.announcement.create({
    data: {
      authorId: superAdmin.id,
      title: 'New residency cycle opening',
      body: 'Applications for the next clinical cycle are now open.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      audiences: { create: [{ roleName: 'STUDENT' }] },
    },
  }).catch(() => {})
}

async function seedDemoHospitals(passwordHash: string) {
  console.log('Seeding demo hospital and elective programs...')
  const hospitalRole = await prisma.role.findUnique({ where: { name: 'HOSPITAL' } })
  if (!hospitalRole) {
    throw new Error('HOSPITAL role missing from database')
  }

  const hospitalUser = await prisma.user.upsert({
    where: { email: 'hospital@imgprep.com' },
    update: {
      isDemo: true,
    },
    create: {
      name: 'St. Mary’s Medical Center',
      email: 'hospital@imgprep.com',
      passwordHash,
      roleId: hospitalRole.id,
      onboarded: true,
      isDemo: true,
    },
  })

  let hospitalProfile = await prisma.hospitalProfile.findFirst({
    where: { userId: hospitalUser.id }
  })
  if (!hospitalProfile) {
    hospitalProfile = await prisma.hospitalProfile.create({
      data: {
        userId: hospitalUser.id,
        name: 'St. Mary’s Medical Center',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        email: 'hospital@imgprep.com',
        phone: '+1-555-0100',
        coordinatorName: 'Alex Coordinator',
        coordinatorEmail: 'coordinator@stmarys.org',
        status: 'active',
      }
    })
  }

  for (const mockEl of mockElectives) {
    const existingProg = await prisma.program.findFirst({ where: { slug: mockEl.slug } })
    if (!existingProg) {
      await prisma.program.create({
        data: {
          id: mockEl.id,
          hospitalId: hospitalProfile.id,
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
        }
      })
    }
  }
}

async function seedDemoApplications() {
  console.log('Seeding demo applications...')
  const studentUser = await prisma.user.findUnique({
    where: { email: 'student@imgprep.com' },
    include: { studentProfile: true },
  })

  if (!studentUser?.studentProfile) return

  const studentProfileId = studentUser.studentProfile.id

  const demoApps = [
    { id: 'app-1001', programId: 'im-beth-israel', status: 'SUBMITTED' as const, startDate: new Date('2026-10-05') },
    { id: 'app-1002', programId: 'gs-mgh', status: 'UNDER_REVIEW' as const, startDate: new Date('2027-01-11') },
    { id: 'app-1003', programId: 'peds-lurie', status: 'ACCEPTED' as const, startDate: new Date('2027-04-05') },
  ]

  for (const app of demoApps) {
    const exists = await prisma.application.findUnique({ where: { id: app.id } })
    if (!exists) {
      await prisma.application.create({
        data: {
          id: app.id,
          studentProfileId,
          programId: app.programId,
          status: app.status,
          startDate: app.startDate,
          durationWeeks: 4,
          submittedAt: new Date(),
          documents: {
            create: [
              { name: 'Passport', verification: 'VERIFIED' },
              { name: 'CV / Resume', verification: 'VERIFIED' },
            ]
          }
        }
      })
    }
  }
}

async function seedDemoDocuments() {
  console.log('Seeding demo documents...')
  const studentUser = await prisma.user.findUnique({
    where: { email: 'student@imgprep.com' },
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
        }
      })
    }
  }
}

async function seedDemoPayments() {
  console.log('Seeding demo payments...')
  const studentUser = await prisma.user.findUnique({
    where: { email: 'student@imgprep.com' },
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
        }
      })
    }
  }
}

async function seedDemoNotifications() {
  console.log('Seeding demo notifications...')
  const studentUser = await prisma.user.findUnique({
    where: { email: 'student@imgprep.com' },
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
        }
      })
    }
  }
}

async function seedDemoPlanner() {
  console.log('Seeding demo planner...')
  const studentUser = await prisma.user.findUnique({
    where: { email: 'student@imgprep.com' },
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
      }
    })
  }
}

async function main() {
  await seedDefaultMetadata()

  const passwordHash = await bcrypt.hash('Admin@123', 12)

  // Seed production Super Admin unconditionally
  await seedRealSuperAdmin(passwordHash)

  const enableDemoData = process.env.ENABLE_DEMO_DATA !== 'false'
  
  if (enableDemoData) {
    await seedDemoUsers(passwordHash)
    await seedDemoHospitals(passwordHash)
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
