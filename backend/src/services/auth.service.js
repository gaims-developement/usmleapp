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

const REFRESH_TOKEN_TTL_MS = durationToMs(env.JWT_REFRESH_EXPIRES_IN)
const EMAIL_VERIFICATION_TTL_MS = durationToMs(env.EMAIL_VERIFICATION_EXPIRES_IN)
const PASSWORD_RESET_TTL_MS = durationToMs(env.PASSWORD_RESET_EXPIRES_IN)

export const userInclude = {
  role: true,
  studentProfile: {
    include: { interests: true, locations: true, goals: true },
  },
  hospitalProfile: true,
  doctorProfile: true,
  reviewerProfile: true,
}

const toDateOnly = value => (value ? new Date(value).toISOString().slice(0, 10) : undefined)

export function serializeUser(user) {
  const student = user.studentProfile
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role?.name ?? 'STUDENT',
    onboarded: user.onboarded,
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

  return serializeUser(user)
}

export const authService = {
  login,
  registerStudent,
  registerPartner,
  refresh,
  logout,
  requestEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
}
