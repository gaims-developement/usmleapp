import crypto from 'node:crypto'
import { prisma } from '../db/prisma.js'
import { AppError } from '../utils/app-error.js'
import { comparePassword, hashPassword } from './password.service.js'
import {
  durationToMs,
  generateOpaqueToken,
  hashToken,
  signAccessToken,
} from './token.service.js'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

const REFRESH_TOKEN_TTL_MS = durationToMs(env.JWT_REFRESH_EXPIRES_IN)
const EMAIL_VERIFICATION_TTL_MS = durationToMs(env.EMAIL_VERIFICATION_EXPIRES_IN)
const PASSWORD_RESET_TTL_MS = durationToMs(env.PASSWORD_RESET_EXPIRES_IN)

export const userInclude = {
  role: true,
  studentProfile: {
    include: { interests: true, locations: true, goals: true },
  },
  hospitalProfile: true,
  doctorProfile: {
    include: {
      hospital: true,
      department: true,
    },
  },
  reviewerProfile: {
    include: {
      hospital: true,
    },
  },
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateCode(prefix, length = 6) {
  const bytes = crypto.randomBytes(length)
  let suffix = ''
  for (let i = 0; i < length; i++) {
    suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return `${prefix}-${suffix}`
}

const toDateOnly = value => (value ? new Date(value).toISOString().slice(0, 10) : undefined)

export function serializeUser(user) {
  const student = user.studentProfile
  const hospital = user.hospitalProfile
  const doctor = user.doctorProfile
  const reviewer = user.reviewerProfile
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role?.name ?? 'STUDENT',
    onboarded: user.onboarded,
    isDemo: user.isDemo,
    emailVerified: Boolean(user.emailVerifiedAt),
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    college: student?.college ?? undefined,
    dob: student?.dateOfBirth ? toDateOnly(student.dateOfBirth) : undefined,
    graduationYear: student?.graduationYear ?? undefined,
    visaStatus: student?.visaStatus ?? undefined,
    goals: student?.goals?.map(goal => goal.value) ?? undefined,
    electives: student?.interests?.map(interest => interest.value) ?? undefined,
    locations: student?.locations?.map(location => location.value) ?? undefined,
    earliestStart: student?.earliestStart ? toDateOnly(student.earliestStart) : undefined,
    durationPreference: student?.durationPreference ?? undefined,
    travelReady: student?.travelReady ?? undefined,
    hospital: hospital
      ? {
          id: hospital.id,
          name: hospital.name ?? null,
          city: hospital.city ?? null,
          state: hospital.state ?? null,
          country: hospital.country ?? null,
          address: hospital.address ?? null,
          website: hospital.website ?? null,
          email: hospital.email ?? null,
          phone: hospital.phone ?? null,
          description: hospital.description ?? null,
          coordinatorName: hospital.coordinatorName ?? null,
          coordinatorEmail: hospital.coordinatorEmail ?? null,
          coordinatorPhone: hospital.coordinatorPhone ?? null,
          tier: hospital.tier ?? null,
          status: hospital.status ?? null,
        }
      : undefined,
    doctor: doctor
      ? {
          id: doctor.id,
          specialty: doctor.specialty ?? null,
          title: doctor.title ?? null,
          licenseNumber: doctor.licenseNumber ?? null,
          email: doctor.email ?? null,
          phone: doctor.phone ?? null,
          availability: doctor.availability ?? null,
          status: doctor.status ?? null,
          hospitalId: doctor.hospitalId ?? null,
          hospitalName: doctor.hospital?.name ?? null,
          departmentId: doctor.departmentId ?? null,
          departmentName: doctor.department?.name ?? null,
        }
      : undefined,
    reviewer: reviewer
      ? {
          id: reviewer.id,
          specialty: reviewer.specialty ?? null,
          department: reviewer.department ?? null,
          timezone: reviewer.timezone ?? null,
          title: reviewer.title ?? null,
          institution: reviewer.institution ?? null,
          phone: reviewer.phone ?? null,
          yearsOfExperience: reviewer.yearsOfExperience ?? null,
          status: reviewer.status ?? null,
          hospitalId: reviewer.hospitalId ?? null,
          hospitalName: reviewer.hospital?.name ?? null,
        }
      : undefined,
    createdAt: user.createdAt.toISOString(),
  }
}

async function createRefreshToken(userId, meta = {}) {
  const raw = generateOpaqueToken()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  const record = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt,
      ipAddress: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  })
  return { raw, id: record.id, expiresAt }
}

