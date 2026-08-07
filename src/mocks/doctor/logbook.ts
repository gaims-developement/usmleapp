export type LogbookType =
  | 'orientation'
  | 'history_taking'
  | 'physical_examination'
  | 'case_presentation'
  | 'procedure_observed'
  | 'procedure_assisted'
  | 'daily_reflection'
  | 'case_discussion'

export type LogbookStatus = 'pending' | 'approved' | 'rejected'

export const LOGBOOK_TYPES: Record<LogbookType, string> = {
  orientation: 'Orientation',
  history_taking: 'History Taking',
  physical_examination: 'Physical Examination',
  case_presentation: 'Case Presentation',
  procedure_observed: 'Procedure Observed',
  procedure_assisted: 'Procedure Assisted',
  daily_reflection: 'Daily Reflection',
  case_discussion: 'Case Discussion',
}

export interface LogbookEntry {
  id: string
  studentId: string
  date: string
  type: LogbookType
  description: string
  status: LogbookStatus
  comments?: string
}

let lbSeq = 0
function e(
  studentId: string,
  date: string,
  type: LogbookType,
  description: string,
  status: LogbookStatus = 'pending',
  comments?: string,
): LogbookEntry {
  lbSeq += 1
  return { id: `LB-${String(lbSeq).padStart(3, '0')}`, studentId, date, type, description, status, comments }
}

