import { useMemo, useState } from 'react'
import { Check, Save } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageLoader } from '@/components/ui/spinner'
import { StatusBadge, evaluationStatusMeta, recommendationMeta } from '@/components/ui/status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { type EvaluationPeriod, type FinalRecommendation, type ScoreKey } from '@/mocks/doctor/evaluations'
import { useEvaluations, useSaveEvaluation, useSubmitEvaluation } from '@/lib/doctorQueries'
import { formatDate } from '@/lib/utils'
import type { EvaluationDraft, EvaluationJoined } from '@/services/doctorService'

const SCORE_FIELDS: { label: string; key: ScoreKey }[] = [
  { label: 'Professionalism', key: 'professionalism' },
  { label: 'Communication', key: 'communication' },
  { label: 'Medical Knowledge', key: 'medicalKnowledge' },
  { label: 'Clinical Skills', key: 'clinicalSkills' },
  { label: 'Patient Interaction', key: 'patientInteraction' },
  { label: 'Teamwork', key: 'teamwork' },
  { label: 'Documentation', key: 'documentation' },
]

function toDraft(evaluation: EvaluationJoined): EvaluationDraft {
  return {
    scores: { ...evaluation.scores },
    overallPerformance: evaluation.overallPerformance,
    strengths: evaluation.strengths,
    areasForImprovement: evaluation.areasForImprovement,
    overallComments: evaluation.overallComments,
    finalRecommendation: evaluation.finalRecommendation,
  }
}