async function issueTokenPair(user, meta = {}) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role?.name ?? 'STUDENT' })
  const refresh = await createRefreshToken(user.id, meta)
  return {
    accessToken,
    refreshToken: refresh.raw,
    refreshTokenExpiresAt: refresh.expiresAt.toISOString(),
  }
}

async function login({ email, password }, meta = {}) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: userInclude,
  })

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  const passwordMatches = await comparePassword(password, user.passwordHash)
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  if (user.deletedAt) {
    throw new AppError('This account has been deactivated', 403, 'ACCOUNT_DEACTIVATED')
  }

  const tokens = await issueTokenPair(user, meta)
  return { user: serializeUser(user), ...tokens }
}

async function registerStudent(input, meta = {}) {
  const email = input.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS')
  }

  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } })
  if (!studentRole) {
    throw new AppError('Student role is not configured', 500, 'ROLE_NOT_FOUND')
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      roleId: studentRole.id,
      onboarded: false,
      isDemo: false,
      studentProfile: {
        create: {
          college: input.college ?? null,
          dateOfBirth: input.dob ? new Date(`${input.dob}T00:00:00.000Z`) : null,
          interests:
            input.electives?.length > 0
              ? { create: input.electives.map(value => ({ value })) }
              : undefined,
          locations:
            input.locations?.length > 0
              ? { create: input.locations.map(value => ({ value })) }
              : undefined,
        },
      },
    },
    include: userInclude,
  })

  const tokens = await issueTokenPair(user, meta)
  const emailVerification = await createEmailVerificationToken(user.id)

  return {
    user: serializeUser(user),
    ...tokens,
    emailVerification,
  }
}

const partnerByType = {
  HOSPITAL: {
    roleName: 'HOSPITAL',
    profile: 'hospitalProfile',
    label: 'Hospital',
  },
  DOCTOR: {
    roleName: 'DOCTOR',
    profile: 'doctorProfile',
    label: 'Doctor / Mentor',
  },
  REVIEWER: {
    roleName: 'REVIEWER',
    profile: 'reviewerProfile',
    label: 'Reviewer',
  },
}

async function registerPartner(input) {
  const email = input.email.toLowerCase()
  const partnerType = partnerByType[input.type]
  if (!partnerType) {
    throw new AppError('Unsupported partner type', 400, 'INVALID_PARTNER_TYPE')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS')
  }

  const pendingRegistration = await prisma.partnerRegistration.findFirst({
    where: { contactEmail: email, status: { in: ['PENDING', 'REVIEWED'] } },
  })
  if (pendingRegistration) {
    throw new AppError(
      'An application with this email is already under review',
      409,
      'PARTNER_ALREADY_PENDING',
    )
  }

  const role = await prisma.role.findUnique({ where: { name: partnerType.roleName } })
  if (!role) {
    throw new AppError(`${partnerType.label} role is not configured`, 500, 'ROLE_NOT_FOUND')
  }

  const passwordHash = await hashPassword(input.password)

  const profileData =
    input.type === 'HOSPITAL'
      ? {
          hospitalProfile: {
            create: {
              name: input.organizationName ?? input.name,
              city: input.city ?? null,
              state: input.state ?? null,
              country: input.country ?? null,
              email,
              phone: input.phone ?? null,
              coordinatorName: input.coordinatorName ?? null,
              coordinatorEmail: input.coordinatorEmail ?? null,
              coordinatorPhone: input.coordinatorPhone ?? null,
              description: input.message ?? null,
              status: 'pending',
            },
          },
        }
      : input.type === 'DOCTOR'
        ? {
            doctorProfile: {
              create: {
                specialty: input.specialty ?? input.department ?? null,
                email,
                phone: input.phone ?? null,
                availability: input.designation ?? null,
                status: 'pending',
              },
            },
          }
        : {
            reviewerProfile: {
              create: {
                specialty: input.department ?? null,
                department: input.department ?? null,
                timezone: input.timezone ?? null,
              },
            },
          }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      roleId: role.id,
      onboarded: true,
      isDemo: false,
      ...profileData,
    },
    include: userInclude,
  })

  await prisma.partnerRegistration.create({
    data: {
      registeredById: user.id,
      hospitalProfileId:
        input.type === 'HOSPITAL' ? user.hospitalProfile?.id ?? null : undefined,
      organizationName:
        input.type === 'HOSPITAL' ? (input.organizationName ?? input.name) : input.name,
      contactName: input.name,
      contactEmail: email,
      phone: input.phone ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      country: input.country ?? null,
      message: input.message ?? null,
      status: 'PENDING',
      submittedAt: new Date(),
    },
  })

  return {
    user: serializeUser(user),
    status: 'PENDING',
    message: `${partnerType.label} registration submitted for review. You will be able to log in once approved.`,
  }
}

