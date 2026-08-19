import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { asyncHandler } from '../utils/async-handler.js'
import { authenticateOptional } from '../middleware/auth.middleware.js'
import { DATE_ONLY } from '../utils/status-maps.js'

export const programRouter = Router()

// Parse a free-text duration like "4, 8, 12 weeks" into week numbers.
function durationWeeksFrom(duration) {
  if (!duration) return []
  const matches = String(duration).match(/\d+/g)
  return matches ? matches.map(Number) : []
}

function mapProgram(program) {
  const durationWeeks = durationWeeksFrom(program.duration)
  const slots = program.slots ?? []
  return {
    id: program.id,
    specialty: program.specialty ?? 'General',
    hospital: program.hospital.name ?? 'Hospital',
    city: program.hospital.city ?? '',
    state: program.hospital.state ?? '',
    status: program.status,
    spots: program.seats,
    filled: program.filledSeats,
    fee: program.fee != null ? Number(program.fee) : 0,
    description: program.description ?? '',
    requirements: (program.requirements ?? []).map(r => r.requirement),
    eligibility: program.eligibility ?? '',
    // Presentation fields not yet tracked in the DB. Returned as empty/null so the
    // frontend renders honestly (no fabricated ratings/highlights) and never crashes.
    rating: null,
    teachingType: null,
    highlights: [],
    startDates: slots.length
      ? slots.map(s => DATE_ONLY(s.startDate)).filter(Boolean)
      : program.startDate
        ? [DATE_ONLY(program.startDate)]
        : [],
    durationWeeks: durationWeeks.length ? durationWeeks : slots.length ? [] : [],
    applicationDeadline: program.deadline ? DATE_ONLY(program.deadline) : '',
  }
}

// GET /api/programs - Retrieve list of active programs (electives)
programRouter.get(
  '/',
  authenticateOptional,
  asyncHandler(async (req, res) => {
    const { search, specialty, city, duration } = req.query

    // Demo isolation: a user only ever browses programs from their own
    // environment. Demo users (isDemo = true) see demo programs; real users
    // and anonymous visitors only see real (isDemo = false) programs.
    const isDemo = req.user?.isDemo ?? false

    const whereClause = { status: 'ACTIVE' }
    const hospitalWhere = { user: { isDemo } }

    if (specialty) {
      whereClause.specialty = specialty
    }

    if (city) {
      const [cityName, stateName] = String(city).split(',').map(s => s.trim())
      hospitalWhere.city = cityName || undefined
      hospitalWhere.state = stateName || undefined
    }

    whereClause.hospital = hospitalWhere

    if (search) {
      const q = String(search).toLowerCase()
      whereClause.OR = [
        { specialty: { contains: q } },
        { title: { contains: q } },
        { hospital: { name: { contains: q } } },
        { hospital: { city: { contains: q } } },
      ]
    }

    let programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        hospital: true,
        requirements: true,
        slots: { orderBy: { startDate: 'asc' } },
      },
    })

    if (duration) {
      const weeks = Number(duration)
      if (Number.isFinite(weeks)) {
        programs = programs.filter(p => durationWeeksFrom(p.duration).includes(weeks))
      }
    }

    return res.json({ success: true, data: programs.map(mapProgram) })
  }),
)

// GET /api/programs/:id - Retrieve program details
programRouter.get(
  '/:id',
  authenticateOptional,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const isDemo = req.user?.isDemo ?? false

    const program = await prisma.program.findUnique({
      where: { id, hospital: { user: { isDemo } } },
      include: {
        hospital: true,
        requirements: true,
        slots: { orderBy: { startDate: 'asc' } },
      },
    })

    if (!program) {
      return res.status(404).json({ success: false, error: { message: 'Program not found' } })
    }

    return res.json({ success: true, data: mapProgram(program) })
  }),
)
