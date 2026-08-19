import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../utils/async-handler.js'
import { validate } from '../../middleware/validate.middleware.js'
import { authenticate } from '../../middleware/auth.middleware.js'
import { authService } from '../../services/auth.service.js'

export const authRouter = Router()

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  }),
})

const registerStudentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(8),
    college: z.string().trim().optional(),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'dob must be a valid date (YYYY-MM-DD)')
      .optional(),
    electives: z.array(z.string().trim().min(1)).optional(),
    locations: z.array(z.string().trim().min(1)).optional(),
  }),
})

const registerPartnerSchema = z.object({
  body: z
    .object({
      type: z.enum(['HOSPITAL', 'DOCTOR', 'REVIEWER']),
      name: z.string().trim().min(2),
      email: z.string().trim().email(),
      password: z.string().min(8),
      organizationName: z.string().trim().optional(),
      coordinatorName: z.string().trim().optional(),
      coordinatorEmail: z.string().trim().email().optional(),
      coordinatorPhone: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
      department: z.string().trim().optional(),
      specialty: z.string().trim().optional(),
      designation: z.string().trim().optional(),
      timezone: z.string().trim().optional(),
      message: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === 'HOSPITAL' && !data.organizationName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['organizationName'],
          message: 'organizationName is required for hospital registration',
        })
      }
    }),
})

const registerHospitalSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(8),
    organizationName: z.string().trim().min(2).optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    address: z.string().trim().optional(),
    website: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    description: z.string().trim().optional(),
    coordinatorName: z.string().trim().optional(),
    coordinatorEmail: z.string().trim().email().optional(),
    coordinatorPhone: z.string().trim().optional(),
  }),
})

const registerDoctorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(8),
    hospitalCode: z.string().trim().min(1),
    departmentName: z.string().trim().min(1).optional(),
    specialty: z.string().trim().optional(),
    title: z.string().trim().optional(),
    licenseNumber: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    availability: z.string().trim().optional(),
  }),
})

const registerReviewerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2),
      email: z.string().trim().email(),
      password: z.string().min(8),
      hospitalCode: z.string().trim().min(1).optional(),
      invitationCode: z.string().trim().min(1).optional(),
      specialty: z.string().trim().optional(),
      department: z.string().trim().optional(),
      timezone: z.string().trim().optional(),
      title: z.string().trim().optional(),
      institution: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      yearsOfExperience: z.coerce.number().int().min(0).max(60).optional(),
    })
    .refine(body => Boolean(body.hospitalCode || body.invitationCode), {
      message: 'hospitalCode is required',
      path: ['hospitalCode'],
    }),
})

const hospitalCodeLookupSchema = z.object({
  query: z.object({
    code: z.string().trim().min(1),
  }),
})

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
})

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
})

const emailSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
  }),
})

const tokenSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
})

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
})

authRouter.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json({ success: true, data: result })
  }),
)

authRouter.post(
  '/register',
  validate(registerStudentSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.registerStudent(req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.status(201).json({ success: true, data: result })
  }),
)

authRouter.post(
  '/register/partner',
  validate(registerPartnerSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.registerPartner(req.body)

    res.status(201).json({ success: true, data: result })
  }),
)

authRouter.post(
  '/register/hospital',
  validate(registerHospitalSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.registerHospital(req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.status(201).json({ success: true, data: result })
  }),
)

authRouter.post(
  '/register/doctor',
  validate(registerDoctorSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.registerDoctor(req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.status(201).json({ success: true, data: result })
  }),
)

authRouter.post(
  '/register/reviewer',
  validate(registerReviewerSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.registerReviewer(req.body, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.status(201).json({ success: true, data: result })
  }),
)

authRouter.get(
  '/hospital-code/lookup',
  validate(hospitalCodeLookupSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.lookupHospitalCode(req.query.code)
    res.json({ success: true, data: result })
  }),
)

authRouter.post(
  '/refresh',
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.json({ success: true, data: result })
  }),
)

authRouter.post(
  '/logout',
  validate(logoutSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.logout(req.body.refreshToken)

    res.json({ success: true, data: result })
  }),
)

authRouter.post(
  '/verify-email/request',
  validate(emailSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.requestEmailVerification(req.body.email)
    res.json({ success: true, data: result })
  }),
)

authRouter.post(
  '/verify-email',
  validate(tokenSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(req.body.token)
    res.json({ success: true, data: result })
  }),
)

authRouter.post(
  '/forgot-password',
  validate(emailSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email)
    res.json({ success: true, data: result })
  }),
)

authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(req.body.token, req.body.password)
    res.json({ success: true, data: result })
  }),
)

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id)
    res.json({ success: true, data: { user } })
  }),
)