async function resolveActiveHospitalCode(code) {
  const record = await prisma.hospitalRegistrationCode.findUnique({
    where: { code: String(code).toUpperCase().trim() },
    include: { hospital: true },
  })
  if (!record) {
    throw new AppError(
      'Hospital code not found. Please check the code provided by your hospital.',
      404,
      'INVALID_HOSPITAL_CODE',
    )
  }
  if (!record.isActive) {
    throw new AppError(
      'This hospital code is no longer active. Please contact your hospital administrator.',
      400,
      'HOSPITAL_CODE_INACTIVE',
    )
  }
  if (record.expiresAt && record.expiresAt < new Date()) {
    throw new AppError(
      'This hospital code has expired. Please contact your hospital administrator.',
      400,
      'HOSPITAL_CODE_EXPIRED',
    )
  }
  return record
}

async function resolveHospitalCode(code) {
  const record = await prisma.hospitalRegistrationCode.findUnique({
    where: { code: String(code).toUpperCase().trim() },
    include: { hospital: true },
  })
  if (!record) {
    throw new AppError(
      'Hospital code not found. Please check the code provided by your hospital.',
      404,
      'INVALID_HOSPITAL_CODE',
    )
  }
  return record
}

async function registerHospital(input, meta = {}) {
  const email = input.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS')
  }

  const role = await prisma.role.findUnique({ where: { name: 'HOSPITAL' } })
  if (!role) {
    throw new AppError('Hospital role is not configured', 500, 'ROLE_NOT_FOUND')
  }

  const passwordHash = await hashPassword(input.password)

  let createdUser
  let hospitalCode
  await prisma.$transaction(async tx => {
    createdUser = await tx.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        roleId: role.id,
        onboarded: true,
        isDemo: false,
        hospitalProfile: {
          create: {
            name: input.organizationName ?? input.name,
            city: input.city ?? null,
            state: input.state ?? null,
            country: input.country ?? null,
            address: input.address ?? null,
            website: input.website ?? null,
            email,
            phone: input.phone ?? null,
            description: input.description ?? null,
            coordinatorName: input.coordinatorName ?? null,
            coordinatorEmail: input.coordinatorEmail ?? null,
            coordinatorPhone: input.coordinatorPhone ?? null,
            status: 'pending',
          },
        },
      },
      include: userInclude,
    })

    hospitalCode = generateCode('HOSP')
    await tx.hospitalRegistrationCode.create({
      data: {
        hospitalId: createdUser.hospitalProfile.id,
        code: hospitalCode,
        isActive: false,
      },
    })

    await tx.partnerRegistration.create({
      data: {
        registeredById: createdUser.id,
        hospitalProfileId: createdUser.hospitalProfile.id,
        organizationName: input.organizationName ?? input.name,
        contactName: input.name,
        contactEmail: email,
        phone: input.phone ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        country: input.country ?? null,
        message: input.description ?? null,
        status: 'PENDING',
        submittedAt: new Date(),
      },
    })
  })

  notifySuperAdmins(
    'New Hospital Registration',
    `A new hospital "${input.organizationName ?? input.name}" has registered and is pending review.`,
  ).catch(() => {})

  return {
    user: serializeUser(createdUser),
    status: 'PENDING',
    message: 'Hospital registration submitted for review. You will be able to log in once approved.',
  }
}

async function notifySuperAdmins(title, body) {
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
  if (!superAdminRole) return
  const superAdmins = await prisma.user.findMany({
    where: { roleId: superAdminRole.id, deletedAt: null },
    select: { id: true },
  })
  for (const sa of superAdmins) {
    await prisma.notification.create({
      data: { userId: sa.id, tone: 'INFO', title, body },
    })
  }
}

