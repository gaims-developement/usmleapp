import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../db/prisma.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { validate } from '../../middleware/validate.middleware.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { requireRoles } from '../../middleware/role.middleware.js'
import { uploadAvatar } from '../../middleware/upload.middleware.js'
import { userService } from '../../services/user.service.js'

export const userRouter = Router()

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a valid date (YYYY-MM-DD)')
  .optional()
  .nullable()

const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Expected a valid month (YYYY-MM)')
  .optional()
  .nullable()

const stringArraySchema = z.array(z.string().trim().min(1)).optional()

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    onboarded: z.boolean().optional(),
    college: z.string().trim().optional().nullable(),
    dob: dateSchema,
    graduationYear: z.coerce.number().int().optional().nullable(),
    visaStatus: z.string().trim().optional().nullable(),
    goals: stringArraySchema,
    electives: stringArraySchema,
    locations: stringArraySchema,
    earliestStart: monthSchema,
    durationPreference: z.coerce.number().int().optional().nullable(),
    travelReady: z.boolean().optional(),
    hospital: z
      .object({
        name: z.string().trim().optional(),
        city: z.string().trim().optional(),
        state: z.string().trim().optional(),
        country: z.string().trim().optional(),
        address: z.string().trim().optional(),
        website: z.string().trim().optional(),
        email: z.string().trim().email().optional(),
        phone: z.string().trim().optional(),
        description: z.string().trim().optional(),
        coordinatorName: z.string().trim().optional(),
        coordinatorEmail: z.string().trim().email().optional(),
        coordinatorPhone: z.string().trim().optional(),
        tier: z.string().trim().optional(),
      })
      .optional(),
    doctor: z
      .object({
        specialty: z.string().trim().optional(),
        title: z.string().trim().optional(),
        licenseNumber: z.string().trim().optional(),
        email: z.string().trim().email().optional(),
        phone: z.string().trim().optional(),
        availability: z.string().trim().optional(),
      })
      .optional(),
    reviewer: z
      .object({
        specialty: z.string().trim().optional(),
        department: z.string().trim().optional(),
        timezone: z.string().trim().optional(),
        title: z.string().trim().optional(),
        institution: z.string().trim().optional(),
        phone: z.string().trim().optional(),
        yearsOfExperience: z.coerce.number().int().min(0).max(60).optional(),
      })
      .optional(),
  }),
})

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
})

const reactivateParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
})

userRouter.use(authenticate)

userRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id)
    res.json({ success: true, data: { user } })
  }),
)

userRouter.patch(
  '/me',
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body)
    res.json({ success: true, data: { user } })
  }),
)

userRouter.put(
  '/me',
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body)
    res.json({ success: true, data: { user } })
  }),
)

userRouter.patch(
  '/me/password',
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await userService.changePassword(req.user.id, req.body)
    res.json({ success: true, data: result })
  }),
)

userRouter.post(
  '/me/avatar',
  uploadAvatar.single('avatar'),
  asyncHandler(async (req, res) => {
    const user = await userService.uploadAvatar(req.user.id, req.file)
    res.json({ success: true, data: { user } })
  }),
)

userRouter.delete(
  '/me/avatar',
  asyncHandler(async (req, res) => {
    const user = await userService.removeAvatar(req.user.id)
    res.json({ success: true, data: { user } })
  }),
)

userRouter.delete(
  '/me',
  asyncHandler(async (req, res) => {
    const result = await userService.deactivateAccount(req.user.id)
    res.json({ success: true, data: result })
  }),
)

userRouter.get(
  '/students',
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const students = await prisma.user.findMany({
      where: {
        isDemo: req.user.isDemo,
        role: { name: 'STUDENT' },
      },
      include: {
        studentProfile: true,
      },
    })
    const mapped = students.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      college: u.studentProfile?.college ?? null,
      graduationYear: u.studentProfile?.graduationYear ?? null,
      visaStatus: u.studentProfile?.visaStatus ?? null,
      onboarded: u.onboarded,
      isDemo: u.isDemo,
    }))
    return res.json({ success: true, data: mapped })
  }),
)

userRouter.get(
  '/reviewers',
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const reviewers = await prisma.user.findMany({
      where: {
        isDemo: req.user.isDemo,
        role: { name: 'REVIEWER' },
      },
      include: {
        reviewerProfile: true,
      },
    })
    const mapped = reviewers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      specialty: u.reviewerProfile?.specialty ?? null,
      department: u.reviewerProfile?.department ?? null,
      onboarded: u.onboarded,
      isDemo: u.isDemo,
    }))
    return res.json({ success: true, data: mapped })
  }),
)

userRouter.get(
  '/hospitals',
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const hospitals = await prisma.user.findMany({
      where: {
        isDemo: req.user.isDemo,
        role: { name: 'HOSPITAL' },
      },
      include: {
        hospitalProfile: {
          include: {
            hospitalCodes: true,
            programs: true,
            doctors: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const mapped = hospitals.map(u => {
      const activeCode = u.hospitalProfile?.hospitalCodes?.find(c => c.isActive)?.code ?? 'N/A'
      return {
        id: u.hospitalProfile?.id || u.id,
        userId: u.id,
        name: u.hospitalProfile?.name ?? u.name,
        organizationName: u.hospitalProfile?.name ?? u.name,
        city: u.hospitalProfile?.city ?? '',
        state: u.hospitalProfile?.state ?? '',
        country: u.hospitalProfile?.country ?? '',
        email: u.email,
        phone: u.hospitalProfile?.phone ?? '',
        hospitalCode: activeCode,
        tier: u.hospitalProfile?.tier ?? 'standard',
        programs: u.hospitalProfile?.programs?.length ?? 0,
        doctors: u.hospitalProfile?.doctors?.length ?? 0,
        students: 0,
        rating: 4.8,
        status: u.hospitalProfile?.status ?? 'active',
        joinedAt: u.createdAt.toISOString().slice(0, 10),
        onboarded: u.onboarded,
        isDemo: u.isDemo,
      }
    })
    return res.json({ success: true, data: mapped })
  }),
)

userRouter.get(
  '/doctors',
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const doctors = await prisma.user.findMany({
      where: {
        isDemo: req.user.isDemo,
        role: { name: 'DOCTOR' },
      },
      include: {
        doctorProfile: true,
      },
    })
    const mapped = doctors.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      specialty: u.doctorProfile?.specialty ?? null,
      hospital: u.doctorProfile?.hospitalName ?? null,
      students: 0,
      evaluations: 0,
      rating: 4.8,
      status: u.doctorProfile?.status ?? 'active',
      joinedAt: u.createdAt.toISOString().slice(0, 10),
      isDemo: u.isDemo,
    }))
    return res.json({ success: true, data: mapped })
  }),
)

userRouter.get(
  '/all',
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      where: {
        isDemo: req.user.isDemo,
      },
      include: {
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    const mapped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role?.name ?? 'USER',
      status: u.status ?? 'active',
      onboarded: u.onboarded,
      createdAt: u.createdAt.toISOString().slice(0, 10),
      isDemo: u.isDemo,
    }))
    return res.json({ success: true, data: mapped })
  }),
)

userRouter.post(
  '/:id/reactivate',
  validate(reactivateParamsSchema),
  requireRoles('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const result = await userService.reactivateAccount(req.params.id)
    res.json({ success: true, data: result })
  }),
)
