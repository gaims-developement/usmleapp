import { partnerHospitals, type PartnerHospital } from '@/mocks/partners/hospitals'
import { partnerDoctors, type PartnerDoctor } from '@/mocks/partners/doctors'
import { partnerReviewers, type PartnerReviewer } from '@/mocks/partners/reviewers'
import { userService } from '@/services/userService'
import type { RoleId } from '@/types/rbac'

export type PartnerType = 'hospital' | 'doctor' | 'reviewer'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'info_requested'

export interface HospitalRegistrationInput {
  name: string
  email: string
  password: string
  coordinatorName: string
  coordinatorEmail: string
  phone: string
  country: string
  address: string
  website: string
  departments: string[]
  accreditation: string[]
  description: string
  logoFileName?: string
}

export interface DoctorRegistrationInput {
  fullName: string
  email: string
  password: string
  phone: string
  specialty: string
  department: string
  designation: string
  licenseNumber: string
  yearsExperience: number
  hospitalCode: string
  avatarFileName?: string
}

export interface ReviewerRegistrationInput {
  fullName: string
  email: string
  password: string
  phone: string
  country: string
  department: string
  qualifications: string
  experienceYears: number
  reviewerId?: string
  avatarFileName?: string
}

export interface ApprovalRequest {
  id: string
  type: PartnerType
  role: RoleId
  name: string
  email: string
  submittedAt: string
  status: ApprovalStatus
  hospitalCode?: string
  hospitalName?: string
  department?: string
  reviewMessage?: string
  details: { label: string; value: string }[]
}

const latency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))
const today = () => new Date().toISOString().slice(0, 10)

let hospitals: PartnerHospital[] = partnerHospitals.map(h => ({
  ...h,
  departments: [...h.departments],
  accreditation: [...h.accreditation],
}))
let doctors: PartnerDoctor[] = partnerDoctors.map(d => ({ ...d }))
let reviewers: PartnerReviewer[] = partnerReviewers.map(r => ({ ...r }))

let lastRegistration: ApprovalRequest | null = null

