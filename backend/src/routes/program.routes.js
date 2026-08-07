import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { asyncHandler } from '../utils/async-handler.js'

export const programRouter = Router()

// GET /api/programs - Retrieve list of active programs (electives)
programRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, specialty, city, duration } = req.query

    let whereClause = { status: 'ACTIVE' }

    if (specialty) {
      whereClause.specialty = specialty
    }

    if (city) {
      // Find programs where hospital's city and state match
      const [cityName, stateName] = city.split(',').map(s => s.trim())
      whereClause.hospital = {
        city: cityName,
        state: stateName,
      }
    }

    if (search) {
      const q = search.toLowerCase()
      whereClause.OR = [
        { specialty: { contains: q } },
        { title: { contains: q } },
        { hospital: { name: { contains: q } } },
        { hospital: { city: { contains: q } } },
      ]
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      include: { hospital: true },
    })

    const mapped = programs.map(p => ({
      id: p.id,
      specialty: p.specialty ?? 'General',
      hospital: p.hospital.name ?? 'Hospital',
      city: p.hospital.city ?? 'Boston',
      state: p.hospital.state ?? 'MA',
      rating: Number(p.fee) > 1200 ? 4.8 : 4.5, // Mocked rating
      spots: p.seats,
      teachingType: 'Inpatient', // Default
      fee: Number(p.fee),
      description: p.description ?? '',
      highlights: ['U.S. clinical exposure', 'Letter of Recommendation potential'],
      requirements: ['Passport', 'CV / Resume', 'Medical school transcript', 'Immunization record', 'TB screening'],
      eligibility: p.eligibility ?? 'All medical students & grads',
      startDates: [p.startDate?.toISOString().slice(0, 10) ?? '2027-01-01'],
      durationWeeks: [4, 8],
      applicationDeadline: p.deadline?.toISOString().slice(0, 10) ?? '2026-12-31',
    }))

    return res.json({ success: true, data: mapped })
  }),
)

// GET /api/programs/:id - Retrieve program details
programRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const program = await prisma.program.findUnique({
      where: { id },
      include: { hospital: true },
    })

    if (!program) {
      return res.status(404).json({ success: false, error: { message: 'Program not found' } })
    }

    const mapped = {
      id: program.id,
      specialty: program.specialty ?? 'General',
      hospital: program.hospital.name ?? 'Hospital',
      city: program.hospital.city ?? 'Boston',
      state: program.hospital.state ?? 'MA',
      rating: 4.8,
      spots: program.seats,
      teachingType: 'Inpatient',
      fee: Number(program.fee),
      description: program.description ?? '',
      highlights: ['U.S. clinical exposure', 'Letter of Recommendation potential'],
      requirements: ['Passport', 'CV / Resume', 'Medical school transcript', 'Immunization record', 'TB screening'],
      eligibility: program.eligibility ?? 'All medical students & grads',
      startDates: [program.startDate?.toISOString().slice(0, 10) ?? '2027-01-01'],
      durationWeeks: [4, 8],
      applicationDeadline: program.deadline?.toISOString().slice(0, 10) ?? '2026-12-31',
    }

    return res.json({ success: true, data: mapped })
  }),
)
