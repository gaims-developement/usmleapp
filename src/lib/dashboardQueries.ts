import { useQuery } from '@tanstack/react-query'
import type { Application, Elective } from '@/lib/types'
import { sessionService } from '@/services/sessionService'
import { apiGet } from '@/lib/apiClient'

export interface DashboardStats {
  activeApplications: number
  confirmedRotations: number
  documentsReady: number
  requiredDocuments: number
  totalApplications: number
}

async function getDashboardStats(): Promise<DashboardStats> {
  const envelope = await apiGet<DashboardStats>('/dashboard/stats')
  return envelope
}

async function getRecommendedElectives(): Promise<Elective[]> {
  const user = sessionService.get()?.user
  const allElectives = await apiGet<Elective[]>('/programs')

  if (!user) return allElectives

  const preferredSpecialties = user.electives ?? []
  const preferredLocations = user.locations ?? []

  const scoredElectives = allElectives.map(elective => {
    let score = 0
    if (preferredSpecialties.some((s: string) => s.toLowerCase() === elective.specialty.toLowerCase())) {
      score += 10
    }
    if (preferredLocations.some((loc: string) => {
      const parts = loc.toLowerCase().split(',')
      const city = parts[0]?.trim()
      const state = parts[1]?.trim()
      return elective.city.toLowerCase() === city || elective.state.toLowerCase() === state || elective.city.toLowerCase().includes(city) || elective.state.toLowerCase().includes(state)
    })) {
      score += 5
    }
    return { elective, score }
  })

  scoredElectives.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return b.elective.rating - a.elective.rating
  })

  return scoredElectives.map(item => item.elective)
}

async function getLatestApplications(): Promise<Application[]> {
  const allApps = await apiGet<Application[]>('/applications')
  return allApps.slice(0, 3)
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  })
}

export function useRecommendedElectives() {
  return useQuery({
    queryKey: ['dashboard', 'recommended'],
    queryFn: getRecommendedElectives,
  })
}

export function useLatestApplications() {
  return useQuery({
    queryKey: ['dashboard', 'latest-applications'],
    queryFn: getLatestApplications,
  })
}