export const logbookEntries: LogbookEntry[] = [
  // dstu-1
  e('dstu-1', '2026-10-06', 'history_taking', 'Took complete history of a 58-year-old with unstable angina; documented risk factors and chest pain characteristics.', 'approved', 'Excellent structure and detail.'),
  e('dstu-1', '2026-10-08', 'physical_examination', 'Performed cardiovascular exam including JVP, apex beat, and peripheral pulses under supervision.', 'approved'),
  e('dstu-1', '2026-10-13', 'case_presentation', 'Presented an acute kidney injury case during morning rounds.', 'approved', 'Well-organized; good synthesis of labs.'),
  e('dstu-1', '2026-10-15', 'procedure_observed', 'Observed central line insertion in the ICU.', 'approved'),
  e('dstu-1', '2026-10-20', 'case_discussion', 'Discussed anticoagulation choices in atrial fibrillation with attending.', 'pending'),
  e('dstu-1', '2026-10-27', 'daily_reflection', 'Reflected on managing a difficult family conversation about goals of care.', 'pending'),
  // dstu-2
  e('dstu-2', '2026-10-07', 'history_taking', 'Obtained history from a patient with new-onset diabetes, including medication reconciliation.', 'approved'),
  e('dstu-2', '2026-10-09', 'physical_examination', 'Completed full respiratory exam on a COPD patient; identified wheezing pattern.', 'approved', 'Good technique.'),
  e('dstu-2', '2026-10-14', 'case_presentation', 'Presented hyponatremia workup at noon conference.', 'approved'),
  e('dstu-2', '2026-10-16', 'procedure_assisted', 'Assisted with arterial blood gas sampling.', 'approved'),
  e('dstu-2', '2026-10-21', 'case_discussion', 'Reviewed insulin sliding scale versus basal-bolus regimens.', 'pending'),
  // dstu-3
  e('dstu-3', '2026-10-06', 'history_taking', 'Practiced history taking for a patient with chronic abdominal pain.', 'approved', 'Needs more open-ended questions.'),
  e('dstu-3', '2026-10-12', 'physical_examination', 'Performed abdominal exam; documented organomegaly findings.', 'pending'),
  e('dstu-3', '2026-10-19', 'daily_reflection', 'Wrote reflection on first week of ward posting.', 'pending'),
  // dstu-4
  e('dstu-4', '2026-10-06', 'history_taking', 'Took comprehensive history for septic patient including exposure and travel history.', 'approved'),
  e('dstu-4', '2026-10-08', 'physical_examination', 'Performed neurological exam on stroke patient; noted focal deficit.', 'approved'),
  e('dstu-4', '2026-10-13', 'case_presentation', 'Presented sepsis case with SOFA score calculation.', 'approved', 'Strong presentation skills.'),
  e('dstu-4', '2026-10-15', 'procedure_observed', 'Observed lumbar puncture.', 'approved'),
  e('dstu-4', '2026-10-20', 'case_discussion', 'Discussed empiric antibiotic coverage for community-acquired sepsis.', 'pending'),
  e('dstu-4', '2026-10-27', 'procedure_assisted', 'Assisted with blood culture collection.', 'pending'),
  // dstu-5
  e('dstu-5', '2026-11-03', 'orientation', 'Attended rotation orientation; reviewed protocols.', 'approved'),
  e('dstu-5', '2026-11-05', 'history_taking', 'Practiced history taking on geriatric patient with falls.', 'pending'),
  // dstu-6
  e('dstu-6', '2026-11-03', 'orientation', 'Completed ward orientation and safety training.', 'approved'),
  e('dstu-6', '2026-11-06', 'daily_reflection', 'Reflected on expectations for the rotation.', 'pending'),
  // dstu-7
  e('dstu-7', '2026-10-06', 'history_taking', 'Took detailed history for new diabetes consult; reviewed glucose logs.', 'approved'),
  e('dstu-7', '2026-10-09', 'physical_examination', 'Performed focused diabetic foot exam; identified neuropathy.', 'approved'),
  e('dstu-7', '2026-10-14', 'case_presentation', 'Presented DKA management plan during rounds.', 'approved', 'Outstanding differential.'),
  e('dstu-7', '2026-10-16', 'case_discussion', 'Discussed long-acting insulin adjustments.', 'approved'),
  e('dstu-7', '2026-10-22', 'procedure_observed', 'Observed insulin pump setup.', 'pending'),
  // dstu-8
  e('dstu-8', '2026-11-03', 'orientation', 'Completed onboarding and badge access.', 'approved'),
  e('dstu-8', '2026-11-07', 'history_taking', 'Practiced taking social history from patient with TB exposure.', 'pending'),
  // dstu-9
  e('dstu-9', '2026-10-06', 'history_taking', 'Took history for COPD exacerbation; documented smoking history.', 'approved'),
  e('dstu-9', '2026-10-08', 'physical_examination', 'Performed chest exam; assessed for hyperinflation.', 'approved'),
  e('dstu-9', '2026-10-13', 'case_presentation', 'Presented COPD exacerbation with oxygen titration plan.', 'approved'),
  e('dstu-9', '2026-10-15', 'procedure_observed', 'Observed nebulizer and spacer teaching.', 'approved'),
  e('dstu-9', '2026-10-21', 'case_discussion', 'Discussed non-invasive ventilation indications.', 'pending'),
  // dstu-10
  e('dstu-10', '2026-10-06', 'history_taking', 'Practiced history taking for sickle cell crisis patient.', 'approved', 'Good empathy shown.'),
  e('dstu-10', '2026-10-12', 'physical_examination', 'Performed joint exam on patient with arthritis.', 'pending'),
  e('dstu-10', '2026-10-19', 'daily_reflection', 'Reflected on managing acute pain discussions.', 'pending'),
  // dstu-11
  e('dstu-11', '2026-10-06', 'history_taking', 'Took comprehensive liver disease history including alcohol use screen.', 'approved'),
  e('dstu-11', '2026-10-08', 'physical_examination', 'Performed abdominal exam; assessed for ascites and hepatomegaly.', 'approved'),
  e('dstu-11', '2026-10-13', 'case_presentation', 'Presented cirrhosis complications case.', 'approved', 'Excellent depth.'),
  e('dstu-11', '2026-10-15', 'procedure_observed', 'Observed paracentesis.', 'approved'),
  e('dstu-11', '2026-10-20', 'case_discussion', 'Discussed variceal bleeding management.', 'pending'),
  // dstu-12
  e('dstu-12', '2026-11-03', 'orientation', 'Completed orientation session.', 'approved'),
  e('dstu-12', '2026-11-06', 'history_taking', 'Practiced history taking for a patient with hemoptysis.', 'pending'),
  // dstu-13
  e('dstu-13', '2026-10-06', 'history_taking', 'Took history for CKD patient; reviewed medication list for nephrotoxins.', 'approved'),
  e('dstu-13', '2026-10-09', 'physical_examination', 'Performed focused cardiac exam; noted volume status.', 'approved'),
  e('dstu-13', '2026-10-14', 'case_presentation', 'Presented hyperkalemia management during rounds.', 'approved'),
  e('dstu-13', '2026-10-16', 'case_discussion', 'Discussed dialysis access planning.', 'pending'),
  e('dstu-13', '2026-10-22', 'procedure_observed', 'Observed renal biopsy.', 'pending'),
  // dstu-14
  e('dstu-14', '2026-10-06', 'history_taking', 'Practiced history taking for acute diarrhea patient.', 'approved'),
  e('dstu-14', '2026-10-12', 'physical_examination', 'Performed hydration status assessment.', 'pending'),
  e('dstu-14', '2026-10-19', 'daily_reflection', 'Reflected on rehydration therapy decisions.', 'pending'),
  // dstu-15
  e('dstu-15', '2026-10-06', 'history_taking', 'Took detailed history for DKA patient; documented triggers.', 'approved', 'Exceptional history taking.'),
  e('dstu-15', '2026-10-08', 'physical_examination', 'Performed complete exam; monitored vital signs trend.', 'approved'),
  e('dstu-15', '2026-10-13', 'case_presentation', 'Presented DKA case with fluid and insulin plan.', 'approved'),
  e('dstu-15', '2026-10-15', 'procedure_assisted', 'Assisted with insulin infusion setup.', 'approved'),
  e('dstu-15', '2026-10-20', 'case_discussion', 'Discussed metabolic acidosis differential.', 'approved'),
  e('dstu-15', '2026-10-27', 'daily_reflection', 'Reflected on near-discharge planning and patient education.', 'pending'),
  // dstu-16
  e('dstu-16', '2026-11-03', 'orientation', 'Completed orientation.', 'approved'),
  e('dstu-16', '2026-11-07', 'history_taking', 'Practiced history for a patient with fever of unknown origin.', 'pending'),
  // dstu-17
  e('dstu-17', '2026-10-06', 'history_taking', 'Took history for post-op fever patient; reviewed surgical timeline.', 'approved'),
  e('dstu-17', '2026-10-08', 'physical_examination', 'Performed wound inspection and documented findings.', 'approved'),
  e('dstu-17', '2026-10-13', 'case_presentation', 'Presented post-op complication case.', 'approved', 'Good clinical reasoning.'),
  e('dstu-17', '2026-10-15', 'procedure_assisted', 'Assisted with wound dressing change.', 'approved'),
  e('dstu-17', '2026-10-21', 'case_discussion', 'Discussed surgical site infection prevention.', 'pending'),
  // dstu-18
  e('dstu-18', '2026-10-06', 'history_taking', 'Practiced history taking for diabetic foot ulcer patient.', 'approved'),
  e('dstu-18', '2026-10-12', 'physical_examination', 'Performed foot exam; assessed ulcer stage.', 'pending'),
  e('dstu-18', '2026-10-19', 'daily_reflection', 'Reflected on diabetic foot care counseling.', 'pending'),
  // dstu-19
  e('dstu-19', '2026-10-06', 'history_taking', 'Took history for hypertensive patient; reviewed home BP logs.', 'approved'),
  e('dstu-19', '2026-10-08', 'physical_examination', 'Performed BP measurement and orthostatic assessment.', 'approved'),
  e('dstu-19', '2026-10-13', 'case_presentation', 'Presented resistant hypertension case.', 'approved'),
  e('dstu-19', '2026-10-20', 'case_discussion', 'Discussed medication adherence strategies.', 'pending'),
  // dstu-20
  e('dstu-20', '2026-11-03', 'orientation', 'Completed orientation.', 'approved'),
  e('dstu-20', '2026-11-06', 'history_taking', 'Practiced history taking for malaria patient.', 'pending'),
]
