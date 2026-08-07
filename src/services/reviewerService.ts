import {
  buildReviewerApplication,
  reviewerApplications,
  type DocVerification,
  type EligibilityCheck,
  type ReviewDocType,
  type ReviewerApplication,
  type ReviewerApplicationCore,
  type ReviewerRecommendation,
} from '@/mocks/reviewer/applications'
import {
  messageTemplates,
  reviewerConversations,
  type MessageTemplate,
  type ReviewerConversation,
} from '@/mocks/reviewer/messages'
import { reviewerNotifications, type ReviewerNotification } from '@/mocks/reviewer/notifications'
import { reviewerProfile, type ReviewerProfile } from '@/mocks/reviewer/profile'

const latency = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

let apps: ReviewerApplicationCore[] = reviewerApplications.map(a => ({
  ...a,
  documents: a.documents.map(d => ({ ...d })),
  eligibility: { ...a.eligibility },
}))
let conversations: ReviewerConversation[] = reviewerConversations.map(c => ({
  ...c,
  messages: c.messages.map(m => ({ ...m })),
}))
let notifications: ReviewerNotification[] = reviewerNotifications.map(n => ({ ...n }))

const today = () => new Date().toISOString().slice(0, 10)
const minutesAgo = () =>
  new Date(Date.now() - Math.floor(Math.random() * 45 + 5) * 60 * 1000).toISOString().slice(11, 16)

const joined = (a: ReviewerApplicationCore): ReviewerApplication => buildReviewerApplication(a)

export async function fetchReviewerApplications(): Promise<ReviewerApplication[]> {
  await latency(300)
  return apps.map(joined).sort((a, b) => {
    const rank: Record<string, number> = { submitted: 0, under_review: 1, changes_requested: 2, approved: 3, forwarded: 4, rejected: 5 }
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status]
    return b.submittedAt.localeCompare(a.submittedAt)
  })
}

export async function fetchReviewerApplication(applicationId: string): Promise<ReviewerApplication> {
  await latency(250)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  return joined(app)
}

export async function fetchReviewerProfile(): Promise<ReviewerProfile> {
  await latency(200)
  return { ...reviewerProfile }
}

export async function fetchConversations(): Promise<ReviewerConversation[]> {
  await latency(300)
  return conversations.map(c => ({ ...c, messages: c.messages.map(m => ({ ...m })) }))
}

export async function fetchMessageTemplates(): Promise<MessageTemplate[]> {
  await latency(150)
  return messageTemplates.map(t => ({ ...t }))
}

export async function fetchReviewerNotifications(): Promise<ReviewerNotification[]> {
  await latency(200)
  return notifications.map(n => ({ ...n }))
}

export async function markAllReviewerNotificationsRead(): Promise<ReviewerNotification[]> {
  await latency(200)
  notifications = notifications.map(n => ({ ...n, read: true }))
  return notifications.map(n => ({ ...n }))
}

export async function startReview(applicationId: string): Promise<ReviewerApplication> {
  await latency(250)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  if (app.status === 'submitted') app.status = 'under_review'
  return joined(app)
}

export interface ReviewDraft {
  reviewerNotes?: string
  internalNotes?: string
  recommendation?: ReviewerRecommendation
  eligibility?: Partial<EligibilityCheck>
}

export async function saveDraft(applicationId: string, draft: ReviewDraft): Promise<ReviewerApplication> {
  await latency(350)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  if (draft.reviewerNotes !== undefined) app.reviewerNotes = draft.reviewerNotes
  if (draft.internalNotes !== undefined) app.internalNotes = draft.internalNotes
  if (draft.recommendation !== undefined) app.recommendation = draft.recommendation
  if (draft.eligibility) app.eligibility = { ...app.eligibility, ...draft.eligibility }
  return joined(app)
}

async function decide(
  applicationId: string,
  status: ReviewerApplicationCore['status'],
  recommendation: ReviewerRecommendation,
  draft: ReviewDraft,
  messageToStudent?: string,
): Promise<ReviewerApplication> {
  await latency(450)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  if (draft.reviewerNotes !== undefined) app.reviewerNotes = draft.reviewerNotes
  if (draft.internalNotes !== undefined) app.internalNotes = draft.internalNotes
  if (draft.recommendation !== undefined) app.recommendation = draft.recommendation
  if (draft.eligibility) app.eligibility = { ...app.eligibility, ...draft.eligibility }
  app.status = status
  app.recommendation = recommendation
  app.reviewedAt = today()
  app.reviewMinutes = Math.floor(10 + Math.random() * 30)
  if (messageToStudent) notifyStudent(app, messageToStudent)
  return joined(app)
}

