import { prisma } from '../db/prisma.js'
import { AppError } from '../utils/app-error.js'
import { generateCode } from './auth.service.js'

async function getOrganization(hospitalId) {
  const hospital = await prisma.hospitalProfile.findUnique({
    where: { id: hospitalId },
    include: {
      hospitalCodes: {
        orderBy: { createdAt: 'desc' },
      },
      departments: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { doctors: true } } },
      },
      doctors: {
        orderBy: { joinedAt: 'desc' },
        include: {
          user: true,
          department: true,
        },
      },
    },
  })

  if (!hospital) {
    throw new AppError('Hospital profile not found', 404, 'HOSPITAL_NOT_FOUND')
  }

  let activeCode = hospital.hospitalCodes.find(code => code.isActive) ?? null
  if (!activeCode) {
    const newCodeString = generateCode('HOSP')
    activeCode = await prisma.hospitalRegistrationCode.create({
      data: {
        hospitalId: hospital.id,
        code: newCodeString,
        isActive: true,
      },
    })
  }

  return {
    profile: {
      id: hospital.id,
      name: hospital.name,
      city: hospital.city,
      state: hospital.state,
      country: hospital.country,
      address: hospital.address,
      website: hospital.website,
      email: hospital.email,
      phone: hospital.phone,
      description: hospital.description,
      coordinatorName: hospital.coordinatorName,
      coordinatorEmail: hospital.coordinatorEmail,
      coordinatorPhone: hospital.coordinatorPhone,
      tier: hospital.tier,
      status: hospital.status,
    },
    activeCode: activeCode
      ? {
          code: activeCode.code,
          isActive: activeCode.isActive,
          usedCount: activeCode.usedCount,
          expiresAt: activeCode.expiresAt?.toISOString() ?? null,
          createdAt: activeCode.createdAt.toISOString(),
        }
      : null,
    departments: hospital.departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      doctorCount: dept._count.doctors,
      createdAt: dept.createdAt.toISOString(),
    })),
    doctors: hospital.doctors.map(doctor => ({
      id: doctor.id,
      userId: doctor.userId,
      name: doctor.user.name,
      email: doctor.email ?? doctor.user.email,
      specialty: doctor.specialty,
      title: doctor.title,
      departmentId: doctor.departmentId,
      departmentName: doctor.department?.name ?? null,
      status: doctor.status,
    })),
  }
}

async function createDepartment(hospitalId, name) {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new AppError('Department name is required', 400, 'DEPARTMENT_NAME_REQUIRED')
  }

  const existing = await prisma.department.findUnique({
    where: { hospitalId_name: { hospitalId, name: trimmed } },
  })
  if (existing) {
    throw new AppError('This department already exists', 409, 'DEPARTMENT_EXISTS')
  }

  const department = await prisma.department.create({
    data: { hospitalId, name: trimmed },
  })
  return {
    id: department.id,
    name: department.name,
    doctorCount: 0,
    createdAt: department.createdAt.toISOString(),
  }
}

async function deleteDepartment(hospitalId, departmentId) {
  const department = await prisma.department.findFirst({
    where: { id: departmentId, hospitalId },
    include: { _count: { select: { doctors: true } } },
  })
  if (!department) {
    throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND')
  }
  if (department._count.doctors > 0) {
    throw new AppError(
      'Cannot delete a department that has doctors assigned',
      400,
      'DEPARTMENT_HAS_DOCTORS',
    )
  }

  await prisma.department.delete({ where: { id: departmentId } })
  return { deleted: true, id: departmentId }
}

async function regenerateHospitalCode(hospitalId) {
  const hospital = await prisma.hospitalProfile.findUnique({ where: { id: hospitalId } })
  if (!hospital) {
    throw new AppError('Hospital profile not found', 404, 'HOSPITAL_NOT_FOUND')
  }

  const code = generateCode('HOSP')

  const record = await prisma.hospitalRegistrationCode.create({
    data: { hospitalId, code, isActive: true },
  })

  await prisma.hospitalRegistrationCode.updateMany({
    where: { hospitalId, isActive: true, id: { not: record.id } },
    data: { isActive: false },
  })

  return {
    code: record.code,
    isActive: record.isActive,
    usedCount: record.usedCount,
    expiresAt: record.expiresAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  }
}

async function mintReviewerCode(createdById, expiresAt) {
  const code = generateCode('REV')
  const record = await prisma.reviewerInvitationCode.create({
    data: {
      code,
      isActive: true,
      createdById: createdById ?? null,
      expiresAt: expiresAt ?? null,
    },
  })
  return {
    id: record.id,
    code: record.code,
    isActive: record.isActive,
    usedCount: record.usedCount,
    expiresAt: record.expiresAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  }
}

async function listReviewerCodes() {
  const records = await prisma.reviewerInvitationCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })
  return records.map(record => ({
    id: record.id,
    code: record.code,
    isActive: record.isActive,
    usedCount: record.usedCount,
    expiresAt: record.expiresAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    createdBy: record.createdBy
      ? { id: record.createdBy.id, name: record.createdBy.name, email: record.createdBy.email }
      : null,
  }))
}

async function deactivateReviewerCode(id) {
  const record = await prisma.reviewerInvitationCode.findUnique({ where: { id } })
  if (!record) {
    throw new AppError('Invitation code not found', 404, 'INVITATION_CODE_NOT_FOUND')
  }
  await prisma.reviewerInvitationCode.update({
    where: { id },
    data: { isActive: false },
  })
  return { deactivated: true, id }
}

export const orgService = {
  getOrganization,
  createDepartment,
  deleteDepartment,
  regenerateHospitalCode,
  mintReviewerCode,
  listReviewerCodes,
  deactivateReviewerCode,
}
