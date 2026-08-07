import { apiGet, apiPatch } from '@/lib/apiClient'
import type { ReviewerApplication, ReviewerRecommendation } from '@/mocks/reviewer/applications'
import {
  messageTemplates,
  reviewerConversations,
  type MessageTemplate,
  type ReviewerConversation,
} from '@/mocks/reviewer/messages'
import { reviewerNotifications, type ReviewerNotification } from '@/mocks/reviewer/notifications'
import { reviewerProfile, type ReviewerProfile } from '@/mocks/reviewer/profile'

let conversations = [...reviewerConversations]
let notifications = [...reviewerNotifications]

export interface ReviewDraft {
  reviewerNotes?: string
  internalNotes?: string
  recommendation?: ReviewerRecommendation
  eligibility?: any
}

export async function fetchReviewerApplications(): Promise<ReviewerApplication[]> {
  const res = await apiGet<ReviewerApplication[]>('/applications')
  return res
}

export async function fetchReviewerApplication(applicationId: string): Promise<ReviewerApplication> {
  const apps = await fetchReviewerApplications()
  const app = apps.find(a => a.id === applicationId)
  if (!app) throw new Error(`Application ${applicationId} not found`)
  return app
}

export async function fetchReviewerProfile(): Promise<ReviewerProfile> {
  return { ...reviewerProfile }
}

export async function fetchConversations(): Promise<ReviewerConversation[]> {
  return conversations
}

export async function fetchMessageTemplates(): Promise<MessageTemplate[]> {
  return messageTemplates
}

export async function fetchReviewerNotifications(): Promise<ReviewerNotification[]> {
  return notifications
}

export async function markAllReviewerNotificationsRead(): Promise<ReviewerNotification[]> {
  notifications = notifications.map(n => ({ ...n, read: true }))
  return notifications
}

export async function startReview(applicationId: string): Promise<ReviewerApplication> {
  const res = await apiPatch<ReviewerApplication>(`/applications/${applicationId}/reviewer-decision`, {
    status: 'under_review',
  })
  return res
}

export async function saveDraft(applicationId: string, draft: ReviewDraft): Promise<ReviewerApplication> {
  const res = await apiPatch<ReviewerApplication>(`/applications/${applicationId}/reviewer-decision`, {
    status: 'under_review',
    internalNotes: draft.internalNotes,
    reviewerNotes: draft.reviewerNotes,
  })
  return res
}

async function decide(
  applicationId: string,
  status: string,
  recommendation: ReviewerRecommendation,
  draft: ReviewDraft,
  messageToStudent?: string,
): Promise<ReviewerApplication> {
  const res = await apiPatch<ReviewerApplication>(`/applications/${applicationId}/reviewer-decision`, {
    status,
    recommendation,
    internalNotes: draft.internalNotes,
    reviewerNotes: draft.reviewerNotes,
    messageToStudent,
  })
  return res
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
  docName: string,
  verification: string,
): Promise<ReviewerApplication> {
  const res = await apiPatch<ReviewerApplication>(`/applications/${applicationId}/documents/${docName}`, {
    verification,
  })
  return res
}

export async function setDocumentNote(
  applicationId: string,
  docName: string,
  note: string,
): Promise<ReviewerApplication> {
  const res = await apiPatch<ReviewerApplication>(`/applications/${applicationId}/documents/${docName}`, {
    note,
  })
  return res
}

export async function sendMessage(
  conversationId: string,
  text: string,
  attachment?: { name: string; size: string },
): Promise<ReviewerConversation> {
  const conversation = conversations.find(c => c.id === conversationId)
  if (!conversation) throw new Error(`Conversation ${conversationId} not found`)
  conversation.messages.push({ id: `m-${Date.now()}`, from: 'reviewer', text, time: 'now', attachment })
  conversation.lastMessage = text
  conversation.lastTime = 'now'
  conversation.unread = 0
  return conversation
}

export async function sendMessageToStudent(
  studentId: string,
  applicationId: string,
  text: string,
): Promise<ReviewerConversation> {
  let conversation = conversations.find(c => c.studentId === studentId)
  const message = { id: `m-${Date.now()}`, from: 'reviewer' as const, text, time: 'now' }
  if (conversation) {
    conversation.messages.push(message)
    conversation.lastMessage = text
    conversation.lastTime = 'now'
    return conversation
  }
  conversation = {
    id: `con-${Date.now()}`,
    studentId,
    studentName: 'Student',
    country: 'US',
    applicationId,
    lastMessage: text,
    lastTime: 'now',
    unread: 0,
    messages: [message],
  }
  conversations.unshift(conversation)
  return conversation
}

export async function markConversationRead(conversationId: string): Promise<ReviewerConversation> {
  const conversation = conversations.find(c => c.id === conversationId)
  if (!conversation) throw new Error(`Conversation ${conversationId} not found`)
  conversation.unread = 0
  return conversation
}
