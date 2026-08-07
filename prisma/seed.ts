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

async function main() {
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
    const allowedPermissions = defaultRolePermissions[role.name]
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

  const passwordHash = await bcrypt.hash('Admin@123', 12)

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } })
  const reviewerRole = await prisma.role.findUnique({ where: { name: 'REVIEWER' } })
  const hospitalRole = await prisma.role.findUnique({ where: { name: 'HOSPITAL' } })
  const doctorRole = await prisma.role.findUnique({ where: { name: 'DOCTOR' } })

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@imgprep.com' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'admin@imgprep.com',
      passwordHash,
      roleId: superAdminRole.id,
      onboarded: true,
      studentProfile: undefined,
    },
  })

  await prisma.user.upsert({
    where: { email: 'ops@imgprep.com' },
    update: {},
    create: {
      name: 'Alex Admin',
      email: 'ops@imgprep.com',
      passwordHash,
      roleId: adminRole.id,
      onboarded: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'student@imgprep.com' },
    update: {},
    create: {
      name: 'Student Demo',
      email: 'student@imgprep.com',
      passwordHash,
      roleId: studentRole.id,
      onboarded: false,
      studentProfile: { create: {} },
    },
  })

  await prisma.user.upsert({
    where: { email: 'reviewer@imgprep.com' },
    update: {},
    create: {
      name: 'Rita Reviewer',
      email: 'reviewer@imgprep.com',
      passwordHash,
      roleId: reviewerRole.id,
      onboarded: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'hospital@imgprep.com' },
    update: {},
    create: {
      name: 'St. Mary\u2019s Medical Center',
      email: 'hospital@imgprep.com',
      passwordHash,
      roleId: hospitalRole.id,
      onboarded: true,
      hospitalProfile: {
        create: {
          name: 'St. Mary\u2019s Medical Center',
          city: 'Boston',
          state: 'MA',
          country: 'USA',
          email: 'hospital@imgprep.com',
          phone: '+1-555-0100',
          coordinatorName: 'Alex Coordinator',
          coordinatorEmail: 'coordinator@stmarys.org',
          status: 'active',
        },
      },
    },
  })

  await prisma.user.upsert({
    where: { email: 'doctor@imgprep.com' },
    update: {},
    create: {
      name: 'Dr. Michael Mentor',
      email: 'doctor@imgprep.com',
      passwordHash,
      roleId: doctorRole.id,
      onboarded: true,
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

  const hospital = await prisma.hospitalProfile.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: {
      userId: superAdmin.id,
      name: 'St. Mary\'s Medical Center',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      email: 'coordinator@stmarys.org',
      phone: '+1-555-0100',
      description: 'Partner hospital for residency programs.',
      coordinatorName: 'Alex Coordinator',
      coordinatorEmail: 'coordinator@stmarys.org',
      coordinatorPhone: '+1-555-0101',
      tier: 'partner',
      status: 'active',
    },
  })

  await prisma.program.create({
    data: {
      hospitalId: hospital.id,
      title: 'Internal Medicine Residency',
      department: 'Medicine',
      specialty: 'Internal Medicine',
      duration: '36 months',
      fee: 1500,
      seats: 8,
      filledSeats: 0,
      deadline: new Date('2026-12-31T23:59:59.000Z'),
      startDate: new Date('2027-01-01T00:00:00.000Z'),
      description: 'Comprehensive internal medicine training program.',
      eligibility: 'Applicants must provide transcripts and supporting documents.',
      status: 'ACTIVE',
      slug: 'internal-medicine-residency',
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
  })

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

  console.log('Seed completed')
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