export function DoctorEvaluationsPage() {
  const evaluations = useEvaluations()
  const save = useSaveEvaluation()
  const submit = useSubmitEvaluation()
  const toast = useToast()
  const [period, setPeriod] = useState<'all' | EvaluationPeriod>('all')
  const [selected, setSelected] = useState<EvaluationJoined | null>(null)
  const [draft, setDraft] = useState<EvaluationDraft | null>(null)

  const filtered = useMemo(
    () => (period === 'all' ? (evaluations.data ?? []) : (evaluations.data ?? []).filter(e => e.period === period)),
    [evaluations.data, period],
  )

  if (evaluations.isLoading) return <PageLoader label="Loading evaluations…" />

  function openEditor(entry: EvaluationJoined) {
    setSelected(entry)
    setDraft(toDraft(entry))
  }

  function setScore(key: ScoreKey, value: number) {
    setDraft(prev => prev ? { ...prev, scores: { ...prev.scores, [key]: value } } : prev)
  }

  function handleSave() {
    if (!selected || !draft) return
    save.mutate(
      { evaluationId: selected.id, draft },
      {
        onSuccess: () => {
          toast.success('Draft saved', `${selected.id} was saved as a draft.`)
          setSelected(null)
          setDraft(null)
        },
        onError: () => toast.error('Could not save evaluation'),
      },
    )
  }

  function handleSubmit() {
    if (!selected || !draft) return
    if (!draft.strengths.trim() || !draft.overallComments.trim()) {
      toast.error('Incomplete evaluation', 'Strengths and overall comments are required to submit.')
      return
    }
    submit.mutate(
      { evaluationId: selected.id, draft },
      {
        onSuccess: () => {
          toast.success('Evaluation submitted', `Final recommendation recorded for ${selected.student.name}.`)
          setSelected(null)
          setDraft(null)
        },
        onError: () => toast.error('Could not submit evaluation'),
      },
    )
  }

  const columns: DataTableColumn<EvaluationJoined>[] = [
    {
      key: 'student',
      header: 'Student',
      sortValue: e => e.student.name,
      cell: entry => (
        <div className="flex items-center gap-3">
          <Avatar name={entry.student.name} />
          <div>
            <p className="font-semibold text-ink-900">{entry.student.name}</p>
            <p className="text-xs text-ink-500">{entry.student.country}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      sortValue: e => e.period,
      cell: entry => (
        <span className={entry.period === 'final' ? 'rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800' : 'rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700'}>
          {entry.period === 'final' ? 'Final' : 'Mid-rotation'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: e => e.status,
      cell: entry => (
        <StatusBadge label={evaluationStatusMeta(entry.status).label} tone={evaluationStatusMeta(entry.status).tone} />
      ),
    },
    {
      key: 'overall',
      header: 'Overall',
      sortValue: e => e.overallPerformance,
      cell: entry => (
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              className={
                n <= entry.overallPerformance
                  ? 'size-2.5 rounded-full bg-brand-600'
                  : 'size-2.5 rounded-full bg-ink-200'
              }
              aria-hidden
            />
          ))}
          <span className="ml-1 text-xs font-bold text-ink-700">{entry.overallPerformance}/5</span>
        </div>
      ),
    },
    {
      key: 'recommendation',
      header: 'Recommendation',
      sortValue: e => e.finalRecommendation,
      cell: entry =>
        entry.status === 'completed' ? (
          <StatusBadge label={recommendationMeta(entry.finalRecommendation).label} tone={recommendationMeta(entry.finalRecommendation).tone} />
        ) : (
          <span className="text-xs text-ink-400">Not set</span>
        ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      sortValue: e => e.submittedAt ?? '',
      cell: entry => (
        <span className="text-ink-600">{entry.submittedAt ? formatDate(entry.submittedAt) : '—'}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: entry => (
        <button
          type="button"
          onClick={() => openEditor(entry)}
          className="cursor-pointer rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
        >
          {entry.status === 'completed' ? 'View' : 'Edit'}
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Evaluations"
        subtitle="Structured mid-rotation and final evaluations for your students."
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as 'all' | EvaluationPeriod)}
          className="h-10 w-52 cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Filter by period"
        >
          <option value="all">All periods</option>
          <option value="mid_rotation">Mid-rotation</option>
          <option value="final">Final</option>
        </select>
        <p className="text-sm text-ink-500">
          {(evaluations.data ?? []).filter(e => e.status === 'draft').length} drafts pending
        </p>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} keyField="id" pageSize={10} />
      </div>

      <Modal
        open={Boolean(selected && draft)}
        onClose={() => { setSelected(null); setDraft(null) }}
        title={`${selected?.status === 'completed' ? 'Evaluation' : 'Edit evaluation'} · ${selected?.id ?? ''}`}
        description={selected ? `${selected.student.name} — ${selected.period === 'final' ? 'Final' : 'Mid-rotation'} review` : undefined}
        size="lg"
      >
        {selected && draft && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={selected.student.name} className="size-10" />
                <div>
                  <p className="font-display text-base font-bold text-ink-900">{selected.student.name}</p>
                  <p className="text-sm text-ink-500">{selected.student.country} · {selected.period === 'final' ? 'Final' : 'Mid-rotation'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-ink-500">Category scores</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {SCORE_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 p-3">
                    <p className="text-sm font-semibold text-ink-800">{field.label}</p>
                    <select
                      value={draft.scores[field.key]}
                      onChange={e => setScore(field.key, Number(e.target.value))}
                      disabled={selected.status === 'completed'}
                      className="h-9 w-20 cursor-pointer rounded-lg border border-ink-300 bg-white px-2 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-ink-50 disabled:text-ink-400"
                      aria-label={`${field.label} score`}
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {n === 5 ? 'Excellent' : n === 4 ? 'Good' : n === 3 ? 'Satisfactory' : n === 2 ? 'Fair' : 'Poor'}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-ink-500">Overall performance</h4>
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    disabled={selected.status === 'completed'}
                    onClick={() => setDraft(prev => prev ? { ...prev, overallPerformance: n } : prev)}
                    className={
                      n <= draft.overallPerformance
                        ? 'grid size-10 cursor-pointer place-items-center rounded-full bg-brand-600 text-sm font-bold text-white transition-colors'
                        : 'grid size-10 cursor-pointer place-items-center rounded-full border border-ink-200 bg-white text-sm font-bold text-ink-400 transition-colors hover:border-brand-400'
                    }
                    aria-label={`Overall performance ${n}`}
                  >
                    {n}
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold text-ink-600">{draft.overallPerformance}/5</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="eval-strengths">Strengths</label>
                <Textarea id="eval-strengths" value={draft.strengths} onChange={e => setDraft(prev => prev ? { ...prev, strengths: e.target.value } : prev)} rows={3} disabled={selected.status === 'completed'} placeholder="Key strengths observed…" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="eval-improve">Areas for improvement</label>
                <Textarea id="eval-improve" value={draft.areasForImprovement} onChange={e => setDraft(prev => prev ? { ...prev, areasForImprovement: e.target.value } : prev)} rows={3} disabled={selected.status === 'completed'} placeholder="Suggested areas to develop…" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="eval-comments">Overall comments</label>
              <Textarea id="eval-comments" value={draft.overallComments} onChange={e => setDraft(prev => prev ? { ...prev, overallComments: e.target.value } : prev)} rows={3} disabled={selected.status === 'completed'} placeholder="Summary of the student's performance…" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-800" htmlFor="eval-rec">Final recommendation</label>
              <select
                id="eval-rec"
                value={draft.finalRecommendation}
                onChange={e => setDraft(prev => prev ? { ...prev, finalRecommendation: e.target.value as FinalRecommendation } : prev)}
                disabled={selected.status === 'completed'}
                className="h-10 w-full cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-ink-50 disabled:text-ink-400"
              >
                <option value="recommend">Recommend</option>
                <option value="recommend_with_reservation">Recommend with reservation</option>
                <option value="not_recommend">Not recommended</option>
              </select>
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => { setSelected(null); setDraft(null) }}>
            Close
          </Button>
          {selected?.status !== 'completed' && (
            <>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={save.isPending}>
                <Save className="size-4" aria-hidden />
                {save.isPending ? 'Saving…' : 'Save draft'}
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={submit.isPending}>
                <Check className="size-4" aria-hidden />
                {submit.isPending ? 'Submitting…' : 'Submit evaluation'}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