function nextHospitalCode(): string {
  const numbers = [...hospitals].map(h => Number(h.hospitalCode.replace('IMGH-', '')))
  const next = (numbers.length > 0 ? Math.max(...numbers) : 1000) + 1
  return `IMGH-${String(next).padStart(4, '0')}`
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

function hospitalById(id: string): PartnerHospital | undefined {
  return hospitals.find(h => h.id === id)
}

function doctorById(id: string): PartnerDoctor | undefined {
  return doctors.find(d => d.id === id)
}

function assertEmailFree(email: string): void {
  const normalized = email.trim().toLowerCase()
  const inUsers = userService.findByEmail(normalized)
  if (inUsers) throw new Error('An account with this email already exists.')
  const inRegistries = [...hospitals, ...doctors, ...reviewers].some(
    r => r.email.toLowerCase() === normalized,
  )
  if (inRegistries) throw new Error('An account with this email is already registered or pending approval.')
}

function approvalStatus(status: 'active' | 'pending' | 'rejected' | 'info_requested'): ApprovalStatus {
  switch (status) {
    case 'active':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'info_requested':
      return 'info_requested'
    default:
      return 'pending'
  }
}

function requestFromHospital(h: PartnerHospital): ApprovalRequest {
  return {
    id: `hreq-${h.id}`,
    type: 'hospital',
    role: 'HOSPITAL',
    name: h.name,
    email: h.email,
    submittedAt: h.joinedAt,
    status: approvalStatus(h.status),
    hospitalCode: h.hospitalCode,
    hospitalName: h.name,
    department: h.departments[0],
    reviewMessage: h.reviewMessage,
    details: [
      { label: 'Hospital code', value: h.hospitalCode },
      { label: 'Country', value: h.country },
      { label: 'Phone', value: h.phone },
      { label: 'Coordinator', value: `${h.coordinator.name} (${h.coordinator.email})` },
      { label: 'Departments', value: h.departments.join(', ') },
      { label: 'Accreditation', value: h.accreditation.join(', ') || '—' },
      { label: 'Website', value: h.website || '—' },
    ],
  }
}

function requestFromDoctor(d: PartnerDoctor): ApprovalRequest {
  const hospital = hospitals.find(h => h.hospitalCode === d.hospitalCode)
  return {
    id: `dreq-${d.id}`,
    type: 'doctor',
    role: 'DOCTOR',
    name: d.name,
    email: d.email,
    submittedAt: d.joinedAt,
    status: approvalStatus(d.status),
    hospitalCode: d.hospitalCode,
    hospitalName: hospital?.name,
    department: d.department,
    reviewMessage: d.reviewMessage,
    details: [
      { label: 'Specialty', value: d.specialty },
      { label: 'Department', value: d.department },
      { label: 'Designation', value: d.designation },
      { label: 'License number', value: d.licenseNumber },
      { label: 'Experience', value: `${d.yearsExperience} years` },
      { label: 'Hospital', value: hospital ? `${hospital.name} (${d.hospitalCode})` : d.hospitalCode },
      { label: 'Phone', value: d.phone },
    ],
  }
}

function requestFromReviewer(r: PartnerReviewer): ApprovalRequest {
  return {
    id: `rreq-${r.id}`,
    type: 'reviewer',
    role: 'REVIEWER',
    name: r.name,
    email: r.email,
    submittedAt: r.joinedAt,
    status: approvalStatus(r.status),
    department: r.department,
    reviewMessage: r.reviewMessage,
    details: [
      { label: 'Country', value: r.country },
      { label: 'Department', value: r.department },
      { label: 'Qualifications', value: r.qualifications },
      { label: 'Experience', value: `${r.experienceYears} years` },
      { label: 'Reviewer ID', value: r.reviewerId || '—' },
      { label: 'Phone', value: r.phone },
    ],
  }
}

export interface HospitalCodeLookup {
  valid: boolean
  hospital?: PartnerHospital
  error?: string
}

export const partnerService = {
  async listHospitals(): Promise<PartnerHospital[]> {
    await latency()
    return hospitals.map(h => ({ ...h, departments: [...h.departments], accreditation: [...h.accreditation] }))
  },

  async listDoctors(): Promise<PartnerDoctor[]> {
    await latency()
    return doctors.map(d => ({ ...d }))
  },

  async listReviewers(): Promise<PartnerReviewer[]> {
    await latency()
    return reviewers.map(r => ({ ...r }))
  },

  async findHospitalByCode(code: string): Promise<PartnerHospital | null> {
    await latency(150)
    return hospitals.find(h => h.hospitalCode === normalizeCode(code)) ?? null
  },

  async generateHospitalCode(): Promise<string> {
    await latency()
    return nextHospitalCode()
  },

  async validateHospitalCode(code: string): Promise<HospitalCodeLookup> {
    await latency(200)
    const normalized = normalizeCode(code)
    if (!normalized) return { valid: false, error: 'Enter a hospital code to continue.' }
    const match = hospitals.find(h => h.hospitalCode === normalized)
    if (!match) return { valid: false, error: 'No hospital found with this code. Check and try again.' }
    if (match.status !== 'active') {
      return { valid: false, error: `${match.name} has not been activated yet. Only active hospitals can host doctors.` }
    }
    return { valid: true, hospital: match }
  },

  async registerHospital(input: HospitalRegistrationInput): Promise<ApprovalRequest> {
    await latency(600)
    assertEmailFree(input.email)
    const record: PartnerHospital = {
      id: `hosp-${Date.now().toString(36)}`,
      name: input.name.trim(),
      hospitalCode: nextHospitalCode(),
      email: input.email.trim(),
      password: input.password,
      coordinator: { name: input.coordinatorName.trim(), email: input.coordinatorEmail.trim() },
      phone: input.phone.trim(),
      country: input.country,
      city: '',
      address: input.address.trim(),
      website: input.website.trim(),
      departments: input.departments.filter(Boolean),
      logoColor: logoPalette[Math.floor(Math.random() * logoPalette.length)],
      accreditation: input.accreditation.filter(Boolean),
      description: input.description.trim(),
      status: 'pending',
      joinedAt: today(),
    }
    hospitals.unshift(record)
    lastRegistration = requestFromHospital(record)
    return lastRegistration
  },

  async registerDoctor(input: DoctorRegistrationInput): Promise<ApprovalRequest> {
    await latency(600)
    assertEmailFree(input.email)
    const lookup = await this.validateHospitalCode(input.hospitalCode)
    if (!lookup.valid || !lookup.hospital) {
      throw new Error(lookup.error ?? 'Invalid hospital code.')
    }
    const record: PartnerDoctor = {
      id: `doc-reg-${Date.now().toString(36)}`,
      name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      specialty: input.specialty.trim(),
      department: input.department.trim(),
      designation: input.designation.trim(),
      licenseNumber: input.licenseNumber.trim(),
      yearsExperience: input.yearsExperience,
      hospitalCode: lookup.hospital.hospitalCode,
      avatarColor: logoPalette[Math.floor(Math.random() * logoPalette.length)],
      status: 'pending',
      joinedAt: today(),
      password: input.password,
    }
    doctors.unshift(record)
    lastRegistration = requestFromDoctor(record)
    return lastRegistration
  },

  async registerReviewer(input: ReviewerRegistrationInput): Promise<ApprovalRequest> {
    await latency(600)
    assertEmailFree(input.email)
    const record: PartnerReviewer = {
      id: `rev-reg-${Date.now().toString(36)}`,
      name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      country: input.country,
      department: input.department.trim(),
      qualifications: input.qualifications.trim(),
      experienceYears: input.experienceYears,
      reviewerId: input.reviewerId?.trim() || '',
      avatarColor: logoPalette[Math.floor(Math.random() * logoPalette.length)],
      status: 'pending',
      joinedAt: today(),
      password: input.password,
    }
    reviewers.unshift(record)
    lastRegistration = requestFromReviewer(record)
    return lastRegistration
  },

  async fetchApprovalRequests(): Promise<ApprovalRequest[]> {
    await latency(300)
    const requests = [
      ...hospitals.map(requestFromHospital),
      ...doctors.map(requestFromDoctor),
      ...reviewers.map(requestFromReviewer),
    ]
    return requests
      .filter(r => r.status !== 'approved')
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  },

  async getLastRegistration(): Promise<ApprovalRequest | null> {
    await latency()
    return lastRegistration ? { ...lastRegistration, details: [...lastRegistration.details] } : null
  },

  async approveRequest(id: string): Promise<ApprovalRequest> {
    await latency(450)
    const hospital = hospitals.find(h => `hreq-${h.id}` === id)
    if (hospital) {
      hospital.status = 'active'
      delete hospital.reviewMessage
      if (!userService.findByEmail(hospital.email)) {
        userService.create({
          name: hospital.name,
          email: hospital.email,
          password: hospital.password ?? '',
          role: 'HOSPITAL',
        })
      }
      return requestFromHospital(hospital)
    }
    const doctor = doctors.find(d => `dreq-${d.id}` === id)
    if (doctor) {
      doctor.status = 'active'
      delete doctor.reviewMessage
      if (!userService.findByEmail(doctor.email)) {
        userService.create({
          name: doctor.name,
          email: doctor.email,
          password: doctor.password ?? '',
          role: 'DOCTOR',
        })
      }
      return requestFromDoctor(doctor)
    }
    const reviewer = reviewers.find(r => `rreq-${r.id}` === id)
    if (reviewer) {
      reviewer.status = 'active'
      delete reviewer.reviewMessage
      if (!userService.findByEmail(reviewer.email)) {
        userService.create({
          name: reviewer.name,
          email: reviewer.email,
          password: reviewer.password ?? '',
          role: 'REVIEWER',
        })
      }
      return requestFromReviewer(reviewer)
    }
    throw new Error('Approval request not found.')
  },

  async rejectRequest(id: string, message: string): Promise<ApprovalRequest> {
    await latency(400)
    const target = hospitals.find(h => `hreq-${h.id}` === id) ??
      doctors.find(d => `dreq-${d.id}` === id) ??
      reviewers.find(r => `rreq-${r.id}` === id)
    if (!target) throw new Error('Approval request not found.')
    target.status = 'rejected'
    target.reviewMessage = message || undefined
    if (hospitalById(target.id)) return requestFromHospital(target as PartnerHospital)
    if (doctorById(target.id)) return requestFromDoctor(target as PartnerDoctor)
    return requestFromReviewer(target as PartnerReviewer)
  },

  async requestInfo(id: string, message: string): Promise<ApprovalRequest> {
    await latency(400)
    const target = hospitals.find(h => `hreq-${h.id}` === id) ??
      doctors.find(d => `dreq-${d.id}` === id) ??
      reviewers.find(r => `rreq-${r.id}` === id)
    if (!target) throw new Error('Approval request not found.')
    target.status = 'info_requested'
    target.reviewMessage = message || undefined
    if (hospitalById(target.id)) return requestFromHospital(target as PartnerHospital)
    if (doctorById(target.id)) return requestFromDoctor(target as PartnerDoctor)
    return requestFromReviewer(target as PartnerReviewer)
  },

  async regenerateHospitalCode(hospitalId: string): Promise<PartnerHospital> {
    await latency(450)
    const hospital = hospitals.find(h => h.id === hospitalId)
    if (!hospital) throw new Error('Hospital not found.')
    hospital.hospitalCode = nextHospitalCode()
    return { ...hospital, departments: [...hospital.departments], accreditation: [...hospital.accreditation] }
  },
}

const logoPalette = ['sky', 'emerald', 'violet', 'brand', 'amber', 'red'] as const
