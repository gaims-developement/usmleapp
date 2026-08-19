import { prisma } from '../db/prisma.js'
import { AppError } from '../utils/app-error.js'
import { env } from '../config/env.js'
import { comparePassword, hashPassword } from './password.service.js'
import { deleteCloudinaryAsset, uploadBufferToCloudinary } from './cloudinary.service.js'
import { serializeUser, userInclude } from './auth.service.js'

const toDate = value => (value ? new Date(`${value}T00:00:00.000Z`) : null)

function assertAccountActive(user) {
  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  })

  assertAccountActive(user)
  return serializeUser(user)
}

async function updateProfile(userId, input) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  })

  assertAccountActive(user)

  const roleName = user.role?.name ?? 'STUDENT'
  const userData = {}
  if (input.name !== undefined) userData.name = input.name
  if (input.onboarded !== undefined) userData.onboarded = Boolean(input.onboarded)

  const studentData = {}
  if (input.college !== undefined) studentData.college = input.college || null
  if (input.dob !== undefined) studentData.dateOfBirth = toDate(input.dob)
  if (input.graduationYear !== undefined) studentData.graduationYear = input.graduationYear ?? null
  if (input.visaStatus !== undefined) studentData.visaStatus = input.visaStatus || null
  if (input.earliestStart !== undefined) studentData.earliestStart = toDate(input.earliestStart)
  if (input.durationPreference !== undefined) studentData.durationPreference = input.durationPreference ?? null
  if (input.travelReady !== undefined) studentData.travelReady = Boolean(input.travelReady)

  const hospitalData = {}
  if (input.hospital) {
    const fields = [
      'name',
      'city',
      'state',
      'country',
      'address',
      'website',
      'email',
      'phone',
      'description',
      'coordinatorName',
      'coordinatorEmail',
      'coordinatorPhone',
      'tier',
    ]
    for (const field of fields) {
      if (input.hospital[field] !== undefined) hospitalData[field] = input.hospital[field]
    }
  }

  const doctorData = {}
  if (input.doctor) {
    for (const field of ['specialty', 'title', 'licenseNumber', 'email', 'phone', 'availability']) {
      if (input.doctor[field] !== undefined) doctorData[field] = input.doctor[field]
    }
  }

  const reviewerData = {}
  if (input.reviewer) {
    for (const field of [
      'specialty',
      'department',
      'timezone',
      'title',
      'institution',
      'phone',
      'yearsOfExperience',
    ]) {
      if (input.reviewer[field] !== undefined) reviewerData[field] = input.reviewer[field]
    }
  }

  const hasStudentProfile = Boolean(user.studentProfile)
  const hasHospitalProfile = Boolean(user.hospitalProfile)
  const hasDoctorProfile = Boolean(user.doctorProfile)
  const hasReviewerProfile = Boolean(user.reviewerProfile)

  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: userId }, data: userData })

    if (roleName === 'STUDENT' && Object.keys(studentData).length > 0) {
      if (hasStudentProfile) {
        await tx.studentProfile.update({ where: { userId }, data: studentData })
      } else {
        await tx.studentProfile.create({ data: { userId, ...studentData } })
      }
    }

    if (input.electives !== undefined) {
      await tx.studentInterest.deleteMany({ where: { studentProfileId: user.studentProfile?.id ?? '' } })
      if (hasStudentProfile && input.electives.length > 0) {
        await tx.studentInterest.createMany({
          data: input.electives.map(value => ({ studentProfileId: user.studentProfile.id, value })),
        })
      }
    }

    if (input.goals !== undefined) {
      await tx.studentGoal.deleteMany({ where: { studentProfileId: user.studentProfile?.id ?? '' } })
      if (hasStudentProfile && input.goals.length > 0) {
        await tx.studentGoal.createMany({
          data: input.goals.map(value => ({ studentProfileId: user.studentProfile.id, value })),
        })
      }
    }

    if (input.locations !== undefined) {
      await tx.studentLocationPreference.deleteMany({
        where: { studentProfileId: user.studentProfile?.id ?? '' },
      })
      if (hasStudentProfile && input.locations.length > 0) {
        await tx.studentLocationPreference.createMany({
          data: input.locations.map(value => ({ studentProfileId: user.studentProfile.id, value })),
        })
      }
    }

    if (hasHospitalProfile && Object.keys(hospitalData).length > 0) {
      await tx.hospitalProfile.update({ where: { userId }, data: hospitalData })
    }

    if (hasDoctorProfile && Object.keys(doctorData).length > 0) {
      await tx.doctorProfile.update({ where: { userId }, data: doctorData })
    }

    if (hasReviewerProfile && Object.keys(reviewerData).length > 0) {
      await tx.reviewerProfile.update({ where: { userId }, data: reviewerData })
    }
  })

  return getProfile(userId)
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  assertAccountActive(user)

  if (!user.passwordHash) {
    throw new AppError('This account does not use a password', 400, 'NO_PASSWORD_SET')
  }

  const passwordMatches = await comparePassword(currentPassword, user.passwordHash)
  if (!passwordMatches) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD')
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  return { changed: true }
}

function cloudinaryConfigured() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)
}

async function uploadAvatar(userId, file) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  assertAccountActive(user)

  if (!file?.buffer) {
    throw new AppError('No avatar image was provided', 400, 'FILE_MISSING')
  }

  if (!cloudinaryConfigured()) {
    throw new AppError('Avatar uploads are not configured on this server', 503, 'UPLOAD_NOT_CONFIGURED')
  }

  if (user.avatarPublicId) {
    await deleteCloudinaryAsset(user.avatarPublicId).catch(() => {})
  }

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: 'avatars',
    resource_type: 'image',
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
  })

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: result.secure_url, avatarPublicId: result.public_id },
    include: userInclude,
  })

  return serializeUser(updated)
}

async function removeAvatar(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  assertAccountActive(user)

  if (user.avatarPublicId) {
    await deleteCloudinaryAsset(user.avatarPublicId).catch(() => {})
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null, avatarPublicId: null },
    include: userInclude,
  })

  return serializeUser(updated)
}

async function deactivateAccount(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  assertAccountActive(user)

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  return { deactivated: true }
}

async function reactivateAccount(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  if (!user.deletedAt) {
    throw new AppError('This account is already active', 400, 'ACCOUNT_ACTIVE')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: null },
  })

  return { reactivated: true, user: await getProfile(userId) }
}

export const userService = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
  deactivateAccount,
  reactivateAccount,
}
