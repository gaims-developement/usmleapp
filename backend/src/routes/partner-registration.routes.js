import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { asyncHandler } from '../utils/async-handler.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { notify } from './notification.routes.js'

export const partnerRegistrationRouter = Router()

partnerRegistrationRouter.use(authenticate)
partnerRegistrationRouter.use(requireRoles('SUPER_ADMIN', 'ADMIN'))

const idParamsSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})

const rejectBodySchema = z.object({
  body: z.object({ message: z.string().optional() }),
})

const ROLE_TO_PARTNER_TYPE = {
  HOSPITAL: 'hospital',
  DOCTOR: 'doctor',
  REVIEWER: 'reviewer',
}

function mapStatus(status) {
  switch (status) {
    case 'APPROVED':
      return 'approved'
    case 'REJECTED':
      return 'rejected'
    case 'INFO_REQUESTED':
      return 'info_requested'
    default:
      return 'pending'
  }
}

function buildDetails(reg) {
  const user = reg.registeredBy
  const role = user?.role?.name
  const details = []

  if (role === 'HOSPITAL') {
    const hp = reg.hospitalProfile
    if (hp) {
      details.push({ label: 'Organization', value: hp.name || reg.organizationName })
      details.push({ label: 'Country', value: hp.country || '—' })
      details.push({ label: 'Phone', value: hp.phone || reg.phone || '—' })
      if (hp.coordinatorName) {
        details.push({ label: 'Coordinator', value: `${hp.coordinatorName}${hp.coordinatorEmail ? ` (${hp.coordinatorEmail})` : ''}` })
      }
      if (hp.city) details.push({ label: 'City', value: hp.city })
      if (hp.state) details.push({ label: 'State', value: hp.state })
      if (hp.website) details.push({ label: 'Website', value: hp.website })
      if (hp.description) details.push({ label: 'Description', value: hp.description })
    } else {
      details.push({ label: 'Organization', value: reg.organizationName })
      if (reg.country) details.push({ label: 'Country', value: reg.country })
      if (reg.phone) details.push({ label: 'Phone', value: reg.phone })
      if (reg.city) details.push({ label: 'City', value: reg.city })
      if (reg.state) details.push({ label: 'State', value: reg.state })
    }
  } else if (role === 'DOCTOR') {
    const dp = user?.doctorProfile
    details.push({ label: 'Name', value: reg.contactName })
    details.push({ label: 'Email', value: reg.contactEmail })
    if (reg.phone) details.push({ label: 'Phone', value: reg.phone })
    if (dp?.specialty) details.push({ label: 'Specialty', value: dp.specialty })
    if (dp?.title) details.push({ label: 'Designation', value: dp.title })
    if (dp?.licenseNumber) details.push({ label: 'License #', value: dp.licenseNumber })
    if (reg.country) details.push({ label: 'Country', value: reg.country })
  } else if (role === 'REVIEWER') {
    const rp = user?.reviewerProfile
    details.push({ label: 'Name', value: reg.contactName })
    details.push({ label: 'Email', value: reg.contactEmail })
    if (reg.phone) details.push({ label: 'Phone', value: reg.phone })
    if (rp?.specialty) details.push({ label: 'Specialty', value: rp.specialty })
    if (rp?.department) details.push({ label: 'Department', value: rp.department })
    if (rp?.yearsOfExperience) details.push({ label: 'Experience', value: `${rp.yearsOfExperience} years` })
    if (reg.country) details.push({ label: 'Country', value: reg.country })
  }

  if (reg.message) {
    details.push({ label: 'Message', value: reg.message })
  }

  return details
}

function serializeRegistration(reg) {
  const user = reg.registeredBy
  const role = user?.role?.name
  const partnerType = ROLE_TO_PARTNER_TYPE[role] || 'hospital'

  let hospitalCode = null
  let hospitalName = null
  let department = null

  if (role === 'HOSPITAL' && reg.hospitalProfile) {
    hospitalName = reg.hospitalProfile.name
    const activeCode = reg.hospitalProfile.hospitalCodes?.find(c => c.isActive)
    if (activeCode) hospitalCode = activeCode.code
  } else if (role === 'DOCTOR' && user?.doctorProfile) {
    department = user.doctorProfile.specialty
    if (user.doctorProfile.hospital) {
      hospitalName = user.doctorProfile.hospital.name
      const activeCode = user.doctorProfile.hospital.hospitalCodes?.find(c => c.isActive)
      if (activeCode) hospitalCode = activeCode.code
    }
  } else if (role === 'REVIEWER' && user?.reviewerProfile) {
    department = user.reviewerProfile.department || user.reviewerProfile.specialty
  }

  return {
    id: reg.id,
    type: partnerType,
    role,
    name: reg.contactName,
    email: reg.contactEmail,
    submittedAt: reg.submittedAt.toISOString(),
    status: mapStatus(reg.status),
    hospitalCode,
    hospitalName,
    department,
    reviewMessage: reg.reviewMessage || null,
    details: buildDetails(reg),
  }
}

partnerRegistrationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const registrations = await prisma.partnerRegistration.findMany({
      where: {
        status: { notIn: ['APPROVED'] },
      },
      include: {
        registeredBy: {
          include: {
            role: true,
            doctorProfile: {
              include: { hospital: { include: { hospitalCodes: true } } },
            },
            reviewerProfile: true,
          },
        },
        hospitalProfile: {
          include: { hospitalCodes: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    const mapped = registrations.map(serializeRegistration)
    return res.json({ success: true, data: mapped })
  }),
)

partnerRegistrationRouter.patch(
  '/:id/approve',
  validate(idParamsSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const registration = await prisma.partnerRegistration.findUnique({
      where: { id },
      include: {
        registeredBy: {
          include: { role: true },
        },
        hospitalProfile: true,
      },
    })

    if (!registration) {
      return res.status(404).json({ success: false, error: { message: 'Registration not found.' } })
    }

    const role = registration.registeredBy?.role?.name

    await prisma.$transaction(async (tx) => {
      await tx.partnerRegistration.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedById: req.user.id,
        },
      })

      if (role === 'HOSPITAL' && registration.hospitalProfileId) {
        await tx.hospitalProfile.update({
          where: { id: registration.hospitalProfileId },
          data: { status: 'active' },
        })
        const codes = await tx.hospitalRegistrationCode.findMany({
          where: { hospitalId: registration.hospitalProfileId },
        })
        for (const code of codes) {
          await tx.hospitalRegistrationCode.update({
            where: { id: code.id },
            data: { isActive: true },
          })
        }
      } else if (role === 'DOCTOR' && registration.registeredById) {
        const doctorProfile = await tx.doctorProfile.findUnique({
          where: { userId: registration.registeredById },
        })
        if (doctorProfile) {
          await tx.doctorProfile.update({
            where: { id: doctorProfile.id },
            data: { status: 'active' },
          })
        }
      } else if (role === 'REVIEWER' && registration.registeredById) {
        const reviewerProfile = await tx.reviewerProfile.findUnique({
          where: { userId: registration.registeredById },
        })
        if (reviewerProfile) {
          await tx.reviewerProfile.update({
            where: { id: reviewerProfile.id },
            data: { status: 'active' },
          })
        }
      }
    })

    const label = role === 'HOSPITAL' ? 'Hospital' : role === 'DOCTOR' ? 'Doctor' : 'Reviewer'
    await notify(registration.registeredById, {
      tone: 'SUCCESS',
      title: `${label} Registration Approved`,
      body: `Your ${label.toLowerCase()} registration has been approved. You can now access the dashboard.`,
    })

    const updated = await prisma.partnerRegistration.findUnique({
      where: { id },
      include: {
        registeredBy: {
          include: {
            role: true,
            doctorProfile: { include: { hospital: { include: { hospitalCodes: true } } } },
            reviewerProfile: true,
          },
        },
        hospitalProfile: { include: { hospitalCodes: true } },
      },
    })

    return res.json({ success: true, data: serializeRegistration(updated) })
  }),
)

partnerRegistrationRouter.patch(
  '/:id/reject',
  validate(idParamsSchema),
  validate(rejectBodySchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { message } = req.body

    const registration = await prisma.partnerRegistration.findUnique({ where: { id } })
    if (!registration) {
      return res.status(404).json({ success: false, error: { message: 'Registration not found.' } })
    }

    await prisma.partnerRegistration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewMessage: message || null,
        reviewedAt: new Date(),
        reviewedById: req.user.id,
      },
    })

    const rejReg = await prisma.partnerRegistration.findUnique({
      where: { id },
      include: { registeredBy: { include: { role: true } } },
    })
    const rejLabel = rejReg?.registeredBy?.role?.name === 'HOSPITAL' ? 'Hospital' : rejReg?.registeredBy?.role?.name === 'DOCTOR' ? 'Doctor' : 'Reviewer'
    if (rejReg?.registeredById) {
      await notify(rejReg.registeredById, {
        tone: 'WARNING',
        title: `${rejLabel} Registration Rejected`,
        body: message || `Your ${rejLabel.toLowerCase()} registration has been rejected.`,
      })
    }

    const updated = await prisma.partnerRegistration.findUnique({
      where: { id },
      include: {
        registeredBy: {
          include: {
            role: true,
            doctorProfile: { include: { hospital: { include: { hospitalCodes: true } } } },
            reviewerProfile: true,
          },
        },
        hospitalProfile: { include: { hospitalCodes: true } },
      },
    })

    return res.json({ success: true, data: serializeRegistration(updated) })
  }),
)

partnerRegistrationRouter.patch(
  '/:id/request-info',
  validate(idParamsSchema),
  validate(rejectBodySchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { message } = req.body

    const registration = await prisma.partnerRegistration.findUnique({ where: { id } })
    if (!registration) {
      return res.status(404).json({ success: false, error: { message: 'Registration not found.' } })
    }

    await prisma.partnerRegistration.update({
      where: { id },
      data: {
        status: 'INFO_REQUESTED',
        reviewMessage: message || null,
        reviewedAt: new Date(),
        reviewedById: req.user.id,
      },
    })

    const infoReg = await prisma.partnerRegistration.findUnique({
      where: { id },
      include: { registeredBy: { include: { role: true } } },
    })
    const infoLabel = infoReg?.registeredBy?.role?.name === 'HOSPITAL' ? 'Hospital' : infoReg?.registeredBy?.role?.name === 'DOCTOR' ? 'Doctor' : 'Reviewer'
    if (infoReg?.registeredById) {
      await notify(infoReg.registeredById, {
        tone: 'INFO',
        title: `Additional Information Requested`,
        body: message || `The administrator has requested additional information for your ${infoLabel.toLowerCase()} registration.`,
      })
    }

    const updated = await prisma.partnerRegistration.findUnique({
      where: { id },
      include: {
        registeredBy: {
          include: {
            role: true,
            doctorProfile: { include: { hospital: { include: { hospitalCodes: true } } } },
            reviewerProfile: true,
          },
        },
        hospitalProfile: { include: { hospitalCodes: true } },
      },
    })

    return res.json({ success: true, data: serializeRegistration(updated) })
  }),
)
