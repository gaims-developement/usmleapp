export type EvaluationPeriod = 'mid_rotation' | 'final'
export type EvaluationStatus = 'draft' | 'completed'
export type FinalRecommendation = 'recommend' | 'recommend_with_reservation' | 'not_recommend'

export const EVALUATION_CATEGORIES = [
  'Professionalism',
  'Communication',
  'Medical Knowledge',
  'Clinical Skills',
  'Patient Interaction',
  'Teamwork',
  'Documentation',
] as const

export type EvaluationCategory = (typeof EVALUATION_CATEGORIES)[number]

export type ScoreKey = 'professionalism' | 'communication' | 'medicalKnowledge' | 'clinicalSkills' | 'patientInteraction' | 'teamwork' | 'documentation'

export interface EvaluationScores {
  professionalism: number
  communication: number
  medicalKnowledge: number
  clinicalSkills: number
  patientInteraction: number
  teamwork: number
  documentation: number
}

export interface Evaluation {
  id: string
  studentId: string
  period: EvaluationPeriod
  status: EvaluationStatus
  scores: EvaluationScores
  overallPerformance: number
  strengths: string
  areasForImprovement: string
  overallComments: string
  finalRecommendation: FinalRecommendation
  submittedAt?: string
}

const S = (professionalism: number, communication: number, medicalKnowledge: number, clinicalSkills: number, patientInteraction: number, teamwork: number, documentation: number): EvaluationScores => ({
  professionalism, communication, medicalKnowledge, clinicalSkills, patientInteraction, teamwork, documentation,
})