async function registerDoctor(input, meta = {}) {
  const email = input.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS')
  }

  const hospitalCodeRecord = await resolveHospitalCode(input.hospitalCode)

  const role = await prisma.role.findUnique({ where: { name: 'DOCTOR' } })
  if (!role) {
    throw new AppError('Doctor role is not configured', 500, 'ROLE_NOT_FOUND')
  }

  let departmentId = null
  if (input.departmentName) {
    const department = await prisma.department.upsert({
      where: {
        hospitalId_name: {
          hospitalId: hospitalCodeRecord.hospitalId,
          name: input.departmentName.trim(),
        },
      },
      update: {},
      create: {
        hospitalId: hospitalCodeRecord.hospitalId,
        name: input.departmentName.trim(),
      },
    })
    departmentId = department.id
  }

  const passwordHash = await hashPassword(input.password)

  let user
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        roleId: role.id,
        onboarded: true,
        isDemo: false,
        doctorProfile: {
          create: {
            hospitalId: hospitalCodeRecord.hospitalId,
            departmentId,
            specialty: input.specialty ?? null,
            title: input.title ?? null,
            licenseNumber: input.licenseNumber ?? null,
            email,
            phone: input.phone ?? null,
            availability: input.availability ?? null,
            status: 'pending',
          },
        },
      },
      include: userInclude,
    })
  } catch (err) {
    logger.error('Doctor registration failed:', {
      name: err?.name,
      code: err?.code,
      message: err?.message,
    })
    throw new AppError(
      'Unable to create doctor account. Please verify the hospital information and try again.',
      400,
      'DOCTOR_CREATE_FAILED',
    )
  }

  await prisma.hospitalRegistrationCode.update({
    where: { id: hospitalCodeRecord.id },
    data: { usedCount: { increment: 1 } },
  })

  await prisma.partnerRegistration.create({
    data: {
      registeredById: user.id,
      organizationName: user.name,
      contactName: user.name,
      contactEmail: email,
      phone: input.phone ?? null,
      country: null,
      message: null,
      status: 'PENDING',
      submittedAt: new Date(),
    },
  })

  const hospitalOwner = await prisma.hospitalProfile.findUnique({
    where: { id: hospitalCodeRecord.hospitalId },
    select: { userId: true },
  })
  if (hospitalOwner?.userId) {
    await prisma.notification.create({
      data: {
        userId: hospitalOwner.userId,
        tone: 'INFO',
        title: 'New Doctor Registration',
        body: `A new doctor "${input.name}" has registered and is pending your approval.`,
      },
    })
  }

  return {
    user: serializeUser(user),
    status: 'PENDING',
    message: 'Doctor registration submitted. Your account is pending hospital approval.',
  }
}

async function registerReviewer(input, meta = {}) {
  const email = input.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError('A user with this email already exists', 409, 'EMAIL_EXISTS')
  }

  const codeToResolve = input.hospitalCode || input.invitationCode
  if (!codeToResolve) {
    throw new AppError('Hospital code is required', 400, 'HOSPITAL_CODE_REQUIRED')
  }

  const hospitalCodeRecord = await resolveHospitalCode(codeToResolve)

  const role = await prisma.role.findUnique({ where: { name: 'REVIEWER' } })
  if (!role) {
    throw new AppError('Reviewer role is not configured', 500, 'ROLE_NOT_FOUND')
  }

  const passwordHash = await hashPassword(input.password)

  let user
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        roleId: role.id,
        onboarded: true,
        isDemo: false,
        reviewerProfile: {
          create: {
            hospitalId: hospitalCodeRecord.hospitalId,
            specialty: input.specialty ?? null,
            department: input.department ?? null,
            timezone: input.timezone ?? null,
            title: input.title ?? null,
            institution: input.institution ?? null,
            phone: input.phone ?? null,
            yearsOfExperience: input.yearsOfExperience ?? null,
            status: 'pending',
          },
        },
      },
      include: userInclude,
    })
  } catch (err) {
    logger.error('Reviewer registration failed:', {
      name: err?.name,
      code: err?.code,
      message: err?.message,
    })
    throw new AppError(
      'Unable to create reviewer account. Please verify the hospital information and try again.',
      400,
      'REVIEWER_CREATE_FAILED',
    )
  }

  await prisma.hospitalRegistrationCode.update({
    where: { id: hospitalCodeRecord.id },
    data: { usedCount: { increment: 1 } },
  })

  await prisma.partnerRegistration.create({
    data: {
      registeredById: user.id,
      organizationName: user.name,
      contactName: user.name,
      contactEmail: email,
      phone: input.phone ?? null,
      country: null,
      message: null,
      status: 'PENDING',
      submittedAt: new Date(),
    },
  })

  const hospitalOwner = await prisma.hospitalProfile.findUnique({
    where: { id: hospitalCodeRecord.hospitalId },
    select: { userId: true },
  })
  if (hospitalOwner?.userId) {
    await prisma.notification.create({
      data: {
        userId: hospitalOwner.userId,
        tone: 'INFO',
        title: 'New Reviewer Registration',
        body: `A new reviewer "${input.name}" has registered and is pending your approval.`,
      },
    })
  }

  return {
    user: serializeUser(user),
    status: 'PENDING',
    message: 'Reviewer registration submitted. Your account is pending hospital approval.',
  }
}