export async function approveApplication(applicationId: string, draft: ReviewDraft = {}): Promise<ReviewerApplication> {
  return decide(applicationId, 'approved', 'approve', draft)
}

export async function rejectApplication(
  applicationId: string,
  draft: ReviewDraft = {},
  messageToStudent?: string,
): Promise<ReviewerApplication> {
  return decide(applicationId, 'rejected', 'reject', draft, messageToStudent)
}

export async function requestChanges(
  applicationId: string,
  draft: ReviewDraft = {},
  messageToStudent?: string,
): Promise<ReviewerApplication> {
  return decide(applicationId, 'changes_requested', 'request_changes', draft, messageToStudent)
}

export async function forwardToHospital(applicationId: string, draft: ReviewDraft = {}): Promise<ReviewerApplication> {
  return decide(applicationId, 'forwarded', 'forward', draft)
}

export async function setDocumentVerification(
  applicationId: string,
  docName: ReviewDocType,
  verification: DocVerification,
): Promise<ReviewerApplication> {
  await latency(300)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  const doc = app.documents.find(d => d.name === docName)
  if (!doc) throw new Error(`Document ${docName} not found`)
  doc.verification = verification
  if (verification === 'verified') doc.note = ''
  return joined(app)
}

export async function setDocumentNote(
  applicationId: string,
  docName: ReviewDocType,
  note: string,
): Promise<ReviewerApplication> {
  await latency(250)
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  const doc = app.documents.find(d => d.name === docName)
  if (!doc) throw new Error(`Document ${docName} not found`)
  doc.note = note
  return joined(app)
}

function notifyStudent(app: ReviewerApplicationCore, text: string) {
  const conversation = conversations.find(c => c.studentId === app.studentId)
  const student = joined(app).student
  const message = {
    id: `m-${Date.now()}`,
    from: 'reviewer' as const,
    text,
    time: 'now',
  }
  if (conversation) {
    conversation.messages.push(message)
    conversation.lastMessage = text
    conversation.lastTime = 'now'
  } else {
    conversations.unshift({
      id: `con-${Date.now()}`,
      studentId: app.studentId,
      studentName: student.name,
      country: student.country,
      applicationId: app.id,
      lastMessage: text,
      lastTime: 'now',
      unread: 0,
      messages: [message],
    })
  }
}

export async function sendMessage(
  conversationId: string,
  text: string,
  attachment?: { name: string; size: string },
): Promise<ReviewerConversation> {
  await latency(300)
  const conversation = conversations.find(c => c.id === conversationId)
  if (!conversation) throw new Error(`Conversation ${conversationId} not found`)
  conversation.messages.push({ id: `m-${Date.now()}`, from: 'reviewer', text, time: 'now', attachment })
  conversation.lastMessage = text
  conversation.lastTime = 'now'
  conversation.unread = 0
  return { ...conversation, messages: conversation.messages.map(m => ({ ...m })) }
}

export async function sendMessageToStudent(
  studentId: string,
  applicationId: string,
  text: string,
): Promise<ReviewerConversation> {
  await latency(350)
  const student = joined(apps.find(a => a.studentId === studentId)!).student
  let conversation = conversations.find(c => c.studentId === studentId)
  const message = { id: `m-${Date.now()}`, from: 'reviewer' as const, text, time: minutesAgo() }
  if (conversation) {
    conversation.messages.push(message)
    conversation.lastMessage = text
    conversation.lastTime = 'now'
    return { ...conversation }
  }
  conversation = {
    id: `con-${Date.now()}`,
    studentId,
    studentName: student.name,
    country: student.country,
    applicationId,
    lastMessage: text,
    lastTime: 'now',
    unread: 0,
    messages: [message],
  }
  conversations.unshift(conversation)
  return { ...conversation }
}

export async function markConversationRead(conversationId: string): Promise<ReviewerConversation> {
  await latency(150)
  const conversation = conversations.find(c => c.id === conversationId)
  if (!conversation) throw new Error(`Conversation ${conversationId} not found`)
  conversation.unread = 0
  return { ...conversation }
}