export const doctorEvaluations: Evaluation[] = [
  { id: 'EVAL-1', studentId: 'dstu-1', period: 'mid_rotation', status: 'completed', scores: S(5, 4, 4, 4, 5, 5, 4), overallPerformance: 4, strengths: 'Excellent rapport with patients; thorough history taking.', areasForImprovement: 'Continue building confidence in synthesizing lab data.', overallComments: 'A dependable and motivated student who is on track.', finalRecommendation: 'recommend', submittedAt: '2026-10-15' },
  { id: 'EVAL-2', studentId: 'dstu-2', period: 'mid_rotation', status: 'completed', scores: S(4, 5, 4, 4, 5, 4, 4), overallPerformance: 4, strengths: 'Strong communication and patient education skills.', areasForImprovement: 'Work on faster differential generation.', overallComments: 'Solid mid-rotation performance.', finalRecommendation: 'recommend', submittedAt: '2026-10-16' },
  { id: 'EVAL-3', studentId: 'dstu-3', period: 'mid_rotation', status: 'completed', scores: S(4, 3, 3, 3, 4, 4, 3), overallPerformance: 3, strengths: 'Reliable, punctual, eager to learn.', areasForImprovement: 'Use more open-ended questions during history taking.', overallComments: 'Good baseline; improvement expected in clinical skills.', finalRecommendation: 'recommend_with_reservation', submittedAt: '2026-10-17' },
  { id: 'EVAL-4', studentId: 'dstu-4', period: 'mid_rotation', status: 'completed', scores: S(5, 5, 5, 4, 5, 5, 5), overallPerformance: 5, strengths: 'Outstanding case presentations and knowledge base.', areasForImprovement: 'None significant.', overallComments: 'Exceptional mid-rotation review.', finalRecommendation: 'recommend', submittedAt: '2026-10-18' },
  { id: 'EVAL-5', studentId: 'dstu-7', period: 'final', status: 'completed', scores: S(5, 5, 5, 5, 5, 5, 5), overallPerformance: 5, strengths: 'Top decile performance; superb clinical reasoning.', areasForImprovement: 'Continue publishing research findings.', overallComments: 'One of the strongest students I have supervised.', finalRecommendation: 'recommend', submittedAt: '2026-11-10' },
  { id: 'EVAL-6', studentId: 'dstu-9', period: 'mid_rotation', status: 'completed', scores: S(4, 4, 5, 4, 4, 4, 4), overallPerformance: 4, strengths: 'Strong medical knowledge; good synthesis.', areasForImprovement: 'Improve efficiency of documentation.', overallComments: 'Very good progress.', finalRecommendation: 'recommend', submittedAt: '2026-10-19' },
  { id: 'EVAL-7', studentId: 'dstu-10', period: 'mid_rotation', status: 'completed', scores: S(4, 4, 3, 3, 4, 4, 4), overallPerformance: 3, strengths: 'Good bedside manner and empathy.', areasForImprovement: 'Expand clinical reasoning frameworks.', overallComments: 'Progressing well.', finalRecommendation: 'recommend', submittedAt: '2026-10-20' },
  { id: 'EVAL-8', studentId: 'dstu-11', period: 'mid_rotation', status: 'completed', scores: S(5, 4, 5, 4, 5, 4, 5), overallPerformance: 4, strengths: 'Deep knowledge of internal medicine; strong presentations.', areasForImprovement: 'More assertiveness in team discussions.', overallComments: 'Highly capable student.', finalRecommendation: 'recommend', submittedAt: '2026-10-21' },
  { id: 'EVAL-9', studentId: 'dstu-13', period: 'mid_rotation', status: 'completed', scores: S(4, 4, 4, 4, 4, 4, 4), overallPerformance: 4, strengths: 'Consistent and dependable across all domains.', areasForImprovement: 'Develop more independent patient ownership.', overallComments: 'Balanced performance; on track.', finalRecommendation: 'recommend', submittedAt: '2026-10-22' },
  { id: 'EVAL-10', studentId: 'dstu-14', period: 'mid_rotation', status: 'completed', scores: S(4, 3, 3, 3, 4, 4, 3), overallPerformance: 3, strengths: 'Punctual and respectful.', areasForImprovement: 'Strengthen physical exam technique.', overallComments: 'Meets expectations with room to grow.', finalRecommendation: 'recommend_with_reservation', submittedAt: '2026-10-23' },
  { id: 'EVAL-11', studentId: 'dstu-15', period: 'final', status: 'completed', scores: S(5, 5, 5, 5, 5, 5, 5), overallPerformance: 5, strengths: 'Exceptional clinical skills and patient advocacy.', areasForImprovement: 'None.', overallComments: 'An excellent student, ideal candidate for residency.', finalRecommendation: 'recommend', submittedAt: '2026-11-12' },
  { id: 'EVAL-12', studentId: 'dstu-17', period: 'mid_rotation', status: 'completed', scores: S(4, 4, 4, 5, 4, 5, 4), overallPerformance: 4, strengths: 'Great procedural aptitude and teamwork.', areasForImprovement: 'Refine verbal handoffs.', overallComments: 'Very good mid-rotation review.', finalRecommendation: 'recommend', submittedAt: '2026-10-24' },
  { id: 'EVAL-13', studentId: 'dstu-18', period: 'mid_rotation', status: 'completed', scores: S(4, 3, 3, 3, 4, 4, 3), overallPerformance: 3, strengths: 'Diligent and organized.', areasForImprovement: 'Improve documentation completeness.', overallComments: 'Good attitude; working on clinical skills.', finalRecommendation: 'recommend_with_reservation', submittedAt: '2026-10-25' },
  { id: 'EVAL-14', studentId: 'dstu-19', period: 'mid_rotation', status: 'completed', scores: S(4, 4, 4, 4, 4, 4, 4), overallPerformance: 4, strengths: 'Consistent performance across domains.', areasForImprovement: 'Take on more independent presentations.', overallComments: 'On track for a strong final review.', finalRecommendation: 'recommend', submittedAt: '2026-10-26' },
  { id: 'EVAL-15', studentId: 'dstu-5', period: 'mid_rotation', status: 'draft', scores: S(4, 4, 3, 3, 4, 4, 3), overallPerformance: 3, strengths: '', areasForImprovement: '', overallComments: '', finalRecommendation: 'recommend' },
  { id: 'EVAL-16', studentId: 'dstu-6', period: 'mid_rotation', status: 'draft', scores: S(4, 4, 4, 3, 4, 4, 4), overallPerformance: 3, strengths: '', areasForImprovement: '', overallComments: '', finalRecommendation: 'recommend' },
  { id: 'EVAL-17', studentId: 'dstu-8', period: 'mid_rotation', status: 'draft', scores: S(4, 3, 3, 3, 4, 4, 3), overallPerformance: 3, strengths: '', areasForImprovement: '', overallComments: '', finalRecommendation: 'recommend' },
  { id: 'EVAL-18', studentId: 'dstu-12', period: 'mid_rotation', status: 'draft', scores: S(4, 4, 3, 3, 4, 4, 3), overallPerformance: 3, strengths: '', areasForImprovement: '', overallComments: '', finalRecommendation: 'recommend' },
  { id: 'EVAL-19', studentId: 'dstu-16', period: 'mid_rotation', status: 'draft', scores: S(4, 4, 3, 3, 4, 4, 4), overallPerformance: 3, strengths: '', areasForImprovement: '', overallComments: '', finalRecommendation: 'recommend' },
  { id: 'EVAL-20', studentId: 'dstu-20', period: 'mid_rotation', status: 'draft', scores: S(4, 4, 3, 3, 4, 4, 3), overallPerformance: 3, strengths: '', areasForImprovement: '', overallComments: '', finalRecommendation: 'recommend' },
]