async function lookupHospitalCode(code) {
  const record = await resolveActiveHospitalCode(code)
  const departments = await prisma.department.findMany({
    where: { hospitalId: record.hospitalId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return {
    valid: true,
    code: record.code,
    hospitalId: record.hospitalId,
    hospitalName: record.hospital.name ?? 'Hospital',
    city: record.hospital.city ?? '',
    state: record.hospital.state ?? '',
    country: record.hospital.country ?? '',
    departments: departments.map(d => d.name),
  }
}

async function refresh(refreshToken, meta = {}) {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: { include: userInclude } },
  })

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw new AppError('Refresh token is invalid or has expired', 401, 'INVALID_REFRESH_TOKEN')
  }

  if (!record.user || !record.user.passwordHash) {
    throw new AppError('Account no longer exists', 401, 'USER_NOT_FOUND')
  }

  if (record.user.deletedAt) {
    throw new AppError('This account has been deactivated', 403, 'ACCOUNT_DEACTIVATED')
  }

  const nextRefresh = await createRefreshToken(record.userId, meta)
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date(), replacedById: nextRefresh.id },
  })

  const accessToken = signAccessToken({
    sub: record.user.id,
    role: record.user.role?.name ?? 'STUDENT',
  })

  return {
    user: serializeUser(record.user),
    accessToken,
    refreshToken: nextRefresh.raw,
    refreshTokenExpiresAt: nextRefresh.expiresAt.toISOString(),
  }
}

async function logout(refreshToken) {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  })

  if (!record || record.revokedAt) {
    throw new AppError('Refresh token is invalid', 401, 'INVALID_REFRESH_TOKEN')
  }

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  })

  return { loggedOut: true }
}

async function createEmailVerificationToken(userId) {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, usedAt: null, expiresAt: { lt: new Date() } },
  })

  const raw = generateOpaqueToken(32)
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS)
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: hashToken(raw), expiresAt },
  })

  const url = new URL('/verify-email', env.APP_URL)
  url.searchParams.set('token', raw)

  return { token: raw, expiresAt: expiresAt.toISOString(), verifyUrl: url.toString() }
}

async function requestEmailVerification(email) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    throw new AppError('No account found for that email', 404, 'USER_NOT_FOUND')
  }
  if (user.emailVerifiedAt) {
    throw new AppError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED')
  }
  return createEmailVerificationToken(user.id)
}

async function verifyEmail(token) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })

  if (!record || record.usedAt) {
    throw new AppError('Invalid or expired verification link', 400, 'INVALID_VERIFICATION_TOKEN')
  }

  if (record.expiresAt < new Date()) {
    throw new AppError('Verification link has expired', 400, 'VERIFICATION_TOKEN_EXPIRED')
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return { emailVerified: true, email: record.user.email }
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  // Always resolve successfully to avoid leaking which emails are registered.
  if (!user) {
    return { sent: false }
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null, expiresAt: { lt: new Date() } },
  })

  const raw = generateOpaqueToken(32)
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(raw), expiresAt },
  })

  const url = new URL('/reset-password', env.APP_URL)
  url.searchParams.set('token', raw)

  return {
    sent: true,
    resetUrl: url.toString(),
    expiresAt: expiresAt.toISOString(),
  }
}

async function resetPassword(token, newPassword) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })

  if (!record || record.usedAt) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN')
  }

  if (record.expiresAt < new Date()) {
    throw new AppError('Reset token has expired', 400, 'RESET_TOKEN_EXPIRED')
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return { reset: true }
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  })

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  if (user.deletedAt) {
    throw new AppError('This account has been deactivated', 403, 'ACCOUNT_DEACTIVATED')
  }

  return serializeUser(user)
}

export const authService = {
  login,
  registerStudent,
  registerPartner,
  registerHospital,
  registerDoctor,
  registerReviewer,
  lookupHospitalCode,
  refresh,
  logout,
  requestEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
}
